"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HotelBookingModal from './hotels/bookings-modal';

// 🟢 PHASE 2: THE FALLBACK MATRIX - Keeps the site looking premium if the DB is empty
const FALLBACK_ROOMS = [
  {
    _id: 'airgo_room_01',
    hotelName: 'Transcorp Hilton Abuja',
    hotelAddress: '1 Aguiyi Ironsi St, Maitama, Abuja',
    name: 'Presidential Suite',
    pricePerNight: 350000,
    totalAllocated: 5,
    amenities: 'Private Pool, Executive Lounge Access, City View',
    image: 'https://images.unsplash.com/photo-1582719478250-c89404bb8a0e?auto=format&fit=crop&w=800&q=80',
    partnerId: 'airgo_direct',
    bookedDates: []
  },
  {
    _id: 'airgo_room_02',
    hotelName: 'The Wheatbaker Lagos',
    hotelAddress: '4 Onitolo Rd, Ikoyi, Lagos',
    name: 'Luxury Executive Penthouse',
    pricePerNight: 280000,
    totalAllocated: 3,
    amenities: 'Spa Access, Free Wi-Fi, Chauffeur Service',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    partnerId: 'airgo_direct',
    bookedDates: []
  },
  {
    _id: 'airgo_room_03',
    hotelName: 'Fraser Suites Abuja',
    hotelAddress: '294 Leventis Close, Central Business District, Abuja',
    name: 'Diplomatic Studio',
    pricePerNight: 195000,
    totalAllocated: 8,
    amenities: 'Kitchenette, Gym Access, Premium Security',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    partnerId: 'airgo_direct',
    bookedDates: []
  }
];

const FALLBACK_CARS = [
  {
    _id: 'airgo_car_01',
    name: 'Mercedes-Benz G-Wagon',
    type: 'Luxury SUV',
    price: 450000,
    capacity: 4,
    features: 'Bulletproof, Chauffeur, Leather Interior',
    image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=800&q=80',
    partnerId: 'airgo_direct',
    bookedDates: [],
    location: 'Maitama',
    state: 'Abuja',
    vehicleNumber: 'ABJ-888-GW'
  },
  {
    _id: 'airgo_car_02',
    name: 'Range Rover Autobiography',
    type: 'Premium SUV',
    price: 350000,
    capacity: 5,
    features: 'Massaging Seats, Panoramic Roof, Wi-Fi',
    image: 'https://images.unsplash.com/photo-1606016159991-efa9f131a48c?auto=format&fit=crop&w=800&q=80',
    partnerId: 'airgo_direct',
    bookedDates: [],
    location: 'Ikoyi',
    state: 'Lagos',
    vehicleNumber: 'LAG-123-RR'
  }
];

