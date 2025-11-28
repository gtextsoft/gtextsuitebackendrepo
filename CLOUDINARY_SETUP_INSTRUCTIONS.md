# Cloudinary Setup Instructions - Fix "Must supply api_key" Error

## ❌ Error You're Seeing

```
Error: Must supply api_key
```

This means Cloudinary environment variables are missing from your `.env` file.

---

## ✅ Solution

### Step 1: Get Your Cloudinary Credentials

1. Go to [cloudinary.com](https://cloudinary.com) and sign up (or log in)
2. Go to your **Dashboard**
3. Copy these three values:
   - **Cloud Name** (e.g., `dxyz123`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

---

### Step 2: Add to `.env` File

Create or edit your `.env` file in the project root and add:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxyz123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

### Step 3: Restart Your Server

After adding the environment variables:

1. **Stop your server** (Ctrl+C)
2. **Restart your server:**
   ```bash
   npm run dev
   ```

You should see:
```
✅ Cloudinary configured successfully
```

---

## 🔍 Verify Setup

### Check if `.env` file exists:

```bash
# Windows PowerShell
Get-Content .env

# Windows CMD
type .env

# Linux/Mac
cat .env
```

### Check if variables are loaded:

The server will now show an error message if variables are missing, or "✅ Cloudinary configured successfully" if they're set correctly.

---

## 📝 Complete `.env` File Example

Your `.env` file should look something like this:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/gtextsuite

# JWT
JWT_SECRET_KEY=your_jwt_secret_key_here

# Email (if you have email configured)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
```

---

## ⚠️ Important Notes

1. **Never commit `.env` to Git** - It should be in `.gitignore`
2. **Keep credentials secret** - Don't share your API secret
3. **Restart server after changes** - Environment variables are loaded at startup
4. **Check for typos** - Variable names must match exactly:
   - `CLOUDINARY_CLOUD_NAME` (not `CLOUD_NAME`)
   - `CLOUDINARY_API_KEY` (not `API_KEY`)
   - `CLOUDINARY_API_SECRET` (not `API_SECRET`)

---

## 🚨 Still Getting Error?

### Check 1: File Location
Make sure `.env` is in the **root directory** (same folder as `package.json`)

### Check 2: Variable Names
Make sure variable names are **exactly**:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Check 3: No Spaces
```env
# ❌ Wrong
CLOUDINARY_CLOUD_NAME = dxyz123

# ✅ Correct
CLOUDINARY_CLOUD_NAME=dxyz123
```

### Check 4: Restart Server
Environment variables are only loaded when the server starts. **Restart your server** after adding/changing `.env` file.

### Check 5: Check Console Output
The server will now show a clear error message if Cloudinary is not configured:
```
⚠️ Cloudinary configuration missing!
Please add the following to your .env file:
...
```

---

## ✅ Success!

Once configured correctly, you should see:
```
✅ Cloudinary configured successfully
```

And image uploads will work! 🎉

