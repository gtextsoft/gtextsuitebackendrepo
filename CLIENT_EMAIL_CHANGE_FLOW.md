# Client Email Change Flow - Complete Frontend Guide

## 📋 Overview

When a client (regular user) wants to change their email, they must complete a **two-step sequential verification**:
1. **Step 1:** Old email approves the change (REQUIRED FIRST)
2. **Step 2:** New email verifies they control the new address
3. **Step 3:** Change completes automatically when both are done

---

## 🔄 Complete Flow Diagram

```
User Requests Email Change
         ↓
Both Emails Receive Codes
         ↓
┌────────────────┐
│  OLD EMAIL     │ ← Must approve FIRST
│  (Approval)    │
└────────────────┘
         ↓
┌────────────────┐
│  NEW EMAIL     │ ← Then verify
│  (Verification)│
└────────────────┘
         ↓
   Change Complete
```

---

## 📡 API Endpoints - Complete Reference

### 1. Request Email Change

**Endpoint:** `PUT /api/users/profile`

**Authentication:** Required (User must be logged in)

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "newemail@example.com"
}
```

**Required Fields:**
- `email` (string, valid email format) - The new email address

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated. Verification codes have been sent to both your new and old email addresses. Both must be verified to complete the email change.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "oldemail@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "roles": ["user"],
    "isVerified": true,
    "lastLoginDate": "2024-01-15T10:30:00.000Z",
    "pendingEmail": "newemail@example.com",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  },
  "needsReVerification": true,
  "pendingEmailChange": true
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
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

**400 Bad Request - Email Already Exists:**
```json
{
  "success": false,
  "message": "Email is already in use by another account."
}
```

**400 Bad Request - Pending Change Exists:**
```json
{
  "success": false,
  "message": "You already have a pending email change. Please verify or cancel it first.",
  "pendingEmail": "previousnewemail@example.com"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized. Please login first."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to send verification email. Please try again."
}
```

---

### 2. Approve from Old Email (Step 1 - REQUIRED FIRST)

**Endpoint:** `POST /api/users/approve-email-change`

**Authentication:** Required (User must be logged in)

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "approvalToken": "123456"
}
```

**Required Fields:**
- `approvalToken` (string, 6 digits, numeric) - Approval code from old email

**Success Response (200 OK) - Change Not Complete Yet:**
```json
{
  "success": true,
  "message": "Old email approved successfully! Now please verify your new email address to complete the change.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "oldemail@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "roles": ["user"],
    "isVerified": true,
    "lastLoginDate": "2024-01-15T10:30:00.000Z",
    "pendingEmail": "newemail@example.com",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  },
  "emailChangeStatus": {
    "newEmailVerified": false,
    "oldEmailApproved": true,
    "completed": false
  },
  "nextStep": {
    "action": "verify_new_email",
    "message": "Please check your new email inbox and verify the change to complete the process.",
    "newEmail": "newemail@example.com"
  }
}
```

**Success Response (200 OK) - Change Complete (if new email already verified):**
```json
{
  "success": true,
  "message": "Email address changed successfully. Please verify your new email address.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "newemail@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "roles": ["user"],
    "isVerified": false,
    "lastLoginDate": "2024-01-15T10:30:00.000Z",
    "pendingEmail": null,
    "updatedAt": "2024-01-16T14:25:00.000Z"
  },
  "emailChangeStatus": {
    "newEmailVerified": true,
    "oldEmailApproved": true,
    "completed": true
  },
  "nextStep": null
}
```

**Error Responses:**

**400 Bad Request - No Pending Change:**
```json
{
  "success": false,
  "message": "No pending email change found."
}
```

**400 Bad Request - Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid approval token."
}
```

**400 Bad Request - Expired Token:**
```json
{
  "success": false,
  "message": "Approval token has expired. Please request a new email change."
}
```

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Approval token must be exactly 6 digits long.",
      "param": "approvalToken",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized. Please login first."
}
```

---

### 3. Verify New Email (Step 2 - AFTER OLD EMAIL APPROVES)

**Endpoint:** `POST /api/users/verify-email-change`

