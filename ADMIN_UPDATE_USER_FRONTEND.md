# Admin Update User - Frontend Guide

## 📋 Overview

This guide shows what the frontend needs to allow an admin to update any user, including changing their email and verification status.

---

## 🔑 API Endpoint

**Endpoint:** `PUT /api/users/:userId`

**Authentication:** Required (Admin only)

**Route:** `src/routes/users.ts` (line 71)

---

## 📡 Complete API Reference

### Request

**Method:** `PUT`

**URL:** `/api/users/:userId`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Authentication:** Cookie-based (admin must be logged in)

**URL Parameters:**
- `userId` (string, required) - MongoDB ObjectId of the user to update

**Request Body (all fields optional):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "email": "newemail@example.com",
  "roles": ["user", "admin"],
  "isVerified": true
}
```

### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | No | User's first name |
| `lastName` | string | No | User's last name |
| `phoneNumber` | string | No | User's phone number |
| `email` | string | No | User's email address (admin can change directly) |
| `roles` | string[] | No | Array of roles: `["user"]`, `["admin"]`, `["moderator"]`, or combinations |
| `isVerified` | boolean | No | Email verification status |

**Valid Roles:**
- `"user"` - Regular user
- `"admin"` - Administrator
- `"moderator"` - Moderator

---

## ✅ Success Response (200 OK)

```json
{
  "success": true,
  "message": "User updated successfully.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "newemail@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "roles": ["user", "admin"],
    "isVerified": true,
    "lastLoginDate": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  },
  "updatedBy": {
    "adminId": "507f1f77bcf86cd799439012",
    "adminEmail": "admin@example.com"
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "errors": [
    {
      "msg": "A valid email is required.",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 400 Bad Request - Email Already Exists
```json
{
  "success": false,
  "message": "Email is already in use by another account."
}
```

### 400 Bad Request - Invalid Roles
```json
{
  "success": false,
  "message": "Invalid roles: invalidRole. Valid roles are: user, admin, moderator"
}
```

### 400 Bad Request - No Changes
```json
{
  "success": true,
  "message": "No changes detected.",
  "user": {
    // ... user object
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized. Please login first."
}
```

### 403 Forbidden - Cannot Change Own Role
```json
{
  "success": false,
  "message": "You cannot change your own role."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Something went wrong while updating user."
}
```

---

## 💻 Frontend Implementation

### TypeScript/JavaScript Function

```typescript
interface AdminUpdateUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  roles?: string[];
  isVerified?: boolean;
}

interface AdminUpdateUserResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    roles: string[];
    isVerified: boolean;
    lastLoginDate?: string;
    createdAt: string;
    updatedAt: string;
  };
  updatedBy?: {
    adminId: string;
    adminEmail: string;
  };
  errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}

async function adminUpdateUser(
  userId: string,
  data: AdminUpdateUserData
): Promise<AdminUpdateUserResponse> {
  const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify(data),
  });

  return await response.json();
}
```

---

## 🎨 React Component Example

### Complete Admin User Edit Form

```tsx
import React, { useState, useEffect } from 'react';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  isVerified: boolean;
}

interface AdminUserEditFormProps {
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function AdminUserEditForm({ userId, onSuccess, onCancel }: AdminUserEditFormProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    roles: [] as string[],
    isVerified: false,
  });

  // Fetch user data on mount
  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        setFormData({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phoneNumber: data.user.phoneNumber,
          email: data.user.email,
          roles: data.user.roles || [],
          isVerified: data.user.isVerified || false,
        });
      }
    } catch (err) {
      setError('Failed to load user data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setUser(data.user);
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        if (data.errors && data.errors.length > 0) {
          setError(data.errors[0].msg);
        } else {
          setError(data.message || 'Failed to update user');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="admin-user-edit-form">
      <h2>Edit User: {user.email}</h2>

      {success && (
        <div className="alert alert-success">
          User updated successfully!
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* First Name */}
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>

        {/* Last Name */}
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            required
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          <small className="form-text">
            ⚠️ Changing email will send verification email to new address and notification to old address.
          </small>
        </div>

        {/* Roles */}
        <div className="form-group">
          <label>Roles</label>
          <div className="role-checkboxes">
            {['user', 'admin', 'moderator'].map(role => (
              <label key={role} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                />
                <span className="capitalize">{role}</span>
              </label>
            ))}
          </div>
          <small className="form-text">
            ⚠️ Admins cannot change their own role.
          </small>
        </div>

        {/* Verification Status */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isVerified}
              onChange={(e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
            />
            <span>Email Verified</span>
          </label>
          <small className="form-text">
            Check to mark user's email as verified. Uncheck to require email verification.
          </small>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update User'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AdminUserEditForm;
```

---

## 📝 Usage Examples

### Example 1: Update User Verification Status

```typescript
// Mark user as verified
await adminUpdateUser('507f1f77bcf86cd799439011', {
  isVerified: true
});
```

### Example 2: Change User Email

```typescript
// Change user's email (admin privilege - bypasses two-step verification)
await adminUpdateUser('507f1f77bcf86cd799439011', {
  email: 'newemail@example.com'
});
// Note: This automatically sets isVerified to false and sends verification email
```

### Example 3: Update Multiple Fields

```typescript
// Update name, email, and verification status
await adminUpdateUser('507f1f77bcf86cd799439011', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  isVerified: true
});
```

### Example 4: Change User Roles

```typescript
// Make user an admin
await adminUpdateUser('507f1f77bcf86cd799439011', {
  roles: ['user', 'admin']
});

// Remove admin role
await adminUpdateUser('507f1f77bcf86cd799439011', {
  roles: ['user']
});
```

---

## ⚠️ Important Notes

### Email Changes
- **Admin can change email directly** - No two-step verification required
- **Old email receives notification** - User is notified of the change
- **New email receives verification code** - User must verify new email
- **isVerified automatically set to false** - When email changes, verification is reset

### Verification Status
- **Admin can set isVerified to true** - Bypasses email verification requirement
- **Setting isVerified to false** - Requires user to verify email again
- **When email changes** - isVerified is automatically set to false

### Role Changes
- **Admin cannot change their own role** - Security protection
- **Valid roles:** `user`, `admin`, `moderator`
- **Multiple roles allowed** - User can have multiple roles

### Audit Trail
- **All changes are logged** - Check audit trail at `/api/users/:userId/audit-trail`
- **Tracks who made changes** - Admin ID and email are recorded
- **Tracks what changed** - Field, old value, new value

---

## 🔍 Get User Data First

Before updating, you need to fetch the user data:

```typescript
// Get user by ID
async function getAdminUser(userId: string) {
  const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
    method: 'GET',
    credentials: 'include',
  });
  return await response.json();
}

// Usage
const userData = await getAdminUser('507f1f77bcf86cd799439011');
if (userData.success) {
  // Use userData.user to populate form
}
```

---

## ✅ Summary

**What Frontend Needs:**

1. ✅ **API Endpoint:** `PUT /api/users/:userId`
2. ✅ **Authentication:** Admin must be logged in (cookie-based)
3. ✅ **Request Body:** Optional fields (firstName, lastName, phoneNumber, email, roles, isVerified)
4. ✅ **Error Handling:** Handle validation errors, email conflicts, role restrictions
5. ✅ **Success Handling:** Update UI with new user data
6. ✅ **Special Cases:**
   - Email changes send notifications
   - Admin cannot change own role
   - Email changes reset verification status

**Key Features:**
- ✅ Admin can change any user's email directly
- ✅ Admin can set verification status
- ✅ Admin can change user roles
- ✅ All changes are audited
- ✅ Email notifications sent for email changes

