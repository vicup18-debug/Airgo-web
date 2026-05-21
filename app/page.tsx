"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 🟢 PHASE 2: THE FALLBACK MATRIX - Keeps the site looking premium if the DB is empty
const FALLBACK_ROOMS = [
  {
    _id: 'airgo_room_01',
    hotelName: 'Transcorp Hilton Abuja',
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
    name: 'Diplomatic Studio',
    pricePerNight: 195000,
    totalAllocated: 8,
    amenities: 'Kitchenette, Gym Access, Premium Security',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    partnerId: 'airgo_direct',
    bookedDates: []
  }
];

export default function HotelHomepage() {
  const [user, setUser] = useState<any>(null);
  const [liveRooms, setLiveRooms] = useState<any[]>(FALLBACK_ROOMS);
  const [isLoading, setIsLoading] = useState(false);

  // SEARCH & DATE STATES
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // BOOKING MODAL STATES
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
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

    const fetchRooms = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
        const res = await fetch(`${apiUrl}/api/rooms`);

        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setLiveRooms(data);
          } else {
            setLiveRooms(FALLBACK_ROOMS); // 🟢 Fallback on empty DB
          }
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchRooms();
  }, []);

  // 🛡️ DYNAMIC AVAILABILITY ENGINE
  const isRoomAvailable = (room: any) => {
    if (!checkIn || !checkOut) return true;
    if (!room.bookedDates) return true; // Safeguard for fallback data

    let d = new Date(checkIn);
    const endD = new Date(checkOut);

    while (d < endD) {
      const dateStr = d.toISOString().split('T')[0];
      const dayMatch = room.bookedDates?.find((b: any) => b.date === dateStr);
      if (dayMatch && dayMatch.count >= room.totalAllocated) return false;
      d.setDate(d.getDate() + 1);
    }
    return true;
  };

  const calculateTotal = (pricePerNight: number) => {
    if (!checkIn || !checkOut) return pricePerNight;
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
    return (nights > 0 ? nights : 1) * pricePerNight;
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

      const payload = {
        userId: finalUserId,
        itemId: selectedRoom._id,
        itemName: `${selectedRoom.hotelName} - ${selectedRoom.name}`,
        itemType: 'hotel',
        partnerId: selectedRoom.partnerId,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: 1,
        totalPrice: calculateTotal(selectedRoom).toLocaleString(),
        status: 'Pending Escrow',
        clientName: clientData.name,
        clientEmail: clientData.email,
        clientPhone: clientData.phone,
        deliveryAddress: 'Walk-In Stay at Property'
      };

      const res = await fetch(`${apiUrl}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');

      toast.success("Booking Confirmed! Your Escrow hold is active and PDF Invoice has been generated.");
      setSelectedRoom(null);
      router.push('/dashboard');

    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-[72px] md:pb-0 flex flex-col">

      

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow">
        {/* HEADER */}
        <header className="bg-[#000080] pt-12 pb-48 px-6 rounded-b-[2.5rem] md:rounded-none relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Find Your Perfect Stay</h1>
            <p className="text-sm md:text-lg text-blue-100 max-w-2xl mx-auto">Secure luxury hotel suites and premium executive lodgings across Nigeria with Airgo Escrow Protection.</p>
          </div>
          
          {/* TRUST BAR */}
          <div className="mt-10 bg-[#000060] rounded-2xl p-6 md:p-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 shadow-md border border-[#000099]">
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">✅</span>
              <span className="font-bold text-white text-base">Verified Partners</span>
              <span className="text-xs text-blue-200 mt-1">Strictly vetted luxury properties</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">🔒</span>
              <span className="font-bold text-white text-base">Escrow-Protected Transactions</span>
              <span className="text-xs text-blue-200 mt-1">Your funds are held securely</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">📞</span>
              <span className="font-bold text-white text-base">24/7 Support</span>
              <span className="text-xs text-blue-200 mt-1">Always available for assistance</span>
            </div>
          </div>
        </header>

        {/* SEARCH BOX & CALENDAR PICKER */}
        <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-10">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
            <form className="flex flex-col md:flex-row gap-4">
              <div className="flex-[2]">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Hotel or City</label>
                <input type="text" placeholder="Abuja, Lagos, Hilton..." className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] focus:ring-2 outline-none" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Check In</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Check Out</label>
                <input type="date" min={checkIn || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </form>
          </div>
        </div>

        {/* LIVE DYNAMIC INVENTORY */}
        <div className="max-w-7xl mx-auto px-6 mt-12 mb-16">

          {isLoading ? (
            <div className="text-center py-12 text-gray-500 font-bold animate-pulse">Scanning live matrices...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveRooms.map((room) => {
                const available = isRoomAvailable(room);

                return (
                  <div key={room._id} className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition duration-300 flex flex-col ${available ? 'hover:shadow-lg' : 'opacity-60 grayscale'}`}>
                    <div className="h-56 overflow-hidden relative">
                      <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {!available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                          <span className="bg-red-600 text-white font-black px-4 py-2 rounded-lg text-sm uppercase tracking-wider transform -rotate-12 shadow-xl">Sold Out</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-xs font-black text-[#000080] uppercase tracking-wider mb-1 line-clamp-1">{room.hotelName}</p>
                      <h3 className="font-bold text-gray-900 text-xl mb-2 leading-tight">{room.name}</h3>

                      <div className="bg-gray-50 p-3 rounded-lg mb-6 border border-gray-100 flex-grow">
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">{room.amenities}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                        <div>
                          <p className="text-2xl font-black text-[#000080]">₦{calculateTotal(room).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{checkIn && checkOut ? 'Total Price' : 'Per Night'}</p>
                        </div>
                        <button
                          onClick={() => available ? setSelectedRoom(room) : null}
                          disabled={!available || !checkIn || !checkOut}
                          className={`px-5 py-3 rounded-xl font-black text-sm shadow-md transition ${!checkIn || !checkOut ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : available ? 'bg-[#FFB81C] text-[#000080] hover:bg-yellow-400' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                          {available ? 'Book Escrow' : 'Unavailable'}
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
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto border border-gray-100">
            <div className="bg-[#000080] p-6 text-white flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black">{selectedRoom.hotelName}</h2>
                <p className="text-blue-200 text-sm font-bold mt-1">{selectedRoom.name}</p>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="text-white hover:text-red-300 text-2xl font-bold transition">✕</button>
            </div>

            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                <span>Check-In: <span className="text-gray-900">{new Date(checkIn).toLocaleDateString()}</span></span>
                <span>Check-Out: <span className="text-gray-900">{new Date(checkOut).toLocaleDateString()}</span></span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <span className="text-xs uppercase font-black text-gray-400">Total Escrow Hold</span>
                <span className="text-3xl font-black text-[#000080]">₦{calculateTotal(selectedRoom).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              {!user && <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-xs font-bold mb-4">Please log in to your Airgo account to secure this booking.</div>}

              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Guest Name</label><input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#000080] outline-none" value={clientData.name} onChange={(e) => setClientData({ ...clientData, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email (For Invoice)</label><input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#000080] outline-none" value={clientData.email} onChange={(e) => setClientData({ ...clientData, email: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label><input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#000080] outline-none" value={clientData.phone} onChange={(e) => setClientData({ ...clientData, phone: e.target.value })} /></div>
              </div>

              <p className="text-[10px] text-gray-500 leading-relaxed mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                🔒 By confirming, your funds will be securely held in the Airgo Escrow framework. The partner will only be paid upon successful completion of your stay.
              </p>

              <button disabled={isBooking || !user} type="submit" className={`w-full py-4 rounded-xl shadow-lg text-lg font-black transition mt-2 ${(isBooking || !user) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FFB81C] text-[#000080] hover:bg-yellow-400'}`}>
                {isBooking ? 'Locking Inventory & Encrypting...' : 'Confirm Escrow Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}