**Authentication:** Required (User must be logged in)

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "verificationToken": "654321"
}
```

**Required Fields:**
- `verificationToken` (string, 6 digits, numeric) - Verification code from new email

**Success Response (200 OK) - Change Complete:**
```json
{
  "success": true,
  "message": "Email address changed successfully. Please verify your new email address.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "newemail@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "roles": ["user"],
    "isVerified": false,
    "lastLoginDate": "2024-01-15T10:30:00.000Z",
    "pendingEmail": null,
    "updatedAt": "2024-01-16T14:25:00.000Z"
  },
  "emailChangeStatus": {
    "newEmailVerified": true,
    "oldEmailApproved": true,
    "completed": true
  },
  "nextStep": null
}
```

**Error Response (400 Bad Request) - Old Email Not Approved Yet:**
```json
{
  "success": false,
  "message": "Please approve the email change from your old email address first. Check your old email inbox for the approval code, then verify your new email address.",
  "requiresOldEmailApproval": true,
  "instructions": {
    "step1": "Check your OLD email inbox (oldemail@example.com) for the approval code",
    "step2": "Enter the approval code using the 'Approve Email Change' option",
    "step3": "After approval, you can verify your new email address"
  },
  "currentEmail": "oldemail@example.com",
  "pendingEmail": "newemail@example.com"
}
```

**Other Error Responses:**

**400 Bad Request - No Pending Change:**
```json
{
  "success": false,
  "message": "No pending email change found."
}
```

**400 Bad Request - Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid verification token."
}
```

**400 Bad Request - Expired Token:**
```json
{
  "success": false,
  "message": "Verification token has expired. Please request a new email change."
}
```

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Verification token must be exactly 6 digits long.",
      "param": "verificationToken",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized. Please login first."
}
```

---

### 4. Cancel Pending Email Change

**Endpoint:** `POST /api/users/cancel-email-change`

**Authentication:** Required (User must be logged in)

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:** None (empty body)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Pending email change has been cancelled.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "oldemail@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "roles": ["user"],
    "isVerified": true,
    "lastLoginDate": "2024-01-15T10:30:00.000Z",
    "pendingEmail": null,
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "No pending email change to cancel."
}
```

---

### 5. Get Current Profile (Check Pending Status)

**Endpoint:** `GET /api/users/profile`

**Authentication:** Required (User must be logged in)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "oldemail@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "roles": ["user"],
    "isVerified": true,
    "lastLoginDate": "2024-01-15T10:30:00.000Z",
    "pendingEmail": "newemail@example.com",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

**Key Fields for Frontend:**
- `user.pendingEmail` - If present, user has pending email change
- `user.email` - Current email address
- `user.isVerified` - Current verification status

---

## 💻 Complete Frontend Implementation

### TypeScript/JavaScript API Functions

```typescript
// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Types
interface EmailChangeResponse {
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
    pendingEmail?: string | null;
    updatedAt: string;
  };
  emailChangeStatus?: {
    newEmailVerified: boolean;
    oldEmailApproved: boolean;
    completed: boolean;
  };
  nextStep?: {
    action: string;
    message: string;
    oldEmail?: string;
    newEmail?: string;
  } | null;
  requiresOldEmailApproval?: boolean;
  instructions?: {
    step1: string;
    step2: string;
    step3: string;
  };
  currentEmail?: string;
  pendingEmailChange?: boolean;
  needsReVerification?: boolean;
  errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}

// 1. Request Email Change
async function requestEmailChange(newEmail: string): Promise<EmailChangeResponse> {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email: newEmail }),
  });
  return await response.json();
}

// 2. Approve from Old Email
async function approveOldEmail(approvalToken: string): Promise<EmailChangeResponse> {
  const response = await fetch(`${API_BASE_URL}/users/approve-email-change`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ approvalToken }),
  });
  return await response.json();
}

// 3. Verify New Email
async function verifyNewEmail(verificationToken: string): Promise<EmailChangeResponse> {
  const response = await fetch(`${API_BASE_URL}/users/verify-email-change`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ verificationToken }),
  });
  return await response.json();
}

// 4. Cancel Pending Email Change
async function cancelEmailChange(): Promise<EmailChangeResponse> {
  const response = await fetch(`${API_BASE_URL}/users/cancel-email-change`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  return await response.json();
}

// 5. Get Current Profile (Check Pending Status)
async function getProfile(): Promise<EmailChangeResponse> {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  return await response.json();
}
```

