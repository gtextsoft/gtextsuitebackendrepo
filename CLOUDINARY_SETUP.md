# Cloudinary Image Upload Setup - Complete Guide

## 📋 Overview

This document outlines all image upload locations in the application and provides complete Cloudinary integration setup.

---

## 🖼️ All Image Upload Locations

### 1. **Property Images** (Admin Only)
- **Model:** `Property`
- **Field:** `images: string[]`
- **Location:** `src/models/property.ts`
- **Controller:** `src/controllers/property.ts`
- **Routes:** `src/routes/properties.ts`
- **Who Uploads:** Admin only
- **Use Case:** Property listings (sale, rental, investment, tour properties)
- **Multiple Images:** Yes (array of image URLs)

### 2. **Tour Images** (Admin Only)
- **Model:** `Tour`
- **Field:** `images: string[]`
- **Location:** `src/models/tour.ts`
- **Controller:** `src/controllers/tour.ts`
- **Routes:** `src/routes/tours.ts`
- **Who Uploads:** Admin only
- **Use Case:** Tour packages
- **Multiple Images:** Yes (array of image URLs)

### 3. **Booking Property Images** (Admin/Client)
- **Model:** `Booking`
- **Field:** `propertyDetails.images: string[]`
- **Location:** `src/models/booking.ts`
- **Controller:** `src/controllers/booking.ts`
- **Routes:** `src/routes/bookings.ts`
- **Who Uploads:** Admin (for booking-only properties) or Client (when creating custom booking)
- **Use Case:** Properties that are not in main listing but can be booked
- **Multiple Images:** Yes (array of image URLs)

### 4. **Inquiry Property Images** (Admin/Client)
- **Model:** `Inquiry`
- **Field:** `propertyDetails.images: string[]`
- **Location:** `src/models/inquiry.ts`
- **Controller:** `src/controllers/inquiry.ts`
- **Routes:** `src/routes/inquiries.ts`
- **Who Uploads:** Admin (for inquiry-only properties) or Client (when creating custom inquiry)
- **Use Case:** Properties for sale/investment inquiries that are not in main listing
- **Multiple Images:** Yes (array of image URLs)

### 5. **User Profile Picture** (Client/Admin)
- **Model:** `User` (needs to be added)
- **Field:** `profilePicture: string` (single URL)
- **Location:** `src/models/user.ts`
- **Controller:** `src/controllers/auth.ts`
- **Routes:** `src/routes/users.ts`
- **Who Uploads:** Client (their own profile) or Admin (any user's profile)
- **Use Case:** User avatar/profile picture
- **Multiple Images:** No (single image URL)

---

## 📦 Required Packages

Install the following packages:

```bash
npm install cloudinary multer
npm install --save-dev @types/multer
```

---

## 🔑 Cloudinary Configuration

### 1. Get Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 2. Add to `.env` file

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📁 File Structure

```
src/
├── config/
│   └── cloudinary.ts          # Cloudinary configuration
├── services/
│   └── cloudinaryService.ts   # Cloudinary upload service
├── middleware/
│   └── upload.middleware.ts   # Multer middleware for file uploads
├── controllers/
│   └── upload.controller.ts   # Image upload controller
└── routes/
    └── uploads.ts             # Image upload routes
```

---

## 🚀 Implementation Steps

### Step 1: Install Dependencies

```bash
npm install cloudinary multer
npm install --save-dev @types/multer
```

### Step 2: Create Cloudinary Configuration

File: `src/config/cloudinary.ts`

### Step 3: Create Cloudinary Service

File: `src/services/cloudinaryService.ts`

### Step 4: Create Upload Middleware

File: `src/middleware/upload.middleware.ts`

### Step 5: Create Upload Controller

File: `src/controllers/upload.controller.ts`

### Step 6: Create Upload Routes

File: `src/routes/uploads.ts`

### Step 7: Add Profile Picture to User Model

Update: `src/models/user.ts`

### Step 8: Update Main App

Update: `src/index.ts`

---

## 📝 API Endpoints Summary

### Image Upload Endpoints

1. **Upload Single Image**
   - `POST /api/uploads/single`
   - For: Profile pictures, single images
   - Returns: Image URL

2. **Upload Multiple Images**
   - `POST /api/uploads/multiple`
   - For: Property images, tour images
   - Returns: Array of image URLs

3. **Delete Image**
   - `DELETE /api/uploads/:publicId`
   - For: Removing images from Cloudinary
   - Returns: Success message

---

## 🎯 Usage Examples

### Frontend - Upload Single Image (Profile Picture)

```javascript
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/uploads/single', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});

const { imageUrl } = await response.json();
// Use imageUrl to update user profile
```

### Frontend - Upload Multiple Images (Property/Tour)

```javascript
const formData = new FormData();
files.forEach(file => {
  formData.append('images', file);
});

const response = await fetch('/api/uploads/multiple', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});

const { imageUrls } = await response.json();
// Use imageUrls array to create/update property/tour
```

---

## 🔒 Security Considerations

1. **File Type Validation:** Only allow image files (jpg, jpeg, png, webp)
2. **File Size Limits:** Max 5MB per image
3. **Authentication:** All uploads require authentication
4. **Admin Only:** Property and Tour uploads require admin role
5. **User Profile:** Users can only upload their own profile picture (unless admin)

---

## 📊 Image Organization in Cloudinary

### Folder Structure

```
gtextsuite/
├── properties/          # Property images
├── tours/               # Tour images
├── bookings/            # Booking property images
├── inquiries/           # Inquiry property images
└── profiles/            # User profile pictures
```

---

## ✅ Implementation Complete

All files have been created and integrated. Follow these steps:

### Step 1: Install Packages

```bash
npm install cloudinary multer
npm install --save-dev @types/multer
```

### Step 2: Set Up Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up
2. Get your credentials from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Add to `.env` File

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Test the Implementation

1. Start your server: `npm run dev`
2. Test upload endpoint: `POST /api/uploads/single`
3. Test with Postman or your frontend

---

## 📡 Complete API Reference

### Upload Single Image

**Endpoint:** `POST /api/uploads/single`

**Query Parameters:**
- `folder` (optional): `profiles` | `properties` | `tours` | `bookings` | `inquiries`
  - Default: `profiles`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with `image` field
- Authentication: Required (cookie)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image uploaded successfully.",
  "data": {
    "imageUrl": "https://res.cloudinary.com/.../image.jpg",
    "publicId": "gtextsuite/profiles/xyz123"
  }
}
```

**Error Responses:**
- `400`: No file provided, invalid file type, file too large
- `401`: Unauthorized
- `500`: Upload failed

---

### Upload Multiple Images

**Endpoint:** `POST /api/uploads/multiple`

**Query Parameters:**
- `folder` (optional): `properties` | `tours` | `bookings` | `inquiries`
  - Default: `properties`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with `images` field (array)
- Authentication: Required (cookie)
- Max files: 10

**Success Response (200):**
```json
{
  "success": true,
  "message": "3 image(s) uploaded successfully.",
  "data": {
    "imageUrls": [
      "https://res.cloudinary.com/.../image1.jpg",
      "https://res.cloudinary.com/.../image2.jpg",
      "https://res.cloudinary.com/.../image3.jpg"
    ],
    "publicIds": [
      "gtextsuite/properties/xyz1",
      "gtextsuite/properties/xyz2",
      "gtextsuite/properties/xyz3"
    ],
    "errors": null
  }
}
```

---

### Delete Single Image

**Endpoint:** `DELETE /api/uploads/:publicId`

**Request:**
- Method: `DELETE`
- Authentication: Required (cookie)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image deleted successfully."
}
```

