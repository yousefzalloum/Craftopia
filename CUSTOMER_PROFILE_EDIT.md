# Customer Profile Edit Feature

## Overview
Customers can now edit their profile information through a modal interface. Changes are saved to the backend via the `/customers/profile` endpoint.

## Backend Endpoint
**Endpoint:** `PUT /api/customers/profile`  
**Authentication:** Bearer Token (JWT) required  
**Content-Type:** `application/json`

### Request
```json
{
  "name": "John Doe",
  "phone_number": "1234567890"
}
```

### Response
Returns the updated customer profile object with all fields.

## Frontend Implementation

### Files Updated

#### 1. **customerService.js**
Location: `src/services/customerService.js`

**Updated Function:**
```javascript
export const updateCustomerProfile = async (updateData) => {
  // Uses authenticated PUT /customers/profile endpoint
  // Backend identifies customer from JWT token
  // Returns updated profile data
}
```

**Changes:**
- Removed `customerId` parameter (backend uses token)
- Uses `/customers/profile` endpoint instead of `/customers/:id`
- Removed localStorage update (data comes from backend)
- Added detailed logging for debugging

#### 2. **Profile.jsx**
Location: `src/views/Profile.jsx`

**New Features:**
- ✏️ **Edit Profile Button** in header
- **Modal Dialog** for editing
- **Form Validation** (required fields)
- **Success/Error Messages**
- **Auto-refresh** after successful update

**New State Variables:**
```javascript
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [editLoading, setEditLoading] = useState(false);
const [editError, setEditError] = useState(null);
const [successMessage, setSuccessMessage] = useState(null);
const [formData, setFormData] = useState({
  name: '',
  phone_number: ''
});
```

**New Functions:**
- `handleOpenEditModal()` - Opens modal with pre-filled data
- `handleCloseEditModal()` - Closes modal and clears messages
- `handleInputChange()` - Updates form fields
- `handleSubmitEdit()` - Submits changes to backend

## User Flow

### Step 1: Open Edit Modal
1. Customer navigates to their profile page
2. Clicks "✏️ Edit Profile" button in top-right
3. Modal appears with current profile data pre-filled

### Step 2: Edit Information
- **Name field** - Customer's full name
- **Phone Number field** - Contact number
- Both fields are required

### Step 3: Save Changes
1. Customer clicks "Save Changes"
2. Frontend validates form data
3. Sends PUT request to `/customers/profile`
4. Backend updates customer record
5. Backend returns updated profile

### Step 4: Success
1. Success message appears: "✅ Profile updated successfully!"
2. Profile data refreshes automatically
3. Modal closes after 1.5 seconds
4. Updated information visible on profile page

### Error Handling
- Network errors displayed in modal
- Validation errors shown
- Modal stays open on error
- User can retry or cancel

## UI Components

