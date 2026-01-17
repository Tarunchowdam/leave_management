// API Base URL
const API_URL = '/api';

// Current user
let currentUser = null;
let currentFilter = 'all';
let currentCalendarDate = new Date();

// DOM Elements
const notification = document.getElementById('notification');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeNavigation();
    loadDashboardData();
});

// Check authentication
function checkAuth() {
    currentUser = JSON.parse(localStorage.getItem('user'));
    
    if (!currentUser || currentUser.role !== 'manager') {
        showNotification('Please login as a manager', 'error');
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
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Load specific tab data
            if (tabId === 'pending') {
                loadPendingRequests();
            } else if (tabId === 'all-requests') {
                loadAllRequests();
            } else if (tabId === 'calendar') {
                loadCalendar();
            } else if (tabId === 'employees') {
                loadEmployees();
            }
        });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            loadAllRequests();
        });
    });

    // Calendar navigation
    document.getElementById('prevMonth')?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        loadCalendar();
    });

    document.getElementById('nextMonth')?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        loadCalendar();
    });
}

// Load dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadOverviewStats(),
        loadRecentRequests()
    ]);
}

// Load overview statistics
async function loadOverviewStats() {
    try {
        const response = await fetch(`${API_URL}/leaves/all`);
        const result = await response.json();

        if (result.success) {
            const leaves = result.leaves;

            // Pending requests count
            const pendingCount = leaves.filter(leave => leave.status === 'pending').length;
            document.getElementById('pendingCount').textContent = pendingCount;

            // Approved this month
            const now = new Date();
            const approvedMonth = leaves.filter(leave => {
                if (leave.status !== 'approved') return false;
                const approvedDate = new Date(leave.created_at);
                return approvedDate.getMonth() === now.getMonth() && 
                       approvedDate.getFullYear() === now.getFullYear();
            }).length;
            document.getElementById('approvedMonth').textContent = approvedMonth;

            // On leave today
            const today = new Date().toISOString().split('T')[0];
            const onLeaveToday = leaves.filter(leave => {
                if (leave.status !== 'approved') return false;
                return leave.start_date <= today && leave.end_date >= today;
            }).length;
            document.getElementById('onLeaveToday').textContent = onLeaveToday;

            // Total employees
            const employeesResponse = await fetch(`${API_URL}/users/employees`);
            const employeesResult = await employeesResponse.json();
            if (employeesResult.success) {
                document.getElementById('totalEmployees').textContent = employeesResult.employees.length;
            }
        }
    } catch (error) {
        console.error('Error loading overview stats:', error);
    }
}

