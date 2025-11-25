# Tours Implementation Analysis & Recommendations

## Current State Analysis

### How Tours Currently Work
1. **Tours are stored as Properties** with `propertyPurpose: "tour"`
2. **Tours use the Booking system** with `bookingType: "tour"`
3. **Problem**: Booking system requires `checkIn` and `checkOut` dates, but tours only need ONE date

### Issues with Current Implementation
- ❌ Tours require check-in AND check-out dates (not applicable)
- ❌ Booking system calculates "nights" (doesn't apply to tours)
- ❌ No tour-specific fields (duration, features list)
- ❌ Booking form expects date range, but tours need single date

---

## Your Tours Page Requirements

### Tour Display Cards Need:
- Tour Name (e.g., "City Tour", "Desert Safari")
- Description
- Features List (with ✓ checkmarks)
- Duration (e.g., "4-6 Hours", "5-7 Hours", "Full Day")
- Starting Price (e.g., "From $150", "From $170")
- Book This Tour button

### Booking Form Needs:
- Full Name *
- Email Address *
- Phone Number *
- Tour Date * (single date picker, not date range)
- Number of Guests * (dropdown: 1 Guest, 2 Guests, etc.)
- Special Requests (Optional textarea)

---

## Recommendation: Separate Tours System

### Why Separate?

**Option 1: Separate Tours Model (RECOMMENDED)**
- ✅ Cleaner separation of concerns
- ✅ Tour-specific fields (duration, features, meeting point, etc.)
- ✅ Single date instead of date range
- ✅ No "nights" calculation
- ✅ Better suited for tour-specific business logic
- ✅ Easier to add tour-specific features later (time slots, group discounts, etc.)

**Option 2: Keep in Booking System (NOT RECOMMENDED)**
- ❌ Forces tour date into check-in/check-out pattern
- ❌ Calculates "nights" unnecessarily
- ❌ Mixed logic makes code more complex
- ❌ Harder to extend with tour-specific features

---

## Proposed Solution: Separate Tours System

### 1. Create Tour Model (`src/models/tour.ts`)

```typescript
// Tour model with tour-specific fields
export type TourType = {
  name: string;
  description: string;
  longDescription: string;
  location: string;
  duration: string; // e.g., "4-6 Hours", "Full Day"
  startingPrice: number; // Base price per person
  currency: string;
  images: string[];
  features: string[]; // List of features with checkmarks
  meetingPoint?: string;
  included: string[]; // What's included
  excluded?: string[]; // What's not included
  maxGuests?: number;
  minGuests?: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
};
```

### 2. Create Tour Booking Model (`src/models/tourBooking.ts`)

```typescript
// Tour-specific booking (separate from property bookings)
export type TourBookingType = {
  tourId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tourDate: Date; // Single date (not date range)
  guests: number;
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  totalAmount: number; // guests * pricePerPerson
  specialRequests?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "partial" | "paid" | "refunded";
  notes?: string; // Admin notes
};
```

### 3. API Endpoints Needed

#### Client API (Frontend - Tours Page)
```
GET    /api/tours                    - Get all active tours (for tours page)
GET    /api/tours/:id                - Get single tour details
POST   /api/tours/:id/bookings       - Create tour booking
GET    /api/tours/bookings           - Get user's tour bookings
GET    /api/tours/bookings/:id       - Get single tour booking
DELETE /api/tours/bookings/:id       - Cancel tour booking
```

#### Admin API (Admin Panel)
```
POST   /api/tours                    - Create new tour
PUT    /api/tours/:id                - Update tour
DELETE /api/tours/:id                - Delete tour
GET    /api/tours/bookings           - Get all tour bookings (admin sees all)
GET    /api/tours/bookings/:id       - Get tour booking details
PATCH  /api/tours/bookings/:id/status - Update booking status
```

---

## Alternative: Enhance Existing System (Simpler but Less Clean)

If you prefer to keep tours in the booking system, you would need to:

1. **Modify Booking Controller** to handle tours differently:
   - For `bookingType: "tour"`, only require `checkIn` (use as tour date)
   - Set `checkOut = checkIn` (same day)
   - Set `nights = 0` or `1`
   - Calculate price per guest instead of per night

2. **Add Tour-Specific Fields to Property Model**:
   - Add `tourDetails?: { duration: string, features: string[] }` to Property model

3. **Update Booking Validation**:
   - For tours, allow `checkOut = checkIn`
   - Don't require nights calculation

**Pros**: Faster to implement, reuses existing booking infrastructure
**Cons**: Mixes concerns, less maintainable, harder to extend

---

## Frontend Requirements

### Client Side (Tours Page)

#### Page: `/tours` or `/booking/tours`
- Fetch: `GET /api/tours`
- Display tour cards in grid/list
- Each card shows: name, description, features, duration, price
- "Book This Tour" button → Opens booking modal/form

#### Booking Modal/Form
```typescript
interface TourBookingForm {
  tourId: string;
  fullName: string;
  email: string;
  phone: string;
  tourDate: Date; // Single date picker
  guests: number; // Dropdown: 1, 2, 3, ...
  specialRequests?: string;
}
```
- Submit: `POST /api/tours/:tourId/bookings`
- On success: Show confirmation, redirect to bookings page

#### User Bookings Page
- Fetch: `GET /api/tours/bookings`
- Display user's tour bookings with status
- Allow cancellation: `DELETE /api/tours/bookings/:id`

### Admin Side (Admin Panel)

#### Tours Management Page
- List all tours: `GET /api/tours` (all, including inactive)
- Create tour: `POST /api/tours`
- Edit tour: `PUT /api/tours/:id`
- Delete tour: `DELETE /api/tours/:id`
- Toggle active status

#### Tour Bookings Management
- View all bookings: `GET /api/tours/bookings`
- Filter by status, date, tour
- Update booking status: `PATCH /api/tours/bookings/:id/status`
- View booking details
- Add admin notes

---

## Implementation Checklist

### Backend
- [ ] Create `Tour` model (`src/models/tour.ts`)
- [ ] Create `TourBooking` model (`src/models/tourBooking.ts`)
- [ ] Create tour controller (`src/controllers/tour.ts`)
- [ ] Create tour booking controller (`src/controllers/tourBooking.ts`)
- [ ] Create tour routes (`src/routes/tours.ts`)
- [ ] Create tour booking routes (`src/routes/tourBookings.ts`)
- [ ] Add tour validators (`src/validators/tour.validators.ts`)
- [ ] Register routes in `src/index.ts`
- [ ] Update email service to send tour booking emails
- [ ] Add tour booking email templates

### Frontend - Client
- [ ] Create `/tours` page component
- [ ] Create tour card component
- [ ] Create tour booking modal/form component
- [ ] Create tour booking confirmation page
- [ ] Add to navigation/menu
- [ ] Display tour bookings in user dashboard

### Frontend - Admin
- [ ] Create tours management page (CRUD)
- [ ] Create tour booking management page
- [ ] Add tour creation/edit forms
- [ ] Add booking status management UI

---

## Migration Strategy

If you have existing tour bookings in the booking system:

1. **Keep existing bookings as-is** (don't migrate)
2. **New tours use new system**
3. **Gradually migrate** tour properties to Tour model
4. **Run parallel systems** during transition

---

## Recommendation Summary

✅ **CREATE SEPARATE TOURS SYSTEM**

**Why:**
- Tours are fundamentally different from property bookings
- Single date vs date range
- Tour-specific fields (duration, features, meeting point)
- Cleaner, more maintainable code
- Easier to extend with tour features later

**Implementation:**
1. Create `Tour` model
2. Create `TourBooking` model  
3. Create separate API endpoints
4. Build tours page and admin management

Would you like me to implement the separate tours system?

