# Artisan Avatar Upload Integration Guide

## Overview
This guide explains how the artisan profile picture upload feature works in Craftopia.

## Backend Endpoint
**Endpoint:** `POST /api/artisans/profile-picture`  
**Authentication:** Bearer Token (JWT) required  
**Content-Type:** `multipart/form-data`

### Request
- **Method:** POST
- **Headers:** 
  - `Authorization: Bearer {token}`
- **Body:** FormData with field name `image`

### Response
```json
{
    "message": "Profile picture updated",
    "profilePicture": "/uploads/1767271155205-ff871ba4673c93bc12b092c8ae23e546.jpg"
}
```

## Frontend Implementation

### Files Updated

#### 1. **craftsmanService.js**
Located: `src/services/craftsmanService.js`

```javascript
export const uploadProfilePicture = async (imageFile) => {
  // Creates FormData with 'image' field
  // Uses Bearer token from localStorage
  // Uploads to /api/artisans/profile-picture
  // Returns response with profilePicture path
}
```

**Key Features:**
- Validates file is an image
- Sends multipart/form-data request
- Returns profile picture path from backend
- Proper error handling with console logging

#### 2. **ArtisanProfilePage.jsx** 
Located: `src/views/ArtisanProfilePage.jsx`

**Features:**
- File input for selecting profile picture
- Image preview before upload
- File validation (type and size < 5MB)
- Upload on form submission
- Automatic profile refresh after upload
- Displays uploaded profile picture

**Key Functions:**
- `handleProfilePictureChange()` - Handles file selection and preview
- `handleSubmitEdit()` - Uploads picture and updates profile
- Profile picture display with fallback to avatar placeholder

#### 3. **CraftsmanProfile.jsx**
Located: `src/views/CraftsmanProfile.jsx`

**Features:**
- Displays artisan's profile picture to visitors
- Supports both `profilePicture` (uploaded) and `profileImage` (legacy) fields
- Fallback to generated avatar if no picture uploaded
- Error handling with fallback avatar

## How It Works

### Upload Flow

1. **Artisan opens Edit Profile modal**
   - Clicks "Edit Profile" button on their profile page
   - Modal opens with current profile data

2. **Selects profile picture**
   - Clicks on file input
   - Selects image file from computer
   - Image preview appears immediately

