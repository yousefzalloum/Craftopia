import { useState, useEffect } from 'react';
import CraftCard from '../components/CraftCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import { CraftController } from '../controllers/CraftController';
import '../styles/Crafts.css';

const Crafts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [crafts, setCrafts] = useState([]);
  const [filteredCrafts, setFilteredCrafts] = useState([]);

  const categories = CraftController.getCategories();

  useEffect(() => {
    // Load all crafts on component mount
    const allCrafts = CraftController.getCrafts();
    setCrafts(allCrafts);
    setFilteredCrafts(allCrafts);
  }, []);

  useEffect(() => {
    // Apply filters whenever search, category, or sort changes
    let result = crafts;

    // Filter by search query
    if (searchQuery) {
      result = CraftController.search(searchQuery);
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(craft => craft.category === selectedCategory);
    }

    // Sort crafts
    if (sortBy !== 'default') {
      result = CraftController.sortCrafts(result, sortBy);
    }

    setFilteredCrafts(result);
  }, [searchQuery, selectedCategory, sortBy, crafts]);

  return (
    <div className="crafts-page">
      <div className="crafts-header">
        <div className="container">
          <h1 className="page-title">Browse Crafts</h1>
          <p className="page-subtitle">
            Discover unique industrial crafts from talented artisans
          </p>
        </div>
      </div>

      <div className="container">
        <div className="crafts-controls">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, description, or artisan..."
          />
          
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        <div className="crafts-results">
          <p className="results-count">
            Showing {filteredCrafts.length} {filteredCrafts.length === 1 ? 'craft' : 'crafts'}
          </p>

          {filteredCrafts.length > 0 ? (
            <div className="crafts-grid">
              {filteredCrafts.map((craft) => (
                <CraftCard key={craft.id} craft={craft} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No crafts found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Crafts;
