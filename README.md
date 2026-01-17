# Employee Leave Management System

A complete web-based leave management system for small companies with around 50 employees. This system automates the process of requesting and approving leave requests, providing transparency and efficiency in managing employee absences.

## Features

### For Employees:
- **User Authentication**: Secure login system with role-based access
- **Leave Request Submission**: Easy-to-use form for submitting leave requests
- **Leave Balances**: Real-time tracking of available leave days
- **Request History**: View all past and current leave requests
- **Calendar View**: Visual representation of team leave schedules
- **Cancel Requests**: Ability to cancel pending requests

### For Managers:
- **Dashboard Overview**: Quick view of pending requests and team statistics
- **Request Review**: Approve or reject leave requests with comments
- **All Requests Management**: View and filter all employee leave requests
- **Team Calendar**: Visual calendar showing all team leave schedules
- **Employee Management**: View employee list and their leave balances

## Technology Stack

### Backend:
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Database management
- **RESTful APIs** - Clean API architecture

### Frontend:
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with responsive design
- **JavaScript (ES6+)** - Dynamic functionality
- **Fetch API** - Data communication

## Prerequisites

Before running this application, ensure you have:

1. **Node.js** (v14 or higher) - [Download Node.js](https://nodejs.org/)
2. **MySQL** (v5.7 or higher) - [Download MySQL](https://www.mysql.com/downloads/)
3. **npm** (comes with Node.js)

## Installation Guide

### Step 1: Clone or Download the Project

```bash
cd employee-leave-system
```

### Step 2: Set Up MySQL Database

1. Open MySQL Command Line Client or your preferred MySQL tool
2. Run the database setup script:

```bash
mysql -u root -p < config/database.sql
```

Or manually execute the SQL commands in `config/database.sql`:
- Creates database: `leave_management`
- Creates tables: `users`, `leave_types`, `leave_balances`, `leave_requests`
- Inserts sample data for testing

### Step 3: Install Node.js Dependencies

```bash
cd server
npm install
```

### Step 4: Configure Database Connection

Edit `server/config/database.js` if needed:

```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',           // Your MySQL username
    password: '',           // Your MySQL password
    database: 'leave_management',
    // ... rest of config
};
```

### Step 5: Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Step 6: Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## Demo Credentials

### Employee Accounts:
- **Username**: john_doe
- **Password**: password123

- **Username**: jane_smith
- **Password**: password123

- **Username**: mike_wilson
- **Password**: password123

- **Username**: sarah_jones
- **Password**: password123

### Manager Account:
- **Username**: manager_alex
- **Password**: password123

## Project Structure

```
employee-leave-system/
├── public/
│   ├── css/
│   │   └── style.css          # Main stylesheet
│   ├── js/
│   │   ├── login.js           # Login functionality
│   │   ├── employee-dashboard.js    # Employee features
│   │   └── manager-dashboard.js     # Manager features
│   ├── index.html             # Login page
│   ├── employee-dashboard.html      # Employee dashboard
│   └── manager-dashboard.html       # Manager dashboard
├── server/
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── leaves.js          # Leave management routes
│   │   └── users.js           # User management routes
│   ├── server.js              # Main server file
│   └── package.json           # Node.js dependencies
├── config/
│   ├── database.js            # Database configuration
│   └── database.sql           # Database schema and sample data
└── README.md                  # This file
```

## API Endpoints

### Authentication:
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Leave Management:
- `GET /api/leaves/all` - Get all leave requests (manager)
- `GET /api/leaves/user/:userId` - Get user's leave requests
- `GET /api/leaves/balances/:userId` - Get user's leave balances
- `GET /api/leaves/types` - Get all leave types
- `GET /api/leaves/calendar` - Get calendar data
- `POST /api/leaves/request` - Submit new leave request
- `PUT /api/leaves/review/:requestId` - Approve/reject request (manager)
- `DELETE /api/leaves/:requestId` - Cancel pending request

### User Management:
- `GET /api/users/employees` - Get all employees (manager)
- `GET /api/users/:userId` - Get user details

## Database Schema

### Users Table:
- Stores employee and manager accounts
- Fields: id, username, password, full_name, email, role

### Leave Types Table:
- Predefined leave categories
- Fields: id, name, description, max_days

### Leave Balances Table:
- Tracks employee leave balances
- Fields: id, user_id, leave_type_id, total_days, used_days, remaining_days

### Leave Requests Table:
- Stores all leave requests
- Fields: id, user_id, leave_type_id, start_date, end_date, total_days, reason, status, manager_comments

## Features Overview

### 1. User Authentication
- Secure login system
- Role-based access control (Employee/Manager)
- Session management using localStorage

### 2. Leave Request Submission
- Form with validation
- Automatic day calculation
- Leave type selection with balance display
- Reason input field

### 3. Leave Approval Workflow
- Manager dashboard for reviewing requests
- Approve/Reject functionality
- Optional manager comments
- Automatic balance updates

### 4. Leave Balances
- Real-time balance tracking
- Multiple leave types
- Automatic updates on approval
- Visual balance display

### 5. Leave Calendar
- Monthly calendar view
- Color-coded leave types
- Team leave visualization
- Navigation between months

## Customization

### Adding New Leave Types:
Edit the SQL in `config/database.sql`:

```sql
INSERT INTO leave_types (name, description, max_days) VALUES
('Maternity', 'Maternity leave', 90),
('Paternity', 'Paternity leave', 14);
```

### Modifying Leave Policies:
Update the `max_days` field in the `leave_types` table.

### Styling Customization:
Edit `public/css/style.css` to customize colors, layouts, and design.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Password Storage**: Currently using plain text comparison. In production, implement bcrypt for password hashing.
2. **Session Management**: Using localStorage. In production, implement proper session tokens (JWT).
3. **Input Validation**: Basic validation implemented. Add comprehensive server-side validation.
4. **SQL Injection**: Using parameterized queries. Ensure all queries remain parameterized.
5. **HTTPS**: Always use HTTPS in production environments.

## Troubleshooting

### Server Won't Start:
- Ensure Node.js and npm are installed
- Check if port 3000 is available
- Verify MySQL is running

### Database Connection Error:
- Check MySQL credentials in `config/database.js`
- Ensure MySQL service is running
- Verify database exists and schema is imported

### Login Not Working:
- Verify demo credentials are correct
- Check database has sample data
- Check browser console for errors

### Leave Request Not Submitting:
- Check browser console for errors
- Verify database connection
- Ensure user has sufficient leave balance

## Development

### Running in Development Mode:

```bash
npm run dev
```


## Future Enhancements

Potential features for future versions:
- Email notifications
- Advanced reporting and analytics
- Leave carry-over functionality
- Holiday management
- Multi-level approval workflow
- File attachments for medical certificates
- Integration with calendar applications (Google Calendar, Outlook)
- Mobile app version
- Enhanced security with JWT tokens
- Database backup and restore functionality

----