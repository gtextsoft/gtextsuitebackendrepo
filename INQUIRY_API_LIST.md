# Inquiry API Endpoints - Complete List

## Overview
This document lists all Inquiry API endpoints available for both **Admin** and **User** (client) consumption.

---

## 📋 API Endpoints Summary

| Method | Endpoint | Auth Required | Access Level | Description |
|--------|----------|---------------|--------------|-------------|
| POST | `/api/inquiries/simple` | Optional | Public | Create simple inquiry (matches frontend form) |
| POST | `/api/inquiries` | Required | User | Create full inquiry with all details |
| GET | `/api/inquiries` | Required | User/Admin | Get list of inquiries (users see own, admins see all) |
| GET | `/api/inquiries/:id` | Required | User/Admin | Get single inquiry by ID |
| PATCH | `/api/inquiries/:id/status` | Required | Admin Only | Update inquiry status, priority, assign, notes |
| DELETE | `/api/inquiries/:id` | Required | User/Admin | Delete inquiry (users delete own, admins delete any) |

---

## 1️⃣ Create Simple Inquiry (Public)

### Endpoint
```
POST /api/inquiries/simple
```

### Authentication
- **Optional** - Works for both authenticated and unauthenticated users
- If user is logged in, inquiry is linked to their account
- If not logged in, inquiry is still created (public inquiry)

