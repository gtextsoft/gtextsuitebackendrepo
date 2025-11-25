# 📧 Frontend Email Verification Implementation Guide

**Complete guide for implementing email verification flow on the frontend.**

---

## 🎯 Overview

This guide provides everything you need to implement a complete email verification system on the frontend, integrated with the backend API.

---

## ✅ What the Backend Provides

### API Endpoints Available:

1. **`POST /api/users/register`** - Register new user
   - Returns: `user` object with `isVerified: false`
   - Sends verification email automatically

2. **`POST /api/users/login`** - Login user
   - Returns: `user` object with `isVerified: boolean`
   - Always returns `isVerified` status

3. **`POST /api/users/verify-email`** - Verify email with token
   - Requires: `userId` and `verificationToken` (6-digit code)
   - Returns: Success/error message

4. **`POST /api/users/resend-verification`** - Resend verification email
   - Requires: Authentication (logged in user)
   - Rate limited: 1 request per minute
   - Returns: Success message

5. **Protected Routes** - May return 403 if email not verified
   - Response includes: `requiresVerification: true`

---

## 🚀 Implementation Steps

### Step 1: Check Verification Status After Login

After a successful login, check `user.isVerified` and handle accordingly.

**Example Implementation:**

```typescript
// Login function
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // IMPORTANT: Include cookies
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (data.success) {
    // Store user data
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Check verification status
    if (!data.user.isVerified) {
      // Show verification banner/modal
      showVerificationBanner();
    }
    
    return data.user;
  } else {
    throw new Error(data.message);
  }
}
```

---

### Step 2: Create Verification Banner Component

Create a banner that shows when user is not verified.

**Example: React/Next.js Component**

```tsx
// components/VerificationBanner.tsx
'use client';

import { useState, useEffect } from 'react';

interface VerificationBannerProps {
  userId: string;
  onVerified?: () => void;
}

export default function VerificationBanner({ userId, onVerified }: VerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Start countdown if message shows rate limit
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    setIsResending(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/users/resend-verification', {
        method: 'POST',
        credentials: 'include', // Include auth cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Verification email sent! Please check your inbox.');
        setCountdown(60); // 60 second cooldown
      } else if (data.retryAfter) {
        setCountdown(data.retryAfter);
        setMessage(`⏳ Please wait ${data.retryAfter} seconds before requesting again.`);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Your account is not verified. Please check your email for the verification code.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={handleResend}
              disabled={isResending || countdown > 0}
              className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
            >
              {isResending
                ? 'Sending...'
                : countdown > 0
                ? `Resend (${countdown}s)`
                : 'Resend Verification Email'}
            </button>
          </div>
          {message && (
            <div className="mt-2 text-sm text-yellow-800">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### Step 3: Create Verification Modal/Page

Create a page or modal where users can enter their verification code.

**Example: Verification Page Component**

```tsx
// components/EmailVerification.tsx or pages/verify-email.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailVerification({ userId }: { userId: string }) {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setCode(newCode);
    
    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const verificationToken = code.join('');
    if (verificationToken.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          verificationToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update user in localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.isVerified = true;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Redirect to dashboard or refresh
        router.push('/dashboard');
        router.refresh(); // Refresh to update verification status
      } else {
        setError(data.message || 'Invalid verification code');
        // Clear inputs on error
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Failed to verify email. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a 6-digit verification code to your email address.
            Please enter it below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || code.join('').length !== 6}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Didn't receive the code?{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Resend
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
```

---

### Step 4: Create Route Guard for Protected Pages

Protect routes that require verification.

**Example: Route Guard Hook (React/Next.js)**

```tsx
// hooks/useRequireVerification.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useRequireVerification(redirectTo = '/verify-email') {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    // Get user from localStorage or context
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsVerified(user.isVerified);

      if (!user.isVerified) {
        router.push(redirectTo);
      }
    } else {
      // No user found, redirect to login
      router.push('/login');
    }
  }, [router, redirectTo]);

  return isVerified;
}

