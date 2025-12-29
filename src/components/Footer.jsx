import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">
            <span className="logo-icon">🔨</span>
            Craftopia
          </h3>
          <p className="footer-description">
            Discover and reserve unique industrial crafts made by skilled artisans. 
            Quality craftsmanship meets modern design.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/crafts">Browse Crafts</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Information</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Categories</h4>
          <ul className="footer-links">
            <li><Link to="/crafts?category=Metalwork">Metalwork</Link></li>
            <li><Link to="/crafts?category=Woodwork">Woodwork</Link></li>
            <li><Link to="/crafts">All Crafts</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Connect With Us</h4>
          <div className="footer-social">
            <a href="#" className="social-link">Facebook</a>
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">Twitter</a>
            <a href="#" className="social-link">Pinterest</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Craftopia. All rights reserved. | University Project</p>
      </div>
    </footer>
  );
};

export default Footer;
