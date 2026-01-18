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
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(230, 126, 34, 0.3)',
                        border: '3px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        {artisan.craftType === 'Carpentry' && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <path d="M21.71 2.29a1 1 0 0 0-1.42 0L18 4.59V3a1 1 0 0 0-2 0v3.59l-2.29-2.3a1 1 0 0 0-1.42 1.42l2.3 2.29H11a1 1 0 0 0 0 2h3.59l-2.3 2.29a1 1 0 0 0 1.42 1.42l2.29-2.3V15a1 1 0 0 0 2 0v-3.59l2.29 2.3a1 1 0 0 0 1.42-1.42l-2.3-2.29H23a1 1 0 0 0 0-2h-3.59l2.3-2.29a1 1 0 0 0 0-1.42z"/>
                          </svg>
                        )}
                        {artisan.craftType === 'Plumbing' && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <path d="M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.57-3.47-6.33-3.87z"/>
                            <circle cx="9" cy="8" r="4"/>
                            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.24C14.5 5.27 15 6.58 15 8s-.5 2.73-1.33 3.76c.42.14.86.24 1.33.24zM9 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        )}
                        {artisan.craftType === 'Electrical' && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                          </svg>
                        )}
                        {artisan.craftType === 'Painting' && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <path d="M18 4V3c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6h1v4H9v11c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h8V4h-3z"/>
                          </svg>
                        )}
                        {artisan.craftType === 'Welding' && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25 6 2.25v4.7z"/>
                          </svg>
                        )}
                        {artisan.craftType === 'Masonry' && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <path d="M19 6v14H5V6h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9.5 5.5h5V12h-5V9.5zM7 9.5h2V12H7V9.5zm8 0h2V12h-2V9.5zM7 13h2v2.5H7V13zm8 0h2v2.5h-2V13zm-3.5 0h5v2.5h-5V13z"/>
                          </svg>
                        )}
                        {!['Carpentry', 'Plumbing', 'Electrical', 'Painting', 'Welding', 'Masonry'].includes(artisan.craftType) && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                          </svg>
                        )}
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
