# 🔄 Artisan Profile Authentication Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ARTISAN PROFILE FLOW                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Browser    │
│  localhost:  │
│    3000      │
└──────┬───────┘
       │
       │ 1. User navigates to /login
       ↓
┌──────────────┐
│  Login Page  │
│   (Login.jsx)│
└──────┬───────┘
       │
       │ 2. User enters credentials
       │    email: emem@example.com
       │    password: ******
       ↓
┌──────────────────────────────────────────────────────────┐
│  craftsmanService.loginCraftsman()                       │
│  POST /artisans/login                                    │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 3. Request sent to backend
       ↓
┌──────────────────────────────────────────────────────────┐
│  Backend Server (localhost:5000)                         │
│  POST /api/artisans/login                                │
│  - Validates credentials                                 │
│  - Generates JWT token                                   │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 4. Response with token
       │    {
       │      _id: "6952a0ea...",
       │      name: "yoyo",
       │      email: "emem@example.com",
       │      role: "artisan",
       │      token: "eyJhbGciOiJIUzI1NiIsInR5c..."
       │    }
       ↓
┌──────────────────────────────────────────────────────────┐
│  Store in localStorage                                   │
│  localStorage.setItem('token', token)                    │
│  localStorage.setItem('role', 'artisan')                 │
│  localStorage.setItem('userId', _id)                     │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 5. Navigate to /artisan-profile
       ↓
┌──────────────────────────────────────────────────────────┐
│  ArtisanProfilePage.jsx                                  │
│  useEffect() runs on mount                               │
│  - Checks if logged in                                   │
│  - Checks if role === 'artisan'                          │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 6. Call getArtisanProfile()
       ↓
┌──────────────────────────────────────────────────────────┐
│  craftsmanService.getArtisanProfile()                    │
│  GET /artisans/profile                                   │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 7. api.js automatically adds token
       │    const token = localStorage.getItem('token')
       │    headers['Authorization'] = `Bearer ${token}`
       ↓
┌──────────────────────────────────────────────────────────┐
│  Backend Server (localhost:5000)                         │
│  GET /api/artisans/profile                               │
│  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5c...      │
│  - Validates JWT token                                   │
│  - Extracts artisan ID from token                        │
│  - Fetches profile from database                         │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 8. Response with profile data
       │    {
       │      _id: "6952a0ea...",
       │      name: "yoyo",
       │      email: "emem@example.com",
       │      phone_number: "0599123456",
       │      craftType: "Carpentry",
       │      location: "Hebron",
       │      description: "yoo.",
       │      portfolioImages: [],
       │      averageRating: 0,
       │      createdAt: "2025-12-29T15:40:26.309Z",
       │      updatedAt: "2025-12-29T15:40:26.309Z"
       │    }
       ↓
┌──────────────────────────────────────────────────────────┐
│  ArtisanProfilePage.jsx                                  │
│  - Stores data in state: setProfileData(data)            │
│  - Renders profile UI                                    │
│  - Displays all fields                                   │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 9. User sees their profile!
       ↓
┌──────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────┐ │
│  │           ARTISAN PROFILE                          │ │
│  ├────────────────────────────────────────────────────┤ │
│  │  [Avatar]      yoyo                                │ │
│  │                Carpentry                           │ │
│  │                📍 Hebron                           │ │
│  │                                                    │ │
│  │  ⭐ 0.0  📷 0  📅 Dec 29, 2025                     │ │
│  ├────────────────────────────────────────────────────┤ │
│  │  📖 About Me                                       │ │
│  │  yoo.                                              │ │
│  ├────────────────────────────────────────────────────┤ │
│  │  📞 Contact Information                            │ │
│  │  📧 Email: emem@example.com                        │ │
│  │  📱 Phone: 0599123456                              │ │
│  │  📍 Location: Hebron                               │ │
│  │  🔨 Craft Type: Carpentry                          │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 Token Flow Detail

