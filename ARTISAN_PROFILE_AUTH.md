# Artisan Profile Integration - Bearer Token Authentication

## Overview
Successfully integrated the artisan profile GET endpoint with bearer token authentication to fetch and display artisan profile data from the backend API.

## API Endpoint
- **Endpoint**: `{{baseurl}}/artisans/profile`
- **Method**: GET
- **Authentication**: Bearer Token (JWT)
- **Response**: Artisan profile data

## Response Structure
```json
{
    "_id": "6952a0ea6a8cba277ae21a83",
    "name": "yoyo",
    "email": "emem@example.com",
    "phone_number": "0599123456",
    "craftType": "Carpentry",
    "location": "Hebron",
    "description": "yoo.",
    "portfolioImages": [],
    "averageRating": 0,
    "createdAt": "2025-12-29T15:40:26.309Z",
    "updatedAt": "2025-12-29T15:40:26.309Z",
    "__v": 0
}
```

## Changes Made

### 1. Fixed Token Storage Consistency (src/utils/api.js)
**Problem**: API utility was checking for `'craftopia_token'` while login stored `'token'`

**Solution**: Updated token retrieval to use the correct key
```javascript
// Before
const token = localStorage.getItem('craftopia_token');

// After
const token = localStorage.getItem('token');
```

### 2. Updated Registration Token Storage (src/services/craftsmanService.js)
**Changed**: Made token storage consistent with login
```javascript
// Now stores:
localStorage.setItem('token', response.token);
localStorage.setItem('role', response.role || 'artisan');
localStorage.setItem('userId', response._id);
```

### 3. Updated Logout Function (src/services/craftsmanService.js)
**Changed**: Clears the correct token keys
```javascript
export const logoutCraftsman = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
};
```

### 4. Created ArtisanProfilePage Component (src/views/ArtisanProfilePage.jsx)
**New File**: Dedicated page for displaying the logged-in artisan's profile

**Features**:
- ✅ Bearer token authentication
- ✅ Fetches data from GET /artisans/profile endpoint
- ✅ Displays all profile fields from API response
- ✅ Error handling with user-friendly messages
- ✅ Loading states
- ✅ Authentication checks (redirects if not logged in as artisan)
- ✅ Responsive design
- ✅ Professional UI with profile stats
- ✅ Portfolio display support
- ✅ Contact information section
- ✅ Profile details grid with all metadata

### 5. Enhanced CSS Styles (src/styles/CraftsmanProfile.css)
**Added new styles**:
- Contact information cards
- Profile details grid
- Error message styling
- Responsive design for mobile devices
- Detail cards with colored borders
- Professional formatting

### 6. Updated App Routes (src/App.jsx)
**Added new route**:
```javascript
<Route path="/artisan-profile" element={<ArtisanProfilePage />} />
```

## How It Works

### Authentication Flow
1. **Login**: User logs in as artisan → Token stored in `localStorage` as `'token'`
2. **API Request**: When fetching profile → Token automatically included as `Bearer {token}` in Authorization header
3. **Response**: Backend validates token and returns artisan profile data
4. **Display**: Profile data rendered in ArtisanProfilePage component

### Token Management
```javascript
// Stored during login/registration
localStorage.setItem('token', response.token);
localStorage.setItem('role', 'artisan');
localStorage.setItem('userId', response._id);

// Retrieved for API calls (automatic in api.js)
const token = localStorage.getItem('token');
headers['Authorization'] = `Bearer ${token}`;

// Cleared during logout
localStorage.removeItem('token');
localStorage.removeItem('role');
localStorage.removeItem('userId');
```

## Usage

### Navigate to Artisan Profile
```javascript
// From anywhere in the app
navigate('/artisan-profile');

// From CraftsmanDashboard
<button onClick={() => navigate('/artisan-profile')}>
  View My Profile
</button>
```

### Component Usage
```jsx
import ArtisanProfilePage from './views/ArtisanProfilePage';

// In routes
<Route path="/artisan-profile" element={<ArtisanProfilePage />} />
```

## API Service Method

### getArtisanProfile() 
Located in `src/services/craftsmanService.js`

```javascript
export const getArtisanProfile = async () => {
  try {
    console.log('📋 Fetching artisan profile...');
    
    // Token is automatically included by the get() helper from localStorage
    const response = await get('/artisans/profile');
    
    console.log('✅ Artisan profile fetched successfully');
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch artisan profile');
    throw new Error(parseApiError(error));
  }
};
```

## Displayed Profile Information

The ArtisanProfilePage displays:

1. **Header Section**
   - Profile image (avatar generated from name)
   - Name
   - Craft type
   - Location
   - Active status badge

2. **Profile Stats**
   - Average rating
   - Portfolio items count
   - Member since date

3. **About Section**
   - Description/bio

4. **Contact Information**
   - Email
   - Phone number
   - Location
   - Craft type

5. **Portfolio Section**
   - Portfolio images (if available)
   - Empty state if no images

6. **Profile Details**
   - Profile ID
   - Created date
   - Last updated date
   - Average rating

## Error Handling

The component handles various error scenarios:

1. **Not Authenticated**: Redirects to login
2. **Wrong Role**: Shows alert and redirects
3. **API Error**: Displays error message with retry option
4. **Missing Data**: Shows appropriate empty states

## Testing Checklist

✅ **Prerequisites**:
- Backend server running
- Valid artisan account created
- Token stored after login

✅ **Tests**:
1. Login as artisan
2. Navigate to `/artisan-profile`
3. Verify profile data displays correctly
4. Check all fields are populated
5. Test portfolio section (with and without images)
6. Test error handling (logout and try to access)
7. Test responsive design on mobile
8. Verify console logs for debugging

## Console Logging

The implementation includes comprehensive logging:

```
📋 Fetching artisan profile...
✅ Artisan profile fetched successfully: { _id, name, email, role }
```

Or in case of errors:
```
❌ Failed to fetch artisan profile
❌ Error Status: 401
❌ Error Message: Authentication failed
```

## Future Enhancements

Possible improvements:
1. Add edit profile functionality
2. Upload portfolio images
3. Update description/bio
4. Change password option
5. View booking history
6. Analytics dashboard
7. Reviews and ratings display
8. Service availability management

## Notes

- ✅ Token is automatically included in all API requests via the `apiRequest` utility
- ✅ Bearer token format: `Authorization: Bearer {token}`
- ✅ Token persistence: Stored in localStorage, persists across page refreshes
- ✅ Consistent with customer profile pattern
- ✅ Full error handling and loading states
- ✅ Professional UI matching existing design system

## Files Modified

1. ✅ `src/utils/api.js` - Fixed token retrieval
2. ✅ `src/services/craftsmanService.js` - Updated token storage and logout
3. ✅ `src/views/ArtisanProfilePage.jsx` - Created new profile page
4. ✅ `src/styles/CraftsmanProfile.css` - Enhanced styles
5. ✅ `src/App.jsx` - Added route

## Integration Complete! 🎉

The artisan profile view is now fully integrated with:
- ✅ Bearer token authentication
- ✅ GET /artisans/profile endpoint
- ✅ Proper token storage and retrieval
- ✅ Professional UI display
- ✅ Error handling
- ✅ Responsive design
