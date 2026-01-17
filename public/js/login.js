// API Base URL
const API_URL = '/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const notification = document.getElementById('notification');

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

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const data = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    try {
        showNotification('Logging in...', 'info');

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(result.user));
            
            showNotification('Login successful!', 'success');
            
            // Redirect based on role
            if (result.user.role === 'manager') {
                setTimeout(() => {
                    window.location.href = 'manager-dashboard.html';
                }, 1000);
            } else {
                setTimeout(() => {
                    window.location.href = 'employee-dashboard.html';
                }, 1000);
            }
        } else {
            showNotification(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
});

// Check if user is already logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        if (user.role === 'manager') {
            window.location.href = 'manager-dashboard.html';
        } else {
            window.location.href = 'employee-dashboard.html';
        }
    }
}

// Run check on page load
checkAuth();