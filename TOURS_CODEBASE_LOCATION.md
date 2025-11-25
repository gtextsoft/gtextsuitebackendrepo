# Tours Page: Codebase Location & Implementation Guide

## 📍 Where Tours Fit in Your Codebase

### Current Structure
```
src/
├── models/
│   ├── property.ts        ← Tours currently stored here (propertyPurpose: "tour")
│   └── booking.ts         ← Tour bookings currently use this (bookingType: "tour")
├── controllers/
│   ├── property.ts        ← Handles tour properties
│   └── booking.ts         ← Handles tour bookings (with check-in/check-out)
├── routes/
│   ├── properties.ts      ← GET /api/properties?propertyPurpose=tour
│   └── bookings.ts        ← POST /api/bookings (bookingType: "tour")
└── validators/
    └── booking.validators.ts ← Validates tour bookings
```

### ✅ Recommendation: Create Separate Tours System

**New Structure (Recommended):**
```
src/
├── models/
│   ├── tour.ts            ← NEW: Tour model
│   └── tourBooking.ts     ← NEW: Tour booking model (separate from property bookings)
├── controllers/
│   ├── tour.ts            ← NEW: Tour CRUD operations
│   └── tourBooking.ts     ← NEW: Tour booking operations
├── routes/
│   ├── tours.ts           ← NEW: /api/tours routes
│   └── tourBookings.ts    ← NEW: /api/tours/bookings routes
└── validators/
    └── tour.validators.ts ← NEW: Tour validation
```

---

## 🎯 Answer to Your Questions

### 1. Is it OK to have tours separate from bookingType?

**YES, ABSOLUTELY! ✅**

**Why separate is better:**
- Tours only need **ONE date** (tour date), not check-in/check-out range
- Tours have different fields: duration, features, meeting point
- Tours don't need "nights" calculation
- Cleaner code architecture
- Easier to extend with tour-specific features

