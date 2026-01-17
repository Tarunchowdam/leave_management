const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');

// Get all leave requests (for managers)
router.get('/all', async (req, res) => {
    try {
        const [leaves] = await pool.execute(`
            SELECT lr.*, u.full_name, u.email, lt.name as leave_type_name 
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            ORDER BY lr.created_at DESC
        `);

        res.json({
            success: true,
            leaves: leaves
        });
    } catch (error) {
        console.error('Error fetching leaves:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching leave requests' 
        });
    }
});

// Get leave requests by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [leaves] = await pool.execute(`
            SELECT lr.*, lt.name as leave_type_name 
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE lr.user_id = ?
            ORDER BY lr.created_at DESC
        `, [userId]);

        res.json({
            success: true,
            leaves: leaves
        });
    } catch (error) {
        console.error('Error fetching user leaves:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching leave requests' 
        });
    }
});

// Get leave balances for a user
router.get('/balances/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [balances] = await pool.execute(`
            SELECT lb.*, lt.name as leave_type_name, lt.description 
            FROM leave_balances lb
            JOIN leave_types lt ON lb.leave_type_id = lt.id
            WHERE lb.user_id = ?
        `, [userId]);

        res.json({
            success: true,
            balances: balances
        });
    } catch (error) {
        console.error('Error fetching leave balances:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching leave balances' 
        });
    }
});

// Get all leave types
router.get('/types', async (req, res) => {
    try {
        const [types] = await pool.execute(`
            SELECT * FROM leave_types ORDER BY name
        `);

        res.json({
            success: true,
            types: types
        });
    } catch (error) {
        console.error('Error fetching leave types:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching leave types' 
        });
    }
});

// Get calendar data (all approved leaves)
router.get('/calendar', async (req, res) => {
    try {
        const { year, month } = req.query;

        let query = `
            SELECT lr.*, u.full_name, lt.name as leave_type_name 
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE lr.status = 'approved'
        `;
        
        const params = [];

        if (year) {
            query += ` AND YEAR(lr.start_date) = ?`;
            params.push(year);
        }

        if (month) {
            query += ` AND MONTH(lr.start_date) = ?`;
            params.push(month);
        }

        query += ` ORDER BY lr.start_date ASC`;

        const [leaves] = await pool.execute(query, params);

        res.json({
            success: true,
            leaves: leaves
        });
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching calendar data' 
        });
    }
});

// Submit a new leave request
router.post('/request', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const { userId, leaveTypeId, startDate, endDate, reason } = req.body;

        // Validate required fields
        if (!userId || !leaveTypeId || !startDate || !endDate) {
            throw new Error('All required fields must be provided');
        }

        // Calculate total days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

        if (totalDays <= 0) {
            throw new Error('End date must be after start date');
        }

        // Check if user has enough leave balance
        const [balances] = await connection.execute(
            'SELECT remaining_days FROM leave_balances WHERE user_id = ? AND leave_type_id = ?',
            [userId, leaveTypeId]
        );

        if (balances.length === 0) {
            throw new Error('Leave balance not found for this user');
        }

        const remainingDays = balances[0].remaining_days;
        if (totalDays > remainingDays) {
            throw new Error(`Insufficient leave balance. Available: ${remainingDays} days, Requested: ${totalDays} days`);
        }

        // Insert leave request
        const [result] = await connection.execute(
            'INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, reason) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, leaveTypeId, startDate, endDate, totalDays, reason]
        );

        res.json({
            success: true,
            message: 'Leave request submitted successfully',
            requestId: result.insertId
        });

        await connection.commit();

    } catch (error) {
        await connection.rollback();
        console.error('Error submitting leave request:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error submitting leave request' 
        });
    } finally {
        connection.release();
    }
});

// Approve or reject leave request
router.put('/review/:requestId', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const { requestId } = req.params;
        const { status, managerComments } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            throw new Error('Invalid status. Must be approved or rejected');
        }

        // Get leave request details
        const [requests] = await connection.execute(
            'SELECT * FROM leave_requests WHERE id = ? AND status = "pending"',
            [requestId]
        );

        if (requests.length === 0) {
            throw new Error('Leave request not found or already reviewed');
        }

        const leaveRequest = requests[0];

        // Update leave request status
        await connection.execute(
            'UPDATE leave_requests SET status = ?, manager_comments = ? WHERE id = ?',
            [status, managerComments, requestId]
        );

        // If approved, update leave balance
        if (status === 'approved') {
            await connection.execute(
                'UPDATE leave_balances SET used_days = used_days + ?, remaining_days = remaining_days - ? WHERE user_id = ? AND leave_type_id = ?',
                [leaveRequest.total_days, leaveRequest.total_days, leaveRequest.user_id, leaveRequest.leave_type_id]
            );
        }

        res.json({
            success: true,
            message: `Leave request ${status} successfully`
        });

        await connection.commit();

    } catch (error) {
        await connection.rollback();
        console.error('Error reviewing leave request:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error reviewing leave request' 
        });
    } finally {
        connection.release();
    }
});

// Cancel leave request (only for pending requests)
router.delete('/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM leave_requests WHERE id = ? AND status = "pending"',
            [requestId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete this leave request. It may not exist or has already been processed' 
            });
        }

        res.json({
            success: true,
            message: 'Leave request cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling leave request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error cancelling leave request' 
        });
    }
});

module.exports = router;