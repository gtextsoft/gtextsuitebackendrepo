# Complete Auth API Guide - Testing & Frontend Integration

**Base URL:** `http://localhost:5000`  
**API Prefix:** `/api/users`

---

## 📋 Table of Contents

1. [Register User](#1-register-user)
2. [Register Admin](#2-register-admin)
3. [Login](#3-login)
4. [Logout](#4-logout)
5. [Verify Email](#5-verify-email)
6. [Forgot Password](#6-forgot-password)
7. [Reset Password](#7-reset-password)

---

## 1. Register User

**Endpoint:** `POST http://localhost:5000/api/users/register`

**Description:** Register a new client user

**Authentication:** Not required

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body (JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Sample Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "roles": ["user"],
    "isVerified": false
  }
}
```

**Error Response (400 Bad Request):**
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

**Error Response - Duplicate Email (400):**
```json
{
  "success": false,
  "message": "User Credentials already exist"
}
```

**Field Requirements:**
- `email` - Valid email format (required)
- `password` - Minimum 6 characters (required)
- `firstName` - Not empty (required)
- `lastName` - Not empty (required)
- `phoneNumber` - String (required, no validation currently)

**Frontend Implementation:**
```javascript
// Register user
async function registerUser(userData) {
  const response = await fetch('http://localhost:5000/api/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber
    }),
  });

  const data = await response.json();
  return data;
}

// Example usage
registerUser({
  email: 'john.doe@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890'
})
  .then(result => {
    if (result.success) {
      console.log('Registration successful:', result.user);
      // User will receive verification email (if email service is enabled)
    } else {
      console.error('Registration failed:', result.message);
    }
  });
```

---

## 2. Register Admin

**Endpoint:** `POST http://localhost:5000/api/users/register-admin`

**Description:** Register a new admin user (requires secret key)

**Authentication:** Not required (but needs admin secret)

**Request Body (JSON):**
```json
{
  "email": "admin@gtextsuite.com",
  "password": "Admin@123456",
  "firstName": "Admin",
  "lastName": "User",
  "phoneNumber": "+1234567890",
  "adminSecret": "your-admin-secret-key-here"
}
```

**Sample Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/users/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gtextsuite.com",
    "password": "Admin@123456",
    "firstName": "Admin",
    "lastName": "User",
    "phoneNumber": "+1234567890",
    "adminSecret": "your-admin-secret-key-here"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "admin@gtextsuite.com",
    "firstName": "Admin",
    "lastName": "User",
    "phoneNumber": "+1234567890",
    "roles": ["admin"],
    "isVerified": true
  }
}
```

**Error Response - Invalid Secret (403):**
```json
{
  "success": false,
  "message": "Invalid admin secret key"
}
```

**Error Response - Missing Secret Config (500):**
```json
{
  "success": false,
  "message": "Admin registration not configured"
}
```

**Field Requirements:**
- Same as Register User
- `adminSecret` - Must match `ADMIN_SECRET_KEY` in `.env` (required)

**Important:** 
- Set `ADMIN_SECRET_KEY` in your `.env` file
- Admin users are automatically verified (`isVerified: true`)

---

## 3. Login

**Endpoint:** `POST http://localhost:5000/api/users/login`

**Description:** Login user and get authentication cookie

**Authentication:** Not required

**Request Body (JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Sample Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login Successfully.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "roles": ["user"],
    "isVerified": false
  }
}
```

**Note:** Cookie `auth_token` is automatically set as HttpOnly cookie. Frontend doesn't need to manually store it.

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Frontend Implementation:**
```javascript
async function loginUser(email, password) {
  const response = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // CRITICAL: Include cookies
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (data.success) {
    // Cookie is automatically set by browser
    // Store user data in your state/context
    return data.user;
  } else {
    throw new Error(data.message);
  }
}
```

---

## 4. Logout

**Endpoint:** `POST http://localhost:5000/api/users/logout`

**Description:** Logout user (clears authentication cookie)

**Authentication:** Not required (but cookie must be sent)

**Request Body:** None required

**Sample Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/users/logout \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -c cookies.txt
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Frontend Implementation:**
```javascript
async function logout() {
  const response = await fetch('http://localhost:5000/api/users/logout', {
    method: 'POST',
    credentials: 'include', // Include cookies to clear them
  });

  const data = await response.json();
  
  if (data.success) {
    // Clear user data from your app state
    // Cookie is automatically cleared by server
    return true;
  }
  
  return false;
}
```

---

## 5. Verify Email

**Endpoint:** `POST http://localhost:5000/api/users/verify-email`

**Description:** Verify user email with verification token

**Authentication:** Not required

**Request Body (JSON):**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "verificationToken": "123456"
}
```

**Sample Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/users/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "verificationToken": "123456"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Email successfully verified."
}
```