// Load recent requests
async function loadRecentRequests() {
    try {
        const response = await fetch(`${API_URL}/leaves/all`);
        const result = await response.json();

        if (result.success) {
            const container = document.getElementById('recentRequests');
            const recentLeaves = result.leaves.slice(0, 5);

            if (recentLeaves.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No recent requests</h3><p>Leave requests will appear here</p></div>';
                return;
            }

            let html = '';
            recentLeaves.forEach(leave => {
                html += createRequestItem(leave);
            });

            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading recent requests:', error);
    }
}

// Load pending requests
async function loadPendingRequests() {
    try {
        const response = await fetch(`${API_URL}/leaves/all`);
        const result = await response.json();

        if (result.success) {
            const container = document.getElementById('pendingRequestsList');
            const pendingLeaves = result.leaves.filter(leave => leave.status === 'pending');

            if (pendingLeaves.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No pending requests</h3><p>All requests have been reviewed</p></div>';
                return;
            }

            let html = '';
            pendingLeaves.forEach(leave => {
                html += createRequestItem(leave, true);
            });

            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading pending requests:', error);
    }
}

// Load all requests
async function loadAllRequests() {
    try {
        const response = await fetch(`${API_URL}/leaves/all`);
        const result = await response.json();

        if (result.success) {
            const container = document.getElementById('allRequestsList');
            let leaves = result.leaves;

            // Apply filter
            if (currentFilter !== 'all') {
                leaves = leaves.filter(leave => leave.status === currentFilter);
            }

            if (leaves.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No requests found</h3><p>Try changing the filter</p></div>';
                return;
            }

            let html = '';
            leaves.forEach(leave => {
                html += createRequestItem(leave, false);
            });

            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading all requests:', error);
    }
}

// Create request item HTML
function createRequestItem(leave, showActions = false) {
    const startDate = new Date(leave.start_date).toLocaleDateString();
    const endDate = new Date(leave.end_date).toLocaleDateString();
    const createdAt = new Date(leave.created_at).toLocaleDateString();

    let actionsHtml = '';
    if (showActions && leave.status === 'pending') {
        actionsHtml = `
            <div class="request-actions">
                <button onclick="openReviewModal(${leave.id})" class="btn btn-primary btn-small">Review</button>
            </div>
        `;
    }

    return `
        <div class="request-item status-${leave.status}">
            <div class="request-header">
                <div class="request-title">${leave.full_name}</div>
                <div class="request-status">${leave.status}</div>
            </div>
            <div class="request-details">
                <div class="detail-item">
                    <span class="detail-label">Leave Type</span>
                    <span class="detail-value">${leave.leave_type_name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Duration</span>
                    <span class="detail-value">${startDate} - ${endDate} (${leave.total_days} days)</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Submitted</span>
                    <span class="detail-value">${createdAt}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${leave.email}</span>
                </div>
            </div>
            <div class="request-reason">
                <p><strong>Reason:</strong> ${leave.reason}</p>
            </div>
            ${leave.manager_comments ? `
                <div class="manager-comment">
                    <p><strong>Manager Comment:</strong> ${leave.manager_comments}</p>
                </div>
            ` : ''}
            ${actionsHtml}
        </div>
    `;
}

// Load calendar
async function loadCalendar() {
    renderCalendar();
    await loadCalendarEvents();
}

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const monthDisplay = document.getElementById('currentMonth');
    if (monthDisplay) {
        monthDisplay.textContent = currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

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
            if (!grid) return;

            const days = grid.querySelectorAll('.calendar-day:not(.empty)');

            days.forEach(dayCell => {
                const dayNumber = parseInt(dayCell.getAttribute('data-day'));
                const date = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), dayNumber);

                leaves.forEach(leave => {
                    const startDate = new Date(leave.start_date);
                    const endDate = new Date(leave.end_date);

                    if (date >= startDate && date <= endDate) {
                        const event = document.createElement('div');
                        const typeClass = leave.leave_type_name.toLowerCase().split(' ')[0];
                        event.className = `leave-event type-${typeClass}`;
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
    if (!legend) return;

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

// Load employees
async function loadEmployees() {
    try {
        const response = await fetch(`${API_URL}/users/employees`);
        const result = await response.json();

        if (result.success) {
            const container = document.getElementById('employeesList');

            if (result.employees.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No employees found</h3></div>';
                return;
            }

            let html = '';
            for (const employee of result.employees) {
                // Load leave balances for each employee
                const balanceResponse = await fetch(`${API_URL}/leaves/balances/${employee.id}`);
                const balanceResult = await balanceResponse.json();
                
                let balanceSummary = 'No balance information';
                if (balanceResult.success && balanceResult.balances.length > 0) {
                    balanceSummary = balanceResult.balances.map(b => 
                        `${b.leave_type_name}: ${b.remaining_days}/${b.total_days}`
                    ).join(' | ');
                }

                html += `
                    <div class="employee-item">
                        <div class="employee-info">
                            <div class="employee-name">${employee.full_name}</div>
                            <div class="employee-email">${employee.email}</div>
                        </div>
                        <div class="employee-balance">
                            <div class="balance-summary">${balanceSummary}</div>
                        </div>
                    </div>
                `;
            }

            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

// Open review modal
async function openReviewModal(requestId) {
    try {
        const response = await fetch(`${API_URL}/leaves/all`);
        const result = await response.json();

        if (result.success) {
            const leave = result.leaves.find(l => l.id === requestId);
            if (!leave) {
                showNotification('Leave request not found', 'error');
                return;
            }

            const startDate = new Date(leave.start_date).toLocaleDateString();
            const endDate = new Date(leave.end_date).toLocaleDateString();

            const modalBody = document.getElementById('reviewModalBody');
            modalBody.innerHTML = `
                <div class="review-details">
                    <h3>Request Details</h3>
                    <p><strong>Employee:</strong> ${leave.full_name}</p>
                    <p><strong>Email:</strong> ${leave.email}</p>
                    <p><strong>Leave Type:</strong> ${leave.leave_type_name}</p>
                    <p><strong>Duration:</strong> ${startDate} - ${endDate} (${leave.total_days} days)</p>
                    <p><strong>Reason:</strong> ${leave.reason}</p>
                </div>
                <div class="review-form">
                    <div class="form-group">
                        <label for="managerComment">Manager Comments (Optional)</label>
                        <textarea id="managerComment" rows="4" placeholder="Add any comments for the employee"></textarea>
                    </div>
                    <div class="review-actions">
                        <button onclick="reviewRequest(${requestId}, 'approved')" class="btn btn-success">Approve</button>
                        <button onclick="reviewRequest(${requestId}, 'rejected')" class="btn btn-danger">Reject</button>
                    </div>
                </div>
            `;

            document.getElementById('reviewModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error opening review modal:', error);
        showNotification('Error loading leave request details', 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('reviewModal').classList.remove('active');
}

// Review leave request
async function reviewRequest(requestId, status) {
    const comment = document.getElementById('managerComment').value;

    try {
        showNotification(`Processing request...`, 'info');

        const response = await fetch(`${API_URL}/leaves/review/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status,
                managerComments: comment
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`Leave request ${status} successfully!`, 'success');
            closeModal();
            loadDashboardData();
            loadPendingRequests();
            loadAllRequests();
        } else {
            showNotification(result.message || 'Failed to review request', 'error');
        }
    } catch (error) {
        console.error('Error reviewing request:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

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