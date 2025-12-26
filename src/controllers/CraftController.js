// Craft Controller - Business logic for craft operations
import { 
  getAllCrafts, 
  getCraftById, 
  getCraftsByCategory, 
  getAvailableCrafts,
  searchCrafts 
} from '../models/Craft';

export const CraftController = {
  // Get all crafts
  getCrafts: () => {
    try {
      return getAllCrafts();
    } catch (error) {
      console.error('Error fetching crafts:', error);
      return [];
    }
  },

  // Get single craft by ID
  getCraft: (id) => {
    try {
      const craft = getCraftById(id);
      if (!craft) {
        throw new Error('Craft not found');
      }
      return craft;
    } catch (error) {
      console.error('Error fetching craft:', error);
      return null;
    }
  },

  // Filter crafts by category
  filterByCategory: (category) => {
    try {
      if (!category || category === 'All') {
        return getAllCrafts();
      }
      return getCraftsByCategory(category);
    } catch (error) {
      console.error('Error filtering crafts:', error);
      return [];
    }
  },

  // Get only available crafts
  getAvailable: () => {
    try {
      return getAvailableCrafts();
    } catch (error) {
      console.error('Error fetching available crafts:', error);
      return [];
    }
  },

  // Search crafts
  search: (query) => {
    try {
      if (!query || query.trim() === '') {
        return getAllCrafts();
      }
      return searchCrafts(query);
    } catch (error) {
      console.error('Error searching crafts:', error);
      return [];
    }
  },

  // Get unique categories
  getCategories: () => {
    try {
      const crafts = getAllCrafts();
      const categories = [...new Set(crafts.map(craft => craft.category))];
      return ['All', ...categories];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ['All'];
    }
  },

  // Sort crafts
  sortCrafts: (crafts, sortBy) => {
    try {
      const sortedCrafts = [...crafts];
      switch (sortBy) {
        case 'price-low':
          return sortedCrafts.sort((a, b) => a.price - b.price);
        case 'price-high':
          return sortedCrafts.sort((a, b) => b.price - a.price);
        case 'rating':
          return sortedCrafts.sort((a, b) => b.rating - a.rating);
        case 'name':
          return sortedCrafts.sort((a, b) => a.name.localeCompare(b.name));
        default:
          return sortedCrafts;
      }
    } catch (error) {
      console.error('Error sorting crafts:', error);
      return crafts;
    }
  }
};
