// Craft Model - Represents industrial craft items
export class Craft {
  constructor(id, name, category, description, artisan, price, imageUrl, availability, rating, reviews) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.description = description;
    this.artisan = artisan;
    this.price = price;
    this.imageUrl = imageUrl;
    this.availability = availability;
    this.rating = rating;
    this.reviews = reviews;
  }
}

// Dummy crafts data
export const craftsData = [
  new Craft(
    1,
    'Handcrafted Steel Lamp',
    'Welder',
    'Beautiful industrial-style lamp handcrafted from recycled steel with vintage Edison bulb. Perfect for modern and industrial interiors.',
    'Ahmad Hassan',
    250,
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500',
    true,
    4.8,
    24
  ),
  new Craft(
    2,
    'Wooden Industrial Table',
    'Carpenter',
    'Solid oak table with metal pipe legs. Combines rustic charm with industrial design elements.',
    'Sarah Mitchell',
    850,
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500',
    true,
    4.9,
    42
  ),
  new Craft(
    3,
    'Copper Wall Art',
    'Welder',
    'Hand-hammered copper wall sculpture with geometric patterns. Adds a unique artistic touch to any space.',
    'Michael Chen',
    420,
    'https://images.unsplash.com/photo-1582561833924-5fc4a6ac5caa?w=500',
    true,
    4.7,
    18
  ),
  new Craft(
    4,
    'Industrial Bookshelf',
    'Carpenter',
    'Five-tier bookshelf made from reclaimed wood and iron pipes. Perfect for displaying books and decorative items.',
    'Emily Rodriguez',
    680,
    'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500',
    false,
    4.6,
    31
  ),
  new Craft(
    5,
    'Brass Candlestick Set',
    'Welder',
    'Set of three handcrafted brass candlesticks with industrial finish. Elegant and timeless design.',
    'David Park',
    180,
    'https://images.unsplash.com/photo-1602874801006-e04291c951ce?w=500',
    true,
    4.5,
    15
  ),
  new Craft(
    6,
    'Reclaimed Wood Mirror',
    'Carpenter',
    'Large wall mirror framed with weathered reclaimed wood. Each piece tells its own story.',
    'Lisa Anderson',
    320,
    'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500',
    true,
    4.8,
    27
  ),
  new Craft(
    7,
    'Steel Coffee Table',
    'Welder',
    'Modern coffee table with powder-coated steel frame and tempered glass top. Industrial elegance at its finest.',
    'Ahmad Hassan',
    580,
    'https://images.unsplash.com/photo-1565191999001-551c187427bb?w=500',
    true,
    4.7,
    22
  ),
  new Craft(
    8,
    'Wooden Wall Shelves',
    'Carpenter',
    'Floating wall shelves made from solid walnut with hidden mounting system. Set of three shelves.',
    'Sarah Mitchell',
    240,
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500',
    true,
    4.9,
    36
  ),
  new Craft(
    9,
    'Iron Coat Rack',
    'Welder',
    'Wall-mounted coat rack with industrial pipe design and six hooks. Sturdy and stylish.',
    'Michael Chen',
    150,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    true,
    4.6,
    19
  ),
  new Craft(
    10,
    'Oak Dining Bench',
    'Carpenter',
    'Rustic dining bench made from solid oak with steel legs. Seats up to three people comfortably.',
    'Emily Rodriguez',
    480,
    'https://images.unsplash.com/photo-1503602642458-232111445657?w=500',
    true,
    4.8,
    28
  ),
  new Craft(
    11,
    'Bronze Desk Organizer',
    'Welder',
    'Handcrafted bronze desk organizer with multiple compartments. Keeps your workspace tidy in style.',
    'David Park',
    95,
    'https://images.unsplash.com/photo-1587467512961-120760940315?w=500',
    true,
    4.4,
    12
  ),
  new Craft(
    12,
    'Pine Storage Crate',
    'Carpenter',
    'Set of three stackable storage crates made from distressed pine. Perfect for organizing any room.',
    'Lisa Anderson',
    140,
    'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=500',
    true,
    4.5,
    21
  ),
  new Craft(
    13,
    'Plumbing Fixture Installation',
    'Plumber',
    'Professional plumbing services including fixture installation, pipe repair, and leak fixing.',
    'James Wilson',
    120,
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500',
    true,
    4.9,
    45
  ),
  new Craft(
    14,
    'Electrical Wiring & Repair',
    'Electrician',
    'Licensed electrician for home wiring, outlet installation, circuit breaker repair, and electrical troubleshooting.',
    'Robert Taylor',
    150,
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500',
    true,
    4.8,
    38
  ),
  new Craft(
    15,
    'Interior & Exterior Painting',
    'Painter',
    'Professional painting services for walls, ceilings, doors, and exterior surfaces. Quality finish guaranteed.',
    'Maria Garcia',
    100,
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500',
    true,
    4.7,
    52
  ),
  new Craft(
    16,
    'Tile Installation & Repair',
    'Tiler',
    'Expert tile installation for kitchens, bathrooms, and floors. Specializing in ceramic and porcelain tiles.',
    'Kevin Brown',
    130,
    'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=500',
    true,
    4.6,
    29
  ),
  new Craft(
    17,
    'AC & HVAC Services',
    'HVAC Technician',
    'Air conditioning installation, repair, and maintenance. Heating system services also available.',
    'Daniel Lee',
    180,
    'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=500',
    true,
    4.9,
    41
  ),
  new Craft(
    18,
    'Garden & Landscape Design',
    'Landscaper',
    'Professional landscaping services including garden design, lawn care, and outdoor space transformation.',
    'Jennifer Martinez',
    200,
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=500',
    true,
    4.8,
    33
  )
];

// Get all crafts
export const getAllCrafts = () => craftsData;

// Get craft by ID
export const getCraftById = (id) => craftsData.find(craft => craft.id === parseInt(id));

// Get crafts by category
export const getCraftsByCategory = (category) => 
  craftsData.filter(craft => craft.category === category);

// Get available crafts
export const getAvailableCrafts = () => 
  craftsData.filter(craft => craft.availability === true);

// Search crafts
export const searchCrafts = (query) => 
  craftsData.filter(craft => 
    craft.name.toLowerCase().includes(query.toLowerCase()) ||
    craft.description.toLowerCase().includes(query.toLowerCase()) ||
    craft.artisan.toLowerCase().includes(query.toLowerCase())
  );
