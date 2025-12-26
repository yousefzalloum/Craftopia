# Craftopia - Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## 📂 File Organization

### Adding a New Craft
**File**: `src/models/Craft.js`
```javascript
new Craft(
  id,              // Unique number
  name,            // Craft name
  category,        // 'Metalwork' or 'Woodwork'
  description,     // Description text
  artisan,         // Artisan name
  price,           // Price in dollars
  imageUrl,        // Image URL
  availability,    // true/false
  rating,          // 0-5
  reviews          // Number of reviews
)
```

### Adding a New Page

1. **Create View Component**: `src/views/NewPage.jsx`
2. **Create CSS File**: `src/styles/NewPage.css`
3. **Add Route**: In `src/App.jsx`
4. **Add Nav Link**: In `src/components/Navbar.jsx`

### Controller Functions

**CraftController**:
- `getCrafts()` - Get all crafts
- `getCraft(id)` - Get single craft
- `filterByCategory(category)` - Filter by category
- `search(query)` - Search crafts
- `sortCrafts(crafts, sortBy)` - Sort crafts

**ReservationController**:
- `createReservation(...)` - Create new reservation
- `getUserReservations(userId)` - Get user's reservations
- `validateDates(start, end)` - Validate reservation dates

**UserController**:
- `getCurrentUser()` - Get current user
- `getUser(id)` - Get user by ID

## 🎨 CSS Variables

```css
--primary-color: #2c3e50;      /* Dark blue */
--secondary-color: #e67e22;     /* Orange */
--accent-color: #3498db;        /* Light blue */
--success-color: #27ae60;       /* Green */
--warning-color: #f39c12;       /* Yellow */
--danger-color: #e74c3c;        /* Red */
```

## 📱 Responsive Breakpoints

- Mobile: `max-width: 576px`
- Tablet: `max-width: 992px`
- Desktop: `1200px+`

## 🔧 Common Tasks

### Add New Category
1. Add category to craft data in `src/models/Craft.js`
2. Categories auto-populate in filters

### Modify Colors
1. Edit CSS variables in `src/styles/index.css`
2. Changes apply globally

### Add New Craft Card Style
1. Edit `src/styles/CraftCard.css`
2. Modify `.craft-card` class

### Change Navigation
1. Edit `src/components/Navbar.jsx`
2. Add new `<Link>` elements
3. Update styles in `src/styles/Navbar.css`

## 🐛 Common Issues

**Images not loading**:
- Check image URLs in `src/models/Craft.js`
- Ensure URLs are accessible

**Page not found**:
- Check route in `src/App.jsx`
- Verify component import path

**Styles not applying**:
- Ensure CSS file is imported in component
- Check class names match CSS file

**Data not showing**:
- Verify controller is imported
- Check console for errors (F12)

## 📊 Data Structure

### Craft Object
```javascript
{
  id: 1,
  name: "Craft Name",
  category: "Metalwork",
  description: "Description...",
  artisan: "Artisan Name",
  price: 250,
  imageUrl: "https://...",
  availability: true,
  rating: 4.8,
  reviews: 24
}
```

### Reservation Object
```javascript
{
  id: 1,
  craftId: 1,
  userId: 1,
  userName: "User Name",
  userEmail: "email@example.com",
  startDate: "2025-11-01",
  endDate: "2025-11-15",
  totalPrice: 250,
  status: "confirmed", // pending, confirmed, completed, cancelled
  createdAt: "2025-10-20"
}
```

## 🎯 Key Features

- ✅ Home page with hero and featured crafts
- ✅ Crafts catalog with search and filters
- ✅ Craft detail pages with reservation form
- ✅ Reservation management
- ✅ User profile with statistics
- ✅ About and Contact pages
- ✅ Fully responsive design
- ✅ Clean MVC architecture

## 📞 Getting Help

1. Check browser console (F12)
2. Read error messages carefully
3. Verify all imports are correct
4. Check README.md and SETUP.md
5. Review component props and data flow

---

**Need to integrate with backend?**
- Replace dummy data imports with API calls
- Update controllers to use fetch/axios
- Add loading states and error handling
