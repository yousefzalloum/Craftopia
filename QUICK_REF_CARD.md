# 🚀 Quick Reference Card - Profile Integration

## 📍 URLs

| Role | Login | Profile Page |
|------|-------|--------------|
| **Customer** | `/login` | `/profile` |
| **Artisan** | `/login` | `/artisan-profile` |

---

## 🔐 Test Credentials

### Customer
```
Email: h@test.com
Password: [your_password]
```

### Artisan
```
Email: emem@example.com
Password: [your_password]
```

---

## 🔧 API Endpoints

### Customer
```http
GET {{baseurl}}/customers/profile
Authorization: Bearer {token}
```

### Artisan
```http
GET {{baseurl}}/artisans/profile
Authorization: Bearer {token}
```

---

## 💾 Token Storage (Unified)

```javascript
// Stored after login
localStorage.getItem('token')    // JWT token
localStorage.getItem('role')     // 'customer' or 'artisan'
localStorage.getItem('userId')   // User ID
```

---

## 🧪 Quick Test

### 1. Start Servers
```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 2. Test Customer Profile
```
1. Go to http://localhost:3000/login
2. Login with customer credentials
3. Go to http://localhost:3000/profile
4. ✅ See profile data from API
```

### 3. Test Artisan Profile
```
1. Go to http://localhost:3000/login
2. Login with artisan credentials
3. Go to http://localhost:3000/artisan-profile
4. ✅ See profile data from API
```

---

## 🔍 Debug in Console

```javascript
// Check token
localStorage.getItem('token')

// Check role
localStorage.getItem('role')

// Manual API test (Customer)
fetch('http://localhost:5000/api/customers/profile', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json()).then(console.log)

// Manual API test (Artisan)
fetch('http://localhost:5000/api/artisans/profile', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json()).then(console.log)
```

---

## ✅ What to Look For

### Customer Profile Should Show:
- ✅ Name
- ✅ Email
- ✅ Phone number
- ✅ User ID
- ✅ Registration date
- ✅ Created/Updated dates

### Artisan Profile Should Show:
- ✅ Name
- ✅ Email
- ✅ Phone number
- ✅ Craft type
- ✅ Location
- ✅ Description
- ✅ Portfolio section
- ✅ Average rating
- ✅ All metadata

---

## 🐛 Common Issues

### "Please login" message
```javascript
// Re-login to get fresh token
```

### Profile not loading
```
1. Check backend is running ✓
2. Check Network tab for 200 OK ✓
3. Check console for errors ✓
```

### 401 Unauthorized
```javascript
// Clear and re-login
localStorage.clear();
// Then login again
```

---

## 📦 Files Changed

**Common:**
- `src/utils/api.js`
- `src/App.jsx`

**Customer:**
- `src/services/customerService.js`
- `src/views/Profile.jsx`

**Artisan:**
- `src/services/craftsmanService.js`
- `src/views/ArtisanProfilePage.jsx`
- `src/styles/CraftsmanProfile.css`

---

## 🎯 Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can login as customer
- [ ] Can view customer profile
- [ ] Customer data shows from API
- [ ] Can login as artisan
- [ ] Can view artisan profile
- [ ] Artisan data shows from API
- [ ] No console errors
- [ ] Token stored correctly

---

## 📞 Quick Help

### Check token exists:
```javascript
!!localStorage.getItem('token') // Should be true
```

### Check current role:
```javascript
localStorage.getItem('role') // 'customer' or 'artisan'
```

### Re-login:
```javascript
localStorage.clear();
// Navigate to /login and login again
```

---

## 🎉 Status

**Customer Profile**: ✅ Complete  
**Artisan Profile**: ✅ Complete  
**Token System**: ✅ Unified  
**Documentation**: ✅ Complete  

**Ready to use!** 🚀

---

**Last Updated**: December 29, 2025
