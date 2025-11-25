# 🔐 Admin Registration Guide

## 📋 Required Data for Admin Registration

### Endpoint
```
POST http://localhost:5000/api/users/register-admin
```

---

## ✅ Required Fields

### 1. **email** (string, required)
- Valid email format
- Must be unique (not already registered)
- Example: `"admin@gtextsuite.com"`

### 2. **password** (string, required)
- Minimum 6 characters
- Will be hashed automatically
- Example: `"AdminPass123"`

### 3. **firstName** (string, required)
- Not empty
- Example: `"Admin"`

### 4. **lastName** (string, required)
- Not empty
- Example: `"Manager"`

### 5. **phoneNumber** (string, required)
- Phone number in string format
- Example: `"+1234567890"`

### 6. **adminSecret** (string, required)
- Must match `ADMIN_SECRET_KEY` in your `.env` file
- Security key to prevent unauthorized admin registration
- Example: `"your-secret-key-123"`

---

## 📝 Complete Request Example

### JSON Body:
```json
{
  "email": "admin@gtextsuite.com",
  "password": "AdminPass123",
  "firstName": "Admin",
  "lastName": "Manager",
  "phoneNumber": "+1234567890",
  "adminSecret": "your-admin-secret-key-here"
}
```

### cURL Example:
```bash
curl -X POST http://localhost:5000/api/users/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gtextsuite.com",
    "password": "AdminPass123",
    "firstName": "Admin",
    "lastName": "Manager",
    "phoneNumber": "+1234567890",
    "adminSecret": "your-admin-secret-key-here"
  }'
```

### Postman Example:
1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/users/register-admin`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "email": "admin@gtextsuite.com",
  "password": "AdminPass123",
  "firstName": "Admin",
  "lastName": "Manager",
  "phoneNumber": "+1234567890",
  "adminSecret": "your-admin-secret-key-here"
}
```

---

## ✅ Success Response (201 Created)

```json
{
  "success": true,
  "message": "Admin registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "admin@gtextsuite.com",
    "firstName": "Admin",
    "lastName": "Manager",
    "phoneNumber": "+1234567890",
    "roles": ["admin"],
    "isVerified": true
  }
}
```

**Important Notes:**
- ✅ Admin users are **automatically verified** (`isVerified: true`)
- ✅ Admin users have `roles: ["admin"]`
- ✅ Admin users can access admin-protected routes

---

## ❌ Error Responses

### 1. Invalid Admin Secret (403 Forbidden)
```json
{
  "success": false,
  "message": "Invalid admin secret key"
}
```
**Fix:** Check that `adminSecret` matches `ADMIN_SECRET_KEY` in `.env` file

### 2. Admin Secret Not Configured (500)
```json
{
  "success": false,
  "message": "Admin registration not configured"
}
```
**Fix:** Add `ADMIN_SECRET_KEY` to your `.env` file

### 3. Email Already Exists (400)
```json
{
  "success": false,
  "message": "User Credentials already exist"
}
```
**Fix:** Use a different email address

### 4. Validation Errors (400)
```json
{
  "success": false,
  "errors": [
    {
      "msg": "A valid email is required.",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "First name is required.",
      "param": "firstName",
      "location": "body"
    }
  ]
}
```

---

## 🔧 Setup Required

### Step 1: Add Admin Secret to `.env`

Open your `.env` file and add:
```env
ADMIN_SECRET_KEY=your-secret-key-here
```

**Recommendation:** Use a strong, random string:
- At least 32 characters
- Mix of letters, numbers, and special characters
- Example: `AdminSecretKey2024!@#$%`

### Step 2: Restart Server

After adding `ADMIN_SECRET_KEY` to `.env`, restart your server:
```bash
npm run dev
```

---

## 🎯 Quick Reference

### Minimal Test Data:
```json
{
  "email": "admin@test.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User",
  "phoneNumber": "+1234567890",
  "adminSecret": "your-secret-from-env"
}
```

### Field Requirements Summary:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ Yes | Valid email format |
| `password` | string | ✅ Yes | Min 6 characters |
| `firstName` | string | ✅ Yes | Not empty |
| `lastName` | string | ✅ Yes | Not empty |
| `phoneNumber` | string | ✅ Yes | Any string |
| `adminSecret` | string | ✅ Yes | Must match `.env` |

---

## 🔐 Security Notes

1. **Keep Admin Secret Safe:**
   - Never commit `ADMIN_SECRET_KEY` to git
   - Use strong, random secret
   - Don't share secret in frontend code

2. **Admin Auto-Verification:**
   - Admins are automatically verified
   - No email verification needed
   - Can access all features immediately

3. **Admin Privileges:**
   - Admins can access routes protected by `requireAdmin` middleware
   - Admins have `roles: ["admin"]` in user object

---

## 📝 Example: Register Admin via Frontend Code

```typescript
async function registerAdmin(adminData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  adminSecret: string;
}) {
  const response = await fetch('http://localhost:5000/api/users/register-admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(adminData),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Admin registered:', data.user);
    return data.user;
  } else {
    throw new Error(data.message);
  }
}

// Usage
registerAdmin({
  email: 'admin@gtextsuite.com',
  password: 'SecurePassword123!',
  firstName: 'Admin',
  lastName: 'Manager',
  phoneNumber: '+1234567890',
  adminSecret: 'your-secret-key-from-env'
});
```

---

## ✅ Checklist

Before registering admin:
- [ ] `ADMIN_SECRET_KEY` is set in `.env` file
- [ ] Server has been restarted after adding secret
- [ ] Email address is not already registered
- [ ] Password meets minimum 6 characters
- [ ] All required fields are provided

---

**That's all you need! Just make sure `ADMIN_SECRET_KEY` is set in your `.env` file.** 🔐


