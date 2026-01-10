import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './views/Home';
import Crafts from './views/Crafts';
import CraftDetails from './views/CraftDetails';
import Reservations from './views/Reservations';
import Profile from './views/Profile';
import About from './views/About';
import Contact from './views/Contact';
import Login from './views/Login';
import RoleSelection from './views/RoleSelection';
import Signup from './views/Signup';
import CraftsmanDashboard from './views/CraftsmanDashboard';
import CraftsmanProfile from './views/CraftsmanProfile';
import ArtisanProfilePage from './views/ArtisanProfilePage';
import ArtisanDetailsPage from './views/ArtisanDetailsPage';
import JobsPage from './views/JobsPage';
import Notifications from './views/Notifications';
import AdminDashboard from './views/AdminDashboard';
import './styles/App.css';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin-dashboard';

  return (
    <div className="app">
      {!isAdminRoute && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crafts" element={<Crafts />} />
          <Route path="/crafts/:id" element={<CraftDetails />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/craftsman-dashboard" element={<CraftsmanDashboard />} />
          <Route path="/artisan-profile" element={<ArtisanProfilePage />} />
          <Route path="/artisans/:id" element={<ArtisanDetailsPage />} />
          <Route path="/craftsman/:id" element={<ArtisanDetailsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        {showSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        ) : (
          <AppContent />
        )}
      </Router>
    </AuthProvider>
  );
}

export default App;
