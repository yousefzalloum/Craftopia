import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import CraftCard from '../components/CraftCard';
import { CraftController } from '../controllers/CraftController';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const featuredCrafts = CraftController.getCrafts().slice(0, 6);

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
              <div className="feature-icon">🎨</div>
              <h3>Handcrafted Quality</h3>
              <p>Every piece is carefully crafted by skilled artisans with attention to detail</p>
            </div>
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

      <section className="home-featured">
        <div className="container">
          <h2 className="section-title">Featured Crafts</h2>
          <p className="section-subtitle">
            Explore our handpicked selection of exceptional industrial crafts
          </p>
          
          <div className="crafts-grid">
            {featuredCrafts.map((craft) => (
              <CraftCard key={craft.id} craft={craft} />
            ))}
          </div>

          <div className="home-cta">
            <button 
              className="btn-primary"
              onClick={() => navigate('/crafts')}
            >
              View All Crafts
            </button>
          </div>
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
