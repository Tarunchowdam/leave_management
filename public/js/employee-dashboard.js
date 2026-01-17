// API Base URL
const API_URL = '/api';

// Current user
let currentUser = null;
let currentFilter = 'all';

// DOM Elements
const notification = document.getElementById('notification');
const leaveTypeSelect = document.getElementById('leaveType');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const totalDaysInput = document.getElementById('totalDays');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeNavigation();
    initializeForm();
    loadDashboardData();
});

// Check authentication
function checkAuth() {
    currentUser = JSON.parse(localStorage.getItem('user'));
    
    if (!currentUser || currentUser.role !== 'employee') {
        showNotification('Please login as an employee', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    document.getElementById('userName').textContent = `Welcome, ${currentUser.full_name}`;
}

// Initialize navigation tabs
function initializeNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            navBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected tab content
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Load specific tab data
            if (tabId === 'my-leaves') {
                loadMyLeaves();
            } else if (tabId === 'calendar') {
                loadCalendar();
            }
        });
    });
}

// Initialize leave request form
function initializeForm() {
    // Load leave types
    loadLeaveTypes();

    // Date change handlers
    startDateInput.addEventListener('change', calculateTotalDays);
    endDateInput.addEventListener('change', calculateTotalDays);

    // Form submission
    document.getElementById('leaveRequestForm').addEventListener('submit', handleLeaveRequest);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            loadMyLeaves();
        });
    });
}

// Load leave types
async function loadLeaveTypes() {
    try {
        const response = await fetch(`${API_URL}/leaves/types`);
        const result = await response.json();

        if (result.success) {
            leaveTypeSelect.innerHTML = '<option value="">Select leave type</option>';
            result.types.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = `${type.name} (${type.max_days} days)`;
                leaveTypeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading leave types:', error);
    }
}

// Calculate total days
function calculateTotalDays() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

        if (totalDays > 0) {
            totalDaysInput.value = totalDays;
        } else {
            totalDaysInput.value = '';
            showNotification('End date must be after start date', 'error');
        }
    }
}

