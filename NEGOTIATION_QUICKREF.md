# 🚀 Price Negotiation - Quick Start Guide

## For Artisans

### 1️⃣ View Negotiation
- Go to **Notifications** page
- Look for 💰 icon notifications
- These are customer price negotiation requests

### 2️⃣ Update Price
```
Click "💰 Update Price" → Enter new price → Click "✓ Submit"
```
- Customer gets notified immediately
- They can accept or negotiate again

### 3️⃣ Reject Negotiation
```
Click "❌ Reject" → Confirm → Done
```
- Customer gets rejection notification
- Reservation status changes to "Rejected"

---

## Backend Developer - Required Endpoints

### 📤 Update Price
```http
PUT /api/reservations/:reservationId/update-price
Authorization: Bearer {token}
Content-Type: application/json

{
  "agreed_price": 150.00
}
```

**Actions:**
1. Update `agreed_price` in reservation
2. Set status to "Price_Proposed" or "Negotiating"
3. Create notification for customer
4. Return updated reservation

### ❌ Reject Negotiation
```http
PUT /api/reservations/:reservationId/reject-negotiation
Authorization: Bearer {token}
Content-Type: application/json

{}
```

**Actions:**
1. Set reservation status to "Rejected"
2. Create notification for customer
3. Return updated reservation

---

## Files Changed

| File | Changes |
|------|---------|
| `NotificationCard.jsx` | Added price update form & handlers |
| `Notifications.jsx` | Added update/reject handlers |
| `notificationService.js` | Added API call functions |
| `NotificationController.js` | Added controller methods |
| `NotificationCard.css` | Added negotiation styles |

---

## Important Notes

⚠️ **Notification must include:**
```javascript
{
  "reservationId": "required_for_actions",
  "type": "negotiation",
  "message": "Customer message..."
}
```

✅ **Works with:**
- Custom requests
- Portfolio orders
- Maintenance bookings

🎨 **Features:**
- Inline price editing
- Confirmation dialogs
- Auto-refresh
- Loading states
- Mobile responsive

---

## Test It!

1. Customer sends negotiation
2. Artisan sees notification
3. Artisan clicks "Update Price"
4. Enters new price
5. Customer receives notification
6. ✅ Done!

---

**Need help?** Check `PRICE_NEGOTIATION_FEATURE.md` for full documentation.
