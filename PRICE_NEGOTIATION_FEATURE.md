# Price Negotiation Feature - Complete Implementation

## 🎯 Overview
This feature allows artisans to respond to customer price negotiation requests by either **updating the price** or **rejecting** the negotiation directly from their notifications.

## 📋 Feature Flow

### Customer Side (Already Implemented)
1. Customer makes a custom reservation/order
2. Artisan proposes a price
3. Customer receives notification with proposed price
4. Customer can:
   - ✅ Accept the price
   - 💬 Negotiate (send message saying price is too high)
   - ❌ Reject

### Artisan Side (New Implementation)
1. Artisan receives notification when customer negotiates
2. Artisan can see negotiation message in notifications
3. Artisan can:
   - 💰 **Update Price** - Enter a new price and submit
   - ❌ **Reject** - Decline the negotiation
4. Customer receives notification of artisan's response

## 🔧 Files Modified

### 1. NotificationCard.jsx (`src/components/NotificationCard.jsx`)
**Changes:**
- Added state management for price update form
- Added handlers for price update and rejection
- Added UI for negotiation actions (Update Price & Reject buttons)
- Added inline price input form
- Added loading states during API calls

**Key Features:**
- Detects negotiation notifications automatically
- Shows "Update Price" and "Reject" buttons for negotiation notifications
- Expandable price input form
- Real-time validation
- Disabled states during processing

### 2. Notifications.jsx (`src/views/Notifications.jsx`)
**Changes:**
- Added `handlePriceUpdate()` function
- Added `handleRejectNegotiation()` function
- Passed handlers to all NotificationCard components
- Added success alerts and auto-refresh

**Key Features:**
- Handles price update API calls
- Handles rejection API calls
- Shows user-friendly messages
- Auto-refreshes notifications after actions

### 3. notificationService.js (`src/services/notificationService.js`)
**Changes:**
- Added `updateNegotiationPrice()` - PUT request to `/reservations/:id/update-price`
- Added `rejectNegotiation()` - PUT request to `/reservations/:id/reject-negotiation`

**API Endpoints Used:**
```javascript
PUT /api/reservations/:reservationId/update-price
Body: { agreed_price: number }

PUT /api/reservations/:reservationId/reject-negotiation
Body: {}
```

### 4. NotificationController.js (`src/controllers/NotificationController.js`)
**Changes:**
- Added `updateNegotiationPrice()` method
- Added `rejectNegotiation()` method
- Added 'negotiation' icon type

**Controller Methods:**
```javascript
updateNegotiationPrice(reservationId, newPrice)
rejectNegotiation(reservationId)
```

### 5. NotificationCard.css (`src/styles/NotificationCard.css`)
**Changes:**
- Added styles for `.negotiation-quick-actions`
- Added styles for `.btn-update-price` and `.btn-reject-nego`
- Added styles for `.price-update-form`
- Added styles for price input group
- Added hover effects and transitions
- Added responsive design

**Key Styles:**
- Modern gradient button for "Update Price"
- Red button for "Reject"
- Styled input form with focus states
- Submit and Cancel buttons
- Disabled states

## 🎨 UI/UX Features

### Notification Card for Negotiation
```
┌─────────────────────────────────────────────┐
│ 💰 Negotiation        2h ago                │
│                                              │
│ Customer: "The price is too high, can you   │
│ reduce it please?"                           │
│                                              │
│ ┌─────────────┐ ┌──────────┐               │
│ │💰 Update Price│ │❌ Reject │               │
│ └─────────────┘ └──────────┘               │
└─────────────────────────────────────────────┘
```

