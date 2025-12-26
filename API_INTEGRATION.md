# Backend Integration Guide

## Overview
This document explains the backend API integration for the Craftopia frontend application.

## API Configuration

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** Configure via `VITE_API_BASE_URL` environment variable

### Environment Setup
1. Copy `.env.example` to `.env`
2. Update `VITE_API_BASE_URL` if needed
3. Restart the development server after changing environment variables

## Authentication Flow

### 1. Signup/Registration
**Endpoint:** `POST /artisans`

**Request Body:**
```json
{
  "name": "Maria The Tailor",
  "email": "yousef@craftopia.com",
  "password": "securepassword123",
  "craftType": "Tailoring",
  "location": "Amman"
}
```

**Response:**
```json
{
  "_id": "694e7fd9f14524d75d426577",
  "name": "Maria The Tailor",
  "email": "yousef@craftopia.com",
  "craftType": "Tailoring",
  "location": "Amman",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Artisan registered successfully!"
}
```

**Frontend Implementation:**
- File: `src/services/craftsmanService.js`
- Function: `registerCraftsman()`
- Automatically stores token and user data in localStorage
- Redirects to dashboard on success

### 2. Token Management
**Stored in localStorage:**
- `craftopia_token` - JWT authentication token
- `craftopia_craftsman_id` - Artisan ID
- `craftopia_current_user` - User session data

**Token Usage:**
- Automatically attached to API requests via Authorization header
- Format: `Bearer <token>`
- Checked for expiration before requests

## File Structure

```
src/
├── utils/
│   ├── api.js                    # Base API configuration and helpers
│   └── auth.js                   # Authentication utilities
├── services/
│   └── craftsmanService.js       # Craftsman/Artisan API methods
└── views/
    └── Signup.jsx                # Registration form component
```

## Key Components

### 1. API Utility (`src/utils/api.js`)
- **Purpose:** Centralized API configuration and error handling
- **Features:**
  - Automatic token attachment
  - Error parsing and user-friendly messages
  - Network error handling
  - HTTP method helpers (get, post, put, del)

**Usage Example:**
```javascript
import { post, get } from '../utils/api';

// POST request
const data = await post('/artisans', { name, email, password });

// GET request
const profile = await get('/artisans/123');
```

### 2. Craftsman Service (`src/services/craftsmanService.js`)
- **Purpose:** Artisan-specific API operations
- **Methods:**
  - `registerCraftsman(data)` - Register new artisan
  - `loginCraftsman(credentials)` - Login existing artisan
  - `getCraftsmanProfile(id)` - Get profile data
  - `updateCraftsmanProfile(id, data)` - Update profile
  - `getAllCraftsmen(filters)` - List all artisans
  - `logoutCraftsman()` - Logout and clear session

### 3. Signup Component (`src/views/Signup.jsx`)
- **Purpose:** User registration interface
- **Features:**
  - Form validation (client-side)
  - Real-time error feedback
  - Loading states during API calls
  - Success/error message display
  - Automatic navigation after success

## Error Handling

### API Error Responses
The system handles various HTTP status codes:

| Status | Meaning | User Message |
|--------|---------|--------------|
| 400 | Bad Request | "Invalid request. Please check your input." |
| 401 | Unauthorized | "Authentication failed. Please login again." |
| 403 | Forbidden | "You do not have permission..." |
| 404 | Not Found | "Resource not found." |
| 409 | Conflict | "This resource already exists." |
| 422 | Validation Error | Backend message or "Validation error..." |
| 500 | Server Error | "Server error. Please try again later." |
| 0 | Network Error | "Unable to connect to the server..." |

### Error Display
- **Global Errors:** Red alert box at top of form
- **Field Errors:** Red text below individual fields
- **Visual Feedback:** Input borders turn red, shake animation

## User Experience Features

### Loading States
- Button shows spinner and "Creating Account..." text
- All form fields disabled during submission
- Prevents double submissions

### Success Flow
1. Form validation passes
2. API request sent (button shows loading)
3. Success response received
4. Token and user data stored
5. Automatic redirect to dashboard after 1 second

### Error Flow
1. Error occurs (validation or API)
2. Error message displayed
3. User can correct and retry
4. Previous errors clear when user types

## Validation Rules

### Name
- Required
- Minimum 3 characters

### Email
- Required
- Valid email format (regex validation)

### Password
- Required
- Minimum 6 characters

### Confirm Password
- Required
- Must match password field

### Craft Type
- Required
- Must select from dropdown

### Location
- Required
- Must select from dropdown

## Available Options

### Craft Types
- Tailoring
- Welder
- Carpenter
- Plumber
- Electrician
- Blacksmith
- Potter
- Glassblower
- Leatherworker
- Metalworker

### Locations (Jordan)
- Amman
- Zarqa
- Irbid
- Aqaba
- Madaba
- Salt
- Jerash
- Karak
- Mafraq
- Ajloun

## Testing

### Manual Testing Steps
1. Start backend server: `npm start` (in backend folder)
2. Start frontend: `npm run dev` (in frontend folder)
3. Navigate to `/signup`
4. Fill out form with valid data
5. Submit and verify:
   - Loading state appears
   - Success response handled
   - Token stored in localStorage
   - Redirect to dashboard

### Test Cases
- ✅ Valid registration
- ✅ Duplicate email (409 error)
- ✅ Invalid email format
- ✅ Password mismatch
- ✅ Missing required fields
- ✅ Server offline (network error)
- ✅ Backend validation errors

## Security Considerations

### Client-Side
- Passwords never logged or exposed
- Token stored in localStorage (HttpOnly cookies preferred for production)
- Input validation before API calls
- XSS protection via React's built-in sanitization

### Recommendations for Production
1. Use HttpOnly cookies for tokens instead of localStorage
2. Implement CSRF protection
3. Add rate limiting on signup endpoint
4. Use HTTPS only
5. Implement refresh tokens
6. Add email verification

## Future Enhancements

1. **Login Page:** Similar integration for `/artisans/login`
2. **Profile Update:** Use `updateCraftsmanProfile()` 
3. **Password Reset:** Add forgot password flow
4. **Email Verification:** Verify email after signup
5. **Social Login:** OAuth integration (Google, Facebook)
6. **Two-Factor Auth:** Extra security layer

## Troubleshooting

### Issue: "Unable to connect to the server"
- **Cause:** Backend not running or wrong URL
- **Solution:** Verify backend is running on `http://localhost:5000`

### Issue: "Email already exists"
- **Cause:** Duplicate registration
- **Solution:** Use different email or login instead

### Issue: Token not persisting
- **Cause:** localStorage disabled or cleared
- **Solution:** Check browser settings, use incognito to test

### Issue: CORS errors
- **Cause:** Backend not configured for frontend origin
- **Solution:** Add CORS middleware in backend with frontend URL

## Contact & Support
For backend API questions, refer to the backend documentation or contact the backend development team.
