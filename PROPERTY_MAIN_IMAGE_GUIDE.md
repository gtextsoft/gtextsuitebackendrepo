# Property Main Image + Gallery Structure

## 📋 Overview

Properties now have a **main image** (required) and an optional **gallery** of additional images.

---

## 🎯 Structure

### Before (Old):
```typescript
{
  images: string[]  // Array of all images, first one was "main"
}
```

### After (New):
```typescript
{
  mainImage: string,    // Required: Primary/featured image
  gallery?: string[]    // Optional: Additional gallery images
}
```

---

## ✅ Benefits

1. **Clear Separation** - Main image is explicitly defined
2. **Better UX** - Frontend knows which image to use for thumbnails/listings
3. **Flexible** - Gallery is optional (can have just main image)
4. **Industry Standard** - Matches common property listing patterns

---

## 📡 API Changes

### Create Property

**Request Body:**
```json
{
  "name": "Luxury Villa",
  "location": "Dubai",
  "mainImage": "https://res.cloudinary.com/.../main-image.jpg",
  "gallery": [
    "https://res.cloudinary.com/.../gallery1.jpg",
    "https://res.cloudinary.com/.../gallery2.jpg",
    "https://res.cloudinary.com/.../gallery3.jpg"
  ],
  // ... other fields
}
```

**Required:**
- `mainImage` (string) - **Required**

**Optional:**
- `gallery` (string[]) - Optional array of additional images

---

## 💻 Frontend Implementation

### Upload Flow

```typescript
// Step 1: Upload main image
const mainImageResponse = await fetch('/api/uploads/single?folder=properties', {
  method: 'POST',
  body: mainImageFormData,
  credentials: 'include'
});
const { data: { imageUrl: mainImageUrl } } = await mainImageResponse.json();

// Step 2: Upload gallery images (optional)
let galleryUrls: string[] = [];
if (galleryFiles.length > 0) {
  const galleryFormData = new FormData();
  galleryFiles.forEach(file => galleryFormData.append('images', file));
  
  const galleryResponse = await fetch('/api/uploads/multiple?folder=properties', {
    method: 'POST',
    body: galleryFormData,
    credentials: 'include'
  });
  const { data: { imageUrls } } = await galleryResponse.json();
  galleryUrls = imageUrls;
}

// Step 3: Create property
await fetch('/api/properties', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Luxury Villa',
    mainImage: mainImageUrl,
    gallery: galleryUrls,
    // ... other fields
  }),
  credentials: 'include'
});
```

---

## 🎨 React Component Example

```tsx
function PropertyImageUpload({ onImagesReady }) {
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGalleryImages(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      // Upload main image
      const mainFormData = new FormData();
      mainFormData.append('image', mainImage!);
      
      const mainRes = await fetch('/api/uploads/single?folder=properties', {
        method: 'POST',
        body: mainFormData,
        credentials: 'include'
      });
      const mainData = await mainRes.json();
      const mainImageUrl = mainData.data.imageUrl;

      // Upload gallery (if any)
      let galleryUrls: string[] = [];
      if (galleryImages.length > 0) {
        const galleryFormData = new FormData();
        galleryImages.forEach(file => {
          galleryFormData.append('images', file);
        });
        
        const galleryRes = await fetch('/api/uploads/multiple?folder=properties', {
          method: 'POST',
          body: galleryFormData,
          credentials: 'include'
        });
        const galleryData = await galleryRes.json();
        galleryUrls = galleryData.data.imageUrls;
      }

      onImagesReady({
        mainImage: mainImageUrl,
        gallery: galleryUrls
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div>
        <label>Main Image (Required)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleMainImageChange}
        />
        {mainImage && (
          <img 
            src={URL.createObjectURL(mainImage)} 
            alt="Main preview" 
            style={{ maxWidth: '200px' }}
          />
        )}
      </div>

      <div>
        <label>Gallery Images (Optional)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
        />
        <div>
          {galleryImages.map((file, index) => (
            <img
              key={index}
              src={URL.createObjectURL(file)}
              alt={`Gallery ${index + 1}`}
              style={{ maxWidth: '100px', margin: '5px' }}
            />
          ))}
        </div>
      </div>

      <button 
        onClick={handleUpload} 
        disabled={!mainImage || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Images'}
      </button>
    </div>
  );
}
```

---

## 📊 Response Structure

### Property Response

```json
{
  "success": true,
  "data": {
    "property": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Luxury Villa",
      "location": "Dubai",
      "mainImage": "https://res.cloudinary.com/.../main-image.jpg",
      "gallery": [
        "https://res.cloudinary.com/.../gallery1.jpg",
        "https://res.cloudinary.com/.../gallery2.jpg"
      ],
      // ... other fields
    }
  }
}
```

---

## 🎯 Usage Examples

### Display Main Image (Listings/Thumbnails)

```tsx
function PropertyCard({ property }) {
  return (
    <div>
      <img 
        src={property.mainImage} 
        alt={property.name}
        className="property-thumbnail"
      />
      <h3>{property.name}</h3>
    </div>
  );
}
```

### Display Gallery

```tsx
function PropertyGallery({ property }) {
  const allImages = [property.mainImage, ...(property.gallery || [])];
  
  return (
    <div className="gallery">
      {allImages.map((image, index) => (
        <img 
          key={index}
          src={image} 
          alt={`${property.name} - Image ${index + 1}`}
        />
      ))}
    </div>
  );
}
```

### Display with Main Image Featured

```tsx
function PropertyDetail({ property }) {
  return (
    <div>
      {/* Main image - large featured */}
      <div className="main-image">
        <img src={property.mainImage} alt={property.name} />
      </div>
      
      {/* Gallery - thumbnails */}
      {property.gallery && property.gallery.length > 0 && (
        <div className="gallery-thumbnails">
          {property.gallery.map((image, index) => (
            <img 
              key={index}
              src={image} 
              alt={`Gallery ${index + 1}`}
              onClick={() => setMainImage(image)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Migration Notes

### For Existing Properties

If you have existing properties with `images: string[]`, you can:

1. **Option A: Manual Migration** - Update each property to have `mainImage` and `gallery`
2. **Option B: Auto-Migration** - Use first image as `mainImage`, rest as `gallery`

### Migration Script Example

```typescript
// One-time migration script
const migrateProperties = async () => {
  const properties = await Property.find({ images: { $exists: true } });
  
  for (const property of properties) {
    if (property.images && property.images.length > 0) {
      property.mainImage = property.images[0];
      property.gallery = property.images.slice(1);
      await property.save();
    }
  }
};
```

---

## ✅ Summary

**New Structure:**
- ✅ `mainImage` (required) - Primary/featured image
- ✅ `gallery` (optional) - Additional images array

**Benefits:**
- ✅ Clear separation of main vs gallery
- ✅ Better for listings/thumbnails
- ✅ Industry standard pattern
- ✅ Flexible (gallery optional)

**Frontend:**
- Upload main image separately
- Upload gallery images separately
- Use mainImage for thumbnails/listings
- Use gallery for detail pages

