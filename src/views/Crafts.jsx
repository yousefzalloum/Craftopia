import { useState, useEffect, useRef, useMemo } from 'react';
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
  const [artisansRaw, setArtisansRaw] = useState([]); // store all fetched artisans
  const [selectedCraftType, setSelectedCraftType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  // const [artisans, setArtisans] = useState([]); // REMOVE this line, replaced by artisansRaw and useMemo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available craft types and locations
  const craftTypes = [
    'Carpentry', 
    'Plumbing', 
    'Electrical', 
    'Painting', 
    'Welding', 
    'Masonry',
    'Blacksmith',
    'Mechanic',
    'HVAC',
    'Tiling',
    'Glasswork',
    'Metalwork',
    'Furniture Making',
    'Construction',
    'Roofing',
    'Flooring',
    'Landscaping'
  ];
  
  const locations = [
    'Hebron',
    'Ramallah', 
    'Nablus', 
    'Bethlehem', 
    'Jerusalem', 
    'Jenin',
    'Tulkarm',
    'Qalqilya',
    'Jericho',
    'Tubas',
    'Salfit',
    'Gaza',
    'Khan Yunis',
    'Rafah',
    'Jabalia',
    'Beit Lahia',
    'Deir al-Balah'
  ];

  // Fetch all artisans once on mount
  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all artisans without filters (backend doesn't filter properly)
        const data = await getAllCraftsmen({});
        
        console.log('📦 All artisans fetched:', data?.length || 0);
        
        setArtisansRaw(data || []);
      } catch (err) {
        console.error('❌ Failed to fetch artisans:', err);
        setError(err.message || 'Failed to load artisans');
      } finally {
        setLoading(false);
      }
    };
    fetchArtisans();
  }, []); // Only fetch once on mount

  // Apply all filters on client side
  const artisans = useMemo(() => {
    let filtered = artisansRaw;
    
    // Apply craft type filter
    if (selectedCraftType) {
      filtered = filtered.filter(artisan => 
        artisan.craftType === selectedCraftType
      );
    }
    
    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(artisan => 
        artisan.location === selectedLocation
      );
    }
    
    // Apply rating filter
    if (selectedRating) {
      const minRating = parseFloat(selectedRating);
      filtered = filtered.filter(artisan => {
        const rating = artisan.averageRating ?? artisan.rating ?? 0;
        return rating >= minRating;
      });
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(artisan =>
        artisan.name?.toLowerCase().includes(query) ||
        artisan.description?.toLowerCase().includes(query) ||
        artisan.craftType?.toLowerCase().includes(query) ||
        artisan.location?.toLowerCase().includes(query)
      );
    }
    
    console.log('✅ Filtered artisans:', {
      total: artisansRaw.length,
      filtered: filtered.length,
      filters: { selectedCraftType, selectedLocation, selectedRating, searchQuery }
    });
    
    return filtered;
  }, [searchQuery, artisansRaw, selectedCraftType, selectedLocation, selectedRating]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="crafts-page">
      <div className="crafts-header">
        <div className="container">
          <h1 className="page-title" style={{color: '#ffffff'}}>Browse Artisans</h1>
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
          <div className="error-container">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="error-title">Oops! Something went wrong</h3>
            <p className="error-message">{error}</p>
            <button 
              className="error-retry-btn"
              onClick={() => window.location.reload()}
            >
              <span style={{ marginRight: '0.5rem' }}>↻</span> Try Again
            </button>
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
                      <img
                        src={
                          (artisan.avatar || artisan.profilePicture)
                            ? ((artisan.avatar || artisan.profilePicture).startsWith('http') 
                                ? (artisan.avatar || artisan.profilePicture)
                                : `http://localhost:5000${artisan.avatar || artisan.profilePicture}`)
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&background=e67e22&color=fff&size=120`
                        }
                        alt={artisan.name}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&background=e67e22&color=fff&size=120`;
                        }}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          boxShadow: '0 4px 12px rgba(230, 126, 34, 0.3)',
                          border: '3px solid rgba(255, 255, 255, 0.9)'
                        }}
                      />
                      <div>
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>{artisan.name}</h3>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>{artisan.craftType}</p>
                      </div>
                    </div>
                    <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '1rem', minHeight: '40px' }}>
                      {artisan.description || 'Professional craftsman'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                      <span style={{ color: '#7f8c8d', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        {artisan.location}
                      </span>
                      <span style={{ color: '#f39c12', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        {(artisan.averageRating ?? artisan.rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-animation">
                <svg className="search-icon-animated" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e67e22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h3 className="no-results-title">No Artisans Found</h3>
              <p className="no-results-subtitle">We couldn't find any artisans matching your criteria</p>
              <div className="no-results-suggestions">
                <p className="suggestion-title">Try these suggestions:</p>
                <ul className="suggestion-list">
                  <li><span style={{ marginRight: '0.5rem', color: '#e67e22' }}>↻</span> Clear your filters and try again</li>
                  <li><span style={{ marginRight: '0.5rem', color: '#e67e22' }}>✓</span> Check your spelling</li>
                  <li><span style={{ marginRight: '0.5rem', color: '#e67e22' }}>⊕</span> Try a different location</li>
                  <li><span style={{ marginRight: '0.5rem', color: '#e67e22' }}>★</span> Adjust your rating filter</li>
                </ul>
              </div>
              <button 
                className="clear-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCraftType('');
                  setSelectedLocation('');
                  setSelectedRating('');
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>×</span> Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Crafts;
