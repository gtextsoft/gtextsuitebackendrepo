# Admin Users API Guide

Complete guide for the Admin Users Management API endpoint.

## 📋 Overview

This API endpoint allows administrators to retrieve all users in the system with filtering, pagination, and search capabilities.

---

## 🔐 Endpoint

**URL:** `GET /api/users`  
**Authentication:** Required (Admin only)  
**Method:** `GET`

---

## 🔑 Authentication

This endpoint requires:
1. **User must be logged in** (valid `auth_token` cookie)
2. **User must have admin role** (`roles: ["admin"]`)

The authentication cookie (`auth_token`) is automatically sent by the browser if the user is logged in.

---

## 📥 Query Parameters (All Optional)

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 10) | `?limit=20` |
| `isVerified` | boolean | Filter by verification status | `?isVerified=true` |
| `role` | string | Filter by role (`user`, `admin`, `moderator`) | `?role=user` |
| `search` | string | Search in email, firstName, lastName | `?search=john` |

### Query Parameter Examples

```
GET /api/users?page=1&limit=10
GET /api/users?isVerified=true
GET /api/users?role=user&page=1&limit=20
GET /api/users?search=john&isVerified=false
GET /api/users?page=2&limit=15&role=user&isVerified=true&search=doe
```

---

## 📤 Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "+1234567890",
        "isVerified": true,
        "roles": ["user"],
        "lastLoginDate": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-10T08:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "phoneNumber": "+1234567891",
        "isVerified": true,
        "roles": ["admin"],
        "lastLoginDate": "2024-01-16T14:20:00.000Z",
        "createdAt": "2024-01-05T12:00:00.000Z",
        "updatedAt": "2024-01-16T14:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 47,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### User Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | User's unique ID |
| `email` | string | User's email address |
| `firstName` | string | User's first name |
| `lastName` | string | User's last name |
| `phoneNumber` | string | User's phone number |
| `isVerified` | boolean | Email verification status |
| `roles` | string[] | User roles (e.g., `["user"]`, `["admin"]`) |
| `lastLoginDate` | Date/null | Last login timestamp (null if never logged in) |
| `createdAt` | Date | Account creation timestamp |
| `updatedAt` | Date | Last update timestamp |

**Note:** Sensitive fields are excluded:
- `password` (never returned)
- `resetPasswordToken` (never returned)
- `verificationToken` (never returned)

### Error Responses

#### 401 Unauthorized (Not logged in)
```json
{
  "success": false,
  "message": "Unauthorized - No token provided"
}
```

#### 403 Forbidden (Not admin)
```json
{
  "success": false,
  "message": "Forbidden - Admin access required"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch users",
  "error": "Error details..."
}
```

---

## 💻 Frontend Implementation

### TypeScript Types

```typescript
// User type
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isVerified: boolean;
  roles: string[];
  lastLoginDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Pagination type
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// API Response type
interface GetAllUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: Pagination;
  };
}

// Query parameters type
interface GetUsersParams {
  page?: number;
  limit?: number;
  isVerified?: boolean;
  role?: 'user' | 'admin' | 'moderator';
  search?: string;
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

const useGetAllUsers = (params: GetUsersParams = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query string
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.isVerified !== undefined) queryParams.append('isVerified', params.isVerified.toString());
        if (params.role) queryParams.append('role', params.role);
        if (params.search) queryParams.append('search', params.search);

        const queryString = queryParams.toString();
        const url = `http://localhost:5000/api/users${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include', // Important: sends cookies
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data: GetAllUsersResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch users');
        }

        if (data.success) {
          setUsers(data.data.users);
          setPagination(data.data.pagination);
        } else {
          throw new Error(data.message);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [params.page, params.limit, params.isVerified, params.role, params.search]);

  return { users, pagination, loading, error };
};

export default useGetAllUsers;
```

### React Component Example

```typescript
import React, { useState } from 'react';
import useGetAllUsers from './hooks/useGetAllUsers';

