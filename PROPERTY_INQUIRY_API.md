# Property Inquiry API Documentation

## Overview
The Property Inquiry API allows users (both authenticated and unauthenticated) to submit inquiries about properties. There are two endpoints:
1. **Simple Inquiry** (`/api/inquiries/simple`) - Simplified endpoint matching the frontend form
2. **Full Inquiry** (`/api/inquiries`) - Complete endpoint with all inquiry details

---

## 📋 Simple Inquiry Endpoint (Recommended for Frontend)

### Endpoint
```
POST /api/inquiries/simple
```

### Authentication
- **Optional** - Works for both authenticated and unauthenticated users
- If user is logged in, the inquiry will be linked to their account
- If not logged in, inquiry is still created (public inquiry)

### Request Body
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "propertyId": "6928693e71fa27af706a12b4",
  "message": "Tell us about your investment interest..."
}
```

### Required Fields
- `fullName` (string) - Full name of the inquirer
- `email` (string) - Email address
- `phone` (string) - Phone number
- `propertyId` (string) - ID of the property they're inquiring about

### Optional Fields
- `message` (string) - Additional message/notes from the user

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Inquiry submitted successfully",
  "data": {
    "inquiry": {
      "_id": "inquiry-id",
      "propertyId": {
        "_id": "property-id",
        "name": "George Hills",
        "location": "Lagos, Nigeria",
        "images": ["url1", "url2"],
        "propertyPurpose": "investment"
      },
      "propertyName": "George Hills",
      "inquiryType": "investment",
      "contactInfo": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "status": "pending",
      "priority": "medium",
      "investmentInquiryDetails": {
        "additionalQuestions": "Tell us about your investment interest..."
      },
      "userId": "user-id-or-null",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Missing required fields: fullName, email, phone, propertyId"
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "message": "Property not found"
}
```

---

## 📋 Full Inquiry Endpoint

### Endpoint
```
POST /api/inquiries
```

### Authentication
- **Required** - User must be authenticated

### Request Body
```json
{
  "propertyId": "6928693e71fa27af706a12b4",
  "propertyName": "George Hills",
  "inquiryType": "investment",
  "contactInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "investmentInquiryDetails": {
    "investmentAmount": 2500000,
    "expectedROI": "10%",
    "preferredPaymentSchedule": "Flexible",
    "completionDatePreference": "2025-12-31",
    "additionalQuestions": "What's the payment plan?"
  }
}
```

### For Sale Inquiries
```json
{
  "propertyId": "property-id",
  "propertyName": "Luxury Villa",
  "inquiryType": "sale",
  "contactInfo": {
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890"
  },
  "saleInquiryDetails": {
    "budgetRange": "$500,000 - $750,000",
    "preferredPaymentPlan": "Installment",
    "financingRequired": true,
    "timeline": "3-6 months",
    "additionalRequirements": "Need parking space"
  }
}
```

---

## 🔍 Get Properties for Dropdown

To populate the "Property of Interest" dropdown, use:

### Endpoint
```
GET /api/properties?isListed=true
```

### Query Parameters
- `isListed=true` - Get all listed properties (for dropdown)
- `propertyPurpose=sale` - Filter by sale properties
- `propertyPurpose=investment` - Filter by investment properties
- `page=1` - Page number (default: 1)
- `limit=100` - Items per page (default: 10)

### Response
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "_id": "6928693e71fa27af706a12b4",
        "name": "George Hills",
        "location": "Lagos, Nigeria",
        "propertyPurpose": "investment",
        "price": "₦50,000,000",
        "mainImage": "cloudinary-url",
        "gallery": ["url1", "url2"]
      },
      {
        "_id": "another-property-id",
        "name": "Luxury Villa",
        "location": "Abuja, Nigeria",
        "propertyPurpose": "sale",
        "price": "₦75,000,000",
        "mainImage": "cloudinary-url"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 25,
      "totalPages": 1
    }
  }
}
```

---

## 📊 Frontend Integration Example

### 1. Fetch Properties for Dropdown
```javascript
// Fetch properties for dropdown
const fetchProperties = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/properties?isListed=true&limit=100');
    const data = await response.json();
    
    if (data.success) {
      setProperties(data.data.properties);
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
  }
};
```

### 2. Submit Inquiry Form
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = {
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    propertyId: form.selectedPropertyId,
    message: form.message
  };

  try {
    const response = await fetch('http://localhost:5000/api/inquiries/simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include auth cookie if user is logged in (browser handles automatically)
      },
      credentials: 'include', // Important: include cookies
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success) {
      alert('Inquiry submitted successfully!');
      // Reset form
      setForm({
        fullName: '',
        email: '',
        phone: '',
        selectedPropertyId: '',
        message: ''
      });
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    alert('Failed to submit inquiry. Please try again.');
  }
};
```

### 3. React Component Example
```jsx
import { useState, useEffect } from 'react';

function PropertyInquiryForm() {
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    selectedPropertyId: '',
    message: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/properties?isListed=true&limit=100');
      const data = await response.json();
      if (data.success) {
        setProperties(data.data.properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.fullName || !form.email || !form.phone || !form.selectedPropertyId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/inquiries/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          propertyId: form.selectedPropertyId,
          message: form.message
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Inquiry submitted successfully!');
        setForm({
          fullName: '',
          email: '',
          phone: '',
          selectedPropertyId: '',
          message: ''
        });
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Full Name *</label>
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div>
        <label>Email Address *</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Enter your email address"
          required
        />
      </div>

      <div>
        <label>Phone Number *</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Enter your phone number"
          required
        />
      </div>

      <div>
        <label>Property of Interest *</label>
        <select
          value={form.selectedPropertyId}
          onChange={(e) => setForm({ ...form, selectedPropertyId: e.target.value })}
          required
        >
          <option value="">Select a property</option>
          {properties.map((property) => (
            <option key={property._id} value={property._id}>
              {property.name} - {property.location}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Message</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us about your investment interest..."
          rows={4}
        />
      </div>

      <button type="submit">Submit Inquiry</button>
    </form>
  );
}

export default PropertyInquiryForm;
```

---

## 🔄 How It Works

1. **Property Selection**: Frontend fetches properties using `GET /api/properties?isListed=true`
2. **Form Submission**: User fills form and submits to `POST /api/inquiries/simple`
3. **Backend Processing**:
   - Validates required fields
   - Checks if property exists
   - Determines `inquiryType` automatically based on property's `propertyPurpose`
   - Stores message in appropriate field (`saleInquiryDetails.additionalRequirements` or `investmentInquiryDetails.additionalQuestions`)
   - Links to user account if authenticated (optional)
4. **Response**: Returns created inquiry with populated property details

---

## 📝 Notes

- **Inquiry Type**: Automatically determined from property's `propertyPurpose`:
  - If property is `"investment"` → inquiry type is `"investment"`
  - If property is `"sale"` → inquiry type is `"sale"`
  - Otherwise → defaults to `"sale"`

- **Message Storage**: 
  - For `investment` inquiries → stored in `investmentInquiryDetails.additionalQuestions`
  - For `sale` inquiries → stored in `saleInquiryDetails.additionalRequirements`
  - Fallback → stored in `notes` field

- **Authentication**: 
  - Simple endpoint works without login (public inquiries)
  - If user is logged in, inquiry is linked to their account
  - Full endpoint requires authentication

---

## ✅ Status Codes

- `201` - Inquiry created successfully
- `400` - Bad request (missing/invalid fields)
- `401` - Unauthorized (only for full endpoint)
- `404` - Property not found
- `500` - Server error

