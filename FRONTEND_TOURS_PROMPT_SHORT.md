# Frontend Tours Implementation - Quick Prompt

## 🎯 Task

Build a complete tours booking system frontend with:

1. **Tours Listing Page** - Display all tours in cards with booking button
2. **Booking Modal** - Form to book tours (single date, not date range)
3. **User Bookings** - View user's tour bookings and cancel
4. **Admin Pages** - Manage tours (CRUD) and bookings (status updates)

---

## 📡 API Endpoints

**Base URL:** `/api/tours`

```
GET    /api/tours                    - List tours
GET    /api/tours/:id                - Get tour details
POST   /api/tours/:tourId/bookings   - Create booking
GET    /api/tours/bookings           - Get user bookings
PATCH  /api/tours/bookings/:id/status - Update status (admin)
DELETE /api/tours/bookings/:id       - Cancel booking

Admin:
POST   /api/tours                    - Create tour
PUT    /api/tours/:id                - Update tour
DELETE /api/tours/:id                - Delete tour
```

---

## 📋 Key Features

### Tour Card Display
- Tour image, name, description
- Features list with ✓ checkmarks
- Duration (e.g., "4-6 Hours")
- Starting price (e.g., "From $150")
- "Book This Tour" button

### Booking Form
- Full Name, Email, Phone
- **Tour Date** (single date picker - not range!)
- Number of Guests (dropdown: 1, 2, 3...)
- Special Requests (optional)

### Tour Booking Object
```typescript
{
  tourId: string;
  tourDate: "2024-12-15",  // Single date!
  guests: 2,
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
  },
  specialRequests?: string;
}
```

---

## 🎨 UI Components Needed

1. **TourCard** - Display tour info with booking button
2. **BookingModal** - Form for booking tours
3. **DatePicker** - Single date selection (not range!)
4. **BookingsList** - Show user's tour bookings
5. **StatusBadge** - Display booking status (pending, confirmed, etc.)
6. **AdminTourForm** - Create/edit tour form
7. **AdminBookingsTable** - Manage all bookings

---

## ✅ Requirements

- **Authentication**: Use `auth_token` cookie, include `credentials: 'include'` in fetch
- **Validation**: Validate all form inputs (email, phone, date not in past, etc.)
- **Error Handling**: Show user-friendly error messages
- **Loading States**: Show spinners during API calls
- **Success Messages**: Confirm actions (booking created, cancelled, etc.)
- **Responsive**: Mobile-friendly design

---

## 🔑 Important Notes

- Tours use **single date** (not check-in/check-out range)
- Price = `guests × pricePerPerson`
- Booking statuses: pending → confirmed → completed/cancelled/rejected
- Email notifications sent automatically by backend
- Admin can see all bookings, users see only their own

---

See `FRONTEND_TOURS_IMPLEMENTATION_PROMPT.md` for detailed implementation guide with code examples!

