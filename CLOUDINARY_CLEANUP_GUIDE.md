# Cloudinary Image Cleanup Guide

## 📋 Overview

This guide explains how to automatically clean up orphaned images from Cloudinary when uploads fail or database operations don't complete.

---

## 🎯 The Problem

**Current Flow:**
1. Frontend uploads images → Images stored in Cloudinary ✅
2. Frontend creates property/tour → Database save fails ❌
3. **Result:** Images remain in Cloudinary (orphaned) 🗑️

**Solution:** Clean up images when operations fail!

---

## ✅ Automatic Cleanup Options

### Option 1: Frontend Cleanup (Recommended for Current Flow)

When property/tour creation fails, frontend calls cleanup endpoint:

```typescript
// Frontend: Upload images
const uploadResponse = await fetch('/api/uploads/multiple?folder=properties', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});

const { data: { imageUrls, publicIds } } = await uploadResponse.json();

// Frontend: Create property
try {
  const propertyResponse = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Property Name',
      images: imageUrls,
      // ... other fields
    }),
    credentials: 'include'
  });

  if (!propertyResponse.ok) {
    // Property creation failed - cleanup images
    await fetch('/api/cleanup/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrls }),
      credentials: 'include'
    });
    
    throw new Error('Property creation failed');
  }
} catch (error) {
  // Cleanup on any error
  await fetch('/api/cleanup/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrls }),
    credentials: 'include'
  });
}
```

---

### Option 2: Server-Side Cleanup (Better - Integrated Upload)

Modify property/tour creation to handle files directly and cleanup on failure:

```typescript
// In property controller
export const createProperty = async (req: Request, res: Response) => {
  let uploadedPublicIds: string[] = [];
  
  try {
    // 1. Upload images if files provided
    if (req.files) {
      const uploadResult = await uploadMultipleImages(req.files, 'properties');
      if (!uploadResult.success) {
        res.status(500).json({ success: false, message: 'Image upload failed' });
        return;
      }
      uploadedPublicIds = uploadResult.publicIds || [];
      req.body.images = uploadResult.urls;
    }

    // 2. Create property
    const newProperty = new Property(req.body);
    const savedProperty = await newProperty.save();

    res.status(201).json({ success: true, data: { property: savedProperty } });
  } catch (error) {
    // 3. Cleanup on failure
    if (uploadedPublicIds.length > 0) {
      await deleteMultipleImages(uploadedPublicIds);
      console.log(`Cleaned up ${uploadedPublicIds.length} orphaned images`);
    }
    
    res.status(500).json({ success: false, message: 'Property creation failed' });
  }
};
```

---

## 📡 Cleanup API Endpoints

### 1. Cleanup by Image URLs

**Endpoint:** `POST /api/cleanup/images`

**Request:**
```json
{
  "imageUrls": [
    "https://res.cloudinary.com/.../image1.jpg",
    "https://res.cloudinary.com/.../image2.jpg"
  ]
}
```

**Response:**
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

### 2. Cleanup by Public IDs

**Endpoint:** `POST /api/cleanup/images/public-ids`

**Request:**
```json
{
  "publicIds": [
    "gtextsuite/properties/xyz123",
    "gtextsuite/properties/xyz456"
  ]
}
```

**Response:**
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

## 💻 Frontend Implementation

### React Hook for Safe Upload

```typescript
import { useState } from 'react';

function useSafeImageUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadAndCreate = async (
    uploadEndpoint: string,
    createEndpoint: string,
    files: File[],
    createData: any
  ) => {
    setUploading(true);
    let imageUrls: string[] = [];
    let publicIds: string[] = [];

    try {
      // Step 1: Upload images
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      const uploadResponse = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success) {
        throw new Error('Image upload failed');
      }

      imageUrls = uploadData.data.imageUrls || [];
      publicIds = uploadData.data.publicIds || [];

      // Step 2: Create record
      const createResponse = await fetch(createEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createData,
          images: imageUrls,
        }),
        credentials: 'include',
      });

      const createData_result = await createResponse.json();

      if (!createData_result.success) {
        // Cleanup on failure
        await cleanupImages(imageUrls);
        throw new Error(createData_result.message || 'Creation failed');
      }

      return createData_result;
    } catch (error) {
      // Cleanup on any error
      if (imageUrls.length > 0) {
        await cleanupImages(imageUrls);
      }
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const cleanupImages = async (imageUrls: string[]) => {
    try {
      await fetch('/api/cleanup/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls }),
        credentials: 'include',
      });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  return { uploadAndCreate, uploading };
}
```

---

## 🎯 Best Practices

### 1. Always Cleanup on Failure

```typescript
try {
  // Upload images
  const { imageUrls } = await uploadImages();
  
  // Create property
  await createProperty({ images: imageUrls });
} catch (error) {
  // Always cleanup on error
  await cleanupImages(imageUrls);
  throw error;
}
```

### 2. Use Public IDs When Available

Public IDs are more reliable than extracting from URLs:

```typescript
// Better: Use publicIds
await cleanupImagesByPublicIds(publicIds);

// Also works: Use URLs
await cleanupImagesByUrls(imageUrls);
```

### 3. Handle Cleanup Errors Gracefully

```typescript
try {
  await cleanupImages(imageUrls);
} catch (cleanupError) {
  // Log but don't fail the main operation
  console.error('Cleanup failed (images may be orphaned):', cleanupError);
}
```

---

## 📊 When to Cleanup

### ✅ Cleanup When:

1. **Property/Tour creation fails** - After database save error
2. **Validation fails** - After upload but before save
3. **User cancels** - User abandons the form
4. **Network error** - Request fails mid-operation

### ❌ Don't Cleanup When:

1. **Upload fails** - Nothing was uploaded
2. **Operation succeeds** - Images are in use
3. **Partial success** - Some images saved, some failed (handle individually)

---

## 🔄 Recommended Flow

### Current Flow (Two-Step) with Cleanup

```
1. Upload images → Get URLs + Public IDs
2. Create property/tour with URLs
3. If success → Done ✅
4. If failure → Cleanup images → Return error ❌
```

### Better Flow (Integrated) with Automatic Cleanup

```
1. Upload images + Create property/tour in one request
2. If upload fails → Return error (no cleanup needed)
3. If upload succeeds but save fails → Auto cleanup → Return error
4. If both succeed → Return success ✅
```

---

## ✅ Summary

**What We Added:**

1. ✅ **Cleanup Utility** - `src/utils/cloudinaryCleanup.ts`
2. ✅ **Cleanup Controller** - `src/controllers/cleanup.controller.ts`
3. ✅ **Cleanup Routes** - `src/routes/cleanup.ts`
4. ✅ **API Endpoints** - `/api/cleanup/images` and `/api/cleanup/images/public-ids`

**How to Use:**

1. **Frontend:** Call cleanup endpoint when property/tour creation fails
2. **Backend:** Implement integrated upload with automatic cleanup (recommended)
3. **Manual:** Use cleanup endpoints to remove orphaned images

**Result:** No more orphaned images in Cloudinary! 🎉