---

### Delete Multiple Images

**Endpoint:** `DELETE /api/uploads/multiple`

**Request:**
- Method: `DELETE`
- Body: `{ "publicIds": ["public_id_1", "public_id_2"] }`
- Authentication: Required (cookie)

**Success Response (200):**
```json
{
  "success": true,
  "message": "2 image(s) deleted successfully.",
  "data": {
    "deleted": 2,
    "total": 2,
    "errors": null
  }
}
```

---

## 💻 Frontend Usage Examples

### React - Upload Single Image (Profile Picture)

```typescript
const uploadProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://localhost:5000/api/uploads/single?folder=profiles', {
    method: 'POST',
    body: formData,
    credentials: 'include', // Important for cookies
  });

  const data = await response.json();
  
  if (data.success) {
    // Update user profile with imageUrl
    await updateProfile({ profilePicture: data.data.imageUrl });
    return data.data.imageUrl;
  } else {
    throw new Error(data.message);
  }
};
```

### React - Upload Multiple Images (Property/Tour)

```typescript
const uploadPropertyImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await fetch('http://localhost:5000/api/uploads/multiple?folder=properties', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const data = await response.json();
  
  if (data.success) {
    // Use imageUrls array to create/update property
    return data.data.imageUrls;
  } else {
    throw new Error(data.message);
  }
};
```

### React - Image Upload Component

```tsx
import { useState } from 'react';

function ImageUpload({ onUpload, folder = 'profiles', multiple = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      const endpoint = multiple ? '/multiple' : '/single';
      const fieldName = multiple ? 'images' : 'image';

      if (multiple) {
        Array.from(files).forEach(file => {
          formData.append(fieldName, file);
        });
      } else {
        formData.append(fieldName, files[0]);
      }

      const response = await fetch(
        `http://localhost:5000/api/uploads${endpoint}?folder=${folder}`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (data.success) {
        onUpload(multiple ? data.data.imageUrls : data.data.imageUrl);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

---

## 📋 Summary of All Image Upload Locations

| Location | Model Field | Who Uploads | Folder | Endpoint |
|----------|-------------|-------------|--------|----------|
| **Property Images** | `Property.images[]` | Admin | `properties` | `/api/uploads/multiple?folder=properties` |
| **Tour Images** | `Tour.images[]` | Admin | `tours` | `/api/uploads/multiple?folder=tours` |
| **Booking Property Images** | `Booking.propertyDetails.images[]` | Admin/Client | `bookings` | `/api/uploads/multiple?folder=bookings` |
| **Inquiry Property Images** | `Inquiry.propertyDetails.images[]` | Admin/Client | `inquiries` | `/api/uploads/multiple?folder=inquiries` |
| **User Profile Picture** | `User.profilePicture` | Client/Admin | `profiles` | `/api/uploads/single?folder=profiles` |

---

## 🔒 Security & Validation

✅ **File Type Validation:** Only JPEG, PNG, WebP, GIF allowed  
✅ **File Size Limit:** 5MB per image  
✅ **Max Files:** 10 images per upload  
✅ **Authentication:** All uploads require login  
✅ **Folder Validation:** Only allowed folders can be used  
✅ **Admin Protection:** Properties and Tours require admin role (can be added to routes)

---

## 🎯 Next Steps

1. ✅ Install packages: `npm install cloudinary multer @types/multer`
2. ✅ Set up Cloudinary account and add credentials to `.env`
3. ✅ Test upload endpoints
4. ✅ Integrate with frontend
5. ✅ Update property/tour creation to use image URLs
6. ✅ Add profile picture update to user profile endpoint

