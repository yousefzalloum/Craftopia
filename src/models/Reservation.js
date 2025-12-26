// Reservation Model - Represents craft reservations and home maintenance appointments
export class Reservation {
  constructor(id, craftId, userId, userName, userEmail, startDate, endDate, totalPrice, status, createdAt, reservationType, serviceAddress, serviceDescription, appointmentTime) {
    this.id = id;
    this.craftId = craftId;
    this.userId = userId;
    this.userName = userName;
    this.userEmail = userEmail;
    this.startDate = startDate;
    this.endDate = endDate;
    this.totalPrice = totalPrice;
    this.status = status; // 'pending', 'confirmed', 'completed', 'cancelled'
    this.createdAt = createdAt;
    this.reservationType = reservationType; // 'craft' or 'maintenance'
    this.serviceAddress = serviceAddress; // For home maintenance visits
    this.serviceDescription = serviceDescription; // Description of maintenance work needed
    this.appointmentTime = appointmentTime; // Specific time for appointment
  }
}

// Dummy reservations data
export const reservationsData = [
  new Reservation(
    1,
    1,
    1,
    'John Doe',
    'john.doe@example.com',
    '2025-11-01',
    '2025-11-15',
    250,
    'confirmed',
    '2025-10-20',
    'craft',
    null,
    null,
    null
  ),
  new Reservation(
    2,
    2,
    1,
    'John Doe',
    'john.doe@example.com',
    '2025-11-10',
    '2025-11-20',
    850,
    'pending',
    '2025-10-25',
    'craft',
    null,
    null,
    null
  ),
  new Reservation(
    3,
    3,
    2,
    'Jane Smith',
    'jane.smith@example.com',
    '2025-10-28',
    '2025-11-05',
    420,
    'completed',
    '2025-10-15',
    'craft',
    null,
    null,
    null
  ),
  new Reservation(
    4,
    5,
    1,
    'John Doe',
    'john.doe@example.com',
    '2025-12-01',
    '2025-12-10',
    180,
    'confirmed',
    '2025-10-26',
    'craft',
    null,
    null,
    null
  ),
  // Home Maintenance Appointments
  new Reservation(
    5,
    4,
    1,
    'John Doe',
    'john.doe@example.com',
    '2025-11-05',
    '2025-11-05',
    150,
    'confirmed',
    '2025-10-27',
    'maintenance',
    '123 Main St, Apartment 4B, New York, NY 10001',
    'Fix broken door handle and repair kitchen cabinet hinges',
    '10:00 AM'
  ),
  new Reservation(
    6,
    7,
    1,
    'John Doe',
    'john.doe@example.com',
    '2025-11-12',
    '2025-11-12',
    200,
    'pending',
    '2025-10-28',
    'maintenance',
    '123 Main St, Apartment 4B, New York, NY 10001',
    'Install custom wooden shelves in living room',
    '2:00 PM'
  ),
  new Reservation(
    7,
    1,
    2,
    'Jane Smith',
    'jane.smith@example.com',
    '2025-11-08',
    '2025-11-08',
    120,
    'confirmed',
    '2025-10-26',
    'maintenance',
    '456 Oak Avenue, House #12, Brooklyn, NY 11201',
    'Repair metal fence gate that is not closing properly',
    '9:00 AM'
  )
];

// Get all reservations
export const getAllReservations = () => {
  const storedReservations = JSON.parse(localStorage.getItem('craftopia_reservations') || '[]');
  // Combine with dummy data
  return [...reservationsData, ...storedReservations];
};

// Get reservation by ID
export const getReservationById = (id) => {
  const allReservations = getAllReservations();
  return allReservations.find(reservation => reservation.id === parseInt(id));
};

// Get reservations by user ID
export const getReservationsByUserId = (userId) => {
  const allReservations = getAllReservations();
  return allReservations.filter(reservation => reservation.userId === parseInt(userId));
};

// Get reservations by status
export const getReservationsByStatus = (status) => {
  const allReservations = getAllReservations();
  return allReservations.filter(reservation => reservation.status === status);
};

// Add new reservation (for demo purposes)
export const addReservation = (reservation) => {
  const allReservations = getAllReservations();
  const storedReservations = JSON.parse(localStorage.getItem('craftopia_reservations') || '[]');
  
  const newReservation = new Reservation(
    allReservations.length + 1,
    reservation.craftId,
    reservation.userId,
    reservation.userName,
    reservation.userEmail,
    reservation.startDate,
    reservation.endDate,
    reservation.totalPrice,
    'pending',
    new Date().toISOString().split('T')[0],
    reservation.reservationType || 'craft',
    reservation.serviceAddress || null,
    reservation.serviceDescription || null,
    reservation.appointmentTime || null
  );
  
  storedReservations.push(newReservation);
  localStorage.setItem('craftopia_reservations', JSON.stringify(storedReservations));
  
  return newReservation;
};

// Get reservations by type
export const getReservationsByType = (type) => {
  const allReservations = getAllReservations();
  return allReservations.filter(reservation => reservation.reservationType === type);
};