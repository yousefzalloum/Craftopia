# Reservation System Update - Complete ✅

## Overview
Updated the entire reservation system to support two types of reservations using the same endpoint `{{baseurl}}/reservations`:

1. **Portfolio Orders** - Orders placed from an artisan's portfolio items
2. **Custom Requests** - Custom service requests through the booking form

---

## Changes Made

### 1. API Utilities (`src/utils/api.js`)
**Added:**
- `createReservation()` function - Universal function to create both types of reservations

```javascript
export const createReservation = async (reservationData) => {
  return post('/reservations', reservationData);
};
```

---

### 2. Reservation Controller (`src/controllers/ReservationController.js`)
**Added two new methods:**

#### `createPortfolioOrder()`
Handles portfolio-based orders with the following request body:
```javascript
{
  artisanId: "string",
  job_type: "Order",
  title: "string",
  reference_image: "string (path)",
  quantity: number,
  description: "string"
}
```

#### `createCustomRequest()`
Handles custom service requests with the following request body:
```javascript
{
  artisanId: "string",
  job_type: "Custom_Request",
  title: "string",
  description: "string",
  deadline: "YYYY-MM-DD"
}
```

**Expected Response Format:**
```javascript
{
  customer: "customerId",
  artisan: "artisanId",
  job_type: "Order" | "Custom_Request",
  title: "string",
  description: "string",
  status: "Pending",
  agreed_price: 0,
  quantity: number, // for orders
  reference_image: "string", // for orders
  deadline: "ISO date", // for custom requests
  _id: "string",
  createdAt: "ISO date",
  updatedAt: "ISO date",
  __v: 0
}
```

---

### 3. Artisan Details Page (`src/views/ArtisanDetailsPage.jsx`)
**Added Portfolio Order Functionality:**

✅ **Order Buttons** on each portfolio item (visible to customers only)
✅ **Order Modal** with:
   - Portfolio item preview
   - Quantity selector
   - Order description/instructions field
   - Price calculation (if available)
   - Submit button

**Features:**
- Authentication check before ordering
- Role-based visibility (customers only)
- Image preview with quantity and price calculation
- Error handling and success messages
- Auto-redirect to reservations page after successful order

**Order Flow:**
1. Customer clicks "🛒 Order This Item" button on portfolio item
2. Modal opens with item details and order form
3. Customer enters quantity and order details
4. System creates order using `ReservationController.createPortfolioOrder()`
5. Success: Redirects to `/reservations`

---

### 4. Book Maintenance Page (`src/views/BookMaintenance.jsx`)
**Updated for Custom Requests:**

✅ Replaced dummy data with **real artisan data** from API
✅ Added **Request Title** field
✅ Updated to fetch artisans using `getAllArtisans()`
✅ Changed from appointment booking to custom request submission
✅ Updated submit handler to use `ReservationController.createCustomRequest()`

**New Form Fields:**
- Request Title (e.g., "Fix my dining table")
- Profession selection (from artisan craftTypes)
- Artisan selection (filtered by profession)
- Service description
- Service address
- Appointment date
- Appointment time

**Custom Request Flow:**
1. Customer enters request title and selects profession
2. System shows available artisans for that profession
3. Customer selects artisan and fills in details
4. System creates custom request with:
   - Title from form
   - Combined description (includes address and preferred time)
   - Deadline from appointment date
5. Success: Redirects to `/reservations`

---

### 5. Craftsman Service (`src/services/craftsmanService.js`)
**Added:**
- `getAllArtisans()` function - Fetches all artisans from `/artisans` endpoint

```javascript
export const getAllArtisans = async () => {
  try {
    const response = await get('/artisans');
    return response;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};
```

---

## API Integration Summary

### Endpoint: `POST /reservations`

#### Type 1: Portfolio Order
**Request Body:**
```json
{
  "artisanId": "69527b66d3fbe06d4152a266",
  "job_type": "Order",
  "title": "Handmade Clay Vase",
  "reference_image": "/uploads/1767272877357-kit.jfif",
  "quantity": 3,
  "description": "I need 3 of these delivered to Nablus."
}
```

