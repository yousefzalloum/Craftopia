/**
 * Date utilities for availability management
 */

/**
 * Check if a date is available based on artisan's availability schedule
 * @param {Date|string} date - The date to check
 * @param {Array} availability - Array of availability objects from API
 * @param {boolean} checkWorkingHours - If true, also check if current time is within working hours for today
 * @returns {boolean} True if the date is available, false otherwise
 */
export const isDateAvailable = (date, availability, checkWorkingHours = true) => {
  if (!date || !availability || !Array.isArray(availability) || availability.length === 0) {
    return true; // If no availability data, allow all dates
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(dateObj);
  checkDate.setHours(0, 0, 0, 0);
  
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = dateObj.getDay();
  
  // Map numeric day to day name
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayOfWeek];
  
  // Find availability for this day
  const dayAvailability = availability.find(avail => {
    // Handle both "day" and "dayOfWeek" field names
    const availDay = avail.day || avail.dayOfWeek;
    return availDay && availDay.toLowerCase() === dayName.toLowerCase();
  });
  
  // If day is not in availability schedule, it's not available
  if (!dayAvailability) {
    return false;
  }
  
  // If checking today and checkWorkingHours is enabled, verify current time is before end time
  if (checkWorkingHours && checkDate.getTime() === today.getTime()) {
    const endTime = dayAvailability.end_time || dayAvailability.endTime;
    
    if (endTime) {
      const now = new Date();
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const endDateTime = new Date();
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      // If current time is past the end time, today is not available
      if (now >= endDateTime) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Get the minimum selectable date (today or next available date)
 * @param {Array} availability - Array of availability objects from API
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getMinSelectableDate = (availability) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If no availability data, return today
  if (!availability || !Array.isArray(availability) || availability.length === 0) {
    return today.toISOString().split('T')[0];
  }
  
  // Find next available date (within next 30 days)
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    
    if (isDateAvailable(checkDate, availability)) {
      return checkDate.toISOString().split('T')[0];
    }
  }
  
  // If no available date found in next 30 days, return today
  return today.toISOString().split('T')[0];
};

/**
 * Disable unavailable dates in a date input
 * This returns an onKeyDown handler that prevents manual date entry
 * and ensures only available dates can be selected
 * @param {Array} availability - Array of availability objects from API
 * @returns {Function} onKeyDown event handler
 */
export const handleDateInputKeyDown = (availability) => {
  return (e) => {
    // Prevent manual date typing if we have availability restrictions
    if (availability && availability.length > 0) {
      e.preventDefault();
    }
  };
};

/**
 * Get human-readable list of available days with working hours
 * @param {Array} availability - Array of availability objects from API
 * @param {boolean} includeHours - If true, include working hours in the text
 * @returns {string} Comma-separated list of available days
 */
export const getAvailableDaysText = (availability, includeHours = false) => {
  if (!availability || !Array.isArray(availability) || availability.length === 0) {
    return 'All days';
  }
  
  const days = availability.map(avail => {
    const day = avail.day || avail.dayOfWeek;
    if (!day) return '';
    
    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
    
    if (includeHours) {
      const startTime = avail.start_time || avail.startTime;
      const endTime = avail.end_time || avail.endTime;
      if (startTime && endTime) {
        return `${dayName} (${formatTime(startTime)}-${formatTime(endTime)})`;
      }
    }
    
    return dayName;
  }).filter(Boolean);
  
  if (days.length === 0) {
    return 'No days available';
  }
  
  return days.join(', ');
};

/**
 * Format time from 24h to 12h format
 * @param {string} time - Time in HH:MM format
 * @returns {string} Time in 12h format
 */
const formatTime = (time) => {
  if (!time) return time;
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
};

/**
 * Validate if selected date is available
 * Used for form validation
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {Array} availability - Array of availability objects from API
 * @returns {{valid: boolean, message: string}} Validation result
 */
export const validateDateSelection = (dateString, availability) => {
  if (!dateString) {
    return { valid: false, message: 'Please select a date' };
  }
  
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return { valid: false, message: 'Date must be in the future' };
  }
  
  if (!isDateAvailable(selectedDate, availability)) {
    const availableDays = getAvailableDaysText(availability);
    return { 
      valid: false, 
      message: `This artisan is only available on: ${availableDays}` 
    };
  }
  
  return { valid: true, message: '' };
};