```
┌─────────────────────────────────────────────────────────────────┐
│                     TOKEN LIFECYCLE                             │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN
   ↓
   Backend generates JWT token
   ↓
   Token contains: { userId: "...", role: "artisan", exp: ... }
   ↓
   Frontend receives token

2. STORAGE
   ↓
   localStorage.setItem('token', token)
   ↓
   Persists across page refreshes
   ↓
   Available to all components

3. API REQUESTS
   ↓
   api.js automatically reads token
   ↓
   Adds to Authorization header
   ↓
   "Authorization: Bearer {token}"

4. BACKEND VALIDATION
   ↓
   Receives request with token
   ↓
   Validates JWT signature
   ↓
   Extracts user data from token
   ↓
   Authorizes request

5. LOGOUT
   ↓
   localStorage.removeItem('token')
   ↓
   Token no longer available
   ↓
   Subsequent requests fail authentication
```

---

## 📂 Code Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   FILE STRUCTURE                                │
└─────────────────────────────────────────────────────────────────┘

src/
│
├── utils/
│   └── api.js ........................... ⚙️ API Configuration
│       ├── apiRequest() ................. Makes HTTP requests
│       ├── get() ....................... GET helper
│       ├── post() ...................... POST helper
│       └── [Auto-adds Bearer token] .... 🔑 Token injection
│
├── services/
│   └── craftsmanService.js ............. 🔧 Artisan API Calls
│       ├── loginCraftsman() ............ Login endpoint
│       ├── registerCraftsman() ......... Signup endpoint
│       └── getArtisanProfile() ......... 📋 Profile endpoint
│
├── views/
│   ├── Login.jsx ....................... Login page
│   ├── CraftsmanDashboard.jsx .......... Dashboard
│   └── ArtisanProfilePage.jsx .......... 👤 Profile view
│       ├── Authentication check
│       ├── Fetch profile data
│       ├── Loading state
│       ├── Error handling
│       └── Render profile UI
│
├── styles/
│   └── CraftsmanProfile.css ............ 🎨 Profile styles
│
└── App.jsx ............................. 🛣️ Routes
    └── /artisan-profile ................ Route to profile
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

User Action ──→ Component ──→ Service ──→ API Utils ──→ Backend
    ↑                                                        │
    └────────────────── Response ←──────────────────────────┘

DETAILED:

1. User clicks "View Profile"
   └→ navigate('/artisan-profile')

2. ArtisanProfilePage mounts
   └→ useEffect() runs
      └→ Checks authentication
         └→ Calls getArtisanProfile()

3. getArtisanProfile() in craftsmanService.js
   └→ return get('/artisans/profile')

4. get() in api.js
   └→ apiRequest('/artisans/profile', { method: 'GET' })
      └→ Reads token from localStorage
         └→ Adds Authorization header
            └→ Makes fetch() request

5. Backend receives request
   └→ Validates token
      └→ Fetches profile from database
         └→ Returns JSON response

6. Response flows back
   └→ api.js parses JSON
      └→ craftsmanService returns data
         └→ Component receives data
            └→ setState() triggers re-render
               └→ UI updates with profile data
```

---

## 🎯 Key Components

### 1. Token Injection (api.js)
```javascript
const token = localStorage.getItem('token');
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### 2. Profile Fetching (craftsmanService.js)
```javascript
export const getArtisanProfile = async () => {
  const response = await get('/artisans/profile');
  return response;
};
```

### 3. Profile Display (ArtisanProfilePage.jsx)
```javascript
useEffect(() => {
  const fetchProfile = async () => {
    const data = await getArtisanProfile();
    setProfileData(data);
  };
  fetchProfile();
}, []);
```

---

## ✅ Success Checkpoints

```
┌─────────────────────────────────────────────────────────────────┐
│                   VERIFICATION STEPS                            │
└─────────────────────────────────────────────────────────────────┘

□ Backend server running on port 5000
   └→ Check: curl http://localhost:5000

□ Frontend running on port 3000
   └→ Check: Open http://localhost:3000

□ Can login as artisan
   └→ Check: POST /api/artisans/login works

□ Token stored after login
   └→ Check: localStorage.getItem('token')

□ Can access profile page
   └→ Check: Navigate to /artisan-profile

□ Profile data loads
   └→ Check: Network tab shows 200 OK

□ All fields display correctly
   └→ Check: Name, email, location visible

□ Authentication required
   └→ Check: Logout and try accessing profile
```

---

**Status**: ✅ COMPLETE AND TESTED
**Date**: December 29, 2025
**Version**: 1.0.0