### Edit Profile Button
```jsx
<button onClick={handleOpenEditModal}>
  ✏️ Edit Profile
</button>
```
- Located in header next to "My Profile" title
- Purple gradient color (#667eea)
- Hover effect

### Edit Modal
- **Modal Overlay** - Dark semi-transparent background
- **Modal Content** - White card with rounded corners
- **Header** - "✏️ Edit Profile" title with close button (✕)
- **Form Fields:**
  - Name (text input, required)
  - Phone Number (tel input, required)
- **Action Buttons:**
  - Cancel (gray) - Closes modal without saving
  - Save Changes (purple) - Submits form

### Success Banner
- Green background (#d4edda)
- Appears below header after successful update
- Auto-dismisses when modal closes

## Form Validation

### Frontend Validation
```javascript
// Both fields required
<input type="text" name="name" required />
<input type="tel" name="phone_number" required />
```

### Backend Validation
Backend validates:
- Token authentication
- Required fields present
- Data format correctness

## Update Process

```javascript
const handleSubmitEdit = async (e) => {
  e.preventDefault();
  
  // 1. Show loading state
  setEditLoading(true);
  
  // 2. Send update to backend
  await updateCustomerProfile(formData);
  
  // 3. Refresh profile from backend
  const refreshedProfile = await getCustomerProfile();
  
  // 4. Update local state
  setUser(refreshedProfile);
  
  // 5. Show success and close modal
  setSuccessMessage('Profile updated successfully!');
  setTimeout(() => setIsEditModalOpen(false), 1500);
};
```

## Testing

### Manual Test Steps

1. **Login as Customer**
   ```
   Email: customer@example.com
   Password: password123
   ```

2. **Navigate to Profile**
   - Click "👤 {Name}" in navbar
   - Or go to `/profile`

3. **Open Edit Modal**
   - Click "✏️ Edit Profile" button
   - Verify current data is pre-filled

4. **Update Name**
   - Change name to "Test Customer"
   - Click "Save Changes"
   - Verify success message appears
   - Verify modal closes
   - Verify name updated on profile page

5. **Update Phone**
   - Click "✏️ Edit Profile" again
   - Change phone to "9876543210"
   - Click "Save Changes"
   - Verify phone updated

6. **Test Validation**
   - Clear name field
   - Try to submit
   - Verify HTML5 validation error

7. **Test Cancel**
   - Open edit modal
   - Make changes
   - Click "Cancel"
   - Verify modal closes
   - Verify changes not saved

### Test Cases

✅ **Should Work:**
- Update name only
- Update phone only
- Update both fields
- Close with ✕ button
- Close with Cancel button
- Close by clicking overlay

❌ **Should Prevent:**
- Submit with empty name
- Submit with empty phone
- Multiple simultaneous updates (button disabled during save)

### Backend Testing

**Postman Request:**
```http
PUT http://localhost:5000/api/customers/profile
Headers:
  Authorization: Bearer {jwt-token}
  Content-Type: application/json
Body:
{
  "name": "Updated Name",
  "phone_number": "1234567890"
}
```

**Expected Response:**
```json
{
  "_id": "...",
  "name": "Updated Name",
  "email": "customer@example.com",
  "phone_number": "1234567890",
  "register_date": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Error Scenarios

### 1. Network Error
**Cause:** Backend not running  
**Display:** "Unable to connect to the server..."  
**Action:** User can retry

### 2. Authentication Error (401)
**Cause:** Invalid/expired token  
**Display:** "Authentication failed. Please login again."  
**Action:** Redirect to login

### 3. Validation Error (400)
**Cause:** Invalid data format  
**Display:** Backend error message  
**Action:** User corrects and retries

### 4. Server Error (500)
**Cause:** Backend issue  
**Display:** "Server error. Please try again later."  
**Action:** User retries later

## Console Logging

### Update Flow Logs
```
📝 Submitting profile update: { name: "...", phone_number: "..." }
📝 Updating customer profile...
📝 Update data: { name: "...", phone_number: "..." }
✅ Customer profile updated successfully: { _id: "...", name: "...", ... }
✅ Profile update request successful
📋 Fetching customer profile...
✅ Refreshed profile data: { ... }
```

### Error Logs
```
❌ Failed to update customer profile
❌ Error Status: 400
❌ Error Message: Invalid phone number format
❌ Error Response Data: { ... }
```

## Security

### Authentication
- JWT token required in Authorization header
- Backend validates token before update
- Token identifies which customer to update

### Data Validation
- Frontend: HTML5 required attributes
- Backend: Field validation and sanitization
- No customer ID in request (prevents unauthorized updates)

### Authorization
- Customer can only update their own profile
- Backend uses token to identify customer
- No risk of updating wrong profile

## Troubleshooting

### Profile not updating

1. **Check console for errors:**
   ```javascript
   console.log('📝 Update data:', formData);
   ```

2. **Verify token exists:**
   ```javascript
   localStorage.getItem('token') // Should return JWT
   ```

3. **Check network tab:**
   - PUT request to `/customers/profile`
   - Status 200 OK?
   - Response contains updated data?

4. **Verify backend endpoint:**
   - Endpoint exists and handles PUT
   - Token authentication working
   - Returns updated customer object

### Modal not opening

1. Check button click handler
2. Verify `isEditModalOpen` state updates
3. Check browser console for errors

### Changes not persisting

1. Verify backend saves to database
2. Check `getCustomerProfile()` returns fresh data
3. Verify `setUser()` called with new data

## File Structure

```
src/
├── services/
│   └── customerService.js       # updateCustomerProfile()
├── views/
│   └── Profile.jsx              # Customer profile with edit modal
└── styles/
    └── Profile.css              # Profile page styles
```

## Comparison: Artisan vs Customer Profile Edit

| Feature | Artisan | Customer |
|---------|---------|----------|
| **Endpoint** | `/artisans/profile` | `/customers/profile` |
| **Method** | PUT | PUT |
| **Editable Fields** | name, phone, location, craftType, description | name, phone_number |
| **Profile Picture** | ✅ Yes | ❌ No (future feature) |
| **Portfolio** | ✅ Yes | ❌ N/A |
| **Modal Style** | External CSS classes | Inline styles |

## Future Enhancements

### Possible Additions:
1. **Profile Picture Upload** for customers
2. **Email Change** with verification
3. **Password Change** form
4. **Address/Location** field
5. **Preferences** section
6. **Account Deletion** option

## Integration Summary

✅ **Completed:**
- Customer profile edit modal
- Form with name and phone fields
- PUT request to `/customers/profile`
- Bearer token authentication
- Auto-refresh after update
- Success/error handling
- Loading states
- Form validation

✅ **Works With:**
- Backend endpoint: `/api/customers/profile`
- JWT authentication
- Existing customer profile page
- All customer authentication flows

## Ready to Use!

The customer profile edit feature is fully implemented and ready for testing. Customers can now update their name and phone number through an intuitive modal interface.