### Request Body
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "propertyId": "6928693e71fa27af706a12b4",
  "message": "I'm interested in this property..."
}
```

### Required Fields
- `fullName` (string)
- `email` (string)
- `phone` (string)
- `propertyId` (string)

### Optional Fields
- `message` (string)

### Response (201 Created)
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
        "additionalQuestions": "I'm interested in this property..."
      },
      "userId": "user-id-or-null",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

### Error Responses
- `400` - Missing required fields
- `404` - Property not found
- `500` - Server error

---

## 2️⃣ Create Full Inquiry (Authenticated Users)

### Endpoint
```
POST /api/inquiries
```

### Authentication
- **Required** - User must be authenticated

### Request Body (Investment Inquiry)
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

### Request Body (Sale Inquiry)
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

### Response (201 Created)
```json
{
  "success": true,
  "message": "Inquiry created successfully",
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
      "userId": {
        "_id": "user-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
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
        "investmentAmount": 2500000,
        "expectedROI": "10%",
        "preferredPaymentSchedule": "Flexible",
        "completionDatePreference": "2025-12-31T00:00:00.000Z",
        "additionalQuestions": "What's the payment plan?"
      },
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

### Error Responses
- `400` - Missing/invalid fields
- `401` - Unauthorized (not authenticated)
- `404` - Property not found
- `500` - Server error

---

## 3️⃣ Get List of Inquiries

### Endpoint
```
GET /api/inquiries
```

### Authentication
- **Required** - User must be authenticated

### Access Control
- **Users**: See only their own inquiries
- **Admins**: See all inquiries

### Query Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=1` |
| `limit` | number | Items per page (default: 10) | `?limit=20` |
| `status` | string | Filter by status | `?status=pending` |
| `inquiryType` | string | Filter by type (sale/investment) | `?inquiryType=investment` |
| `priority` | string | Filter by priority (low/medium/high) | `?priority=high` |

### Example Request
```
GET /api/inquiries?page=1&limit=10&status=pending&inquiryType=investment
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "inquiries": [
      {
        "_id": "inquiry-id-1",
        "propertyId": {
          "_id": "property-id",
          "name": "George Hills",
          "location": "Lagos, Nigeria",
          "images": ["url1", "url2"],
          "propertyPurpose": "investment"
        },
        "userId": {
          "_id": "user-id",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
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
        "assignedTo": null,
        "notes": null,
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Status Values
- `pending` - Inquiry just created, not yet contacted
- `contacted` - Admin has contacted the inquirer
- `qualified` - Inquirer is qualified/interested
- `closed` - Inquiry closed (sale completed, etc.)
- `rejected` - Inquiry rejected

### Error Responses
- `401` - Unauthorized (not authenticated)
- `500` - Server error

---

## 4️⃣ Get Single Inquiry by ID

### Endpoint
```
GET /api/inquiries/:id
```

### Authentication
- **Required** - User must be authenticated

### Access Control
- **Users**: Can only view their own inquiries
- **Admins**: Can view any inquiry

### Example Request
```
GET /api/inquiries/6928693e71fa27af706a12b4
```

### Response (200 OK)
```json
{
  "success": true,
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
      "userId": {
        "_id": "user-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "assignedTo": {
        "_id": "admin-id",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "propertyName": "George Hills",
      "inquiryType": "investment",
      "contactInfo": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "status": "contacted",
      "priority": "high",
      "investmentInquiryDetails": {
        "investmentAmount": 2500000,
        "expectedROI": "10%",
        "preferredPaymentSchedule": "Flexible",
        "completionDatePreference": "2025-12-31T00:00:00.000Z",
        "additionalQuestions": "What's the payment plan?"
      },
      "notes": "Follow up scheduled for next week",
      "respondedAt": "2025-01-16T09:00:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-16T09:00:00.000Z"
    }
  }
}
```

### Error Responses
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (trying to view someone else's inquiry)
- `404` - Inquiry not found
- `500` - Server error

---

## 5️⃣ Update Inquiry Status (Admin Only)

### Endpoint
```
PATCH /api/inquiries/:id/status
```

### Authentication
- **Required** - User must be authenticated
- **Admin Only** - Only admins can update inquiry status

### Request Body
```json
{
  "status": "contacted",
  "priority": "high",
  "assignedTo": "admin-user-id",
  "notes": "Follow up scheduled for next week",
  "rejectionReason": "Budget mismatch"
}
```

### Required Fields
- `status` (string) - One of: `pending`, `contacted`, `qualified`, `closed`, `rejected`

### Optional Fields
- `priority` (string) - One of: `low`, `medium`, `high`
- `assignedTo` (string) - User ID of admin/manager to assign inquiry to (or `null` to unassign)
- `notes` (string) - Admin notes about the inquiry
- `rejectionReason` (string) - Required if status is `rejected`

### Example Request
```
PATCH /api/inquiries/6928693e71fa27af706a12b4/status
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Inquiry status updated successfully",
  "data": {
    "inquiry": {
      "_id": "inquiry-id",
      "status": "contacted",
      "priority": "high",
      "assignedTo": {
        "_id": "admin-id",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "notes": "Follow up scheduled for next week",
      "respondedAt": "2025-01-16T09:00:00.000Z",
      "updatedAt": "2025-01-16T09:00:00.000Z",
      // ... other inquiry fields
    }
  }
}
```

### Status Change Behavior
- `contacted` or `qualified` → Sets `respondedAt` timestamp
- `rejected` → Sets `rejectedAt` timestamp and stores `rejectionReason`
- `closed` → Sets `closedAt` timestamp

### Error Responses
- `400` - Invalid status/priority value or missing required fields
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not admin)
- `404` - Inquiry not found
- `500` - Server error

---

## 6️⃣ Delete Inquiry

### Endpoint
```
DELETE /api/inquiries/:id
```

### Authentication
- **Required** - User must be authenticated

### Access Control
- **Users**: Can only delete their own inquiries
- **Admins**: Can delete any inquiry

### Example Request
```
DELETE /api/inquiries/6928693e71fa27af706a12b4
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Inquiry deleted successfully"
}
```

### Error Responses
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (trying to delete someone else's inquiry)
- `404` - Inquiry not found
- `500` - Server error

---

## 🔐 Authentication

All endpoints (except `/api/inquiries/simple`) require authentication via cookie:

### How to Authenticate
1. User logs in via `/api/users/login`
2. Backend sets `auth_token` cookie (HttpOnly)
3. Frontend automatically includes cookie in subsequent requests
4. No need to manually add headers - browser handles cookies automatically

### Frontend Example (Fetch)
```javascript
// Cookies are automatically included
fetch('http://localhost:5000/api/inquiries', {
  method: 'GET',
  credentials: 'include' // Important: include cookies
})
```

### Frontend Example (Axios)
```javascript
// Configure axios to include credentials
axios.defaults.withCredentials = true;

// All requests will include cookies
axios.get('http://localhost:5000/api/inquiries')
```

---

## 📊 Inquiry Status Flow

```
pending → contacted → qualified → closed
   ↓
