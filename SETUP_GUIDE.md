# Setup Guide - Employee Leave Management System

## Quick Start Instructions

### Prerequisites
1. **Node.js** (v14 or higher)
2. **MySQL** (v5.7 or higher)

### Step-by-Step Installation

#### 1. Database Setup

**Option A: Using MySQL Command Line**

```bash
# Open MySQL Command Line Client
mysql -u root -p

# Inside MySQL, run:
source /path/to/employee-leave-system/config/database.sql
```

**Option B: Using MySQL Workbench or phpMyAdmin**

1. Open your MySQL management tool
2. Import the file: `config/database.sql`
3. This will create:
   - Database: `leave_management`
   - Tables: users, leave_types, leave_balances, leave_requests
   - Sample data for testing

#### 2. Install Node.js Dependencies

```bash
cd employee-leave-system/server
npm install
```

#### 3. Configure Database Connection (if needed)

Edit `server/config/database.js`:

```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',        // Your MySQL username
    password: '',        // Your MySQL password
    database: 'leave_management',
    // ...
};
```

#### 4. Start the Application

```bash
npm start
```

The server will start on: `http://localhost:3000`

#### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Demo Accounts

### Employee Accounts
- **john_doe** / password123
- **jane_smith** / password123
- **mike_wilson** / password123
- **sarah_jones** / password123

### Manager Account
- **manager_alex** / password123

## Testing the System

### As an Employee:

1. **Login** with employee credentials
2. **View Dashboard** - Check your leave balances and pending requests
3. **Submit Leave Request**:
   - Go to "New Request" tab
   - Select leave type
   - Choose start and end dates
   - Add reason
   - Submit
4. **View My Leaves** - See all your requests with status
5. **Check Calendar** - View team leave schedule
6. **Cancel Pending Request** - Remove a pending request

### As a Manager:

1. **Login** with manager credentials
2. **View Dashboard** - See pending requests and statistics
3. **Review Pending Requests**:
   - Go to "Pending Requests" tab
   - Click "Review" on any request
   - Add comments (optional)
   - Approve or Reject
4. **View All Requests** - Filter by status
5. **Check Calendar** - See team leave schedule
6. **View Employees** - See employee list and balances

## Troubleshooting

### MySQL Connection Issues

**Error**: "Cannot connect to database"
**Solution**:
- Verify MySQL is running
- Check username and password in `config/database.js`
- Ensure database `leave_management` exists

**Error**: "Database not found"
**Solution**:
- Run the database.sql script to create the database
- Verify database name matches in config

### Server Issues

**Error**: "Port 3000 already in use"
**Solution**:
```bash
# Change port in server.js or kill the process
lsof -ti:3000 | xargs kill -9
```

**Error**: "Module not found"
**Solution**:
```bash
cd server
npm install
```

### Login Issues

**Error**: "Invalid username or password"
**Solution**:
- Use demo credentials from above
- Check database has sample data
- Verify no extra spaces in username/password

### Browser Issues

**Issue**: Pages not loading
**Solution**:
- Clear browser cache
- Try a different browser
- Check browser console for errors (F12)

## Database Reset

To reset the database to initial state:

```bash
mysql -u root -p leave_management < config/database.sql
```

**Warning**: This will delete all data and restore sample data.

## Development Mode

For automatic server restart during development:

```bash
npm run dev
```

## File Structure Reference

```
employee-leave-system/
├── public/              # Frontend files
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   ├── index.html      # Login page
│   ├── employee-dashboard.html
│   └── manager-dashboard.html
├── server/             # Backend files
│   ├── routes/         # API routes
│   ├── server.js       # Main server
│   └── package.json    # Dependencies
├── config/             # Configuration
│   ├── database.js     # DB connection
│   └── database.sql    # DB schema
└── README.md           # Main documentation
```

## Security Considerations

⚠️ **Important**: This is a demonstration system. For production use:

1. Implement password hashing (bcrypt)
2. Use JWT tokens for authentication
3. Add HTTPS/SSL
4. Implement input validation and sanitization
5. Add rate limiting
6. Use environment variables for sensitive data
7. Implement proper session management
8. Add CSRF protection

## Support

For detailed information, see:
- `README.md` - Complete feature documentation
- `TODO.md` - Development progress
- Code comments in each file

## Next Steps

After setup:
1. Test all features with demo accounts
2. Customize leave types in database
3. Modify styling as needed
4. Add company-specific requirements
5. Deploy to production server

---

**Ready to get started? Follow the steps above and you'll have your leave management system running in minutes!**