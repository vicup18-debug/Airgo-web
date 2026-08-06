export function getHotelState(hotel: any): string {
  if (!hotel) return 'Nigeria';
  
  let city = hotel.city || '';
  let state = hotel.state || '';
  let location = '';

  if (hotel.location && typeof hotel.location === 'object') {
    if (!city) city = hotel.location.city || '';
    if (!state) state = hotel.location.state || '';
    location = hotel.location.address || hotel.location.street || '';
  } else if (typeof hotel.location === 'string') {
    location = hotel.location;
  } else if (typeof hotel.hotelAddress === 'string') {
    location = hotel.hotelAddress;
  } else if (typeof hotel.address === 'string') {
    location = hotel.address;
  }
  
  city = city.trim();
  state = state.trim();
  location = location.trim();
  
  let formatted = '';
  
  if (city) {
    formatted += `(${city})`;
  }
  
  if (state) {
    if (formatted) formatted += ' ';
    formatted += state;
  }
  
  if (location) {
    // Avoid appending if the location string is identical to the city/state
    const isDuplicate = 
        location.toLowerCase() === city.toLowerCase() || 
        location.toLowerCase() === state.toLowerCase() ||
        location.toLowerCase() === `${city}, ${state}`.toLowerCase() ||
        location.toLowerCase() === `${city}, ${state}, nigeria`.toLowerCase();
        
    if (!isDuplicate) {
        if (formatted) {
          formatted += ` - ${location}`;
        } else {
          formatted = location;
        }
    }
  }
  
  return formatted || 'Nigeria';
}
