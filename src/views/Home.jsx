import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <Hero
        title="Welcome to Craftopia"
        subtitle="Discover Unique Industrial Crafts Made by Skilled Artisans"
        ctaText="Browse Crafts"
        onCtaClick={() => navigate('/crafts')}
      />

      <section className="home-features">
        <div className="container">
          <div className="section-header">
            <h2>Why Craftopia?</h2>
            <div className="header-divider"></div>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Artisan Craftsmanship</h3>
              <p>Each piece is meticulously handcrafted by skilled artisans with years of experience</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Easy Booking</h3>
              <p>Quick and seamless reservation system to secure your favorite crafts instantly</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Quality Assured</h3>
              <p>Every artisan is verified and every piece is inspected for superior quality</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Connecting Artisans with Collectors</h2>
              <div className="header-divider" style={{ background: 'linear-gradient(90deg, #e67e22, #d35400)', marginBottom: '2rem', marginLeft: 0 }}></div>
              <p>
                Craftopia bridges the gap between skilled artisans and design enthusiasts. 
                Every piece on our platform represents hours of dedication, traditional techniques, 
                and modern innovation combined to create truly unique industrial crafts.
              </p>
              <p>
                From custom furniture to decorative metalwork, our verified artisans bring your 
                vision to life with exceptional attention to detail and uncompromising quality standards.
              </p>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/about')}
                style={{
                  background: '#ffffff',
                  color: '#1e3a5f',
                  border: '2px solid #ffffff',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e67e22';
                  e.target.style.color = '#ffffff';
                  e.target.style.borderColor = '#e67e22';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(230, 126, 34, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.color = '#1e3a5f';
                  e.target.style.borderColor = '#ffffff';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Learn More About Us →
              </button>
            </div>
            <div className="about-image">
              <img 
                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop&q=80" 
                alt="Professional artisan crafting"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=600&fit=crop';
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
