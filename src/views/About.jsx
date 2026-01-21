import '../styles/About.css';
import yousefImg from '../assets/images/team/yousef.png';
import omarImg from '../assets/images/team/omar (2).jpg';
import hamzaImg from '../assets/images/team/hamza.png';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1 className="page-title">About Craftopia</h1>
          <p className="page-subtitle">
            Connecting artisans with craft enthusiasts since 2024
          </p>
        </div>
      </div>

      <div className="container">
        <section className="about-section">
          <div className="about-content">
            <div className="about-text">
              <h2>Our Story</h2>
              <p>
                Craftopia was born from a passion for industrial crafts and a desire to support 
                talented artisans. We recognized that finding unique, handcrafted industrial 
                pieces was challenging, and artisans struggled to reach their ideal audience.
              </p>
              <p>
                Our platform bridges this gap, creating a space where craftsmanship meets 
                convenience. Every piece on Craftopia represents hours of skilled work, creative 
                vision, and dedication to quality.
              </p>
            </div>
            <div className="about-image">
              <img 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop&q=80" 
                alt="Industrial workshop"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop';
                }}
              />
            </div>
          </div>
        </section>

        <section className="mission-section">
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">🎯</div>
              <h3>Quality First</h3>
              <p>We curate only the finest industrial crafts, ensuring every piece meets our high standards for quality and craftsmanship.</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">🤝</div>
              <h3>Support Artisans</h3>
              <p>We empower skilled artisans by providing a platform to showcase their work and reach customers who appreciate quality craftsmanship.</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">💡</div>
              <h3>Innovation</h3>
              <p>We celebrate the fusion of traditional crafting techniques with modern industrial design aesthetics.</p>
            </div>
          </div>
        </section>

        <section className="values-section">
          <h2 className="section-title">Our Values</h2>
          <div className="values-list">
            <div className="value-item">
              <h3>✓ Authenticity</h3>
              <p>Every craft is genuinely handmade by verified artisans</p>
            </div>
            <div className="value-item">
              <h3>✓ Transparency</h3>
              <p>Clear information about materials, processes, and pricing</p>
            </div>
            <div className="value-item">
              <h3>✓ Community</h3>
              <p>Building connections between artisans and craft enthusiasts</p>
            </div>
            <div className="value-item">
              <h3>✓ Excellence</h3>
              <p>Commitment to quality in every aspect of our service</p>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2 className="section-title">Website Creators</h2>
          <div className="artisans-grid">
            <div className="artisan-card">
              <img src={omarImg} alt="Omar Hamouri" />
              <h3>Omar Hamouri</h3>
              <p className="artisan-specialty">💻 Co-Developer</p>
              <p>Full-stack developer passionate about creating seamless user experiences</p>
            </div>
            <div className="artisan-card">
              <img src={yousefImg} alt="Yousef Zalloum" />
              <h3>Yousef Zalloum</h3>
              <p className="artisan-specialty">🚀 Lead Developer</p>
              <p>Project lead and full-stack developer bringing Craftopia to life</p>
            </div>
            <div className="artisan-card">
              <img src={hamzaImg} alt="Hamza Al Jabari" />
              <h3>Hamza Al Jabari</h3>
              <p className="artisan-specialty">⚡ Co-Developer</p>
              <p>Full-stack developer focused on building robust and scalable solutions</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