---

## 🎨 Complete React Component Example

```tsx
import React, { useState, useEffect } from 'react';

interface EmailChangeState {
  step: 'request' | 'oldEmail' | 'newEmail' | 'complete';
  oldEmail: string;
  newEmail: string;
  oldCode: string;
  newCode: string;
  error: string | null;
  nextStep: any;
  loading: boolean;
}

function EmailChangeComponent() {
  const [state, setState] = useState<EmailChangeState>({
    step: 'request',
    oldEmail: '',
    newEmail: '',
    oldCode: '',
    newCode: '',
    error: null,
    nextStep: null,
    loading: false,
  });

  // Check for pending email change on mount
  useEffect(() => {
    checkPendingChange();
  }, []);

  const checkPendingChange = async () => {
    try {
      const result = await getProfile();
      if (result.success && result.user?.pendingEmail) {
        setState(prev => ({
          ...prev,
          oldEmail: result.user!.email,
          newEmail: result.user!.pendingEmail!,
          step: 'oldEmail', // Start with old email approval
        }));
      }
    } catch (error) {
      console.error('Error checking pending change:', error);
    }
  };

  // Step 1: Request Email Change
  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await requestEmailChange(state.newEmail);

      if (result.success && result.pendingEmailChange) {
        setState(prev => ({
          ...prev,
          oldEmail: result.user!.email,
          step: 'oldEmail',
          loading: false,
        }));
      } else if (!result.success) {
        setState(prev => ({
          ...prev,
          error: result.message || 'Failed to request email change',
          loading: false,
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Network error. Please try again.',
        loading: false,
      }));
    }
  };

  // Step 2: Approve from Old Email
  const handleApproveOldEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (state.oldCode.length !== 6) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a 6-digit approval code',
        loading: false,
      }));
      return;
    }

    try {
      const result = await approveOldEmail(state.oldCode);

      if (result.success) {
        if (result.emailChangeStatus?.completed) {
          // Both done! Change complete
          setState(prev => ({
            ...prev,
            step: 'complete',
            loading: false,
          }));
        } else {
          // Old email approved, move to new email verification
          setState(prev => ({
            ...prev,
            step: 'newEmail',
            nextStep: result.nextStep,
            loading: false,
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          error: result.message || 'Invalid approval code',
          loading: false,
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Network error. Please try again.',
        loading: false,
      }));
    }
  };

  // Step 3: Verify New Email
  const handleVerifyNewEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (state.newCode.length !== 6) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a 6-digit verification code',
        loading: false,
      }));
      return;
    }

    try {
      const result = await verifyNewEmail(state.newCode);

      if (result.success) {
        if (result.emailChangeStatus?.completed) {
          // Change complete!
          setState(prev => ({
            ...prev,
            step: 'complete',
            loading: false,
          }));
        } else if (result.requiresOldEmailApproval) {
          // Old email must approve first
          setState(prev => ({
            ...prev,
            step: 'oldEmail',
            error: result.message,
            instructions: result.instructions,
            loading: false,
          }));
        } else if (result.nextStep) {
          // Waiting for old email approval
          setState(prev => ({
            ...prev,
            step: 'oldEmail',
            nextStep: result.nextStep,
            loading: false,
          }));
        }
      } else {
        // Handle specific error cases
        if (result.requiresOldEmailApproval) {
          setState(prev => ({
            ...prev,
            step: 'oldEmail',
            error: result.message,
            instructions: result.instructions,
            loading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: result.message || 'Invalid verification code',
            loading: false,
          }));
        }
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Network error. Please try again.',
        loading: false,
      }));
    }
  };

  // Cancel Pending Change
  const handleCancel = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const result = await cancelEmailChange();
      if (result.success) {
        setState(prev => ({
          ...prev,
          step: 'request',
          oldCode: '',
          newCode: '',
          newEmail: '',
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Error cancelling:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="email-change-container">
      {/* Step 1: Request Email Change */}
      {state.step === 'request' && (
        <div className="step-request">
          <h2>Change Email Address</h2>
          <form onSubmit={handleRequestChange}>
            <div>
              <label>New Email Address</label>
              <input
                type="email"
                value={state.newEmail}
                onChange={(e) => setState(prev => ({ ...prev, newEmail: e.target.value }))}
                placeholder="Enter new email"
                required
                disabled={state.loading}
              />
            </div>
            {state.error && <div className="error">{state.error}</div>}
            <button type="submit" disabled={state.loading}>
              {state.loading ? 'Requesting...' : 'Request Email Change'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Approve from Old Email */}
      {state.step === 'oldEmail' && (
        <div className="step-old-email">
          <h2>Step 1: Approve from Old Email</h2>
          <p>Check your <strong>{state.oldEmail}</strong> inbox for the approval code</p>
          
          {state.instructions && (
            <div className="instructions">
              <h3>Instructions:</h3>
              <ol>
                <li>{state.instructions.step1}</li>
                <li>{state.instructions.step2}</li>
                <li>{state.instructions.step3}</li>
              </ol>
            </div>
          )}

          <form onSubmit={handleApproveOldEmail}>
            <div>
              <label>Approval Code (6 digits)</label>
              <input
                type="text"
                value={state.oldCode}
                onChange={(e) => setState(prev => ({ ...prev, oldCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                placeholder="123456"
                maxLength={6}
                required
                disabled={state.loading}
              />
            </div>
            {state.error && <div className="error">{state.error}</div>}
            <div className="button-group">
              <button type="submit" disabled={state.loading || state.oldCode.length !== 6}>
                {state.loading ? 'Approving...' : 'Approve Email Change'}
              </button>
              <button type="button" onClick={handleCancel} disabled={state.loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Verify New Email */}
      {state.step === 'newEmail' && (
        <div className="step-new-email">
          <h2>Step 2: Verify New Email</h2>
          <p>Check your <strong>{state.newEmail}</strong> inbox for the verification code</p>
          
          {state.nextStep && (
            <div className="info">
              <p>{state.nextStep.message}</p>
            </div>
          )}

          <form onSubmit={handleVerifyNewEmail}>
            <div>
              <label>Verification Code (6 digits)</label>
              <input
                type="text"
                value={state.newCode}
                onChange={(e) => setState(prev => ({ ...prev, newCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                placeholder="654321"
                maxLength={6}
                required
                disabled={state.loading}
              />
            </div>
            {state.error && <div className="error">{state.error}</div>}
            <div className="button-group">
              <button type="submit" disabled={state.loading || state.newCode.length !== 6}>
                {state.loading ? 'Verifying...' : 'Verify New Email'}
              </button>
              <button type="button" onClick={handleCancel} disabled={state.loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Complete */}
      {state.step === 'complete' && (
        <div className="step-complete">
          <h2>✅ Email Changed Successfully!</h2>
          <p>Your email address has been changed to <strong>{state.newEmail}</strong></p>
          <p>Please check your new email inbox to verify your email address.</p>
          <button onClick={() => window.location.reload()}>Done</button>
        </div>
      )}
    </div>
  );
}

export default EmailChangeComponent;
```

