# Frontend Tours Implementation Guide

## 🎯 Objective

Implement a complete tours booking system frontend for GTextSuite with tour listings, booking functionality, and admin management.

---

## 📋 Pages Needed

### Client Side (Public/User)

1. **Tours Listing Page** - `/tours` or `/booking/tours`
2. **Tour Booking Modal/Form** - Component for booking tours
3. **User Tour Bookings** - Dashboard page showing user's tour bookings
4. **Tour Booking Details** - View single booking details

### Admin Side

1. **Tours Management Page** - `/admin/tours`
2. **Create/Edit Tour Form** - Modal or page for creating/editing tours
3. **Tour Bookings Management** - `/admin/tours/bookings`
4. **Tour Booking Details** - Admin view with status management

---

## 🔌 API Integration Details

### Base URL
```
https://your-api-domain.com/api/tours
```

### Authentication
- All authenticated endpoints require `auth_token` cookie (set by login)
- Include credentials in fetch requests: `credentials: 'include'`

---

## 📱 Page 1: Tours Listing Page (`/tours`)

### Purpose
Display all available tours in a grid/list layout with tour cards.

### API Call
```typescript
GET /api/tours
// Optional query params: ?isActive=true&location=Dubai&page=1&limit=10

Response:
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
        images: ["url1.jpg", "url2.jpg"],
        features: [
          "Expert Local Guides",
          "Private Transportation",
          "Iconic Landmarks Visit",
          "Cultural Insights"
        ],
        location: "Dubai, UAE",
        meetingPoint: "Hotel lobby",
        included: ["Transportation", "Guide"],
        excluded: ["Meals"],
        maxGuests: 20,
        minGuests: 1,
        isActive: true
      },
      // ... more tours
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 4,
      totalPages: 1
    }
  }
}
```

### UI Components Needed

#### Tour Card Component
```typescript
interface TourCardProps {
  tour: {
    _id: string;
    name: string;
    description: string;
    duration: string;
    startingPrice: number;
    currency: string;
    images: string[];
    features: string[];
    location: string;
  };
  onBookClick: (tourId: string) => void;
}

// Display:
// - Tour image (first image from images array)
// - Tour name
// - Description (truncated)
// - Features list with ✓ checkmarks
// - Duration badge
// - Starting price (e.g., "From $150")
// - Location
// - "Book This Tour" button
```

### Features to Display
- Tour grid/list view
- Filter by location (optional)
- Pagination
- "Book This Tour" button opens booking modal

### Example Layout
```
┌─────────────────────────────────────────┐
│  Tours                                  │
├─────────────────────────────────────────┤
│  [Filter] [Search]                      │
├──────────────┬──────────────┬───────────┤
│  Tour Card 1 │  Tour Card 2 │ Tour Card │
│  ┌─────────┐ │  ┌─────────┐ │  ┌──────┐ │
│  │  Image  │ │  │  Image  │ │  │Image │ │
│  ├─────────┤ │  ├─────────┤ │  ├──────┤ │
│  │  Title  │ │  │  Title  │ │  │Title │ │
│  │  Desc   │ │  │  Desc   │ │  │Desc  │ │
│  │  ✓ Feat │ │  │  ✓ Feat │ │  │✓ Feat│ │
│  │  Duration│ │  │ Duration│ │  │Durat │ │
│  │  From $ │ │  │  From $ │ │  │From $│ │
│  │ [Book]  │ │  │ [Book]  │ │  │[Book]│ │
│  └─────────┘ │  └─────────┘ │  └──────┘ │
└──────────────┴──────────────┴───────────┘
```

---

## 📝 Page 2: Tour Booking Modal/Form

### Purpose
Modal/form component for booking a tour. Opens when user clicks "Book This Tour".

### API Call
```typescript
POST /api/tours/:tourId/bookings
Headers: {
  'Content-Type': 'application/json',
  // Cookie automatically sent (auth_token)
}

Body:
{
  tourDate: "2024-12-15",        // Date in YYYY-MM-DD format
  guests: 2,                      // Number (1, 2, 3, ...)
  guestInfo: {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+1234567890"
  },
  specialRequests: "Vegetarian meal required"  // Optional
}

Response:
{
  success: true,
  message: "Tour booking created successfully",
  data: {
    booking: {
      _id: "booking123",
      tourId: { ...tour details },
      tourDate: "2024-12-15T00:00:00.000Z",
      guests: 2,
      totalAmount: 300,
      status: "pending",
      // ... other fields
    }
  }
}
```

### Form Fields

```typescript
interface TourBookingFormData {
  fullName: string;          // Required, text input
  email: string;             // Required, email input
  phone: string;             // Required, tel input
  tourDate: Date;            // Required, date picker (single date!)
  guests: number;            // Required, dropdown/select (1, 2, 3, ..., maxGuests)
  specialRequests?: string;  // Optional, textarea
}
```

