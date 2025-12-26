// Craftsman Model - Represents craftsman users with availability settings
export class Craftsman {
  constructor(id, name, email, phone, profession, rating, reviews, price, availability, availableTimes, bio, experienceYears, portfolio = [], city = '') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.profession = profession;
    this.rating = rating;
    this.reviews = reviews;
    this.price = price;
    this.availability = availability; // true/false
    this.availableTimes = availableTimes; // array of time slots
    this.bio = bio;
    this.experienceYears = experienceYears;
    this.portfolio = portfolio; // array of work samples
    this.city = city; // craftsman's city
  }
}

// Dummy craftsmen data
export const craftsmenData = [
  new Craftsman(
    1,
    'Ahmad Hassan',
    'ahmad.hassan@craftopia.com',
    '+1 (555) 123-4567',
    'Welder',
    4.8,
    24,
    250,
    true,
    ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
    'Expert welder with 10+ years of experience in metal fabrication and industrial design.',
    12,
    [
      {
        id: 1,
        title: 'Custom Metal Gate',
        description: 'Designed and welded a decorative security gate',
        imageUrl: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=500',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        title: 'Industrial Shelving',
        description: 'Heavy-duty metal shelving for warehouse',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500',
        createdAt: '2024-02-20'
      }
    ],
    'New York'
  ),
  new Craftsman(
    2,
    'Sarah Mitchell',
    'sarah.mitchell@craftopia.com',
    '+1 (555) 234-5678',
    'Carpenter',
    4.9,
    42,
    850,
    true,
    ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
    'Master carpenter specializing in custom furniture and woodworking projects.',
    15,
    [
      {
        id: 1,
        title: 'Custom Dining Table',
        description: 'Handcrafted oak dining table with live edge',
        imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500',
        createdAt: '2024-01-10'
      },
      {
        id: 2,
        title: 'Built-in Bookshelf',
        description: 'Floor-to-ceiling custom bookshelf installation',
        imageUrl: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=500',
        createdAt: '2024-02-14'
      },
      {
        id: 3,
        title: 'Kitchen Cabinets',
        description: 'Complete kitchen cabinet renovation',
        imageUrl: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=500',
        createdAt: '2024-03-05'
      }
    ],
    'Los Angeles'
  ),
  new Craftsman(
    3,
    'James Wilson',
    'james.wilson@craftopia.com',
    '+1 (555) 345-6789',
    'Plumber',
    4.9,
    45,
    120,
    true,
    ['8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
    'Licensed plumber with expertise in residential and commercial plumbing systems.',
    10,
    [],
    'Chicago'
  ),
  new Craftsman(
    4,
    'Robert Taylor',
    'robert.taylor@craftopia.com',
    '+1 (555) 456-7890',
    'Electrician',
    4.8,
    38,
    150,
    true,
    ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM'],
    'Certified electrician specializing in residential electrical work and installations.',
    8,
    [
      {
        id: 1,
        title: 'Home Rewiring Project',
        description: 'Complete electrical system upgrade',
        imageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500',
        createdAt: '2024-02-28'
      }
    ],
    'Houston'
  ),
  new Craftsman(
    5,
    'Maria Garcia',
    'maria.garcia@craftopia.com',
    '+1 (555) 567-8901',
    'Painter',
    4.7,
    52,
    100,
    true,
    ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
    'Professional painter with a keen eye for detail and color coordination.',
    7,
    [
      {
        id: 1,
        title: 'Modern Living Room',
        description: 'Contemporary color scheme with accent wall',
        imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500',
        createdAt: '2024-01-20'
      },
      {
        id: 2,
        title: 'Exterior House Painting',
        description: 'Complete exterior refresh with weather-resistant paint',
        imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500',
        createdAt: '2024-03-10'
      }
    ],
    'Phoenix'
  )
];

// Get all craftsmen
export const getAllCraftsmen = () => {
  const storedCraftsmen = JSON.parse(localStorage.getItem('craftopia_craftsmen') || '[]');
  // Combine with dummy data
  return [...craftsmenData, ...storedCraftsmen];
};

// Get craftsman by ID
export const getCraftsmanById = (id) => {
  const allCraftsmen = getAllCraftsmen();
  return allCraftsmen.find(craftsman => craftsman.id === parseInt(id));
};

// Get craftsmen by profession
export const getCraftsmenByProfession = (profession) => {
  const allCraftsmen = getAllCraftsmen();
  return allCraftsmen.filter(craftsman => craftsman.profession === profession);
};

// Get available craftsmen
export const getAvailableCraftsmen = () => {
  const allCraftsmen = getAllCraftsmen();
  return allCraftsmen.filter(craftsman => craftsman.availability === true);
};

// Update craftsman availability times
export const updateAvailableTimes = (craftsmanId, newTimes) => {
  const craftsman = getCraftsmanById(craftsmanId);
  if (craftsman) {
    craftsman.availableTimes = newTimes;
    
    // Update in localStorage if it's a stored craftsman (not dummy data)
    const storedCraftsmen = JSON.parse(localStorage.getItem('craftopia_craftsmen') || '[]');
    const index = storedCraftsmen.findIndex(c => c.id === parseInt(craftsmanId));
    if (index !== -1) {
      storedCraftsmen[index].availableTimes = newTimes;
      localStorage.setItem('craftopia_craftsmen', JSON.stringify(storedCraftsmen));
    }
    
    return true;
  }
  return false;
};

// Toggle craftsman availability
export const toggleAvailability = (craftsmanId) => {
  const craftsman = getCraftsmanById(craftsmanId);
  if (craftsman) {
    craftsman.availability = !craftsman.availability;
    
    // Update in localStorage if it's a stored craftsman (not dummy data)
    const storedCraftsmen = JSON.parse(localStorage.getItem('craftopia_craftsmen') || '[]');
    const index = storedCraftsmen.findIndex(c => c.id === parseInt(craftsmanId));
    if (index !== -1) {
      storedCraftsmen[index].availability = craftsman.availability;
      localStorage.setItem('craftopia_craftsmen', JSON.stringify(storedCraftsmen));
    }
    
    return craftsman.availability;
  }
  return null;
};