**Current problem:**
- Booking system forces tours to use check-in/check-out (doesn't make sense)
- Calculates "nights" unnecessarily
- Mixed logic makes code confusing

---

## 📋 APIs Needed for Frontend

### Client Side (Tours Page - `/tours`)

#### 1. Get All Tours (Tours Listing Page)
```http
GET /api/tours
Query Params: ?isActive=true
Response: { tours: [...], total: number }
```

**Use Case:** Display tour cards on tours page
```typescript
// Example response
{
  success: true,
  data: {
    tours: [
      {
        _id: "tour123",
        name: "City Tour",
        description: "Explore the vibrant city",
        longDescription: "Discover the city's most iconic landmarks...",
        duration: "4-6 Hours",
        startingPrice: 150,
        currency: "USD",
        images: ["image1.jpg", "image2.jpg"],
        features: [
          "Expert Local Guides",
          "Private Transportation",
          "Iconic Landmarks Visit",
          "Cultural Insights"
        ],
        location: "Dubai, UAE",
        isActive: true
      },
      // ... more tours
    ],
    total: 4
  }
}
```

#### 2. Get Single Tour Details
```http
GET /api/tours/:id
Response: { tour: {...} }
```

**Use Case:** Tour detail page or booking modal

#### 3. Create Tour Booking
```http
POST /api/tours/:tourId/bookings
Headers: { Authorization: "Bearer <token>" }
Body: {
  tourDate: "2024-12-15",        // Single date (not range!)
  guests: 2,
  guestInfo: {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+1234567890"
  },
  specialRequests: "Vegetarian meal required" // optional
}
Response: { booking: {...}, message: "Tour booking created successfully" }
```

**Use Case:** Booking form submission

#### 4. Get User's Tour Bookings
```http
GET /api/tours/bookings
Headers: { Authorization: "Bearer <token>" }
Query: ?status=pending&page=1&limit=10
Response: { bookings: [...], pagination: {...} }
```

**Use Case:** User dashboard - "My Tour Bookings"

#### 5. Get Single Tour Booking
```http
GET /api/tours/bookings/:id
Headers: { Authorization: "Bearer <token>" }
Response: { booking: {...} }
```

#### 6. Cancel Tour Booking
```http
DELETE /api/tours/bookings/:id
Headers: { Authorization: "Bearer <token>" }
Body: { cancellationReason: "Change of plans" } // optional
Response: { message: "Tour booking cancelled successfully" }
```

---

### Admin Side (Admin Panel)

#### 1. Create Tour
```http
POST /api/tours
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  name: "City Tour",
  description: "Explore the vibrant city",
  longDescription: "Full description...",
  duration: "4-6 Hours",
  startingPrice: 150,
  currency: "USD",
  images: ["url1", "url2"],
  features: ["Feature 1", "Feature 2"],
  location: "Dubai, UAE",
  meetingPoint: "Hotel lobby",
  included: ["Transportation", "Guide"],
  excluded: ["Meals"],
  maxGuests: 20,
  minGuests: 1,
  isActive: true
}
Response: { tour: {...}, message: "Tour created successfully" }
```

#### 2. Update Tour
```http
PUT /api/tours/:id
Headers: { Authorization: "Bearer <admin_token>" }
Body: { ...tour fields to update }
Response: { tour: {...}, message: "Tour updated successfully" }
```

#### 3. Delete Tour
```http
DELETE /api/tours/:id
Headers: { Authorization: "Bearer <admin_token>" }
Response: { message: "Tour deleted successfully" }
```

#### 4. Get All Tours (Admin - includes inactive)
```http
GET /api/tours
Headers: { Authorization: "Bearer <admin_token>" }
Query: ?isActive=false&page=1&limit=10
Response: { tours: [...], pagination: {...} }
```

#### 5. Get All Tour Bookings (Admin sees all)
```http
GET /api/tours/bookings
Headers: { Authorization: "Bearer <admin_token>" }
Query: ?status=pending&tourId=tour123&page=1&limit=10
Response: { bookings: [...], pagination: {...} }
```

#### 6. Update Tour Booking Status
```http
PATCH /api/tours/bookings/:id/status
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  status: "confirmed", // pending | confirmed | cancelled | completed
  notes: "Tour confirmed, guide assigned" // optional
}
Response: { booking: {...}, message: "Booking status updated" }
```

#### 7. Get Single Tour Booking (Admin)
```http
GET /api/tours/bookings/:id
Headers: { Authorization: "Bearer <admin_token>" }
Response: { booking: {...} }
```

---

## 🎨 Frontend Forms Needed

### Client Side Forms

#### 1. Tour Booking Form (Modal/Page)
```typescript
interface TourBookingFormData {
  fullName: string;          // Required
  email: string;             // Required, validated
  phone: string;             // Required
  tourDate: Date;            // Required, date picker (single date!)
  guests: number;            // Required, dropdown (1, 2, 3, ...)
  specialRequests?: string;  // Optional, textarea
}
```

**Form Validation:**
- Full Name: Required, min 2 characters
- Email: Required, valid email format
- Phone: Required, valid phone format
- Tour Date: Required, cannot be in the past
- Guests: Required, min 1, max (tour.maxGuests if defined)
- Special Requests: Optional, max 1000 characters

**API Call:**
```typescript
POST /api/tours/:tourId/bookings
```

---

### Admin Side Forms

#### 1. Create/Edit Tour Form
```typescript
interface TourFormData {
  name: string;                    // Required
  description: string;             // Required, short description
  longDescription: string;         // Required, full description
  duration: string;                // Required, e.g., "4-6 Hours"
  startingPrice: number;           // Required, number
  currency: string;                // Required, "USD" | "NGN" | "AED"
  images: string[];                // Required, array of image URLs
  features: string[];              // Required, array of feature strings
  location: string;                // Required
  meetingPoint?: string;           // Optional
  included: string[];              // Optional, array
  excluded?: string[];             // Optional, array
  maxGuests?: number;              // Optional
  minGuests?: number;              // Optional, default 1
  isActive: boolean;               // Default: true
}
```

**Form Validation:**
- All required fields must be filled
- Images: At least 1 image required
- Features: At least 1 feature required
- Price: Must be positive number
- Duration: Must match format (e.g., "X Hours", "Full Day")

---

## 📁 File Structure for New Tours System

### Backend Files to Create

```
src/
├── models/
│   ├── tour.ts                 ← NEW
│   └── tourBooking.ts          ← NEW
├── controllers/
│   ├── tour.ts                 ← NEW
│   └── tourBooking.ts          ← NEW
├── routes/
│   ├── tours.ts                ← NEW
│   └── tourBookings.ts         ← NEW (or merge into tours.ts)
└── validators/
    └── tour.validators.ts      ← NEW
```

### Frontend Files to Create (Client)

```
frontend/
├── pages/
│   ├── tours/
│   │   ├── index.tsx           ← Tours listing page
│   │   └── [id].tsx            ← Tour detail page (optional)
├── components/
│   ├── tours/
│   │   ├── TourCard.tsx        ← Tour card component
│   │   ├── TourBookingModal.tsx ← Booking modal/form
│   │   └── TourBookingForm.tsx  ← Booking form component
└── hooks/
    └── useTourBookings.ts      ← Fetch user's tour bookings
```

### Frontend Files to Create (Admin)

```
admin/
├── pages/
│   ├── tours/
│   │   ├── index.tsx           ← Tours management list
│   │   ├── create.tsx          ← Create tour form
│   │   ├── edit/[id].tsx       ← Edit tour form
│   │   └── bookings.tsx        ← Tour bookings management
├── components/
│   └── tours/
│       ├── TourForm.tsx        ← Create/edit tour form
│       └── TourBookingTable.tsx ← Bookings table
```

---

## 🔄 Migration Strategy

### Option 1: Clean Slate (Recommended for new projects)
1. Create new tours system
2. Keep existing tour properties as-is (don't migrate)
3. New tours use new system
4. Old tour bookings remain in booking system

### Option 2: Gradual Migration
1. Create new tours system
2. Migrate tour properties from Property model to Tour model
3. Create migration script for tour bookings
4. Run both systems in parallel during transition

---

## ✅ Summary

### Your Questions Answered:

1. **Where can this fix in codebase?**
   - Create new files in `src/models/`, `src/controllers/`, `src/routes/`
   - Tours page: `/tours` route in frontend
   - Admin tours management: `/admin/tours` route

2. **What APIs needed?**
   - ✅ Client: GET tours, GET tour details, POST tour booking, GET user bookings, DELETE booking
   - ✅ Admin: CRUD tours, GET all bookings, PATCH booking status

3. **Is it OK to have separate from bookingType?**
   - ✅ **YES!** Recommended to separate
   - Tours are fundamentally different (single date vs range)
   - Cleaner architecture, easier to maintain

---

## 🚀 Next Steps

Would you like me to:
1. ✅ Implement the complete tours system (models, controllers, routes)?
2. ✅ Create the tours booking system?
3. ✅ Add tour-specific validators?
4. ✅ Update email templates for tour bookings?

Let me know and I'll start implementing!

