# API Reference Card

## Base URL
```
http://localhost:3000/api
```

---

## 🔐 Authentication Endpoints

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "full_name": "John Doe",
    "email": "john.doe@company.com",
    "role": "employee"
  }
}
```

### Logout
```http
POST /auth/logout
```

---

## 📋 Leave Management Endpoints

### Get All Leave Requests (Manager)
```http
GET /leaves/all
```

**Response:**
```json
{
  "success": true,
  "leaves": [
    {
      "id": 1,
      "user_id": 1,
      "leave_type_id": 1,
      "start_date": "2024-02-15",
      "end_date": "2024-02-20",
      "total_days": 5,
      "reason": "Family vacation",
      "status": "approved",
      "manager_comments": null,
      "created_at": "2024-02-01T10:00:00Z",
      "full_name": "John Doe",
      "email": "john.doe@company.com",
      "leave_type_name": "Vacation"
    }
  ]
}
```

### Get User's Leave Requests
```http
GET /leaves/user/:userId
```

**Example:** `GET /leaves/user/1`

**Response:**
```json
{
  "success": true,
  "leaves": [
    {
      "id": 1,
      "leave_type_id": 1,
      "start_date": "2024-02-15",
      "end_date": "2024-02-20",
      "total_days": 5,
      "reason": "Family vacation",
      "status": "approved",
      "leave_type_name": "Vacation"
    }
  ]
}
```

### Get User's Leave Balances
```http
GET /leaves/balances/:userId
```

**Example:** `GET /leaves/balances/1`

**Response:**
```json
{
  "success": true,
  "balances": [
    {
      "id": 1,
      "user_id": 1,
      "leave_type_id": 1,
      "total_days": 20,
      "used_days": 5,
      "remaining_days": 15,
      "leave_type_name": "Vacation",
      "description": "Annual vacation leave"
    }
  ]
}
```

### Get All Leave Types
```http
GET /leaves/types
```

**Response:**
```json
{
  "success": true,
  "types": [
    {
      "id": 1,
      "name": "Vacation",
      "description": "Annual vacation leave",
      "max_days": 20
    }
  ]
}
```

### Get Calendar Data
```http
GET /leaves/calendar?year=2024&month=2
```

**Query Parameters:**
- `year` (optional): Year filter
- `month` (optional): Month filter (1-12)

**Response:**
```json
{
  "success": true,
  "leaves": [
    {
      "id": 1,
      "start_date": "2024-02-15",
      "end_date": "2024-02-20",
      "total_days": 5,
      "status": "approved",
      "full_name": "John Doe",
      "leave_type_name": "Vacation"
    }
  ]
}
```

### Submit New Leave Request
```http
POST /leaves/request
```

**Request Body:**
```json
{
  "userId": 1,
  "leaveTypeId": 1,
  "startDate": "2024-03-01",
  "endDate": "2024-03-05",
  "reason": "Personal trip"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "requestId": 5
}
```

### Review Leave Request (Manager)
```http
PUT /leaves/review/:requestId
```

**Example:** `PUT /leaves/review/5`

**Request Body:**
```json
{
  "status": "approved",
  "managerComments": "Approved. Have a great trip!"
}
```

**Status Options:** `approved` or `rejected`

**Response:**
```json
{
  "success": true,
  "message": "Leave request approved successfully"
}
```

### Cancel Leave Request
```http
DELETE /leaves/:requestId
```

**Example:** `DELETE /leaves/5`

**Response:**
```json
{
  "success": true,
  "message": "Leave request cancelled successfully"
}
```

---

## 👥 User Management Endpoints

### Get All Employees (Manager)
```http
GET /users/employees
```

**Response:**
```json
{
  "success": true,
  "employees": [
    {
      "id": 1,
      "username": "john_doe",
      "full_name": "John Doe",
      "email": "john.doe@company.com",
      "role": "employee",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get User Details
```http
GET /users/:userId
```

**Example:** `GET /users/1`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "john_doe",
    "full_name": "John Doe",
    "email": "john.doe@company.com",
    "role": "employee",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔒 HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 💡 Usage Examples

### Using Fetch API (JavaScript)

```javascript
// Login
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'john_doe', password: 'password123' })
})
.then(res => res.json())
.then(data => console.log(data));

// Submit leave request
fetch('/api/leaves/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 1,
    leaveTypeId: 1,
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    reason: 'Personal trip'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}'

# Get user leaves
curl http://localhost:3000/api/leaves/user/1

# Submit request
curl -X POST http://localhost:3000/api/leaves/request \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "leaveTypeId": 1,
    "startDate": "2024-03-01",
    "endDate": "2024-03-05",
    "reason": "Personal trip"
  }'
```

---

## ⚠️ Notes

- All dates should be in ISO format: `YYYY-MM-DD`
- All requests with body require `Content-Type: application/json` header
- Manager endpoints require manager role
- Pending requests can only be cancelled by the employee who created them
- Leave balances are automatically updated when requests are approved

---

**For complete documentation, see README.md**