**Error Response - Already Verified (400):**
```json
{
  "success": false,
  "message": "Email is already verified."
}
```

**Error Response - Invalid Token (400):**
```json
{
  "success": false,
  "message": "Invalid verification token."
}
```

**Error Response - Expired Token (400):**
```json
{
  "success": false,
  "message": "Verification token has expired. Please request a new one."
}
```

**Field Requirements:**
- `userId` - Exactly 24 characters, hexadecimal (MongoDB ObjectId)
- `verificationToken` - Exactly 6 digits (numeric)

**Frontend Implementation:**
```javascript
async function verifyEmail(userId, verificationToken) {
  const response = await fetch('http://localhost:5000/api/users/verify-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      userId: userId,
      verificationToken: verificationToken
    }),
  });

  const data = await response.json();
  return data;
}

// Example usage
verifyEmail('507f1f77bcf86cd799439011', '123456')
  .then(result => {
    if (result.success) {
      console.log('Email verified successfully!');
      // Redirect to login or update UI
    } else {
      console.error('Verification failed:', result.message);
    }
  });
```

**Where to get userId and verificationToken:**
- `userId` - Received in registration response (`user._id`)
- `verificationToken` - 6-digit code sent via email (if email service is enabled)

---

## 6. Forgot Password

**Endpoint:** `POST http://localhost:5000/api/users/forgot-password`

**Description:** Request password reset link

**Authentication:** Not required

**Request Body (JSON):**
```json
{
  "email": "john.doe@example.com"
}
```

**Sample Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "resetLink": "http://localhost:3000/reset-password/abc123def456..."
}
```

**Note:** `resetLink` is only included in development mode for testing. In production, it's hidden for security.

**Error Response (400 Bad Request):**
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

**Security Note:** Always returns success message even if email doesn't exist (prevents email enumeration attacks).

**Frontend Implementation:**
```javascript
async function forgotPassword(email) {
  const response = await fetch('http://localhost:5000/api/users/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  return data;
}

// Example usage
forgotPassword('john.doe@example.com')
  .then(result => {
    if (result.success) {
      alert(result.message);
      // Show success message to user
      // In dev mode, you might want to show resetLink for testing
      if (result.resetLink) {
        console.log('Reset link:', result.resetLink);
      }
    }
  });
```

---

## 7. Reset Password

**Endpoint:** `POST http://localhost:5000/api/users/reset-password/:token`

**Description:** Reset password using reset token from email

**Authentication:** Not required

**URL Parameter:**
- `token` - Reset token from password reset email link

**Request Body (JSON):**
```json
{
  "password": "newpassword123"
}
```

**Sample Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/users/reset-password/abc123def456ghi789jkl012mno345pqr678 \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword123"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

**Error Response - Invalid/Expired Token (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token."
}
```

**Error Response - Missing Token (400):**
```json
{
  "success": false,
  "message": "Reset token is required."
}
```

**Field Requirements:**
- `password` - Minimum 6 characters (required)

**Frontend Implementation:**
```javascript
async function resetPassword(resetToken, newPassword) {
  const response = await fetch(`http://localhost:5000/api/users/reset-password/${resetToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      password: newPassword
    }),
  });

  const data = await response.json();
  return data;
}

// Example usage (token comes from URL: /reset-password/:token)
const urlParams = new URLSearchParams(window.location.search);
const token = window.location.pathname.split('/reset-password/')[1];

resetPassword(token, 'newpassword123')
  .then(result => {
    if (result.success) {
      alert('Password reset successful! Please login.');
      // Redirect to login page
      window.location.href = '/login';
    } else {
      alert(result.message);
    }
  });
```

---

## 🧪 Complete Test Data Samples

### Test User 1 - Regular User
```json
{
  "email": "testuser@example.com",
  "password": "testpass123",
  "firstName": "Test",
  "lastName": "User",
  "phoneNumber": "+1234567890"
}
```

### Test User 2 - Another Regular User
```json
{
  "email": "jane.smith@example.com",
  "password": "janepass456",
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1987654321"
}
```

### Test Admin
```json
{
  "email": "admin@gtextsuite.com",
  "password": "AdminPass123",
  "firstName": "Admin",
  "lastName": "Manager",
  "phoneNumber": "+1555555555",
  "adminSecret": "your-admin-secret-key-here"
}
```

---

## 📝 Quick Test Sequence

### 1. Register a User
```bash
POST http://localhost:5000/api/users/register
{
  "email": "test@example.com",
  "password": "test123",
  "firstName": "Test",
  "lastName": "User",
  "phoneNumber": "+1234567890"
}
```

**Expected:** 201 Created with user data and verification token generated (check backend logs)

### 2. Login (if already registered)
```bash
POST http://localhost:5000/api/users/login
{
  "email": "test@example.com",
  "password": "test123"
}
```

**Expected:** 200 OK with user data and cookie set

### 3. Verify Email
```bash
POST http://localhost:5000/api/users/verify-email
{
  "userId": "USER_ID_FROM_REGISTRATION",
  "verificationToken": "VERIFICATION_CODE_FROM_EMAIL"
}
```

**Note:** If email service is commented out, check backend logs/console for verification code

### 4. Forgot Password
```bash
POST http://localhost:5000/api/users/forgot-password
{
  "email": "test@example.com"
}
```

**Expected:** 200 OK with reset link (in dev mode)

### 5. Reset Password
```bash
POST http://localhost:5000/api/users/reset-password/RESET_TOKEN_FROM_EMAIL
{
  "password": "newpassword123"
}
```

**Expected:** 200 OK with success message

### 6. Logout
```bash
POST http://localhost:5000/api/users/logout
```

**Expected:** 200 OK, cookie cleared

---

## 🔐 Authentication Cookie Details

**Cookie Name:** `auth_token`

**Cookie Properties:**
- **Type:** HttpOnly (cannot be accessed via JavaScript)
- **Expires:** 24 hours
- **Auto-sent:** Browser automatically includes in requests
- **Cross-origin:** Supports cross-origin in production (sameSite: "none")

**How It Works:**
1. User logs in via `/api/users/login`
2. Server sets `auth_token` cookie automatically
3. Browser sends cookie with every request automatically
4. Frontend doesn't need to manually store or send token
5. Protected routes check this cookie via `authenticate` middleware

**Testing Cookies:**
- Use browser DevTools → Network tab → Check "Set-Cookie" header in response
- Use browser DevTools → Application tab → Cookies to see stored cookie
- For cURL: Use `-c cookies.txt` to save cookies, `-b cookies.txt` to send cookies

---

## 🌐 Frontend Integration Checklist

### Required Setup

1. **Base URL Configuration**
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

2. **Always Include Credentials**
   ```javascript
   credentials: 'include'  // For fetch
   withCredentials: true   // For axios
   ```

3. **Content-Type Header**
   ```javascript
   headers: {
     'Content-Type': 'application/json'
   }
   ```

### Complete Frontend Example

```javascript
// api/auth.js
const API_BASE_URL = 'http://localhost:5000/api';

// Register
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  return await response.json();
};

// Login
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
};

// Logout
export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/users/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return await response.json();
};

// Verify Email
export const verifyEmail = async (userId, verificationToken) => {
  const response = await fetch(`${API_BASE_URL}/users/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, verificationToken }),
  });
  return await response.json();
};

