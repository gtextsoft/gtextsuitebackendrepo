# 🎯 Frontend Email Verification - Implementation Prompt

**Copy this prompt and give it to your frontend developer:**

---

## 📧 Email Verification Flow - Frontend Implementation

### Goal

Implement a complete, industry-standard email verification experience that matches the backend API.

---

## 🎯 Requirements

### 1. **Check Verification Status After Login**

After user logs in:
- Check `user.isVerified` from API response
- If `isVerified === false`, show verification banner/modal
- Store user data including `isVerified` status

### 2. **Verification Banner Component**

Create a reusable component that:
- Shows at top of page when user is not verified
- Displays: "Your account is not verified. Please check your email."
- Has a **"Resend Verification Email"** button
- Shows loading state when resending
- Shows countdown timer (60 seconds) after clicking resend (rate limiting)
- Disappears after user verifies

**Design:** Clean, professional, non-intrusive warning banner (yellow/amber theme recommended)

### 3. **Email Verification Page**

Create a page/modal where users enter verification code:
- **6-digit code input** with individual boxes
- Auto-focus first input, move to next on input
- Support pasting 6-digit code
- Submit button to verify
- Show error messages for invalid/expired codes
- Show success message and redirect after verification
- Option to resend email if code doesn't arrive

**URL example:** `/verify-email` or `/auth/verify`

### 4. **Resend Verification Email**

Implement resend functionality:
- Calls `POST /api/users/resend-verification` endpoint
- Requires authentication (user must be logged in)
- Shows loading state
- Handles rate limiting (1 request per minute)
- Shows countdown timer if rate limited
- Shows success/error messages

### 5. **Route Guards / Protected Routes**

Protect routes that require verified email:
- Check `user.isVerified` before allowing access
- Redirect to verification page if not verified
- Show clear message: "Email verification required to access this feature"

**Example protected routes:**
- `/dashboard`
- `/bookings` (create booking)
- `/inquiries` (create inquiry)
- `/billing`
- Any feature that requires verified account

### 6. **Handle API 403 Responses**

When calling protected API endpoints:
- If response is 403 with `requiresVerification: true`
- Show verification required message
- Redirect to verification page or show modal

### 7. **Update Verification State**

After successful verification:
- Update user object in state/storage
- Set `isVerified: true`
- Remove verification banner
- Allow access to protected features
- Refresh user data if needed

### 8. **Maintain State on Refresh**

- Store user data (including `isVerified`) in localStorage or state management
- Check verification status on page load
- Re-show banner if needed
- Sync with backend if user verifies from another device/tab

---

## 🔗 Backend API Reference

**Base URL:** `http://localhost:5000/api`

### Endpoints

#### Login
```javascript
POST /users/login
Body: { email, password }
Response: { 
  success: true, 
  user: { 
    _id, email, firstName, lastName, 
    isVerified: boolean, // ← Check this!
    ... 
  } 
}
Cookie: auth_token (set automatically)
```

#### Verify Email
```javascript
POST /users/verify-email
Body: { 
  userId: string (24 chars), 
  verificationToken: string (6 digits) 
}
Response: { success: true, message: "Email successfully verified." }
```

#### Resend Verification
```javascript
POST /users/resend-verification
Headers: Cookie: auth_token=... (required - user must be logged in)
Response: { success: true, message: "Verification email sent..." }
Rate Limit: 1 request per minute
Error 429: { success: false, message: "...", retryAfter: 60 }
```

#### Protected Route Example (may return 403)
```javascript
POST /bookings
Headers: Cookie: auth_token=...
Response 403: { 
  success: false, 
  message: "Email verification required...", 
  requiresVerification: true 
}
```

---

## 🎨 UI/UX Guidelines

### Verification Banner
- **Style:** Warning/alert banner (yellow/amber background)
- **Placement:** Top of page, below header
- **Content:** 
  - Icon (warning/exclamation)
  - Message: "Your account is not verified. Please check your email."
  - Button: "Resend Verification Email"
  - Optional: Link to verification page