3. **Validation**
   - Frontend checks file type (must be image/*)
   - Frontend checks file size (max 5MB)
   - Shows error if validation fails

4. **Form submission**
   ```javascript
   // Upload profile picture first
   if (profilePictureFile) {
     await uploadProfilePicture(profilePictureFile);
   }
   
   // Then update other profile fields
   await updateArtisanProfile(formData);
   
   // Refresh profile to get updated data
   const refreshedProfile = await getArtisanProfile();
   setProfileData(refreshedProfile);
   ```

5. **Display updated picture**
   - Profile automatically refreshes
   - New picture appears in profile page
   - Picture visible to all visitors

### Image URL Construction

The backend returns a relative path like:
```
/uploads/1767271155205-ff871ba4673c93bc12b092c8ae23e546.jpg
```

Frontend constructs full URL:
```javascript
profileData.profilePicture.startsWith('http') 
  ? profileData.profilePicture  // Already full URL
  : `http://localhost:5000${profileData.profilePicture}`  // Relative path
```

**Production:** Update base URL to your production server.

## UI Components

### Edit Profile Modal
- **Profile Picture Section:**
  - File input with "Choose file" button
  - Image preview (150px circular)
  - Help text: "Upload an image file (max 5MB)"

### Profile Display
- **Profile Image Container:**
  - Circular image (200px)
  - "Active" badge overlay
  - Error fallback to generated avatar

## Error Handling

### Frontend Validation
```javascript
// File type check
if (!file.type.startsWith('image/')) {
  setEditError('Please select a valid image file');
  return;
}

// File size check (5MB)
if (file.size > 5 * 1024 * 1024) {
  setEditError('Image size must be less than 5MB');
  return;
}
```

### Upload Errors
- Network errors caught and displayed
- Backend errors shown to user
- Profile updates continue even if upload fails
- Console logging for debugging

### Display Errors
- `onError` handler on `<img>` tags
- Automatic fallback to generated avatar
- Error logged to console

## Testing

### Manual Testing Steps

1. **Login as artisan**
   ```
   Email: john@example.com
   Password: password123
   ```

2. **Navigate to profile**
   - Click "👤 Profile" in navbar
   - Or go to `/artisan-profile`

3. **Open Edit Modal**
   - Click "✏️ Edit Profile" button

4. **Upload Picture**
   - Click "Choose File" under Profile Picture
   - Select image file (JPG, PNG, etc.)
   - See preview appear
   - Click "Save Changes"

5. **Verify Upload**
   - Modal closes after success
   - Profile picture appears on page
   - Refresh page - picture persists

6. **View Public Profile**
   - Have another user view your profile
   - Picture should be visible to everyone

### Test Cases

✅ **Valid Uploads:**
- JPG image < 5MB
- PNG image < 5MB
- JPEG image < 5MB
- GIF image < 5MB

❌ **Should Reject:**
- PDF files (not an image)
- Images > 5MB
- Non-image files

### Backend Testing with Postman

```http
POST http://localhost:5000/api/artisans/profile-picture
Headers:
  Authorization: Bearer {your-jwt-token}
Body:
  form-data
  image: [select file]
```

Expected Response:
```json
{
    "message": "Profile picture updated",
    "profilePicture": "/uploads/1767271155205-example.jpg"
}
```

## Troubleshooting

### Picture not appearing after upload

1. **Check console logs:**
   ```javascript
   console.log('📸 Profile picture field:', profileData.profilePicture);
   ```

2. **Verify backend URL:**
   - Check `.env` file: `VITE_API_BASE_URL`
   - Default: `http://localhost:5000/api`

3. **Check network tab:**
   - Upload request successful (200)?
   - Response contains `profilePicture` field?

4. **Verify file served correctly:**
   - Open: `http://localhost:5000/uploads/filename.jpg`
   - Should display the image

### CORS issues

If you see CORS errors:
```javascript
// Backend needs CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Upload fails

1. **Check backend logs** for errors
2. **Verify uploads directory exists** and is writable
3. **Check file size limit** on backend (multer config)
4. **Ensure proper authentication** (valid JWT token)

## File Structure

```
src/
├── services/
│   └── craftsmanService.js      # uploadProfilePicture()
├── views/
│   ├── ArtisanProfilePage.jsx   # Upload UI + Display (artisan's own)
│   └── CraftsmanProfile.jsx     # Display only (public view)
└── utils/
    └── api.js                    # Base API utilities
```

## Security Notes

1. **Authentication Required:** Only logged-in artisans can upload
2. **Token Validation:** Backend verifies JWT token
3. **File Validation:** Frontend and backend validate file type/size
4. **File Storage:** Images stored in `/uploads` directory
5. **Path Returned:** Relative path only, no server info exposed

## Production Deployment

### Update Base URL
In `.env`:
```
VITE_API_BASE_URL=https://your-production-api.com/api
```

### Backend Configuration
1. Configure upload directory
2. Set file size limits
3. Enable CORS for production domain
4. Set up static file serving for `/uploads`

### Image Display
Update image URL construction if needed:
```javascript
const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
const imageUrl = `${baseUrl}${profileData.profilePicture}`;
```

## API Integration Summary

✅ **Implemented:**
- Profile picture upload endpoint integration
- FormData multipart upload
- Bearer token authentication
- File validation (type + size)
- Image preview before upload
- Automatic profile refresh after upload
- Display in both own and public profiles
- Error handling and fallbacks

✅ **Works With:**
- Backend endpoint: `/api/artisans/profile-picture`
- Response format: `{ message, profilePicture }`
- File field name: `image`
- Authentication: JWT Bearer token

## Next Steps

1. ✅ Upload feature is fully integrated
2. ✅ Profile displays updated pictures
3. ✅ Error handling implemented
4. ✅ Validation added

Ready to test! Log in as an artisan and try uploading a profile picture.
