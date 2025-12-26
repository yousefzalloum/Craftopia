import '../styles/FilterBar.css';

const FilterBar = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  sortBy, 
  onSortChange 
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-section">
        <label className="filter-label">Category:</label>
        <select 
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Sort by:</label>
        <select 
          className="filter-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="name">Name (A-Z)</option>
          <option value="price-low">Price (Low to High)</option>
          <option value="price-high">Price (High to Low)</option>
          <option value="rating">Rating</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
