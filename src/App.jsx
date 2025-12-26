import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Signup from './views/Signup';
import BookMaintenance from './views/BookMaintenance';
import CraftsmanDashboard from './views/CraftsmanDashboard';
import CraftsmanProfile from './views/CraftsmanProfile';
import './styles/App.css';

function App() {
  return (
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
            <Route path="/signup" element={<Signup />} />
            <Route path="/book-maintenance" element={<BookMaintenance />} />
            <Route path="/craftsman-dashboard" element={<CraftsmanDashboard />} />
            <Route path="/craftsman/:id" element={<CraftsmanProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
