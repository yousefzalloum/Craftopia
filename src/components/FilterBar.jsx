import '../styles/FilterBar.css';

const FilterBar = ({ 
  craftTypes = [],
  locations = [],
  selectedCraftType = '',
  selectedLocation = '',
  selectedRating = '',
  onCraftTypeChange,
  onLocationChange,
  onRatingChange
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-section">
        <label className="filter-label">🔨 Craft Type:</label>
        <select 
          className="filter-select"
          value={selectedCraftType}
          onChange={(e) => onCraftTypeChange(e.target.value)}
        >
          <option value="">All Crafts</option>
          {craftTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">📍 Location:</label>
        <select 
          className="filter-select"
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">⭐ Rating:</label>
        <select 
          className="filter-select"
          value={selectedRating}
          onChange={(e) => onRatingChange(e.target.value)}
        >
          <option value="">All Ratings</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
          <option value="1">1+ Stars</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