const AdminUsersPage: React.FC = () => {
  const [filters, setFilters] = useState<GetUsersParams>({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { users, pagination, loading, error } = useGetAllUsers(filters);

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1, // Reset to first page on new search
    }));
  };

  const handleFilterChange = (key: keyof GetUsersParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-users-page">
      <h1>User Management</h1>

      {/* Search and Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>

        <select
          value={filters.role || ''}
          onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>

        <select
          value={filters.isVerified === undefined ? '' : filters.isVerified.toString()}
          onChange={(e) => handleFilterChange('isVerified', e.target.value === '' ? undefined : e.target.value === 'true')}
        >
          <option value="">All Users</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>

        <select
          value={filters.limit || 10}
          onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      {/* Users Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Verified</th>
            <th>Last Login</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.roles.join(', ')}</td>
              <td>{user.isVerified ? '✅' : '❌'}</td>
              <td>{user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleDateString() : 'Never'}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div className="pagination">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalUsers} total users)
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
```

### Axios Example

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

export const getAllUsers = async (params: GetUsersParams = {}) => {
  try {
    const response = await axios.get<GetAllUsersResponse>(`${API_BASE_URL}/users`, {
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.message || 'Failed to fetch users');
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

// Usage
const fetchUsers = async () => {
  try {
    const data = await getAllUsers({
      page: 1,
      limit: 20,
      role: 'user',
      isVerified: true,
      search: 'john',
    });
    
    console.log('Users:', data.data.users);
    console.log('Pagination:', data.data.pagination);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Fetch API Example (Vanilla JavaScript)

```javascript
async function getAllUsers(params = {}) {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.isVerified !== undefined) queryParams.append('isVerified', params.isVerified);
    if (params.role) queryParams.append('role', params.role);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `http://localhost:5000/api/users${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // Important: sends cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }

    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Usage
getAllUsers({ page: 1, limit: 10, role: 'user' })
  .then(data => {
    console.log('Users:', data.data.users);
    console.log('Pagination:', data.data.pagination);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

---

## 🎯 Use Cases

### 1. Display All Users
```typescript
const { users } = useGetAllUsers({ page: 1, limit: 10 });
```

### 2. Show Only Verified Users
```typescript
const { users } = useGetAllUsers({ isVerified: true });
```

### 3. Search for Specific User
```typescript
const { users } = useGetAllUsers({ search: 'john@example.com' });
```

### 4. Filter by Role
```typescript
const { users } = useGetAllUsers({ role: 'admin' });
```

### 5. Combined Filters
```typescript
const { users } = useGetAllUsers({
  page: 2,
  limit: 20,
  role: 'user',
  isVerified: true,
  search: 'john',
});
```

---

## ⚠️ Important Notes

1. **Authentication Required:** User must be logged in with admin role
2. **Cookies:** Always use `credentials: 'include'` in fetch requests to send cookies
3. **Pagination:** Default is 10 items per page, max recommended is 50
4. **Search:** Case-insensitive search across email, firstName, and lastName
5. **Sensitive Data:** Password and tokens are never returned
6. **Sorting:** Results are sorted by `createdAt` (newest first)

---

## 🔒 Security

- Only users with `admin` role can access this endpoint
- Passwords and sensitive tokens are excluded from responses
- Authentication is verified via JWT token in cookies
- All requests must include valid authentication cookie

---

## 📊 Response Statistics

The pagination object provides:
- `currentPage`: Current page number
- `totalPages`: Total number of pages
- `totalUsers`: Total number of users matching filters
- `limit`: Items per page
- `hasNextPage`: Boolean indicating if there's a next page
- `hasPrevPage`: Boolean indicating if there's a previous page

---

## 🐛 Error Handling

Always handle these error cases:
1. **401 Unauthorized:** User not logged in
2. **403 Forbidden:** User is not an admin
3. **500 Server Error:** Backend error (check console logs)

Example error handling:
```typescript
try {
  const data = await getAllUsers();
} catch (error: any) {
  if (error.message.includes('Unauthorized')) {
    // Redirect to login
  } else if (error.message.includes('Forbidden')) {
    // Show "Admin access required" message
  } else {
    // Show generic error message
  }
}
```

