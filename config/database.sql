-- Employee Leave Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS leave_management_web;
USE leave_management_web;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('employee', 'manager') NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave types table
CREATE TABLE leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    max_days INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave balances table
CREATE TABLE leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    total_days DECIMAL(5,1) NOT NULL DEFAULT 0,
    used_days DECIMAL(5,1) NOT NULL DEFAULT 0,
    remaining_days DECIMAL(5,1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_leave (user_id, leave_type_id)
);

-- Leave requests table
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,1) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    manager_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
);

-- Insert sample leave types
INSERT INTO leave_types (name, description, max_days) VALUES
('Vacation', 'Annual vacation leave', 20),
('Sick Leave', 'Sick leave for illness', 10),
('Personal', 'Personal leave for personal matters', 5),
('Emergency', 'Emergency leave for urgent matters', 3);

-- Insert sample employees (passwords are 'password123' in production, use proper hashing)
INSERT INTO users (username, password, full_name, email, role) VALUES
('john_doe', 'password123', 'John Doe', 'john.doe@company.com', 'employee'),
('jane_smith', 'password123', 'Jane Smith', 'jane.smith@company.com', 'employee'),
('mike_wilson', 'password123', 'Mike Wilson', 'mike.wilson@company.com', 'employee'),
('sarah_jones', 'password123', 'Sarah Jones', 'sarah.jones@company.com', 'employee'),
('manager_alex', 'password123', 'Alex Thompson', 'alex.thompson@company.com', 'manager');

-- Initialize leave balances for all employees
INSERT INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days)
SELECT 
    u.id,
    lt.id,
    lt.max_days,
    0,
    lt.max_days
FROM users u
CROSS JOIN leave_types lt
WHERE u.role = 'employee';

-- Insert sample leave requests
INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, reason, status) VALUES
(1, 1, '2024-02-15', '2024-02-20', 5, 'Family vacation', 'approved'),
(2, 2, '2024-02-10', '2024-02-12', 2, 'Not feeling well', 'approved'),
(3, 1, '2024-03-01', '2024-03-05', 4, 'Personal trip', 'pending'),
(4, 3, '2024-02-25', '2024-02-26', 1, 'Personal appointment', 'pending');