import '../styles/ReservationCard.css';

const ReservationCard = ({ reservation, craft }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`reservation-card ${reservation.reservationType === 'maintenance' ? 'maintenance-card' : ''}`}>
      <div className="reservation-card-header">
        <div className="reservation-id">
          {reservation.reservationType === 'maintenance' ? '🔧 Maintenance' : '🎨 Craft'} #{reservation.id}
        </div>
        <div className={`reservation-status ${getStatusClass(reservation.status)}`}>
          {reservation.status.toUpperCase()}
        </div>
      </div>

      {craft && (
        <div className="reservation-craft-info">
          <img 
            src={craft.imageUrl} 
            alt={craft.name} 
            className="reservation-craft-image"
          />
          <div className="reservation-craft-details">
            <h3 className="reservation-craft-name">{craft.name}</h3>
            <p className="reservation-craft-category">{craft.category}</p>
            <p className="reservation-craft-artisan">By {craft.artisan}</p>
          </div>
        </div>
      )}

      <div className="reservation-details">
        {reservation.reservationType === 'maintenance' && (
          <>
            <div className="reservation-detail-row">
              <span className="detail-label">📍 Service Address:</span>
              <span className="detail-value">{reservation.serviceAddress}</span>
            </div>
            <div className="reservation-detail-row">
              <span className="detail-label">📝 Service Description:</span>
              <span className="detail-value">{reservation.serviceDescription}</span>
            </div>
            <div className="reservation-detail-row">
              <span className="detail-label">📅 Appointment Date:</span>
              <span className="detail-value">{formatDate(reservation.startDate)}</span>
            </div>
            <div className="reservation-detail-row">
              <span className="detail-label">🕒 Appointment Time:</span>
              <span className="detail-value">{reservation.appointmentTime}</span>
            </div>
          </>
        )}
        {reservation.reservationType === 'craft' && (
          <>
            <div className="reservation-detail-row">
              <span className="detail-label">📅 Start Date:</span>
              <span className="detail-value">{formatDate(reservation.startDate)}</span>
            </div>
            <div className="reservation-detail-row">
              <span className="detail-label">📅 End Date:</span>
              <span className="detail-value">{formatDate(reservation.endDate)}</span>
            </div>
          </>
        )}
        <div className="reservation-detail-row">
          <span className="detail-label">💰 Total Price:</span>
          <span className="detail-value price">${reservation.totalPrice}</span>
        </div>
        <div className="reservation-detail-row">
          <span className="detail-label">📧 Email:</span>
          <span className="detail-value">{reservation.userEmail}</span>
        </div>
        <div className="reservation-detail-row">
          <span className="detail-label">🕒 Created:</span>
          <span className="detail-value">{formatDate(reservation.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;