**Backend Response:**
```json
{
  "customer": "695e906f9353734b82864dbe",
  "artisan": "69527b66d3fbe06d4152a266",
  "job_type": "Order",
  "title": "Handmade Clay Vase",
  "description": "I need 3 of these delivered to Nablus.",
  "status": "Pending",
  "agreed_price": 0,
  "quantity": 3,
  "reference_image": "/uploads/1767272877357-kit.jfif",
  "_id": "695fdf788ccdcba8fef77d52",
  "createdAt": "2026-01-08T16:46:48.370Z",
  "updatedAt": "2026-01-08T16:46:48.370Z",
  "__v": 0
}
```

#### Type 2: Custom Request
**Request Body:**
```json
{
  "artisanId": "695fcb99848a412d741def70",
  "job_type": "Custom_Request",
  "title": "Fix my dining table",
  "description": "The leg is broken and needs glue/screws.\n\nAddress: 123 Main St, Nablus\nPreferred time: 2:00 PM",
  "deadline": "2025-12-01"
}
```

**Backend Response:**
```json
{
  "customer": "695e906f9353734b82864dbe",
  "artisan": "695fcb99848a412d741def70",
  "job_type": "Custom_Request",
  "title": "Fix my dining table",
  "description": "The leg is broken and needs glue/screws.\n\nAddress: 123 Main St, Nablus\nPreferred time: 2:00 PM",
  "status": "Pending",
  "agreed_price": 0,
  "deadline": "2025-12-01T00:00:00.000Z",
  "quantity": 1,
  "_id": "695fe1af8ccdcba8fef77db1",
  "createdAt": "2026-01-08T16:56:15.017Z",
  "updatedAt": "2026-01-08T16:56:15.017Z",
  "__v": 0
}
```

---

## User Experience

### For Customers:

#### Portfolio Orders:
1. Browse artisan profiles
2. View portfolio items with prices and descriptions
3. Click "🛒 Order This Item" on any portfolio item
4. Fill in quantity and order details
5. Submit order
6. Track in reservations page

#### Custom Requests:
1. Navigate to "Book Maintenance" page
2. Enter request title (e.g., "Fix my dining table")
3. Select profession type
4. Choose from available artisans
5. Describe the problem
6. Provide address and preferred date/time
7. Submit request
8. Track in reservations page

### For Artisans:
- View all orders and custom requests in their dashboard
- Both types show up as reservations with appropriate status
- Can accept/reject and negotiate prices

---

## Security & Validation

✅ **Authentication Required:** Both reservation types require user login
✅ **Role Checking:** Portfolio orders only available to customers
✅ **Input Validation:** All required fields validated before submission
✅ **Error Handling:** User-friendly error messages displayed
✅ **Token Management:** JWT tokens automatically included in API calls

---

## Testing Checklist

### Portfolio Orders:
- [ ] Login as customer
- [ ] Navigate to artisan profile (`/artisan/:id`)
- [ ] Click "Order This Item" on portfolio item
- [ ] Fill in quantity and description
- [ ] Submit order
- [ ] Verify redirect to /reservations
- [ ] Check reservation appears correctly

### Custom Requests:
- [ ] Login as customer
- [ ] Navigate to Book Maintenance page
- [ ] Enter request title
- [ ] Select profession
- [ ] Choose artisan
- [ ] Fill in all details
- [ ] Submit request
- [ ] Verify redirect to /reservations
- [ ] Check reservation appears correctly

### Edge Cases:
- [ ] Try ordering without login → Should redirect to login
- [ ] Try ordering as artisan → Should show error
- [ ] Try submitting with missing fields → Should show validation error
- [ ] Test with invalid artisan ID → Should show error

---

## Files Modified

1. ✅ `src/utils/api.js` - Added createReservation function
2. ✅ `src/controllers/ReservationController.js` - Added createPortfolioOrder and createCustomRequest
3. ✅ `src/views/ArtisanDetailsPage.jsx` - Added order buttons and modal
4. ✅ `src/views/BookMaintenance.jsx` - Updated to use custom requests
5. ✅ `src/services/craftsmanService.js` - Added getAllArtisans function

---

## Next Steps

1. **Test both reservation flows** with real backend
2. **Update Reservations page** to display both types correctly
3. **Add artisan dashboard** functionality to manage orders/requests
4. **Implement price negotiation** workflow
5. **Add notifications** for new orders/requests

---

## Notes

- Both reservation types use the same backend endpoint
- Customer ID is automatically extracted from JWT token
- Images in portfolio orders reference existing uploaded files
- Custom requests combine description with address and time info
- All dates are properly formatted for backend (ISO format)

---

**Status:** ✅ Complete and Ready for Testing
**Date:** January 8, 2026
