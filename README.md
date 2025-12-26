# Craftopia - Industrial Crafts Reservation Website

![Craftopia](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Table of Contents
- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [MVC Architecture](#mvc-architecture)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)

## 🎨 About

Craftopia is a modern web application for browsing and reserving unique industrial crafts made by skilled artisans. The platform connects craft enthusiasts with talented artisans, offering a seamless reservation experience.

This is a university project built with React and follows the MVC (Model-View-Controller) architecture pattern for clean, maintainable, and scalable code.

## ✨ Features

- **Browse Crafts**: Explore a wide variety of industrial crafts with detailed information
- **Search & Filter**: Advanced search and filtering by category, price, and rating
- **Craft Details**: View comprehensive details about each craft including images, descriptions, and artisan information
- **Reservations**: Easy reservation system with date selection and confirmation
- **User Profile**: Personalized user dashboard with reservation history and statistics
- **Responsive Design**: Fully responsive UI that works on all devices
- **Clean UI/UX**: Modern, intuitive interface with smooth animations and transitions

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router DOM 6.20.0
- **Styling**: Pure CSS3 with CSS Variables
- **Code Quality**: ESLint with React plugins
- **Architecture**: MVC (Model-View-Controller)

## 📁 Project Structure

```
craftopia/
├── .github/
│   └── copilot-instructions.md    # GitHub Copilot instructions
├── public/                         # Static assets
├── src/
│   ├── models/                     # Data models and dummy data
│   │   ├── Craft.js               # Craft model and data
│   │   ├── Reservation.js         # Reservation model and data
│   │   └── User.js                # User model and data
│   ├── controllers/                # Business logic
│   │   ├── CraftController.js     # Craft operations
│   │   ├── ReservationController.js # Reservation operations
│   │   └── UserController.js      # User operations
│   ├── views/                      # Page components
│   │   ├── Home.jsx               # Home page
│   │   ├── Crafts.jsx             # Crafts listing page
│   │   ├── CraftDetails.jsx       # Individual craft details
│   │   ├── Reservations.jsx       # User reservations page
│   │   ├── Profile.jsx            # User profile page
│   │   ├── About.jsx              # About page
│   │   └── Contact.jsx            # Contact page
│   ├── components/                 # Reusable UI components
│   │   ├── Navbar.jsx             # Navigation bar
│   │   ├── Footer.jsx             # Footer
│   │   ├── CraftCard.jsx          # Craft display card
│   │   ├── ReservationCard.jsx    # Reservation display card
│   │   ├── SearchBar.jsx          # Search component
│   │   ├── FilterBar.jsx          # Filter component
│   │   ├── Hero.jsx               # Hero section
│   │   └── Loading.jsx            # Loading indicator
│   ├── styles/                     # CSS stylesheets
│   │   ├── index.css              # Global styles
│   │   ├── App.css                # App layout styles
│   │   ├── Navbar.css             # Navbar styles
│   │   ├── Footer.css             # Footer styles
│   │   ├── CraftCard.css          # Craft card styles
│   │   ├── ReservationCard.css    # Reservation card styles
│   │   ├── SearchBar.css          # Search bar styles
│   │   ├── FilterBar.css          # Filter bar styles
│   │   ├── Hero.css               # Hero section styles
│   │   ├── Loading.css            # Loading indicator styles
│   │   ├── Home.css               # Home page styles
│   │   ├── Crafts.css             # Crafts page styles
│   │   ├── CraftDetails.css       # Craft details page styles
│   │   ├── Reservations.css       # Reservations page styles
│   │   ├── Profile.css            # Profile page styles
│   │   ├── About.css              # About page styles
│   │   └── Contact.css            # Contact page styles
│   ├── App.jsx                     # Main App component
│   └── main.jsx                    # Application entry point
├── index.html                      # HTML template
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite configuration
├── .eslintrc.cjs                   # ESLint configuration
├── .gitignore                      # Git ignore file
└── README.md                       # Project documentation

```

## 🚀 Installation

### Prerequisites

Make sure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

   Or with yarn:
   ```bash
   yarn install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The application will open at `http://localhost:3000`

## 💻 Usage

### Development Mode

```bash
npm run dev
```

Runs the app in development mode with hot module replacement.

### Build for Production

```bash
npm run build
```

Builds the app for production to the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

Locally preview the production build.

### Lint Code

```bash
npm run lint
```

Run ESLint to check for code quality issues.

## 🏗️ MVC Architecture

This project follows the MVC (Model-View-Controller) architecture pattern:

### Models (`src/models/`)
- Define data structures
- Contain dummy data for development
- Export data access functions
- **Examples**: Craft.js, Reservation.js, User.js

### Controllers (`src/controllers/`)
- Contain business logic
- Handle data manipulation and validation
- Process user interactions
- Bridge between Models and Views
- **Examples**: CraftController.js, ReservationController.js, UserController.js

### Views (`src/views/`)
- React components for pages
- Handle UI rendering
- Use Controllers to access data
- **Examples**: Home.jsx, Crafts.jsx, CraftDetails.jsx

### Components (`src/components/`)
- Reusable UI elements
- Can be used across multiple views
- **Examples**: Navbar.jsx, CraftCard.jsx, SearchBar.jsx

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🎯 Key Features Breakdown

### Home Page
- Hero section with call-to-action
- Feature highlights
- Featured crafts showcase
- About section preview

### Crafts Page
- Full catalog of available crafts
- Search functionality
- Category filtering
- Sort options (price, rating, name)
- Responsive grid layout

### Craft Details Page
- Detailed craft information
- High-quality images
- Artisan details
- Rating and reviews
- Reservation form with date selection
- Availability status

### Reservations Page
- User's reservation history
- Filter by status (pending, confirmed, completed)
- Detailed reservation information
- Craft details for each reservation

### Profile Page
- User information display
- Reservation statistics
- Member since date
- Personal details

### About Page
- Company mission and values
- Featured artisans
- Service highlights

### Contact Page
- Contact form
- Business information
- Social media links
- Business hours

## 🎨 Styling

The project uses pure CSS3 with:
- CSS Variables for theming
- Flexbox and Grid layouts
- Responsive design with media queries
- Smooth transitions and animations
- Modern color palette
- Mobile-first approach

## 🔄 Data Flow

1. **Models** define and store data
2. **Controllers** process and manipulate data
3. **Views** request data from Controllers
4. **Components** receive data as props from Views
5. User interactions trigger Controller functions
6. State updates re-render Views

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔮 Future Enhancements

Once the backend is ready:
- Replace dummy data with API calls
- Implement user authentication
- Add payment processing
- Real-time availability updates
- User reviews and ratings
- Image upload for crafts
- Admin dashboard
- Email notifications

## 👥 Contributing

This is a university project. Contributions from team members are welcome!

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Authors

**Your Name** - University Project

## 🙏 Acknowledgments

- University instructors and mentors
- React and Vite documentation
- Open source community
- Unsplash for placeholder images

---

**Note**: This project currently uses dummy data. Once the Node.js backend is completed by your colleague, the data layer will be replaced with actual API calls.

For questions or support, please contact the development team.

**Happy Coding! 🚀**
