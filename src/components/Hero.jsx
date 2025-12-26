import '../styles/Hero.css';

const Hero = ({ title, subtitle, backgroundImage, ctaText, ctaLink, onCtaClick }) => {
  return (
    <section 
      className="hero" 
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {ctaText && (
          <button 
            className="hero-cta"
            onClick={onCtaClick}
          >
            {ctaText}
          </button>
        )}
      </div>
    </section>
  );
};

export default Hero;
