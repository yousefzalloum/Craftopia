# 📝 How to Edit Price in Jobs Page - Quick Guide

## 🎯 What's New

You can now **edit prices directly from the Jobs page** for reservations that are in **"Negotiating"** or **"Price Proposed"** status!

## 📋 Step-by-Step Instructions

### For Jobs with "Negotiating" Status:

1. **Go to Jobs Page (Dashboard)**
   - Click on "📊 Dashboard" in navigation
   - You'll see your "Incoming Jobs" table

2. **Find the Job**
   - Look for jobs with status badge: **"Negotiating"** (orange badge)
   - These are jobs where customer asked for price adjustment

3. **Click "Edit Price" Button**
   - In the ACTIONS column, click the purple **"✏️ Edit Price"** button
   - A modal popup will appear

4. **Update the Price**
   - You'll see the current price displayed
   - Enter your new price in the input field
   - Click **"✓ Submit Price"**

5. **Done!**
   - Customer receives automatic notification
   - Price updates in the table
   - Status may change based on workflow

## 🎨 Visual Guide

```
┌─────────────────────────────────────────────────┐
│  ACTIONS Column for "Negotiating" Jobs:        │
│                                                  │
│  ┌────────────────────────────┐                │
│  │ ✏️ Edit Price              │ ← Click this!  │
│  └────────────────────────────┘                │
│  ┌────────────────────────────┐                │
│  │ ✗ Reject                   │                │
│  └────────────────────────────┘                │
└─────────────────────────────────────────────────┘
```

### When You Click "Edit Price":

```
┌───────────────────────────────────────┐
│  💰 Update Price                      │
│                                        │
│  Current price: $77.00                │
│  Enter new price for: مباس الخ الصنایع│
│                                        │
│  Price ($) *                          │
│  ┌─────────────────────────────────┐ │
│  │         65.00                   │ │
│  └─────────────────────────────────┘ │
│                                        │
│  ┌─────────┐  ┌──────────────────┐  │
│  │ Cancel  │  │ ✓ Submit Price   │  │
│  └─────────┘  └──────────────────┘  │
└───────────────────────────────────────┘
```

## ✅ Works For These Statuses:

| Status | Action Available |
|--------|------------------|
| **Negotiating** | ✏️ Edit Price + ✗ Reject |
| **Price_Proposed** | ✏️ Edit Price + ✗ Reject |
| **Pending** | 💰 Set Price (if no price) + ✓ Accept + ✗ Reject |
| Other statuses | — (no actions) |

## 🔄 What Happens After Update:

1. **Backend receives update request:**
   ```
   PUT /api/reservations/:id/update-price
   Body: { agreed_price: 65.00 }
   ```

2. **Customer gets notification:**
   - "Artisan updated the price to $65.00"
   - They can accept or negotiate again

3. **Job updates:**
   - Price column shows new amount
   - Customer can respond from their Reservations page

## 💡 Tips

- ✨ The button has a nice purple gradient
- 💵 Current price is always shown when editing
- 🔄 Page auto-refreshes after price update
- ✅ Success message confirms update
- ❌ Can reject negotiation anytime with "Reject" button

## 🎯 Example Scenario

**Situation:** Customer says "$77 is too high, can you make it $65?"

**Your Action:**
1. See "Negotiating" status in Jobs table
2. Click "✏️ Edit Price" button
3. Change from $77.00 to $65.00
4. Click "✓ Submit Price"
5. Customer gets notification and can accept!

## 🚨 Important Notes

- ⚠️ Only works for jobs with existing prices
- ⚠️ Customer must respond to complete booking
- ⚠️ Backend must support `/update-price` endpoint
- ⚠️ Price must be greater than 0

## 🎉 Benefits

- ⚡ Quick price adjustments
- 💬 Direct negotiation from dashboard
- 📱 No need to go to notifications
- 🔄 Real-time updates
- 👥 Better customer communication

---

**Need more help?** Check the full documentation in `PRICE_NEGOTIATION_FEATURE.md`
