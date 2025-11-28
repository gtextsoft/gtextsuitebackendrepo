# Image Upload API Endpoints - Complete Reference

## 📋 Overview

This document lists **all image upload-related API endpoints** that the frontend can consume.

---

## 📡 Total Endpoints: **6**

### Upload Endpoints: **2**
### Delete Endpoints: **2**
### Cleanup Endpoints: **2**

---

## 1️⃣ Upload Endpoints

### 1. Upload Single Image

**Endpoint:** `POST /api/uploads/single`

**Query Parameters:**
- `folder` (optional): `profiles` | `properties` | `tours` | `bookings` | `inquiries`
  - Default: `profiles`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with `image` field
- Authentication: Required (cookie)

**Use Cases:**
- ✅ Profile pictures (`folder=profiles`)
- ✅ Main property image (`folder=properties`)
- ✅ Main tour image (`folder=tours`)

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

---

### 2. Upload Multiple Images

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

**Use Cases:**
- ✅ Property gallery images (`folder=properties`)
- ✅ Tour gallery images (`folder=tours`)
- ✅ Booking property images (`folder=bookings`)
- ✅ Inquiry property images (`folder=inquiries`)

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

## 2️⃣ Delete Endpoints

### 3. Delete Single Image

**Endpoint:** `DELETE /api/uploads/:publicId`

**URL Parameters:**
- `publicId` (required) - Cloudinary public ID

**Request:**
- Method: `DELETE`
- Authentication: Required (cookie)

**Use Cases:**
- ✅ Delete profile picture
- ✅ Delete single property/tour image
- ✅ Remove image from gallery

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image deleted successfully."
}
```

---

### 4. Delete Multiple Images

**Endpoint:** `DELETE /api/uploads/multiple`

**Request:**
- Method: `DELETE`
- Content-Type: `application/json`
- Body: `{ "publicIds": ["id1", "id2", "id3"] }`
- Authentication: Required (cookie)

**Use Cases:**
- ✅ Delete multiple gallery images
- ✅ Bulk cleanup

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

## 3️⃣ Cleanup Endpoints

### 5. Cleanup Images by URLs

**Endpoint:** `POST /api/cleanup/images`

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body: `{ "imageUrls": ["url1", "url2"] }`
- Authentication: Required (cookie)

**Use Cases:**
- ✅ Cleanup orphaned images when property/tour creation fails
- ✅ Remove unused images after failed operations

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

### 6. Cleanup Images by Public IDs

**Endpoint:** `POST /api/cleanup/images/public-ids`

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body: `{ "publicIds": ["id1", "id2"] }`
- Authentication: Required (cookie)

**Use Cases:**
- ✅ Cleanup orphaned images using public IDs (more reliable)
- ✅ Remove unused images after failed operations

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

## 📊 Summary Table

| # | Endpoint | Method | Purpose | Use Case |
|---|----------|--------|---------|----------|
| 1 | `/api/uploads/single` | POST | Upload 1 image | Profile, main image |
| 2 | `/api/uploads/multiple` | POST | Upload many images | Gallery images |
| 3 | `/api/uploads/:publicId` | DELETE | Delete 1 image | Remove single image |
| 4 | `/api/uploads/multiple` | DELETE | Delete many images | Bulk delete |
| 5 | `/api/cleanup/images` | POST | Cleanup by URLs | Remove orphaned images |
| 6 | `/api/cleanup/images/public-ids` | POST | Cleanup by IDs | Remove orphaned images |

---

## 🎯 Common Frontend Workflows

### Workflow 1: Upload Property with Main Image + Gallery

```typescript
// Step 1: Upload main image
const mainFormData = new FormData();
mainFormData.append('image', mainImageFile);

const mainRes = await fetch('/api/uploads/single?folder=properties', {
  method: 'POST',
  body: mainFormData,
  credentials: 'include'
});
const { data: { imageUrl: mainImage } } = await mainRes.json();

// Step 2: Upload gallery
const galleryFormData = new FormData();
galleryFiles.forEach(file => galleryFormData.append('images', file));

const galleryRes = await fetch('/api/uploads/multiple?folder=properties', {
  method: 'POST',
  body: galleryFormData,
  credentials: 'include'
});
const { data: { imageUrls: gallery } } = await galleryRes.json();

// Step 3: Create property
await fetch('/api/properties', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mainImage, gallery, ...otherFields }),
  credentials: 'include'
});
```

---

### Workflow 2: Upload Profile Picture

```typescript
const formData = new FormData();
formData.append('image', profilePictureFile);

const res = await fetch('/api/uploads/single?folder=profiles', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});

const { data: { imageUrl } } = await res.json();
// Use imageUrl to update user profile
```

---

### Workflow 3: Upload with Cleanup on Failure

```typescript
let imageUrls: string[] = [];
let publicIds: string[] = [];

try {
  // Upload images
  const uploadRes = await fetch('/api/uploads/multiple?folder=properties', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  const uploadData = await uploadRes.json();
  imageUrls = uploadData.data.imageUrls;
  publicIds = uploadData.data.publicIds;

  // Create property
  const createRes = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mainImage: imageUrls[0], gallery: imageUrls.slice(1) }),
    credentials: 'include'
  });

  if (!createRes.ok) {
    // Cleanup on failure
    await fetch('/api/cleanup/images/public-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicIds }),
      credentials: 'include'
    });
    throw new Error('Property creation failed');
  }
} catch (error) {
  // Cleanup on any error
  if (publicIds.length > 0) {
    await fetch('/api/cleanup/images/public-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicIds }),
      credentials: 'include'
    });
  }
}
```

---

## 📋 Folder Options

### Available Folders:

| Folder | Use Case | Who Can Upload |
|--------|----------|----------------|
| `profiles` | User profile pictures | Any authenticated user |
| `properties` | Property images | Admin only |
| `tours` | Tour images | Admin only |
| `bookings` | Booking property images | Admin/Client |
| `inquiries` | Inquiry property images | Admin/Client |

---

## ✅ Quick Reference

### Upload Single Image
```typescript
POST /api/uploads/single?folder=profiles
Body: FormData { image: File }
```

### Upload Multiple Images
```typescript
POST /api/uploads/multiple?folder=properties
Body: FormData { images: File[] }
```

### Delete Single Image
```typescript
DELETE /api/uploads/:publicId
```

### Delete Multiple Images
```typescript
DELETE /api/uploads/multiple
Body: { publicIds: string[] }
```

### Cleanup by URLs
```typescript
POST /api/cleanup/images
Body: { imageUrls: string[] }
```

### Cleanup by Public IDs
```typescript
POST /api/cleanup/images/public-ids
Body: { publicIds: string[] }
```

---

## 🎯 Summary

**Total Image Upload APIs: 6**

1. ✅ **POST** `/api/uploads/single` - Upload 1 image
2. ✅ **POST** `/api/uploads/multiple` - Upload many images
3. ✅ **DELETE** `/api/uploads/:publicId` - Delete 1 image
4. ✅ **DELETE** `/api/uploads/multiple` - Delete many images
5. ✅ **POST** `/api/cleanup/images` - Cleanup by URLs
6. ✅ **POST** `/api/cleanup/images/public-ids` - Cleanup by public IDs

**All endpoints require authentication (cookie-based)**

