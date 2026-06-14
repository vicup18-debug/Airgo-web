"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HotelBookingModal from './hotels/bookings-modal';
import CarBookingModal from '../components/CarBookingModal';

// 🟢 PHASE 2: THE FALLBACK MATRIX - Keeps the site looking premium if the DB is empty
const FALLBACK_ROOMS = [
  {
    _id: 'airgo_room_01',
    hotelName: 'Sheraton Lagos Hotel',
    hotelAddress: '30 Mobolaji Bank Anthony Way, Ikeja, Lagos',
    name: 'Deluxe Suite',
    pricePerNight: 120000,
    totalAllocated: 5,
    amenities: 'King Bed, Ocean View, High-speed WiFi, Minibar',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4db85b?auto=format&fit=crop&w=800&q=80',
    partnerId: 'airgo_direct',
    bookedDates: []
  }
];

const FALLBACK_CARS = [
  {
    _id: 'airgo_car_01',
    name: 'Mercedes-Benz G-Wagon G63',
    type: 'SUV',
    price: 350000,
    capacity: 5,
    features: 'Chauffeur Driven, V8 Biturbo, Leather Interior',
    image: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&w=800&q=80',
    partnerId: 'airgo_direct',
    bookedDates: [],
    location: 'Maitama',
    state: 'Abuja',
    vehicleNumber: 'ABJ-888-GW',
    totalAllocated: 1
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
  const [stayType, setStayType] = useState('all'); // 'all' | 'hotel' | 'apartment'
  const [transportType, setTransportType] = useState('all'); // 'all' | 'car' | 'shuttle'
  const [isStayTypeOpen, setIsStayTypeOpen] = useState(false);
  const [isTransportTypeOpen, setIsTransportTypeOpen] = useState(false);

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

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'transport' || window.location.hash === '#transport') {
        setActiveTab('transport');
      }
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
    const allocated = item.totalAllocated !== undefined ? item.totalAllocated : 1;
    if (allocated <= 0) return false;
    if (!checkIn || !checkOut) return true;
    if (!item.bookedDates) return true;

    let d = new Date(checkIn);
    const endD = new Date(checkOut);
    
    // Total capacity vs allocated threshold
    const capacityThreshold = allocated;

    while (d < endD) {
      const dateStr = d.toISOString().split('T')[0];
      const dayMatch = item.bookedDates?.find((b: any) => b.date === dateStr);
      if (dayMatch && dayMatch.count >= capacityThreshold) return false;
      d.setUTCDate(d.getUTCDate() + 1);
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
      router.push(isCar ? '/dashboard' : '/dashboard?hotelBooked=true');

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
          partnerType: room.partnerType || 'hotel',
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
        hotel.partnerType = room.partnerType || 'hotel';
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

    // 2. Stay type match
    const matchesStayType = stayType === 'all' || 
      (stayType === 'hotel' && hotel.partnerType === 'hotel') ||
      (stayType === 'apartment' && hotel.partnerType === 'apartment');

    return matchesLocation && matchesStayType;
  });

  const filteredCars = liveCars.filter((car) => {
    // 1. Location/State match
    const matchesLocation = !location ||
      car.location?.toLowerCase().includes(location.toLowerCase()) ||
      car.state?.toLowerCase().includes(location.toLowerCase());

    // 2. Availability match (using dates)
    const matchesAvailability = isItemAvailable(car, true);

    // 3. Transport type match
    const matchesTransportType = transportType === 'all' ||
      (transportType === 'car' && car.vehicleCategory === 'car') ||
      (transportType === 'shuttle' && car.vehicleCategory === 'shuttle');

    return matchesLocation && matchesAvailability && matchesTransportType;
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
                className={`px-4 sm:px-8 py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'stays' ? 'bg-[#FFB81C] text-[#000080]' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.39 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.61 8.26L12 2Z" />
                </svg>
                luxury stay
              </button>
              <button 
                onClick={() => setActiveTab('transport')} 
                className={`px-4 sm:px-8 py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'transport' ? 'bg-[#FFB81C] text-[#000080]' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
                Car Rental
              </button>
            </div>
          </div>
          
          {/* TRUST BAR */}
          <div className="mt-10 bg-[#000060] rounded-2xl p-4 md:p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 shadow-md border border-[#000099]">
            <div className="flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/5 cursor-pointer group">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-[#FFB81C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-bold text-white text-base group-hover:text-[#FFB81C] transition-colors">Verified Partners</span>
              <span className="text-xs text-blue-200 mt-1 group-hover:text-white transition-colors">Strictly vetted luxury properties and verified chauffeurs.</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/5 cursor-pointer group">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-[#FFB81C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="font-bold text-white text-base group-hover:text-[#FFB81C] transition-colors">Escrow-Protected</span>
              <span className="text-xs text-blue-200 mt-1 group-hover:text-white transition-colors">Your funds are held securely until service is completely delivered.</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/5 cursor-pointer group">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-[#FFB81C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="font-bold text-white text-base group-hover:text-[#FFB81C] transition-colors">24/7 Support</span>
              <span className="text-xs text-blue-200 mt-1 group-hover:text-white transition-colors">Always available for VIP assistance and priority booking support.</span>
            </div>
          </div>
        </header>
 
        {/* SEARCH BOX & CALENDAR PICKER */}
        <div className="max-w-3xl mx-auto px-4 -mt-24 relative z-20">
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
              {activeTab === 'stays' ? (
                <div className="flex-1">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-2">Stay Type</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStayTypeOpen(!isStayTypeOpen)}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-950 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all font-medium text-left flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-sm text-gray-900">
                        {stayType === 'all' && (
                          <svg className="w-4 h-4 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                        {stayType === 'hotel' && (
                          <svg className="w-4 h-4 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                        {stayType === 'apartment' && (
                          <svg className="w-4 h-4 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        )}
                        {stayType === 'all' ? 'All Stays' : stayType === 'hotel' ? 'Hotels Only' : 'Apartments Only'}
                      </span>
                      <svg className="fill-current h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </button>
                    {isStayTypeOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsStayTypeOpen(false)} />
                        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-gray-150 shadow-xl overflow-hidden py-1">
                          <button
                            type="button"
                            onClick={() => { setStayType('all'); setIsStayTypeOpen(false); }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 font-medium flex items-center gap-2.5 transition"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            All Stays
                          </button>
                          <button
                            type="button"
                            onClick={() => { setStayType('hotel'); setIsStayTypeOpen(false); }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 font-medium flex items-center gap-2.5 transition"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Hotels Only
                          </button>
                          <button
                            type="button"
                            onClick={() => { setStayType('apartment'); setIsStayTypeOpen(false); }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 font-medium flex items-center gap-2.5 transition"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Apartments Only
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-2">Vehicle Type</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTransportTypeOpen(!isTransportTypeOpen)}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-950 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all font-medium text-left flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-sm text-gray-900">
                        {transportType === 'all' && (
                          <svg className="w-4 h-4 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16M4 14h16m-2-7l-1.5-4.5h-9L6 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-2z" />
                          </svg>
                        )}
                        {transportType === 'car' && (
                          <svg className="w-4 h-4 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16M4 14h16m-2-7l-1.5-4.5h-9L6 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-2z" />
                          </svg>
                        )}
                        {transportType === 'shuttle' && (
                          <svg className="w-4 h-4 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v9m-8-9v9m-8-6a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3v-8zm2 3h14M8 14h8" />
                          </svg>
                        )}
                        {transportType === 'all' ? 'All Vehicles' : transportType === 'car' ? 'Car Hire' : 'Shuttle Service'}
                      </span>
                      <svg className="fill-current h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </button>
                    {isTransportTypeOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsTransportTypeOpen(false)} />
                        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-gray-150 shadow-xl overflow-hidden py-1">
                          <button
                            type="button"
                            onClick={() => { setTransportType('all'); setIsTransportTypeOpen(false); }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 font-medium flex items-center gap-2.5 transition"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16M4 14h16m-2-7l-1.5-4.5h-9L6 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-2z" />
                            </svg>
                            All Vehicles
                          </button>
                          <button
                            type="button"
                            onClick={() => { setTransportType('car'); setIsTransportTypeOpen(false); }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 font-medium flex items-center gap-2.5 transition"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16M4 14h16m-2-7l-1.5-4.5h-9L6 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-2z" />
                            </svg>
                            Car Hire
                          </button>
                          <button
                            type="button"
                            onClick={() => { setTransportType('shuttle'); setIsTransportTypeOpen(false); }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 font-medium flex items-center gap-2.5 transition"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v9m-8-9v9m-8-6a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3v-8zm2 3h14M8 14h8" />
                            </svg>
                            Shuttle Service
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
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
            <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm max-w-xl mx-auto p-8 my-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-[#000080]">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
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
                          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-sm font-medium leading-relaxed line-clamp-1">{item.location}</p>
                        </div>
                      )}
                      
                      {isCar && item.type && (
                         <div className="flex flex-col gap-1.5 mb-4 text-gray-500">
                           <div className="flex items-center gap-2">
                             <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M6 20h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                             </svg>
                             <p className="text-sm font-bold uppercase tracking-wide">{item.type} <span className="mx-2">•</span> {item.capacity} Seats</p>
                           </div>
                           {item.location && item.state && (
                             <div className="flex items-center gap-2 text-xs font-bold text-[#000080]">
                               <svg className="w-3.5 h-3.5 text-[#000080] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                               </svg>
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
                          className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-sm transition-all duration-300 ${
                            !available 
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none' 
                              : isCar 
                                ? 'bg-[#FFB81C] text-[#000080] hover:bg-yellow-400 shadow-[0_8px_20px_rgba(255,184,28,0.2)] hover:shadow-[0_8px_25px_rgba(255,184,28,0.3)] hover:-translate-y-1' 
                                : 'bg-[#000080] text-white hover:bg-blue-900 shadow-[0_8px_20px_rgba(0,0,128,0.2)] hover:shadow-[0_8px_25px_rgba(0,0,128,0.3)] hover:-translate-y-1'
                          }`}
                        >
                          {available ? (isCar ? 'Book Escrow' : 'Book Room') : 'Unavailable'}
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
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
        />
      )}

      {selectedItem && activeTab === 'transport' && (
        <CarBookingModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          car={selectedItem}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
        />
      )}
    </div>
  );
}