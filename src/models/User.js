// User Model - Represents user accounts
export class User {
  constructor(id, name, email, phone, address, joinedDate, profileImage) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.joinedDate = joinedDate;
    this.profileImage = profileImage;
  }
}

// Dummy users data
export const usersData = [
  new User(
    1,
    'John Doe',
    'john.doe@example.com',
    '+1 (555) 123-4567',
    '123 Main St, New York, NY 10001',
    '2024-01-15',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  ),
  new User(
    2,
    'Jane Smith',
    'jane.smith@example.com',
    '+1 (555) 987-6543',
    '456 Oak Ave, Los Angeles, CA 90001',
    '2024-03-22',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  ),
  new User(
    3,
    'Mike Johnson',
    'mike.johnson@example.com',
    '+1 (555) 246-8135',
    '789 Pine Rd, Chicago, IL 60601',
    '2024-06-10',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  )
];

// Get user by ID
export const getUserById = (id) => usersData.find(user => user.id === parseInt(id));

// Get user by email
export const getUserByEmail = (email) => 
  usersData.find(user => user.email.toLowerCase() === email.toLowerCase());

// Get current logged-in user (for demo purposes, returns first user)
export const getCurrentUser = () => usersData[0];