export default function HotelHomepage() {
  const [user, setUser] = useState<any>(null);
  const [liveRooms, setLiveRooms] = useState<any[]>(FALLBACK_ROOMS);
  const [liveCars, setLiveCars] = useState<any[]>(FALLBACK_CARS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stays' | 'transport'>('stays');

  // SEARCH & DATE STATES
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // BOOKING MODAL STATES
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [clientData, setClientData] = useState({ name: '', email: '', phone: '' });

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('airgo_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setClientData({ name: parsedUser.name, email: parsedUser.email, phone: parsedUser.phone || '' });
    }

    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
        const [roomsRes, carsRes] = await Promise.all([
          fetch(`${apiUrl}/api/rooms`),
          fetch(`${apiUrl}/api/cars`)
        ]);

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          if (roomsData.length > 0) setLiveRooms(roomsData);
        }
        
        if (carsRes.ok) {
          const carsData = await carsRes.json();
          if (carsData.length > 0) setLiveCars(carsData);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchData();
  }, []);

  // 🛡️ DYNAMIC AVAILABILITY ENGINE
  const isItemAvailable = (item: any, isCar: boolean = false) => {
    if ((item.totalAllocated || 0) <= 0) return false;
    if (!checkIn || !checkOut) return true;
    if (!item.bookedDates) return true;

    let d = new Date(checkIn);
    const endD = new Date(checkOut);
    
    // Total capacity vs allocated threshold
    const capacityThreshold = item.totalAllocated || 1;

    while (d < endD) {
      const dateStr = d.toISOString().split('T')[0];
      const dayMatch = item.bookedDates?.find((b: any) => b.date === dateStr);
      if (dayMatch && dayMatch.count >= capacityThreshold) return false;
      d.setDate(d.getDate() + 1);
    }
    return true;
  };

  const calculateTotal = (pricePerUnit: any, discountPercentage: number = 0) => {
    const rawPrice = typeof pricePerUnit === 'string'
      ? parseInt(pricePerUnit.replace(/\D/g, ''))
      : pricePerUnit || 0;
      
    const discountedRate = Math.round(rawPrice * (1 - (discountPercentage || 0) / 100));

    if (!checkIn || !checkOut) return discountedRate;
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
    return (days > 0 ? days : 1) * discountedRate;
  };

  const handleItemSelect = (item: any) => {
    let checkInVal = checkIn;
    let checkOutVal = checkOut;

    if (!checkInVal || !checkOutVal) {
      const today = new Date();
      checkInVal = today.toISOString().split('T')[0];
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      checkOutVal = tomorrow.toISOString().split('T')[0];
      
      setCheckIn(checkInVal);
      setCheckOut(checkOutVal);
      toast.success("📅 We've set default stay dates for your convenience.");
    }
    
    setSelectedItem(item);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.success("Please sign in to secure your escrow reservation.");
      return router.push('/login');
    }

    setIsBooking(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
      const finalUserId = user.id || user.userId || user._id;
      
      const isCar = activeTab === 'transport';
      const basePrice = isCar ? selectedItem.price : selectedItem.pricePerNight;

      const payload = {
        userId: finalUserId,
        itemId: selectedItem._id,
        itemName: isCar ? selectedItem.name : `${selectedItem.hotelName} - ${selectedItem.name}`,
        itemType: isCar ? 'car' : 'hotel',
        partnerId: selectedItem.partnerId,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: 1,
        totalPrice: calculateTotal(basePrice, selectedItem.discountPercentage).toLocaleString(),
        status: 'Pending Escrow',
        clientName: clientData.name,
        clientEmail: clientData.email,
        clientPhone: clientData.phone,
        deliveryAddress: location || (isCar ? 'Depot Pick-up' : 'Walk-In Stay at Property')
      };

      const res = await fetch(`${apiUrl}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');

      toast.success("Booking Confirmed! Your Escrow hold is active and PDF Invoice has been generated.");
      setSelectedItem(null);
      router.push('/dashboard');

    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  // Search & filter logic
  // Group rooms by hotel name
  const groupedHotels = React.useMemo(() => {
    const hotelsMap = new Map<string, any>();
    
    liveRooms.forEach(room => {
      const key = room.hotelName ? room.hotelName.trim() : 'Unknown Hotel';
      if (!hotelsMap.has(key)) {
        hotelsMap.set(key, {
          _id: room._id,
          name: room.hotelName,
          location: room.hotelAddress || 'Nigeria',
          image: room.image,
          partnerId: room.partnerId,
          pricePerNight: room.pricePerNight, // starting price
          discountPercentage: room.discountPercentage || 0,
          amenities: room.amenities,
          rooms: []
        });
      }
      const hotel = hotelsMap.get(key);
      hotel.rooms.push(room);

      const roomPrice = Number(room.pricePerNight) || 0;
      const roomDiscount = room.discountPercentage || 0;
      const roomDiscounted = roomPrice * (1 - roomDiscount / 100);

      const hotelPrice = Number(hotel.pricePerNight) || 0;
      const hotelDiscount = hotel.discountPercentage || 0;
      const hotelDiscounted = hotelPrice * (1 - hotelDiscount / 100);

      if (roomDiscounted < hotelDiscounted) {
        hotel.pricePerNight = room.pricePerNight; // keep lowest original price
        hotel.discountPercentage = room.discountPercentage || 0;
        hotel.image = room.image;
        hotel.amenities = room.amenities;
      }
    });
    
    return Array.from(hotelsMap.values());
  }, [liveRooms]);

  const isHotelAvailable = (hotel: any) => {
    if (!checkIn || !checkOut) return true;
    return hotel.rooms.some((room: any) => isItemAvailable(room, false));
  };

  const filteredRooms = groupedHotels.filter((hotel) => {
    // 1. Location match
    const matchesLocation = !location ||
      hotel.name?.toLowerCase().includes(location.toLowerCase()) ||
      hotel.location?.toLowerCase().includes(location.toLowerCase());

    return matchesLocation;
  });

  const filteredCars = liveCars.filter((car) => {
    // 1. Location/State match
    const matchesLocation = !location ||
      car.location?.toLowerCase().includes(location.toLowerCase()) ||
      car.state?.toLowerCase().includes(location.toLowerCase());

    // 2. Availability match (using dates)
    const matchesAvailability = isItemAvailable(car, true);

    return matchesLocation && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-[72px] md:pb-0 flex flex-col">

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow">
        {/* HEADER */}
        <header className="bg-[#000080] pt-12 pb-48 px-6 rounded-b-[2.5rem] md:rounded-none relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Find Your Perfect Stay</h1>
            <p className="text-sm md:text-lg text-blue-100 max-w-2xl mx-auto mb-8">Secure luxury hotel suites and premium executive lodgings across Nigeria with Airgo Escrow Protection.</p>
            
            {/* TOGGLE: STAYS VS TRANSPORT */}
            <div className="flex justify-center gap-4 mb-6">
              <button 
                onClick={() => setActiveTab('stays')} 
                className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${activeTab === 'stays' ? 'bg-[#FFB81C] text-[#000080]' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.39 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.61 8.26L12 2Z" />
                </svg>
                Luxury Star
              </button>
              <button 
                onClick={() => setActiveTab('transport')} 
                className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${activeTab === 'transport' ? 'bg-[#FFB81C] text-[#000080]' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
                Executive Fleet
              </button>
            </div>
          </div>
          
          {/* TRUST BAR */}
          <div className="mt-10 bg-[#000060] rounded-2xl p-4 md:p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 shadow-md border border-[#000099]">
            <div className="flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/5 cursor-pointer group">
              <span className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">✅</span>
              <span className="font-bold text-white text-base group-hover:text-[#FFB81C] transition-colors">Verified Partners</span>
              <span className="text-xs text-blue-200 mt-1 group-hover:text-white transition-colors">Strictly vetted luxury properties and verified chauffeurs.</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/5 cursor-pointer group">
              <span className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">🔒</span>
              <span className="font-bold text-white text-base group-hover:text-[#FFB81C] transition-colors">Escrow-Protected</span>
              <span className="text-xs text-blue-200 mt-1 group-hover:text-white transition-colors">Your funds are held securely until service is completely delivered.</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/5 cursor-pointer group">
              <span className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">📞</span>
              <span className="font-bold text-white text-base group-hover:text-[#FFB81C] transition-colors">24/7 Support</span>
              <span className="text-xs text-blue-200 mt-1 group-hover:text-white transition-colors">Always available for VIP assistance and priority booking support.</span>
            </div>
          </div>
        </header>

        {/* SEARCH BOX & CALENDAR PICKER */}
        <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-20">
          <div className="bg-white p-4 md:p-6 rounded-3xl shadow-2xl border border-gray-100">
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-4">
              <div className="flex-[2]">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-2">{activeTab === 'stays' ? 'Hotel, City or Region' : 'Pickup Location (State / Area)'}</label>
                <input type="text" placeholder={activeTab === 'stays' ? 'Abuja, Lagos, Hilton...' : 'e.g. Lagos, Abuja, Lekki...'} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all font-medium" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-2">{activeTab === 'stays' ? 'Check In' : 'Pickup Date'}</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all font-medium" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-2">{activeTab === 'stays' ? 'Check Out' : 'Return Date'}</label>
                <input type="date" min={checkIn || new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all font-medium" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </form>
          </div>
        </div>

        {/* LIVE DYNAMIC INVENTORY */}
        <div className="max-w-7xl mx-auto px-6 mt-16 mb-24">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900">{activeTab === 'stays' ? 'Featured Properties' : 'Executive Vehicles'}</h2>
              <p className="text-gray-500 mt-2 font-medium">{activeTab === 'stays' ? 'Discover handpicked luxury accommodations.' : 'Travel in absolute comfort and style.'}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-gray-400 font-bold animate-pulse text-lg">Scanning live matrices...</div>
          ) : (activeTab === 'stays' ? filteredRooms : filteredCars).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm max-w-xl mx-auto p-8 my-8">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800">No Matches Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search query or choosing different dates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(activeTab === 'stays' ? filteredRooms : filteredCars).map((item, idx) => {
                const isCar = activeTab === 'transport';
                const available = isCar ? isItemAvailable(item, true) : isHotelAvailable(item);
                const basePrice = isCar ? item.price : item.pricePerNight;

                return (
                  <div 
                    key={item._id} 
                    onClick={() => available ? handleItemSelect(item) : null}
                    style={{ animationDelay: `${idx * 80}ms` }}
                    className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer opacity-0 animate-slide-up ${!available && 'opacity-60 grayscale'}`}
                  >
                    <div className="h-64 overflow-hidden relative">
                      <img src={item.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      {!available ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                          <span className="bg-red-600 text-white font-black px-6 py-3 rounded-xl text-sm uppercase tracking-widest transform -rotate-12 shadow-2xl border border-white/20">Sold Out</span>
                        </div>
                      ) : isCar ? (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/50 flex flex-col items-end max-w-[calc(100%-2rem)]">
                            {item.discountPercentage > 0 && (
                              <span className="bg-red-500 text-white font-black px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider mb-1 animate-pulse">
                                {item.discountPercentage}% OFF
                              </span>
                            )}
                            <p className="text-sm font-black text-gray-900 flex flex-wrap justify-end items-center gap-x-1.5 gap-y-0.5">
                              {item.discountPercentage > 0 && (
                                <span className="text-xs text-gray-400 line-through font-bold">
                                  ₦{basePrice.toLocaleString()}
                                </span>
                              )}
                              <span>₦{Math.round(basePrice * (1 - (item.discountPercentage || 0) / 100)).toLocaleString()}</span>
                              <span className="text-[10px] text-gray-500 font-bold uppercase">/day</span>
                            </p>
                         </div>
                      ) : (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/50 flex flex-col items-end max-w-[calc(100%-2rem)]">
                            {item.discountPercentage > 0 && (
                              <span className="bg-red-500 text-white font-black px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider mb-1 animate-pulse">
                                {item.discountPercentage}% OFF
                              </span>
                            )}
                            <p className="text-sm font-black text-[#000080] flex flex-wrap justify-end items-center gap-x-1.5 gap-y-0.5">
                              {item.discountPercentage > 0 && (
                                <span className="text-xs text-gray-400 line-through font-bold">
                                  ₦{basePrice.toLocaleString()}
                                </span>
                              )}
                              <span>₦{Math.round(basePrice * (1 - (item.discountPercentage || 0) / 100)).toLocaleString()}</span>
                              <span className="text-[10px] text-gray-500 font-bold uppercase">/night</span>
                            </p>
                         </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      {!isCar ? (
                        <div className="flex items-center gap-1.5 mb-2 bg-[#FFB81C]/10 text-[#000080] px-2.5 py-1 rounded-lg w-fit border border-[#FFB81C]/20">
                          <svg className="w-3 h-3 text-[#FFB81C] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.39 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.61 8.26L12 2Z" />
                          </svg>
                          <span className="text-[9px] font-black tracking-wider uppercase">Luxury Star Partner</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mb-2 bg-blue-50 text-[#000080] px-2.5 py-1 rounded-lg w-fit border border-blue-100">
                          <svg className="w-3 h-3 text-[#000080] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                          </svg>
                          <span className="text-[9px] font-black tracking-wider uppercase">Executive Fleet Partner</span>
                        </div>
                      )}
                      <h3 className="font-black text-gray-900 text-2xl mb-3 leading-tight truncate">{item.name}</h3>
                      
                      {!isCar && item.location && (
                        <div className="flex items-start gap-2 mb-4 text-gray-500">
                          <span className="text-sm mt-0.5">📍</span>
                          <p className="text-sm font-medium leading-relaxed line-clamp-1">{item.location}</p>
                        </div>
                      )}
                      
                      {isCar && item.type && (
                         <div className="flex flex-col gap-1.5 mb-4 text-gray-500">
                           <div className="flex items-center gap-2">
                             <span className="text-sm">🏷️</span>
                             <p className="text-sm font-bold uppercase tracking-wide">{item.type} <span className="mx-2">•</span> {item.capacity} Seats</p>
                           </div>
                           {item.location && item.state && (
                             <div className="flex items-center gap-2 text-xs font-bold text-[#000080]">
                               <span>📍</span>
                               <span>{item.location}, {item.state}</span>
                             </div>
                           )}
                         </div>
                      )}
                      
                      <div className="bg-gray-50 p-4 rounded-2xl mb-8 border border-gray-100 flex-grow">
                        <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-2">{isCar ? item.features : item.amenities}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center pt-2 mt-auto">
                        {isCar ? (
                          <div>
                            <p className="text-xl font-black text-gray-900">₦{calculateTotal(basePrice, item.discountPercentage).toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{checkIn && checkOut ? 'Total Escrow' : 'Per Day'}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xl font-black text-[#000080] flex flex-wrap items-baseline gap-1">
                              {item.discountPercentage > 0 && (
                                <span className="text-xs text-gray-400 line-through font-bold">
                                  ₦{basePrice.toLocaleString()}
                                </span>
                              )}
                              <span>₦{Math.round(basePrice * (1 - (item.discountPercentage || 0) / 100)).toLocaleString()}</span>
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Starting Rate / Night</p>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (available) handleItemSelect(item);
                          }}
                          disabled={!available}
                          className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-sm transition-all duration-300 ${available ? 'bg-[#000080] text-white hover:bg-blue-900 shadow-[0_8px_20px_rgba(0,0,128,0.2)] hover:shadow-[0_8px_25px_rgba(0,0,128,0.3)] hover:-translate-y-1' : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'}`}
                        >
                          {available ? (isCar ? 'Reserve Now' : 'Book Room') : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FRICTIONLESS BOOKING MODAL */}
      {selectedItem && activeTab === 'stays' && (
        <HotelBookingModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          hotel={selectedItem}
        />
      )}

      {selectedItem && activeTab === 'transport' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden my-auto border border-gray-100 transform transition-all animate-scale-in max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#000080] to-[#000060] p-8 text-white relative overflow-hidden shrink-0">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10 pr-8">
                <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">{`${selectedItem.type} Vehicle`}</p>
                <h2 className="text-3xl font-black leading-tight">{selectedItem.name}</h2>
              </div>
              <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all z-20">✕</button>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="p-8 bg-gray-50/50 border-b border-gray-100">
                <div className="flex justify-between items-center mb-6">
                   <div className="flex flex-col">
                     <span className="text-[10px] uppercase font-black text-gray-400 mb-1">Pickup Date</span>
                     <span className="text-sm font-bold text-gray-900">{new Date(checkIn).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                   </div>
                   <div className="h-px bg-gray-300 w-12 flex-1 mx-4"></div>
                   <div className="flex flex-col text-right">
                     <span className="text-[10px] uppercase font-black text-gray-400 mb-1">Return Date</span>
                     <span className="text-sm font-bold text-gray-900">{new Date(checkOut).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                   </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                  <span className="text-xs uppercase font-black text-gray-500 tracking-wider">Total Escrow Hold</span>
                  <div className="flex flex-col items-end">
                    {selectedItem.discountPercentage > 0 && (
                      <span className="text-xs text-gray-400 line-through font-bold mb-0.5">
                        ₦{calculateTotal(selectedItem.price, 0).toLocaleString()}
                      </span>
                    )}
                    <span className="text-3xl font-black text-[#000080]">
                      ₦{calculateTotal(selectedItem.price, selectedItem.discountPercentage).toLocaleString()}
                    </span>
                    {selectedItem.discountPercentage > 0 && (
                      <span className="text-[10px] text-red-600 font-bold uppercase mt-1">🔥 {selectedItem.discountPercentage}% OFF APPLIED</span>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleConfirmBooking} className="p-8 space-y-5">
                {!user && <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-2xl text-sm font-bold mb-6 flex items-start gap-3">
                   <span className="text-xl">⚠️</span>
                   <p>Please log in to your Airgo account to secure this escrow reservation.</p>
                </div>}

                <div><label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Primary Guest Name</label><input required type="text" className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] focus:ring-4 focus:ring-[#000080]/10 outline-none transition-all font-medium" value={clientData.name} onChange={(e) => setClientData({ ...clientData, name: e.target.value })} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Email Address</label><input required type="email" className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] focus:ring-4 focus:ring-[#000080]/10 outline-none transition-all font-medium" value={clientData.email} onChange={(e) => setClientData({ ...clientData, email: e.target.value })} /></div>
                  <div><label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Phone Number</label><input required type="tel" className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] focus:ring-4 focus:ring-[#000080]/10 outline-none transition-all font-medium" value={clientData.phone} onChange={(e) => setClientData({ ...clientData, phone: e.target.value })} /></div>
                </div>

                <div className="flex items-start gap-3 mt-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <span className="text-xl mt-0.5">🛡️</span>
                  <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                    By confirming, your funds are encrypted and held securely in the <strong className="text-[#000080]">Airgo Escrow framework</strong>. The partner is only paid upon successful completion of your service.
                  </p>
                </div>

                <button disabled={isBooking || !user} type="submit" className={`w-full py-3.5 md:py-4 rounded-2xl shadow-xl text-xs sm:text-sm md:text-base font-black transition-all duration-300 mt-4 ${(isBooking || !user) ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#FFB81C] text-[#000080] hover:bg-[#e5a519] hover:shadow-[0_10px_25px_rgba(255,184,28,0.4)] hover:-translate-y-1'}`}>
                  {isBooking ? (
                     <span className="flex items-center justify-center gap-2">
                       <svg className="animate-spin h-5 w-5 text-[#000080]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       Locking Inventory...
                     </span>
                  ) : 'Confirm Reservation'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}