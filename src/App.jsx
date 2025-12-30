import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
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
              <Route path="/craftsman/:id" element={<CraftsmanProfile />} />
              <Route path="/jobs" element={<JobsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
