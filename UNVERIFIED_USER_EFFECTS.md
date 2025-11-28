# Effects of Being Unverified (isVerified: false)

## 📋 Overview

When a user has `isVerified: false`, they are considered **unverified** and may face certain restrictions depending on how routes are protected.

---

## ✅ What Unverified Users CAN Do

### 1. **Login** ✅
- Unverified users **CAN login** successfully
- Login response includes `isVerified: false` status
- User receives authentication token/cookie

### 2. **View Public Content** ✅
- View properties (public listings)
- View tours (public listings)
- Browse the website
- View property/tour details

### 3. **Update Profile** ✅
- Update firstName, lastName, phoneNumber
- Request email change (triggers verification flow)

### 4. **Resend Verification Email** ✅
- Request new verification email
- Rate limited to 1 request per minute

### 5. **Verify Email** ✅
- Use verification code to verify email
- Set `isVerified: true`

---

## ❌ What Unverified Users CANNOT Do

### 1. **Access Protected Routes** ❌

Routes protected with `requireVerified` middleware will **block** unverified users:

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Email verification required. Please verify your email to access this feature.",
  "requiresVerification": true
}
```

### 2. **Currently Protected Routes**

Based on the codebase, these routes **should** be protected (but may not be yet):

- ❌ **Create Booking** - `POST /api/bookings`
- ❌ **Create Inquiry** - `POST /api/inquiries`
- ❌ **User Dashboard** - Any dashboard routes
- ❌ **Billing/Payment** - Any payment-related routes

**Note:** Currently, these routes may not have `requireVerified` middleware applied. You need to add it manually.

---

## 🔒 How to Protect Routes

### Add `requireVerified` Middleware

```typescript
import { authenticate, requireVerified } from '../middleware/auth.middleware';

// Example: Protect booking creation
router.post(
  '/bookings',
  authenticate,        // Must be logged in
  requireVerified,     // Must be verified
  createBooking
);

// Example: Protect inquiry creation
router.post(
  '/inquiries',
  authenticate,        // Must be logged in
  requireVerified,     // Must be verified
  createInquiry
);
```

---

## 📊 Current Implementation Status

### ✅ Already Implemented

1. **Middleware Available** - `requireVerified` middleware exists
2. **Login Works** - Unverified users can login
3. **Verification Endpoint** - Users can verify email
4. **Resend Endpoint** - Users can request new verification email

### ⚠️ Needs Implementation

1. **Route Protection** - Add `requireVerified` to routes that need it:
   - Booking creation
   - Inquiry creation
   - Dashboard routes
   - Payment routes
   - Any other sensitive operations

---

## 🎯 Recommended Routes to Protect

### High Priority (Should Require Verification)

1. **Bookings**
   - `POST /api/bookings` - Create booking
   - `PUT /api/bookings/:id` - Update booking
   - `DELETE /api/bookings/:id` - Cancel booking

2. **Inquiries**
   - `POST /api/inquiries` - Create inquiry
   - `PUT /api/inquiries/:id` - Update inquiry

3. **Tour Bookings**
   - `POST /api/tours/:id/book` - Book a tour

4. **User Dashboard**
   - `GET /api/users/dashboard` - User dashboard data
   - `GET /api/users/bookings` - User's bookings
   - `GET /api/users/inquiries` - User's inquiries

### Medium Priority (Consider Protecting)

1. **Profile Updates**
   - `PUT /api/users/profile` - Update profile (may want to allow)
   - Email change requests (already has its own verification flow)

2. **Image Uploads**
   - `POST /api/uploads/*` - Upload images (may want to allow)

---

## 💻 Frontend Handling

### Check Verification Status

```typescript
// After login
const loginResponse = await login(email, password);
if (loginResponse.success) {
  const { user } = loginResponse;
  
  if (!user.isVerified) {
    // Show verification banner
    showVerificationBanner();
    // Redirect to verification page
    // Block access to protected features
  }
}
```

### Handle 403 Responses

```typescript
async function createBooking(bookingData) {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(bookingData),
  });

  if (response.status === 403) {
    const data = await response.json();
    if (data.requiresVerification) {
      // Show verification required message
      showVerificationRequired();
      // Redirect to verification page
      redirectToVerification();
    }
  }
}
```

### Show Verification Banner

```tsx
function VerificationBanner() {
  const { user } = useAuth();
  
  if (user?.isVerified) {
    return null; // Don't show if verified
  }

  return (
    <div className="verification-banner">
      <p>⚠️ Your email is not verified. Please verify your email to access all features.</p>
      <button onClick={resendVerification}>Resend Verification Email</button>
    </div>
  );
}
```

---

## 🔄 Verification Flow

### When User is Unverified

1. **User Registers** → `isVerified: false`
2. **Verification Email Sent** → User receives code
3. **User Logs In** → Can login, but sees verification banner
4. **User Tries Protected Action** → Gets 403 error
5. **User Verifies Email** → `isVerified: true`
6. **User Can Access Everything** → All restrictions removed

### When Admin Sets isVerified: false

1. **Admin Changes User Email** → `isVerified` automatically set to `false`
2. **User Must Verify New Email** → Receives new verification code
3. **User Cannot Access Protected Routes** → Until verified again

---

## 📝 Summary

### Effects of `isVerified: false`

| Feature | Unverified User | Verified User |
|---------|----------------|---------------|
| **Login** | ✅ Can login | ✅ Can login |
| **View Properties** | ✅ Can view | ✅ Can view |
| **View Tours** | ✅ Can view | ✅ Can view |
| **Create Booking** | ❌ Blocked (if protected) | ✅ Allowed |
| **Create Inquiry** | ❌ Blocked (if protected) | ✅ Allowed |
| **Update Profile** | ✅ Allowed | ✅ Allowed |
| **Change Email** | ✅ Allowed (triggers verification) | ✅ Allowed (triggers verification) |
| **Dashboard** | ❌ Blocked (if protected) | ✅ Allowed |
| **Payment** | ❌ Blocked (if protected) | ✅ Allowed |

### Key Points

1. ✅ **Unverified users CAN login** - They're not blocked from the site
2. ❌ **Protected routes return 403** - With `requiresVerification: true`
3. ✅ **Users can verify anytime** - Using verification code
4. ⚠️ **Routes need protection** - Add `requireVerified` middleware where needed
5. 🔄 **Email changes reset verification** - User must verify new email

---

## 🚀 Next Steps

1. **Review Routes** - Identify which routes should require verification
2. **Add Middleware** - Add `requireVerified` to protected routes
3. **Frontend Handling** - Handle 403 responses and show verification prompts
4. **User Experience** - Show clear messages about verification requirements

---

## ⚠️ Important Notes

- **Currently, most routes are NOT protected** - You need to add `requireVerified` middleware
- **Login is always allowed** - Even for unverified users
- **Admin can bypass** - Admin can set `isVerified: true` directly
- **Email changes reset verification** - Security best practice