// Usage in a protected page:
// export default function Dashboard() {
//   const isVerified = useRequireVerification();
//   
//   if (isVerified === null) return <Loading />;
//   if (!isVerified) return null; // Will redirect
//   
//   return <div>Dashboard content</div>;
// }
```

---

### Step 5: Handle 403 Responses from API

Handle responses from protected API routes that require verification.

**Example: API Client with Error Handling**

```typescript
// utils/api.ts
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(`http://localhost:5000/api${url}`, {
    ...options,
    credentials: 'include', // Always include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  // Handle 403 - Email verification required
  if (response.status === 403 && data.requiresVerification) {
    // Show verification required modal/banner
    window.dispatchEvent(new CustomEvent('verification-required'));
    
    // Or redirect to verification page
    // window.location.href = '/verify-email';
    
    throw new Error('Email verification required');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// Usage:
try {
  const booking = await apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
} catch (error) {
  if (error.message === 'Email verification required') {
    // Already handled by event listener
    return;
  }
  // Handle other errors
}
```

---

### Step 6: Update User Context/State After Verification

Ensure verification status is updated across the app.

**Example: React Context**

```tsx
// context/UserContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  // ... other fields
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const refreshUser = async () => {
    // Optionally fetch fresh user data from API
    // Or update from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
```

**Update user after verification:**

```tsx
// After successful verification
const { setUser } = useUser();

const handleVerify = async (userId: string, token: string) => {
  const data = await verifyEmail(userId, token);
  if (data.success) {
    // Update user in context
    const currentUser = user;
    if (currentUser) {
      setUser({ ...currentUser, isVerified: true });
    }
    // Also update localStorage
    localStorage.setItem('user', JSON.stringify({ ...currentUser, isVerified: true }));
  }
};
```

---

## 📋 Complete Implementation Checklist

### Core Features

- [ ] **Check `isVerified` after login** - Display banner if false
- [ ] **Verification Banner Component** - Shows when not verified
- [ ] **Resend Verification Button** - Calls `/resend-verification` endpoint
- [ ] **Rate Limiting UI** - Shows countdown timer (60 seconds)
- [ ] **Verification Code Input** - 6-digit code input with auto-focus
- [ ] **Verification Page/Modal** - Where users enter verification code
- [ ] **Success Handling** - Update user state after verification
- [ ] **Route Guards** - Protect routes that require verification
- [ ] **Error Handling** - Handle 403 responses from protected routes
- [ ] **User State Management** - Update verification status across app

### UI/UX Requirements

- [ ] Clean, professional design matching your brand
- [ ] Clear messaging about verification requirement
- [ ] Easy-to-use 6-digit code input
- [ ] Loading states for async operations
- [ ] Error messages for failed verification
- [ ] Success feedback after verification
- [ ] Disable features that require verification

---

## 🎨 UI/UX Best Practices

### 1. Verification Banner

- **Placement:** Top of page, below header
- **Design:** Yellow/amber for warning, non-intrusive
- **Dismissible:** Can be minimized (but show indicator)
- **Actions:** "Resend Email" button, link to verification page

### 2. Verification Page

- **Clear instructions:** "We sent a 6-digit code to your email"
- **Input design:** Large, easy-to-read digit inputs
- **Auto-focus:** Focus first input, move to next on input
- **Paste support:** Allow pasting 6-digit code
- **Back button:** Allow going back if needed
- **Resend option:** Link to resend if code doesn't arrive

### 3. Protected Routes

- **Redirect:** Redirect to verification page if not verified
- **Clear message:** Explain why access is restricted
- **Easy path:** Make it easy to verify and return

---

## 🧪 Testing Checklist

- [ ] User can see verification banner after login (if not verified)
- [ ] User can click "Resend" button
- [ ] Rate limiting works (shows countdown after first resend)
- [ ] User can enter 6-digit code
- [ ] Code input has auto-focus and paste support
- [ ] Verification succeeds with correct code
- [ ] Verification fails with incorrect code (shows error)
- [ ] User state updates after verification
- [ ] Protected routes block unverified users
- [ ] Protected routes work after verification
- [ ] Banner disappears after verification

---

## 📱 Example User Flow

1. **User registers** → Email sent automatically
2. **User logs in** → Sees verification banner
3. **User checks email** → Gets 6-digit code
4. **User enters code** → Verification succeeds
5. **User access granted** → Can use all features

**Alternative flow (if user didn't receive email):**

1. **User logs in** → Sees verification banner
2. **User clicks "Resend"** → New email sent
3. **User waits 60 seconds** → Can resend again if needed
4. **User receives email** → Enters code and verifies

---

## 🔗 API Integration Reference

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Register
```typescript
POST /users/register
Body: { email, password, firstName, lastName, phoneNumber }
Response: { success: true, user: { _id, email, isVerified: false, ... } }
```

#### 2. Login
```typescript
POST /users/login
Body: { email, password }
Response: { success: true, user: { _id, email, isVerified: boolean, ... } }
Cookies: auth_token (set automatically)
```

#### 3. Verify Email
```typescript
POST /users/verify-email
Body: { userId: string, verificationToken: string (6 digits) }
Response: { success: true, message: "Email successfully verified." }
```

#### 4. Resend Verification
```typescript
POST /users/resend-verification
Headers: Cookie: auth_token=...
Response: { success: true, message: "Verification email sent..." }
Error 429: { success: false, message: "...", retryAfter: 60 }
```

#### 5. Protected Routes (Example)
```typescript
POST /bookings
Headers: Cookie: auth_token=...
Response 403: { success: false, message: "...", requiresVerification: true }
```

---

## 🚀 Quick Start Code

### Minimal Implementation Example

```tsx
// Minimal example - adapt to your framework

// 1. After login
const user = await login(email, password);
if (!user.isVerified) {
  // Show banner or redirect
}

// 2. Verification banner
<VerificationBanner userId={user._id} />

// 3. Verify code
await fetch('/api/users/verify-email', {
  method: 'POST',
  body: JSON.stringify({ userId, verificationToken }),
});

// 4. Protect route
if (!user.isVerified) {
  redirect('/verify-email');
}
```

---

**Everything you need is here! Adapt the examples to your specific framework (React, Next.js, Vue, etc.)** 🎉

