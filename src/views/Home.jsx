import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../utils/api';
import Hero from '../components/Hero';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [galleryFeed, setGalleryFeed] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryFeed = async () => {
      try {
        setGalleryLoading(true);
        console.log('🎨 Fetching gallery feed...');
        const data = await get('/portfolio/feed');
        console.log('✅ Gallery feed fetched:', data);
        setGalleryFeed(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Failed to fetch gallery feed:', err);
        setGalleryFeed([]);
      } finally {
        setGalleryLoading(false);
      }
    };

    fetchGalleryFeed();
  }, []);

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
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔨</div>
              <h3>Industrial Design</h3>
              <p>Unique industrial-style crafts that blend functionality with aesthetic appeal</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Easy Reservation</h3>
              <p>Simple and secure reservation process for your favorite crafts</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Verified Artisans</h3>
              <p>All our artisans are verified professionals with years of experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Feed Section */}
      <section className="home-gallery">
        <div className="container">
          <div className="gallery-header">
            <h2>✨ Featured Artisan Work</h2>
            <p>Discover amazing craftsmanship from our talented artisans</p>
          </div>
          
          {galleryLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>Loading gallery...</p>
            </div>
          ) : galleryFeed.length > 0 ? (
            <div className="gallery-grid">
              {galleryFeed.map((item, index) => (
                <div 
                  key={index} 
                  className="gallery-card"
                  onClick={() => navigate(`/craftsman/${item.artisanId}`)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    background: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden' }}>
                    <img 
                      src={
                        item.imageUrl.startsWith('http') 
                          ? item.imageUrl 
                          : `http://localhost:5000${item.imageUrl}`
                      }
                      alt={`${item.artisanName}'s work`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0', 
                      fontSize: '1.1rem', 
                      color: '#2c3e50',
                      fontWeight: '600'
                    }}>
                      {item.artisanName}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      color: '#7f8c8d', 
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>🔨</span>
                      {item.craftType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>No portfolio items available yet.</p>
            </div>
          )}
        </div>
      </section>

      <section className="home-about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Why Choose Craftopia?</h2>
              <p>
                Craftopia connects you with talented artisans who create unique industrial crafts. 
                Each piece tells a story and brings character to your space. We carefully curate 
                our collection to ensure quality, authenticity, and exceptional craftsmanship.
              </p>
              <p>
                Whether you're looking for furniture, decor, or functional art, our platform makes 
                it easy to discover and reserve pieces that match your style and needs.
              </p>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/about')}
              >
                Learn More About Us
              </button>
            </div>
            <div className="about-image">
              <img 
                src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600" 
                alt="Artisan at work"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