// Handle leave request submission
async function handleLeaveRequest(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        userId: currentUser.id,
        leaveTypeId: formData.get('leaveType'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        reason: formData.get('reason')
    };

    try {
        showNotification('Submitting leave request...', 'info');

        const response = await fetch(`${API_URL}/leaves/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Leave request submitted successfully!', 'success');
            e.target.reset();
            totalDaysInput.value = '';
            loadDashboardData();
            loadMyLeaves();
        } else {
            showNotification(result.message || 'Failed to submit leave request', 'error');
        }
    } catch (error) {
        console.error('Error submitting leave request:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Load dashboard data
async function loadDashboardData() {
    loadLeaveBalances();
    loadPendingRequests();
    loadApprovedThisMonth();
}

// Load leave balances
async function loadLeaveBalances() {
    try {
        const response = await fetch(`${API_URL}/leaves/balances/${currentUser.id}`);
        const result = await response.json();

        if (result.success) {
            const container = document.getElementById('leaveBalancesOverview');
            
            if (result.balances.length === 0) {
                container.innerHTML = '<p class="empty-state">No leave balances found</p>';
                return;
            }

            let html = '';
            result.balances.forEach(balance => {
                html += `
                    <div class="balance-item">
                        <span class="balance-name">${balance.leave_type_name}</span>
                        <span class="balance-days">${balance.remaining_days} / ${balance.total_days} days</span>
                    </div>
                `;
            });

            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading leave balances:', error);
    }
}

// Load pending requests
async function loadPendingRequests() {
    try {
        const response = await fetch(`${API_URL}/leaves/user/${currentUser.id}`);
        const result = await response.json();

        if (result.success) {
            const pendingLeaves = result.leaves.filter(leave => leave.status === 'pending');
            const container = document.getElementById('pendingRequestsOverview');

            if (pendingLeaves.length === 0) {
                container.innerHTML = '<p class="empty-state">No pending requests</p>';
                return;
            }

            container.innerHTML = `<p class="stat-number">${pendingLeaves.length}</p><p class="stat-label">pending requests</p>`;
        }
    } catch (error) {
        console.error('Error loading pending requests:', error);
    }
}

// Load approved this month
async function loadApprovedThisMonth() {
    try {
        const response = await fetch(`${API_URL}/leaves/user/${currentUser.id}`);
        const result = await response.json();

        if (result.success) {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const approvedLeaves = result.leaves.filter(leave => {
                if (leave.status !== 'approved') return false;
                const createdAt = new Date(leave.created_at);
                return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
            });

            const container = document.getElementById('approvedThisMonth');

            if (approvedLeaves.length === 0) {
                container.innerHTML = '<p class="empty-state">No approved requests this month</p>';
                return;
            }

            container.innerHTML = `<p class="stat-number">${approvedLeaves.length}</p><p class="stat-label">approved this month</p>`;
        }
    } catch (error) {
        console.error('Error loading approved this month:', error);
    }
}

// Load my leaves
async function loadMyLeaves() {
    try {
        const response = await fetch(`${API_URL}/leaves/user/${currentUser.id}`);
        const result = await response.json();

        if (result.success) {
            const container = document.getElementById('myLeavesList');
            let leaves = result.leaves;

            // Apply filter
            if (currentFilter !== 'all') {
                leaves = leaves.filter(leave => leave.status === currentFilter);
            }

            if (leaves.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No leave requests found</h3><p>Submit your first leave request to get started</p></div>';
                return;
            }

            let html = '';
            leaves.forEach(leave => {
                const startDate = new Date(leave.start_date).toLocaleDateString();
                const endDate = new Date(leave.end_date).toLocaleDateString();
                const createdAt = new Date(leave.created_at).toLocaleDateString();

                html += `
                    <div class="leave-item status-${leave.status}">
                        <div class="leave-header">
                            <div class="leave-title">${leave.leave_type_name}</div>
                            <div class="leave-status">${leave.status}</div>
                        </div>
                        <div class="leave-details">
                            <div class="detail-item">
                                <span class="detail-label">Duration</span>
                                <span class="detail-value">${startDate} - ${endDate} (${leave.total_days} days)</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Submitted</span>
                                <span class="detail-value">${createdAt}</span>
                            </div>
                        </div>
                        <div class="leave-reason">
                            <p><strong>Reason:</strong> ${leave.reason}</p>
                        </div>
                        ${leave.manager_comments ? `
                            <div class="manager-comment">
                                <p><strong>Manager Comment:</strong> ${leave.manager_comments}</p>
                            </div>
                        ` : ''}
                        ${leave.status === 'pending' ? `
                            <div class="leave-actions">
                                <button onclick="cancelLeaveRequest(${leave.id})" class="btn btn-danger btn-small">Cancel Request</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading my leaves:', error);
    }
}

// Cancel leave request
async function cancelLeaveRequest(requestId) {
    if (!confirm('Are you sure you want to cancel this leave request?')) {
        return;
    }

    try {
        showNotification('Cancelling leave request...', 'info');

        const response = await fetch(`${API_URL}/leaves/${requestId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Leave request cancelled successfully!', 'success');
            loadMyLeaves();
            loadDashboardData();
        } else {
            showNotification(result.message || 'Failed to cancel leave request', 'error');
        }
    } catch (error) {
        console.error('Error cancelling leave request:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Calendar functionality
let currentCalendarDate = new Date();

async function loadCalendar() {
    renderCalendar();
    loadCalendarEvents();
}

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    document.getElementById('currentMonth').textContent = 
        currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const grid = document.getElementById('calendarGrid');
    let html = '';

    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // Days of the month
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
        const isToday = today.getDate() === day && 
                       today.getMonth() === month && 
                       today.getFullYear() === year;
        
        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}" data-day="${day}">
                <div class="calendar-day-number">${day}</div>
            </div>
        `;
    }

    grid.innerHTML = html;
}

async function loadCalendarEvents() {
    try {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth() + 1;

        const response = await fetch(`${API_URL}/leaves/calendar?year=${year}&month=${month}`);
        const result = await response.json();

        if (result.success) {
            const leaves = result.leaves;
            const grid = document.getElementById('calendarGrid');
            const days = grid.querySelectorAll('.calendar-day:not(.empty)');

            days.forEach(dayCell => {
                const dayNumber = parseInt(dayCell.getAttribute('data-day'));
                const date = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), dayNumber);

                leaves.forEach(leave => {
                    const startDate = new Date(leave.start_date);
                    const endDate = new Date(leave.end_date);

                    if (date >= startDate && date <= endDate) {
                        const event = document.createElement('div');
                        event.className = `leave-event type-${leave.leave_type_name.toLowerCase().split(' ')[0]}`;
                        event.textContent = `${leave.full_name}`;
                        event.title = `${leave.full_name} - ${leave.leave_type_name}`;
                        dayCell.appendChild(event);
                    }
                });
            });

            // Render legend
            renderLegend();
        }
    } catch (error) {
        console.error('Error loading calendar events:', error);
    }
}

function renderLegend() {
    const legend = document.getElementById('calendarLegend');
    const types = [
        { name: 'Vacation', class: 'type-vacation' },
        { name: 'Sick Leave', class: 'type-sick' },
        { name: 'Personal', class: 'type-personal' },
        { name: 'Emergency', class: 'type-emergency' }
    ];

    let html = '';
    types.forEach(type => {
        html += `
            <div class="legend-item">
                <div class="legend-color ${type.class}"></div>
                <span>${type.name}</span>
            </div>
        `;
    });

    legend.innerHTML = html;
}

// Calendar navigation
document.getElementById('prevMonth').addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    loadCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    loadCalendar();
});

// Show notification
function showNotification(message, type = 'info') {
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification ${type}`;
    notificationEl.textContent = message;
    notification.appendChild(notificationEl);

    setTimeout(() => {
        notificationEl.remove();
    }, 5000);
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}