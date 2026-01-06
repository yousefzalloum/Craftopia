# Artisan Availability Feature

## Overview
Added POST method for artisan availability management in the Craftsman Dashboard.

## Implementation Details

### Backend Endpoint
- **URL**: `{{baseurl}}/availability`
- **Method**: `POST`
- **Authentication**: Bearer Token required

### Request Body
```json
{
  "day": "Monday",
  "start_time": "09:00",
  "end_time": "17:00"
}
```

### Response
```json
{
  "artisan": "6952a0ea6a8cba277ae21a83",
  "day": "Monday",
  "start_time": "09:00",
  "end_time": "17:00",
  "_id": "695d497e977e714219508beb",
  "createdAt": "2026-01-06T17:42:22.503Z",
  "updatedAt": "2026-01-06T17:42:22.503Z",
  "__v": 0
}
```

## Files Modified

### 1. Service Layer
**File**: `src/services/craftsmanService.js`
- Added `setAvailability()` function to handle POST request to `/availability` endpoint

### 2. Dashboard Component
**File**: `src/views/CraftsmanDashboard.jsx`
- Added availability form state management
- Added form input handlers
- Added save availability handler
- Updated "Manage Times" modal with availability form UI
- Kept legacy time slots for backward compatibility

### 3. Styling
**File**: `src/styles/CraftsmanDashboard.css`
- Added `.availability-form` styling
- Added `.form-group`, `.form-control`, `.form-row` styling
- Added success/error message styling
- Added divider styling

## User Flow

1. Artisan logs in and navigates to dashboard
2. Clicks "⚙️ Manage Times" button
3. Modal opens with availability form
4. Selects:
   - Day of the week (dropdown)
   - Start time (time input)
   - End time (time input)
5. Clicks "✅ Save Availability"
6. System makes POST request to `/availability` endpoint
7. Success/error message displays
8. On success, modal closes after 2 seconds

## Features

### Form Fields
- **Day**: Dropdown with all 7 days of the week
- **Start Time**: Time picker (HH:MM format)
- **End Time**: Time picker (HH:MM format)

### Validation
- All fields are required
- Times are in 24-hour format
- Backend should validate that end_time > start_time

### User Feedback
- Loading state while saving ("⏳ Saving...")
- Success message with green styling
- Error message with red styling
- Auto-close modal on success

### Legacy Support
- Original time slots feature preserved
- Both systems can coexist
- Separated by a divider in the modal

## Testing

### Test the Feature
1. Run `npm run dev` to start development server
2. Login as an artisan
3. Navigate to Craftsman Dashboard
4. Click "⚙️ Manage Times"
5. Fill in availability form
6. Click "✅ Save Availability"
7. Check browser console for API response
8. Verify success message appears

### Expected Console Output
```
📡 API Request: http://localhost:5000/api/availability POST
✅ Availability saved: { artisan: "...", day: "...", ... }
```

## API Integration Notes

- Uses Bearer token authentication from localStorage
- Automatically includes token in Authorization header
- Error handling with user-friendly messages
- Console logging for debugging

## Future Enhancements

- Display list of saved availabilities
- Edit/delete existing availability slots
- Weekly view with all availabilities
- Conflict detection for overlapping times
- Bulk import/export availability
