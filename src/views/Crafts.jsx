import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CraftCard from '../components/CraftCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import { getAllCraftsmen } from '../services/craftsmanService';
import Loading from '../components/Loading';
import '../styles/Crafts.css';

const Crafts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCraftType, setSelectedCraftType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available craft types and locations
  const craftTypes = ['Carpentry', 'Plumbing', 'Electrical', 'Painting', 'Welding', 'Masonry'];
  const locations = ['Hebron', 'Ramallah', 'Nablus', 'Bethlehem', 'Jerusalem', 'Jenin'];

  useEffect(() => {
    // Fetch artisans from API with filters
    const fetchArtisans = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Fetching artisans with filters:', { 
          craftType: selectedCraftType, 
          location: selectedLocation,
          rating: selectedRating
        });
        
        // Build filter object
        const filters = {};
        if (selectedCraftType) filters.craftType = selectedCraftType;
        if (selectedLocation) filters.location = selectedLocation;
        
        const data = await getAllCraftsmen(filters);
        console.log('✅ Artisans fetched:', data.length);
        
        // Filter by search query, rating, and availability locally
        let result = data;
        
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          result = result.filter(artisan => 
            artisan.name.toLowerCase().includes(query) ||
            artisan.description?.toLowerCase().includes(query) ||
            artisan.craftType.toLowerCase().includes(query) ||
            artisan.location.toLowerCase().includes(query)
          );
        }
        
        // Rating filter
        if (selectedRating) {
          const minRating = parseFloat(selectedRating);
          result = result.filter(artisan => artisan.averageRating >= minRating);
        }
        
        setArtisans(result);
      } catch (err) {
        console.error('❌ Failed to fetch artisans:', err);
        setError(err.message || 'Failed to load artisans');
      } finally {
        setLoading(false);
      }
    };

    fetchArtisans();
  }, [selectedCraftType, selectedLocation, searchQuery, selectedRating]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="crafts-page">
      <div className="crafts-header">
        <div className="container">
          <h1 className="page-title">Browse Artisans</h1>
          <p className="page-subtitle">
            Discover talented artisans for your home and industrial needs
          </p>
        </div>
      </div>

      <div className="container">
        <div className="crafts-controls">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, craft type, or location..."
          />
          
          <FilterBar
            craftTypes={craftTypes}
            locations={locations}
            selectedCraftType={selectedCraftType}
            selectedLocation={selectedLocation}
            selectedRating={selectedRating}
            onCraftTypeChange={setSelectedCraftType}
            onLocationChange={setSelectedLocation}
            onRatingChange={setSelectedRating}
          />
        </div>

        {error && (
          <div className="error-message" style={{ padding: '1rem', background: '#ffe5e5', color: '#e74c3c', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className="crafts-results">
          <p className="results-count">
            Showing {artisans.length} {artisans.length === 1 ? 'artisan' : 'artisans'}
          </p>

          {artisans.length > 0 ? (
            <div className="crafts-grid">
              {artisans.map((artisan) => (
                <div 
                  key={artisan._id} 
                  className="craft-card" 
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/craftsman/${artisan._id}`, { state: { artisan } })}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}>
                        {artisan.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>{artisan.name}</h3>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>{artisan.craftType}</p>
                      </div>
                    </div>
                    <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '1rem', minHeight: '40px' }}>
                      {artisan.description || 'Professional craftsman'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                      <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>📍 {artisan.location}</span>
                      <span style={{ color: '#f39c12', fontSize: '0.9rem' }}>⭐ {artisan.averageRating ? artisan.averageRating.toFixed(1) : '0.0'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No artisans found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Crafts;