---

## 📊 Response Data Structure Reference

### User Object Fields
```typescript
interface User {
  _id: string;                    // User ID
  email: string;                   // Current email address
  firstName: string;               // First name
  lastName: string;                 // Last name
  phoneNumber: string;             // Phone number
  roles: string[];                 // User roles
  isVerified: boolean;             // Email verification status
  lastLoginDate?: string;          // Last login timestamp
  pendingEmail?: string | null;    // Pending new email (if change in progress)
  createdAt: string;              // Account creation date
  updatedAt: string;               // Last update date
}
```

### Email Change Status Object
```typescript
interface EmailChangeStatus {
  newEmailVerified: boolean;      // Whether new email has been verified
  oldEmailApproved: boolean;      // Whether old email has approved
  completed: boolean;              // Whether change is complete
}
```

### Next Step Object
```typescript
interface NextStep {
  action: string;                  // "approve_old_email" | "verify_new_email"
  message: string;                  // Instruction message
  oldEmail?: string;               // Old email address (if applicable)
  newEmail?: string;               // New email address (if applicable)
}
```

### Error Instructions Object
```typescript
interface Instructions {
  step1: string;                   // First instruction
  step2: string;                   // Second instruction
  step3: string;                   // Third instruction
}
```

---

## 🚫 Important Rules & Validation