// Forgot Password
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  return await response.json();
};

// Reset Password
export const resetPassword = async (token, password) => {
  const response = await fetch(`${API_BASE_URL}/users/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password }),
  });
  return await response.json();
};
```

---

## 📧 Email Testing Setup

### To Test Email Functionality

1. **Configure Email in `.env`:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CLIENT_URL=http://localhost:3000
   ```

2. **Uncomment Email Sending in Controllers:**
   - Line 47 in `src/controllers/auth.ts`: `await sendVerificationEmail(email, verificationToken);`
   - Line 241 in `src/controllers/auth.ts`: `await sendWelcomeEmail(...)`
   - Line 296 in `src/controllers/auth.ts`: `await sendPasswordResetEmail(...)`
   - Line 358 in `src/controllers/auth.ts`: `await sendResetSuccessEmail(...)`

3. **Get Verification Code (if email not configured):**
   - Check backend console logs when user registers
   - Verification code is logged/generated (6-digit number)

---

## 🎯 Testing Checklist

- [ ] Register user → Check response includes user data
- [ ] Register user → Check verification email sent (if enabled)
- [ ] Register admin → Check admin secret validation works
- [ ] Login → Check cookie is set in browser
- [ ] Login → Check user data returned
- [ ] Logout → Check cookie is cleared
- [ ] Verify email → Test with valid token
- [ ] Verify email → Test with invalid token
- [ ] Forgot password → Check reset link generated
- [ ] Reset password → Test with valid token
- [ ] Reset password → Test with expired token

---

## 📌 Important Notes

1. **Cookies:** Always use `credentials: 'include'` in fetch requests
2. **CORS:** Frontend URL must be in backend CORS config
3. **Email:** Email service is currently commented out - uncomment to enable
4. **Admin Secret:** Must be set in `.env` as `ADMIN_SECRET_KEY`
5. **Client URL:** Set `CLIENT_URL` in `.env` for password reset links

---

**Last Updated:** Based on current implementation  
**Ready for Testing:** ✅ All endpoints documented