- **Behavior:** 
  - Show when `isVerified === false`
  - Hide when `isVerified === true`
  - Can be minimized (but show indicator)

### Verification Page
- **Design:** Clean, centered form
- **Input:** 6 individual digit inputs (large, easy to read)
- **Features:**
  - Auto-focus first input
  - Auto-advance to next input
  - Support paste (6 digits)
  - Backspace to go to previous input
  - Clear error messages
  - Loading state on submit
- **Instructions:** "We sent a 6-digit verification code to your email address"

### Error Handling
- **Invalid code:** "Invalid verification code. Please try again."
- **Expired code:** "Verification code has expired. Please request a new one."
- **Already verified:** "Your email is already verified."
- **Rate limited:** "Please wait X seconds before requesting another email."

---

## 📋 Implementation Checklist

### Core Features
- [ ] Check `isVerified` status after login
- [ ] Display verification banner when not verified
- [ ] Implement resend verification button
- [ ] Create verification page with 6-digit input
- [ ] Handle verification code submission
- [ ] Update user state after successful verification
- [ ] Implement route guards for protected pages
- [ ] Handle 403 responses from API
- [ ] Rate limiting UI (countdown timer)

### User Experience
- [ ] Clear messaging about verification requirement
- [ ] Easy-to-use code input
- [ ] Loading states for all async operations
- [ ] Error messages for failed attempts
- [ ] Success feedback after verification
- [ ] Smooth transitions/animations

### State Management
- [ ] Store user data including `isVerified`
- [ ] Update state after verification
- [ ] Persist state across page refreshes
- [ ] Sync with backend when needed

---

## 🧪 Testing Requirements

Test these scenarios:

1. ✅ User registers → Sees verification requirement
2. ✅ User logs in (not verified) → Banner appears
3. ✅ User clicks "Resend" → Email sent, countdown starts
4. ✅ User enters correct code → Verification succeeds
5. ✅ User enters wrong code → Error shown
6. ✅ User tries protected route → Redirected to verification
7. ✅ User verifies → Banner disappears, access granted
8. ✅ User refreshes page → Banner still hidden if verified

---

## 💡 Example User Flow

1. **User registers** → Backend sends email automatically
2. **User logs in** → Frontend shows verification banner
3. **User checks email** → Gets 6-digit code (e.g., `123456`)
4. **User navigates to `/verify-email`** → Enters code
5. **User submits code** → Verification succeeds
6. **User redirected** → Can now access all features

**Alternative flow (no email received):**

1. **User logs in** → Sees verification banner
2. **User clicks "Resend"** → New email sent, countdown shows
3. **User waits 60 seconds** → Can resend again if needed
4. **User receives email** → Enters code and verifies

---

## 📚 Documentation Provided

I've provided:
- ✅ Complete implementation guide with code examples
- ✅ React/Next.js component examples
- ✅ API integration reference
- ✅ UI/UX guidelines
- ✅ Testing checklist

**See:** `FRONTEND_EMAIL_VERIFICATION_GUIDE.md` for detailed code examples.

---

## 🎯 Success Criteria

Implementation is complete when:
- ✅ Unverified users see banner after login
- ✅ Users can resend verification email
- ✅ Users can enter and submit verification code
- ✅ Verification status updates across the app
- ✅ Protected routes block unverified users
- ✅ Verified users have full access
- ✅ State persists across page refreshes
- ✅ All edge cases handled (errors, rate limits, etc.)

---

## 🚀 Quick Start

1. **Check verification after login:**
   ```javascript
   if (!user.isVerified) {
     showVerificationBanner();
   }
   ```

2. **Create verification banner component**

3. **Create verification page with 6-digit input**

4. **Implement resend functionality**

5. **Add route guards for protected pages**

6. **Handle API 403 responses**

---

**Questions? Check the detailed guide: `FRONTEND_EMAIL_VERIFICATION_GUIDE.md`**

---

**Ready to implement! All backend APIs are ready and working.** ✅