### Code Format
- **Length:** Exactly 6 digits
- **Type:** Numeric only (0-9)
- **Format:** No spaces, dashes, or special characters

### Expiration
- **Duration:** 24 hours from when codes are sent
- **Behavior:** Codes expire after 24 hours
- **Action:** User must request new email change if codes expire

### Sequential Flow
- **Order:** Old email MUST approve FIRST
- **Enforcement:** API returns error if new email tries to verify before old email approves
- **Completion:** Change only completes when BOTH codes are verified

### Validation Rules
- Email must be valid format
- Email must not be already in use
- User can only have one pending email change at a time
- Codes must match exactly (case-sensitive)

---

## 📧 Email Templates Reference

### Old Email Receives:
- **Subject:** "⚠️ Approve Email Change Request - GTextSuite"
- **Code Type:** Approval code (6 digits)
- **Purpose:** Approve the email change request
- **Action Required:** Enter code in frontend → `POST /api/users/approve-email-change`

### New Email Receives:
- **Subject:** "Verify Your New Email Address - GTextSuite"
- **Code Type:** Verification code (6 digits)
- **Purpose:** Verify user controls the new email address
- **Action Required:** Enter code in frontend → `POST /api/users/verify-email-change`

---

## 🔍 Status Checking

### How to Check Current Status

```typescript
// Check if user has pending email change
async function checkEmailChangeStatus() {
  const profile = await getProfile();
  
  if (profile.success && profile.user) {
    const hasPending = !!profile.user.pendingEmail;
    const currentEmail = profile.user.email;
    const pendingEmail = profile.user.pendingEmail;
    
    return {
      hasPending,
      currentEmail,
      pendingEmail,
      // To check which step is done, you need to call the endpoints
      // or check the response when user tries to verify/approve
    };
  }
  
  return { hasPending: false };
}
```

---

## ⚠️ Error Handling Guide

### Common Error Scenarios

1. **User tries to verify new email before old email approves:**
   - Check `requiresOldEmailApproval: true`
   - Show instructions from `instructions` object
   - Redirect user to old email approval step

2. **Invalid or expired code:**
   - Show error message
   - Allow user to request new email change
   - Clear pending change if expired

3. **Email already in use:**
   - Show error message
   - Suggest user try different email

4. **Pending change already exists:**
   - Show existing pending email
   - Offer to cancel or continue with existing change

---

## ✅ Complete Flow Summary

**Step-by-Step:**
1. User requests change → `PUT /api/users/profile` with new email
2. Both emails receive codes (old = approval, new = verification)
3. **Old email approves FIRST** → `POST /api/users/approve-email-change`
4. **New email verifies** → `POST /api/users/verify-email-change`
5. Change completes automatically when both are done

**Frontend Requirements:**
- ✅ Two-step sequential UI (old email → new email)
- ✅ Code input fields (6 digits, numeric only)
- ✅ Status checking and display
- ✅ Error handling with helpful messages
- ✅ Success confirmation
- ✅ Cancel functionality
- ✅ Auto-redirect based on `nextStep` object

**Key Response Fields to Use:**
- `emailChangeStatus.completed` - Check if change is done
- `emailChangeStatus.oldEmailApproved` - Check old email status
- `emailChangeStatus.newEmailVerified` - Check new email status
- `nextStep` - Guide user to next action
- `requiresOldEmailApproval` - Handle sequential flow requirement
- `instructions` - Show step-by-step guidance
