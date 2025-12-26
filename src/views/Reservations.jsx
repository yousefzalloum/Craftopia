import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationCard from '../components/ReservationCard';
import { ReservationController } from '../controllers/ReservationController';
import { CraftController } from '../controllers/CraftController';
import { UserController } from '../controllers/UserController';
import '../styles/Reservations.css';

const Reservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const currentUser = UserController.getCurrentUser();

  // Check authentication on component mount
  useEffect(() => {
    if (!currentUser) {
      alert('Please login to view your reservations');
      navigate('/login');
      return;
    }

    const userReservations = ReservationController.getUserReservations(currentUser.id);
    setReservations(userReservations);
  }, [currentUser, navigate]);

  const filteredReservations = reservations.filter(res => {
    const statusMatch = filterStatus === 'all' || res.status === filterStatus;
    const typeMatch = filterType === 'all' || res.reservationType === filterType;
    return statusMatch && typeMatch;
  });

  const getReservationWithCraft = (reservation) => {
    const craft = CraftController.getCraft(reservation.craftId);
    return { reservation, craft };
  };

  // Don't render the page if user is not logged in
  if (!currentUser) {
    return null;
  }

  return (
    <div className="reservations-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Reservations</h1>
          <p className="page-subtitle">
            View and manage your craft reservations
          </p>
        </div>

        <div className="reservations-controls">
          <div className="filter-section">
            <h3>Filter by Type:</h3>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All Types
              </button>
              <button 
                className={`filter-btn ${filterType === 'craft' ? 'active' : ''}`}
                onClick={() => setFilterType('craft')}
              >
                🎨 Craft Reservations
              </button>
              <button 
                className={`filter-btn ${filterType === 'maintenance' ? 'active' : ''}`}
                onClick={() => setFilterType('maintenance')}
              >
                🔧 Home Maintenance
              </button>
            </div>
          </div>

          <div className="filter-section">
            <h3>Filter by Status:</h3>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All ({reservations.length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                onClick={() => setFilterStatus('pending')}
              >
                Pending ({reservations.filter(r => r.status === 'pending').length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('confirmed')}
              >
                Confirmed ({reservations.filter(r => r.status === 'confirmed').length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('completed')}
              >
                Completed ({reservations.filter(r => r.status === 'completed').length})
              </button>
            </div>
          </div>
        </div>

        <div className="reservations-list">
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation) => {
              const { craft } = getReservationWithCraft(reservation);
              return (
                <ReservationCard 
                  key={reservation.id} 
                  reservation={reservation} 
                  craft={craft}
                />
              );
            })
          ) : (
            <div className="no-reservations">
              <div className="no-reservations-icon">📋</div>
              <h3>No reservations found</h3>
              <p>
                {filterStatus === 'all' 
                  ? "You haven't made any reservations yet." 
                  : `You don't have any ${filterStatus} reservations.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