### Validation Rules
- **Full Name**: Required, min 2 characters
- **Email**: Required, valid email format
- **Phone**: Required, valid phone format
- **Tour Date**: Required, cannot be in the past, date picker (single date!)
- **Guests**: Required, min 1, max (tour.maxGuests if defined)
- **Special Requests**: Optional, max 1000 characters

### UI Example
```
┌─────────────────────────────────┐
│  Book: City Tour          [×]   │
├─────────────────────────────────┤
│                                 │
│  Tour: City Tour                │
│  Duration: 4-6 Hours            │
│  Price: $150 per person         │
│                                 │
│  Full Name *                    │
│  [________________________]     │
│                                 │
│  Email Address *                │
│  [________________________]     │
│                                 │
│  Phone Number *                 │
│  [________________________]     │
│                                 │
│  Tour Date *                    │
│  [📅 mm/dd/yyyy        ▼]      │
│                                 │
│  Number of Guests *             │
│  [1 Guest              ▼]      │
│                                 │
│  Special Requests (Optional)    │
│  [________________________]     │
│  [________________________]     │
│                                 │
│  [Cancel]  [Confirm Booking]    │
└─────────────────────────────────┘
```

### Success Flow
1. User fills form and clicks "Confirm Booking"
2. Show loading spinner
3. Submit to API
4. On success:
   - Show success message: "Tour booking created successfully! We'll send you a confirmation email."
   - Close modal
   - Optionally redirect to bookings page or show booking confirmation

---

## 📊 Page 3: User Tour Bookings (`/dashboard/tours` or `/my-tours`)

### Purpose
Display user's tour bookings with status, allow viewing details and cancellation.

### API Call
```typescript
GET /api/tours/bookings
// Query params: ?status=pending&page=1&limit=10

Response:
{
  success: true,
  data: {
    bookings: [
      {
        _id: "booking123",
        tourId: {
          _id: "tour123",
          name: "City Tour",
          location: "Dubai, UAE",
          duration: "4-6 Hours",
          images: ["url1.jpg"]
        },
        tourDate: "2024-12-15T00:00:00.000Z",
        guests: 2,
        totalAmount: 300,
        status: "pending",
        paymentStatus: "pending",
        createdAt: "2024-11-01T10:00:00.000Z"
      },
      // ... more bookings
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 5,
      totalPages: 1
    }
  }
}
```

### Display Information
For each booking card:
- Tour name and image
- Location
- Tour date (formatted)
- Number of guests
- Total amount
- Status badge (Pending, Confirmed, Cancelled, Completed)
- Actions: View Details, Cancel (if pending/confirmed)

### Cancel Booking API
```typescript
DELETE /api/tours/bookings/:id
Body (optional): {
  cancellationReason: "Change of plans"
}

Response:
{
  success: true,
  message: "Tour booking cancelled successfully"
}
```

---

## 🔧 Admin Page 1: Tours Management (`/admin/tours`)

### Purpose
CRUD operations for tours - list, create, edit, delete tours.

### API Calls

#### Get All Tours (Admin sees all, including inactive)
```typescript
GET /api/tours
// Query: ?isActive=false&page=1&limit=10

// Admin sees all tours, can filter by isActive
```

#### Create Tour
```typescript
POST /api/tours
Body:
{
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
```

#### Update Tour
```typescript
PUT /api/tours/:id
// Same body structure as create
```

#### Delete Tour
```typescript
DELETE /api/tours/:id
```

### Form Fields for Create/Edit Tour

```typescript
interface TourFormData {
  name: string;                    // Text input
  description: string;             // Textarea (short)
  longDescription: string;         // Textarea (long)
  duration: string;                // Text input (e.g., "4-6 Hours")
  startingPrice: number;           // Number input
  currency: string;                // Select: "USD" | "NGN" | "AED"
  images: string[];                // Array of image URLs (file upload or URL input)
  features: string[];              // Array input (add/remove features)
  location: string;                // Text input
  meetingPoint?: string;           // Optional text input
  included: string[];              // Array input
  excluded?: string[];             // Optional array input
  maxGuests?: number;              // Optional number input
  minGuests?: number;              // Optional number input (default: 1)
  isActive: boolean;               // Toggle/checkbox
}
```

### UI Layout
```
┌──────────────────────────────────────┐
│  Tours Management            [+ New] │
├──────────────────────────────────────┤
│  [Search] [Filter: Active/All]       │
├──────────────────────────────────────┤
│  Tour List Table                     │
│  ┌────────────────────────────────┐  │
│  │ Name | Location | Price | ... │  │
│  ├────────────────────────────────┤  │
│  │ Tour 1 | Dubai | $150 | [Edit]│  │
│  │ Tour 2 | Abu Dhabi | $200 |...│  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 🔧 Admin Page 2: Tour Bookings Management (`/admin/tours/bookings`)

### Purpose
View and manage all tour bookings - update status, view details.

### API Calls

#### Get All Bookings
```typescript
GET /api/tours/bookings
// Query: ?status=pending&tourId=tour123&page=1&limit=10

