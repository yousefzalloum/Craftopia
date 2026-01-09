import { useEffect, useState } from 'react';
import '../styles/SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 600);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-bg">
        <div className="splash-circle splash-circle-1"></div>
        <div className="splash-circle splash-circle-2"></div>
        <div className="splash-circle splash-circle-3"></div>
      </div>
      
      <div className="splash-content">
        <div className="splash-logo">
          <div className="logo-icon">🔨</div>
          <h1 className="splash-title">
            <span className="title-part">Craft</span>
            <span className="title-part title-accent">opia</span>
          </h1>
          <p className="splash-tagline">Where Artistry Meets Craftsmanship</p>
        </div>
        
        <div className="splash-loader">
          <div className="loader-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
