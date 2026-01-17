const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');

// Get all employees (for manager view)
router.get('/employees', async (req, res) => {
    try {
        const [employees] = await pool.execute(`
            SELECT id, username, full_name, email, role, created_at 
            FROM users 
            WHERE role = 'employee'
            ORDER BY full_name ASC
        `);

        res.json({
            success: true,
            employees: employees
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching employees' 
        });
    }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [users] = await pool.execute(
            'SELECT id, username, full_name, email, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching user' 
        });
    }
});

module.exports = router;