rejected
```

### Status Descriptions
- **pending**: Inquiry just created, awaiting admin review
- **contacted**: Admin has reached out to the inquirer
- **qualified**: Inquirer is qualified and interested
- **closed**: Inquiry successfully closed (sale completed, etc.)
- **rejected**: Inquiry rejected (budget mismatch, not qualified, etc.)

---

## 🎯 Priority Levels

- **low**: Standard inquiry, normal priority
- **medium**: Moderate priority (default)
- **high**: Urgent inquiry, needs immediate attention

---

## 📝 Inquiry Types

### Investment Inquiry
- For properties with `propertyPurpose: "investment"`
- Stores details in `investmentInquiryDetails`:
  - `investmentAmount` (number)
  - `expectedROI` (string)
  - `preferredPaymentSchedule` (string)
  - `completionDatePreference` (Date)
  - `additionalQuestions` (string)

### Sale Inquiry
- For properties with `propertyPurpose: "sale"`
- Stores details in `saleInquiryDetails`:
  - `budgetRange` (string)
  - `preferredPaymentPlan` (string)
  - `financingRequired` (boolean)
  - `timeline` (string)
  - `additionalRequirements` (string)

---

## 🔄 Complete Frontend Integration Example

### React Component for User Dashboard
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

function InquiryDashboard() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    inquiryType: '',
    priority: ''
  });

  useEffect(() => {
    fetchInquiries();
  }, [filters]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.inquiryType) params.append('inquiryType', filters.inquiryType);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await axios.get(
        `http://localhost:5000/api/inquiries?${params.toString()}`
      );

      if (response.data.success) {
        setInquiries(response.data.data.inquiries);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/inquiries/${id}`
      );

      if (response.data.success) {
        alert('Inquiry deleted successfully');
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('Failed to delete inquiry');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Inquiries</h1>

      {/* Filters */}
      <div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="closed">Closed</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={filters.inquiryType}
          onChange={(e) => setFilters({ ...filters, inquiryType: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="sale">Sale</option>
          <option value="investment">Investment</option>
        </select>
      </div>

      {/* Inquiry List */}
      <div>
        {inquiries.map((inquiry) => (
          <div key={inquiry._id}>
            <h3>{inquiry.propertyName}</h3>
            <p>Type: {inquiry.inquiryType}</p>
            <p>Status: {inquiry.status}</p>
            <p>Priority: {inquiry.priority}</p>
            <p>Created: {new Date(inquiry.createdAt).toLocaleDateString()}</p>
            <button onClick={() => deleteInquiry(inquiry._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InquiryDashboard;
```

### Admin Component for Managing Inquiries
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

function AdminInquiryManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    notes: ''
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inquiries');
      if (response.data.success) {
        setInquiries(response.data.data.inquiries);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  const updateInquiryStatus = async (id) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/inquiries/${id}/status`,
        updateData
      );

      if (response.data.success) {
        alert('Inquiry updated successfully');
        fetchInquiries();
        setSelectedInquiry(null);
      }
    } catch (error) {
      console.error('Error updating inquiry:', error);
      alert('Failed to update inquiry');
    }
  };

  return (
    <div>
      <h1>Inquiry Management</h1>

      <div>
        {inquiries.map((inquiry) => (
          <div key={inquiry._id} onClick={() => setSelectedInquiry(inquiry)}>
            <h3>{inquiry.propertyName}</h3>
            <p>Status: {inquiry.status}</p>
            <p>Priority: {inquiry.priority}</p>
            <p>Contact: {inquiry.contactInfo.email}</p>
          </div>
        ))}
      </div>

      {selectedInquiry && (
        <div>
          <h2>Update Inquiry</h2>
          <select
            value={updateData.status}
            onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
          >
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={updateData.priority}
            onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <textarea
            placeholder="Notes"
            value={updateData.notes}
            onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
          />

          <button onClick={() => updateInquiryStatus(selectedInquiry._id)}>
            Update Status
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminInquiryManagement;
```

---

## ✅ Quick Reference

### For Users (Clients)
- ✅ `POST /api/inquiries/simple` - Submit inquiry (no login required)
- ✅ `GET /api/inquiries` - View own inquiries
- ✅ `GET /api/inquiries/:id` - View single inquiry
- ✅ `DELETE /api/inquiries/:id` - Delete own inquiry

### For Admins
- ✅ `GET /api/inquiries` - View all inquiries
- ✅ `GET /api/inquiries/:id` - View any inquiry
- ✅ `PATCH /api/inquiries/:id/status` - Update inquiry status/priority/notes
- ✅ `DELETE /api/inquiries/:id` - Delete any inquiry

---

## 📞 Support

For questions or issues with the Inquiry API, refer to:
- `PROPERTY_INQUIRY_API.md` - Detailed simple inquiry documentation
- `API_DOCUMENTATION.md` - General API documentation

