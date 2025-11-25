# Tours API - Correct Frontend Usage

## ⚠️ IMPORTANT: How to Create Tour Bookings

### ❌ WRONG - Common Mistake

**DO NOT** send `tourId` in the request body:

```typescript
// ❌ WRONG
fetch('/api/tours/bookings', {
  method: 'POST',
  body: JSON.stringify({
    tourId: "6925acb7bf593a9e98ce2a73",  // ❌ Don't put tourId here!
    tourDate: "2025-11-27",
    guests: 1,
    // ...
  })
})
```

### ✅ CORRECT - How to Do It

**PUT `tourId` IN THE URL PATH**, not in the body:

```typescript
// ✅ CORRECT
const tourId = "6925acb7bf593a9e98ce2a73"; // Get this from tour._id
const url = `/api/tours/${tourId}/bookings`; // tourId goes in URL!

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: includes auth cookie
  body: JSON.stringify({
    // ❌ DO NOT include tourId here
    tourDate: "2025-11-27",
    guests: 1,
    guestInfo: {
      fullName: "Daniel Daramola",
      email: "dandarmola.d@gmail.com",
      phone: "120120102102"
    },
    specialRequests: "ffddfefefefe" // optional
  })
})
```

---

## 📋 Complete Frontend Code Example

### Step 1: Get Tour ID from Tour Data

```typescript
// When you receive tours from API
const tours = [
  {
    _id: "6925acb7bf593a9e98ce2a73",  // ← This is the tourId
    name: "City Tour",
    // ... other fields
  }
];

// Store the tourId when user clicks "Book This Tour"
const selectedTourId = tour._id;
```

### Step 2: Create Booking Request

```typescript
const createTourBooking = async (tourId: string, bookingData: {
  tourDate: string;
  guests: number;
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
}) => {
  try {
    // ✅ tourId goes in the URL path
    const url = `/api/tours/${tourId}/bookings`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Required for auth cookie
      body: JSON.stringify({
        tourDate: bookingData.tourDate,
        guests: bookingData.guests,
        guestInfo: bookingData.guestInfo,
        specialRequests: bookingData.specialRequests,
        // ❌ DO NOT include tourId in body
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create booking');
    }

    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};
```

### Step 3: Usage in Component

```typescript
const TourBookingModal = ({ tour, onClose }) => {
  const [formData, setFormData] = useState({
    tourDate: '',
    guests: 1,
    guestInfo: {
      fullName: '',
      email: '',
      phone: ''
    },
    specialRequests: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // ✅ Pass tour._id as first parameter (for URL)
      // ✅ Pass form data as second parameter (for body)
      const result = await createTourBooking(tour._id, formData);
      
      console.log('Booking created:', result);
      alert('Booking created successfully!');
      onClose();
    } catch (error) {
      alert(error.message || 'Failed to create booking');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <input 
        type="date" 
        value={formData.tourDate}
        onChange={(e) => setFormData({...formData, tourDate: e.target.value})}
      />
      {/* ... other fields */}
      <button type="submit">Confirm Booking</button>
    </form>
  );
};
```

---

## 🔍 Full API Request/Response Examples

### Request

```http
POST /api/tours/6925acb7bf593a9e98ce2a73/bookings
Content-Type: application/json
Cookie: auth_token=your_token_here

{
  "tourDate": "2025-11-27",
  "guests": 1,
  "guestInfo": {
    "fullName": "Daniel Daramola",
    "email": "dandarmola.d@gmail.com",
    "phone": "120120102102"
  },
  "specialRequests": "ffddfefefefe"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Tour booking created successfully",
  "data": {
    "booking": {
      "_id": "booking_id_here",
      "tourId": {
        "_id": "6925acb7bf593a9e98ce2a73",
        "name": "City Tour",
        "location": "Dubai, UAE",
        "duration": "4 Hours"
      },
      "tourDate": "2025-11-27T00:00:00.000Z",
      "guests": 1,
      "totalAmount": 150,
      "status": "pending",
      "paymentStatus": "pending"
    }
  }
}
```

### Error Response (if tourId wrong)

```json
{
  "success": false,
  "message": "Tour not found with ID: 6925. Please check the tour ID in the URL."
}
```

---

## ✅ Quick Checklist

- [ ] Get `tour._id` from the tour object (e.g., `"6925acb7bf593a9e98ce2a73"`)
- [ ] Put `tourId` in the URL: `/api/tours/${tourId}/bookings`
- [ ] **DO NOT** put `tourId` in the request body
- [ ] Include `credentials: 'include'` in fetch options
- [ ] Send only: `tourDate`, `guests`, `guestInfo`, `specialRequests` in body

---

## 🐛 Common Errors & Solutions

### Error: "Cast to ObjectId failed for value \"6925\""
**Cause**: Only part of the tourId is being used, or tourId is in the wrong place.

**Solution**: 
- Make sure the full tourId is in the URL path: `/api/tours/6925acb7bf593a9e98ce2a73/bookings`
- Check that you're using `tour._id` from the API response, not a partial ID

### Error: "Tour ID is required in the URL path"
**Cause**: `tourId` is missing from the URL.

**Solution**: 
- Make sure your URL includes the tourId: `/api/tours/:tourId/bookings`
- Don't forget to replace `:tourId` with the actual ID

### Error: "Tour not found"
**Cause**: Invalid tourId or tour doesn't exist.

**Solution**: 
- Verify the tourId matches exactly what you got from `GET /api/tours`
- Check that the tour hasn't been deleted
- Make sure the tour is active (`isActive: true`)

---

## 📝 Summary

**Key Point**: The `tourId` must be in the **URL path**, not in the **request body**!

```typescript
// ✅ CORRECT
POST /api/tours/{tourId}/bookings
Body: { tourDate, guests, guestInfo, specialRequests }

// ❌ WRONG
POST /api/tours/bookings
Body: { tourId, tourDate, guests, guestInfo, specialRequests }
```

Use the tour `_id` from the API response and put it in the URL when creating a booking!

