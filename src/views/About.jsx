import '../styles/About.css';

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
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600" 
                alt="Industrial workshop"
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
              <div className="mission-icon">🌍</div>
              <h3>Sustainability</h3>
              <p>Many of our crafts use reclaimed or recycled materials, promoting sustainable practices in industrial design.</p>
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
          <h2 className="section-title">Featured Artisans</h2>
          <div className="artisans-grid">
            <div className="artisan-card">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" alt="Ahmad Hassan" />
              <h3>Ahmad Hassan</h3>
              <p className="artisan-specialty">Metalwork Specialist</p>
              <p>15+ years of experience in industrial metalwork and design</p>
            </div>
            <div className="artisan-card">
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200" alt="Sarah Mitchell" />
              <h3>Sarah Mitchell</h3>
              <p className="artisan-specialty">Woodwork Master</p>
              <p>Specializes in reclaimed wood furniture and industrial design</p>
            </div>
            <div className="artisan-card">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" alt="Michael Chen" />
              <h3>Michael Chen</h3>
              <p className="artisan-specialty">Mixed Media Artist</p>
              <p>Creates unique pieces combining metal, wood, and found objects</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
