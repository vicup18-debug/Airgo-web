export function getHotelState(hotel: any): string {
  if (!hotel) return 'Nigeria';
  
  if (hotel.city || hotel.state) {
    const parts = [hotel.city, hotel.state, hotel.country || 'Nigeria'].filter(Boolean);
    return parts.join(', ');
  }
  
  if (hotel.location && typeof hotel.location === 'object') {
    const city = hotel.location.city || '';
    const state = hotel.location.state || '';
    const country = hotel.location.country || 'Nigeria';
    const parts = [city, state, country].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  
  const locStr = hotel.location || hotel.hotelAddress || hotel.address;
  if (locStr && typeof locStr === 'string') {
    const parts = locStr.split(',').map((p: string) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts.join(', ');
    }
  }
  
  return 'Nigeria';
}
