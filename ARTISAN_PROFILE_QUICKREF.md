# Quick Reference - Artisan Profile Integration

## 🚀 Quick Start

### Access Artisan Profile
```
URL: http://localhost:3000/artisan-profile
```

### Requirements
1. Backend server running
2. Logged in as artisan
3. Valid bearer token in localStorage

## 🔑 Token Management

### Check Token in Browser Console
```javascript
// Check if token exists
localStorage.getItem('token')

// Check role
localStorage.getItem('role')

// Check user ID
localStorage.getItem('userId')
```

### Manual Token Test
```javascript
// Set token manually for testing
localStorage.setItem('token', 'YOUR_JWT_TOKEN_HERE');
localStorage.setItem('role', 'artisan');
localStorage.setItem('userId', 'YOUR_USER_ID');

// Then navigate to /artisan-profile
```

## 📡 API Endpoint

```
GET {{baseurl}}/artisans/profile
Authorization: Bearer {token}
```

### Example Request (Fetch)
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/artisans/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

### Example Request (Using Service)
```javascript
import { getArtisanProfile } from './services/craftsmanService';

// Fetch profile
const profile = await getArtisanProfile();
console.log(profile);
```

## 🎯 Component Usage

### Navigate to Profile
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/artisan-profile');
```

### Add Link in Dashboard
```jsx
// In CraftsmanDashboard.jsx
<button onClick={() => navigate('/artisan-profile')}>
  View My Profile
</button>
```

## 🔍 Debugging

### Check API Call
Open browser console and look for:
```
📋 Fetching artisan profile...
✅ Artisan profile fetched successfully: {...}
```

### Common Issues

#### 1. "Please login as an artisan"
**Cause**: Not logged in or wrong role
**Fix**: 
```javascript
// Check localStorage
console.log('Token:', localStorage.getItem('token'));
console.log('Role:', localStorage.getItem('role'));

// Should see:
// Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// Role: artisan
```

#### 2. "Authentication failed"
**Cause**: Invalid or expired token
**Fix**: 
1. Logout and login again
2. Check token in localStorage
3. Verify backend is accepting the token

#### 3. "Failed to load profile"
**Cause**: Backend not running or network error
**Fix**:
1. Check backend is running on correct port
2. Verify API_BASE_URL in .env
3. Check CORS settings on backend

## 📊 Response Data Structure

```javascript
{
  _id: "6952a0ea6a8cba277ae21a83",
  name: "yoyo",
  email: "emem@example.com",
  phone_number: "0599123456",
  craftType: "Carpentry",
  location: "Hebron",
  description: "yoo.",
  portfolioImages: [],
  averageRating: 0,
  createdAt: "2025-12-29T15:40:26.309Z",
  updatedAt: "2025-12-29T15:40:26.309Z",
  __v: 0
}
```

## 🛠️ Testing Steps

1. **Login as Artisan**
   ```
   POST /api/artisans/login
   { email: "emem@example.com", password: "your_password" }
   ```

2. **Check Token Stored**
   ```javascript
   console.log(localStorage.getItem('token'));
   // Should see: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Navigate to Profile**
   ```
   http://localhost:3000/artisan-profile
   ```

4. **Verify Data Displays**
   - Name shows correctly
   - Email shows correctly
   - Phone number shows
   - Location shows
   - Craft type shows
   - Rating displays
   - Portfolio section visible

## 💡 Tips

### Add Profile Link to Navbar
```jsx
// In Navbar.jsx, add for artisan users:
{role === 'artisan' && (
  <Link to="/artisan-profile">My Profile</Link>
)}
```

### Add Profile Button to Dashboard
```jsx
// In CraftsmanDashboard.jsx
<div className="dashboard-actions">
  <button onClick={() => navigate('/artisan-profile')}>
    👤 View Profile
  </button>
</div>
```

### Refresh Profile Data
```jsx
const [refresh, setRefresh] = useState(0);

// Trigger refresh
const handleRefresh = () => {
  setRefresh(prev => prev + 1);
};

useEffect(() => {
  // Fetch profile
}, [refresh]);
```

## 🔒 Security Notes

1. **Token Expiration**: Backend should set reasonable token expiry
2. **Token Refresh**: Implement token refresh before expiry
3. **Secure Storage**: Consider more secure storage than localStorage for production
4. **HTTPS**: Always use HTTPS in production
5. **Token Validation**: Backend must validate token on every request

## 📱 Responsive Design

The profile page is fully responsive:
- Desktop: Multi-column grid layout
- Tablet: 2-column grid
- Mobile: Single column stacked layout

## 🎨 Customization

### Change Profile Avatar
```jsx
// In ArtisanProfilePage.jsx
<img 
  src={profileData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}`}
  alt={profileData.name}
/>
```

### Add Edit Profile Button
```jsx
<button onClick={() => navigate('/edit-profile')}>
  ✏️ Edit Profile
</button>
```

### Add More Profile Stats
```jsx
<div className="stat">
  <span className="stat-icon">📈</span>
  <div>
    <strong>{completedJobs}</strong>
    <small>Completed Jobs</small>
  </div>
</div>
```

## ✅ Checklist

Before deploying:
- [ ] Backend endpoint tested with Postman/curl
- [ ] Token stored correctly after login
- [ ] Profile page loads without errors
- [ ] All fields display correctly
- [ ] Error handling works (test without token)
- [ ] Loading state displays
- [ ] Responsive design tested
- [ ] Console logs removed or conditioned for production
- [ ] Security headers configured on backend

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab for API calls
3. Verify token in localStorage
4. Test endpoint directly with curl/Postman
5. Check backend logs

---

**Last Updated**: December 29, 2025
**Integration Status**: ✅ Complete