// Admin sees ALL bookings from all users
```

#### Update Booking Status
```typescript
PATCH /api/tours/bookings/:id/status
Body:
{
  status: "confirmed",  // pending | confirmed | cancelled | completed | rejected
  notes: "Tour confirmed, guide assigned"  // Optional
}
```

### Display Information
- Booking table with:
  - Booking ID
  - Tour name
  - Guest name & email
  - Tour date
  - Number of guests
  - Total amount
  - Status
  - Created date
- Filters: By status, by tour, by date range
- Actions: View details, Update status

### Status Update Modal
```
┌─────────────────────────────┐
│  Update Booking Status      │
├─────────────────────────────┤
│  Current Status: Pending    │
│                             │
│  New Status *               │
│  [Confirmed ▼]              │
│                             │
│  Notes (Optional)           │
│  [______________________]   │
│  [______________________]   │
│                             │
│  [Cancel]  [Update Status]  │
└─────────────────────────────┘
```

---

## 🎨 UI/UX Guidelines

### Color Scheme
- Primary: Use your existing brand colors
- Status Colors:
  - Pending: Yellow/Orange
  - Confirmed: Green
  - Cancelled: Red
  - Completed: Blue
  - Rejected: Red

### Components to Reuse
- Button component
- Input/Form components
- Modal component
- Card component
- Table component
- Loading spinner
- Error/Success messages

### Responsive Design
- Mobile-first approach
- Tour cards stack on mobile
- Form modals full-screen on mobile
- Tables scroll horizontally on mobile

---

## 📦 State Management

### Recommended Data Structure

```typescript
// Tours state
interface ToursState {
  tours: Tour[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    location?: string;
    isActive?: boolean;
  };
}

// Booking state
interface BookingState {
  bookings: TourBooking[];
  loading: boolean;
  error: string | null;
  currentBooking: TourBooking | null;
}

// Form state
interface BookingFormState {
  tourId: string;
  tourDate: Date | null;
  guests: number;
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  specialRequests: string;
  submitting: boolean;
  errors: Record<string, string>;
}
```

---

## 🔐 Authentication Handling

### Checking Auth
```typescript
// Check if user is authenticated
const isAuthenticated = // your auth check

// Check if user is admin
const isAdmin = // check user roles.includes('admin')
```

### Redirects
- Unauthenticated users trying to book → Redirect to login
- Non-admin users trying to access admin pages → Redirect to home or show 403

---

## ✅ Implementation Checklist

### Client Side
- [ ] Create tours listing page
- [ ] Create tour card component
- [ ] Create booking modal/form component
- [ ] Implement date picker (single date)
- [ ] Implement form validation
- [ ] Create user bookings page
- [ ] Add booking cancellation
- [ ] Add navigation links to tours page
- [ ] Error handling and loading states
- [ ] Success messages

### Admin Side
- [ ] Create tours management page
- [ ] Create tour form (create/edit)
- [ ] Implement image upload/URL input
- [ ] Create features array input (add/remove)
- [ ] Create bookings management page
- [ ] Implement status update modal
- [ ] Add filters and search
- [ ] Add pagination
- [ ] Error handling

---

## 🚀 Quick Start Example

### React Component Example

```typescript
// ToursPage.tsx
import { useEffect, useState } from 'react';

interface Tour {
  _id: string;
  name: string;
  description: string;
  duration: string;
  startingPrice: number;
  currency: string;
  images: string[];
  features: string[];
  location: string;
}

const ToursPage = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setTours(data.data.tours);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (tourId: string) => {
    // Open booking modal
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="tours-page">
      <h1>Tours</h1>
      <div className="tours-grid">
        {tours.map(tour => (
          <TourCard key={tour._id} tour={tour} onBookClick={handleBookClick} />
        ))}
      </div>
    </div>
  );
};

export default ToursPage;
```

---

## 📚 Additional Resources

- See `TOURS_IMPLEMENTATION_COMPLETE.md` for backend API details
- See `TOURS_CODEBASE_LOCATION.md` for codebase structure
- All API endpoints documented above
- Error responses follow standard format: `{ success: false, message: "..." }`

---

## 🎯 Priority Order

1. **High Priority**: Tours listing page + Booking modal
2. **High Priority**: User bookings page
3. **Medium Priority**: Admin tours management
4. **Medium Priority**: Admin bookings management
5. **Low Priority**: Advanced filters and search

---

Good luck with the frontend implementation! 🚀