### When "Update Price" is clicked:
```
┌─────────────────────────────────────────────┐
│ 💰 Negotiation        2h ago                │
│                                              │
│ Customer: "The price is too high..."        │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ New Price ($):                          │ │
│ │ ┌─────────┐ ┌────────┐ ┌────────┐     │ │
│ │ │  150.00 │ │✓ Submit│ │ Cancel │     │ │
│ │ └─────────┘ └────────┘ └────────┘     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 🚀 How to Use

### For Artisans:

1. **View Negotiation Notification:**
   - Go to Notifications page
   - Look for notifications with 💰 icon or "negotiation" type
   - Read customer's message about price

2. **Update Price:**
   - Click "💰 Update Price" button
   - Enter new price in the input field
   - Click "✓ Submit"
   - Wait for confirmation
   - Customer will receive notification of new price

3. **Reject Negotiation:**
   - Click "❌ Reject" button
   - Confirm rejection in popup
   - Customer will receive rejection notification

## 🔄 Backend Requirements

Your backend needs to implement these endpoints:

### 1. Update Price Endpoint
```javascript
PUT /api/reservations/:reservationId/update-price
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "agreed_price": 150.00
}

Response:
{
  "success": true,
  "message": "Price updated successfully",
  "reservation": { ... }
}
```

**What it should do:**
- Update the `agreed_price` field in reservation
- Change status to "Price_Proposed" or "Negotiating"
- Create notification for customer: "Artisan updated the price to $X"
- Send notification to customer

### 2. Reject Negotiation Endpoint
```javascript
PUT /api/reservations/:reservationId/reject-negotiation
Authorization: Bearer {token}
Content-Type: application/json

Body: {}

Response:
{
  "success": true,
  "message": "Negotiation rejected",
  "reservation": { ... }
}
```

**What it should do:**
- Change reservation status to "Rejected"
- Create notification for customer: "Artisan declined your negotiation"
- Send notification to customer

## 📊 Notification Structure

The notification object should include:
```javascript
{
  "_id": "notification_id",
  "type": "negotiation",
  "message": "Customer wants to negotiate the price...",
  "reservationId": "reservation_id", // IMPORTANT!
  "isRead": false,
  "createdAt": "2026-01-09T10:30:00Z"
}
```

**Key field:** `reservationId` - This is required for the update/reject actions to work.

## ✅ Testing Checklist

### Basic Functionality:
- [ ] Negotiation notifications appear correctly
- [ ] "Update Price" button shows price form
- [ ] Price input accepts valid numbers
- [ ] "Submit" button sends request
- [ ] "Cancel" button closes form
- [ ] "Reject" button shows confirmation
- [ ] Success messages appear after actions
- [ ] Notifications refresh after actions

### Error Handling:
- [ ] Empty price shows validation error
- [ ] Negative price shows validation error
- [ ] Failed API calls show error message
- [ ] Buttons disable during processing
- [ ] Network errors handled gracefully

### UI/UX:
- [ ] Buttons have hover effects
- [ ] Loading states show correctly
- [ ] Form is user-friendly
- [ ] Mobile responsive
- [ ] Proper spacing and alignment

## 🎯 Benefits

1. **For Artisans:**
   - Quick response to negotiations
   - No need to leave notifications page
   - Clear action buttons
   - Inline price editing

2. **For Customers:**
   - Get real-time responses
   - Clear communication
   - Transparent negotiation process

3. **For Business:**
   - Faster negotiation cycles
   - Better customer satisfaction
   - Increased conversion rates
   - Streamlined workflow

## 🔮 Future Enhancements

1. **Negotiation History:**
   - Show previous price offers
   - Track negotiation rounds

2. **Auto-suggest Prices:**
   - Suggest discounted prices
   - Show competitor prices

3. **Quick Responses:**
   - Template messages
   - Preset discount percentages

4. **Chat Integration:**
   - Real-time messaging
   - Voice/video calls

## 📝 Notes

- All changes are backward compatible
- No breaking changes to existing code
- Works with existing notification system
- Follows project's MVC architecture
- Uses existing API utility functions
- Responsive design included
- Error handling implemented

## 🐛 Troubleshooting

### Issue: "Update Price" button doesn't appear
**Solution:** Check if notification has `reservationId` field

### Issue: API calls fail
**Solution:** 
1. Check backend endpoints are implemented
2. Verify authentication token is valid
3. Check CORS settings

### Issue: Notifications don't refresh
**Solution:** Check if `onRefresh` prop is passed to NotificationCard

### Issue: Price form doesn't submit
**Solution:** Verify price is a valid positive number

## 🎉 Complete!

The price negotiation feature is now fully implemented and ready to use! Artisans can respond to customer negotiations directly from their notifications page.
