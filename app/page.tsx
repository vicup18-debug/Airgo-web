"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HotelHomepage() {
  const [user, setUser] = useState<any>(null);
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 SEARCH & DATE STATES
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // 🟢 BOOKING MODAL STATES
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [clientData, setClientData] = useState({ name: '', email: '', phone: '' });

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('airgo_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Pre-fill frictionless data if they are already logged in
      setClientData({ name: parsedUser.name, email: parsedUser.email, phone: parsedUser.phone || '' });
    }

    const fetchRooms = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
        const res = await fetch(`${apiUrl}/api/rooms`); // 🟢 FETCHING FROM NEW MATRIX
        if (res.ok) setLiveRooms(await res.json());
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // 🛡️ THE DYNAMIC AVAILABILITY ENGINE (Checks real-time dates)
  const isRoomAvailable = (room: any) => {
    if (!checkIn || !checkOut) return true; // If they haven't picked dates yet, show everything

    let d = new Date(checkIn);
    const endD = new Date(checkOut);

    while (d < endD) {
      const dateStr = d.toISOString().split('T')[0];
      const dayMatch = room.bookedDates?.find((b: any) => b.date === dateStr);

      // If the count on any single day hits the allocation limit, the room is dead
      if (dayMatch && dayMatch.count >= room.totalAllocated) {
        return false;
      }
      d.setDate(d.getDate() + 1);
    }
    return true;
  };

  // Calculate dynamic price based on nights
  const calculateTotal = (pricePerNight: number) => {
    if (!checkIn || !checkOut) return pricePerNight;
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
    return (nights > 0 ? nights : 1) * pricePerNight;
  };

  // 🟢 SUBMIT BOOKING TO BACKEND
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to secure your escrow reservation.");
      return router.push('/login');
    }

    setIsBooking(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
      const payload = {
        userId: user.id || user.userId || user._id,
        itemId: selectedRoom._id,
        itemName: `${selectedRoom.hotelName} - ${selectedRoom.name}`,
        itemType: 'hotel',
        partnerId: selectedRoom.partnerId,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: 1,
        totalPrice: calculateTotal(selectedRoom.pricePerNight).toLocaleString(),
        // 🟢 NEW: Frictionless Contact Info for the PDF & Partner!
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

      alert("✅ Booking Confirmed! Your PDF Invoice has been generated and emailed to you.");
      setSelectedRoom(null);
      router.push('/dashboard'); // Take them to their client dashboard

    } catch (error: any) {
      alert(`❌ ${error.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-[72px] md:pb-0 flex flex-col">

      {/* NAVIGATION */}
      <nav className="hidden md:flex bg-[#004A99] text-white py-4 px-8 justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center space-x-12">
          <Link href="/"><div className="text-2xl font-black text-white tracking-tight cursor-pointer">Airgo<span className="text-[#FFB81C]">.ng</span></div></Link>
          <div className="flex space-x-6 font-semibold text-sm items-center">
            <Link href="/" className="text-[#FFB81C] border-b-2 border-[#FFB81C] pb-1">Hotels</Link>
            <span className="text-blue-300 flex items-center cursor-not-allowed">Flights <span className="ml-1.5 text-[9px] uppercase tracking-wider bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded-sm">Soon</span></span>
            <Link href="/cars" className="hover:text-[#FFB81C] transition">Car Rentals</Link>
          </div>
        </div>
        <div>
          {user ? (
            <Link href={user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard'}>
              <button className="bg-[#FFB81C] text-[#004A99] px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition shadow-md">Dashboard</button>
            </Link>
          ) : (
            <Link href="/login"><button className="bg-white text-[#004A99] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition shadow-md">Sign In</button></Link>
          )}
        </div>
      </nav>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-[#004A99] text-white py-4 px-6 sticky top-0 z-40 shadow-md flex justify-between items-center">
        <div className="text-xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.ng</span></div>
        <Link href={user ? (user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard') : '/login'}>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#004A99] font-bold shadow-sm">
            {user ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>
        </Link>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow">
        {/* HERO */}
        <header className="bg-[#004A99] pt-8 pb-32 px-6 rounded-b-[2.5rem] md:rounded-none relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3">Find Your Perfect Stay</h1>
            <p className="text-blue-100 text-sm md:text-lg mb-8">Secure luxury suites with Airgo Escrow Protection.</p>
          </div>
        </header>

        {/* SEARCH BOX & CALENDAR PICKER */}
        <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-10">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
            <form className="flex flex-col md:flex-row gap-4">
              <div className="flex-[2]">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Hotel or City</label>
                <input type="text" placeholder="Search destinations..." className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#004A99] focus:ring-2 outline-none" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Check In</label>
                <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#004A99] outline-none" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Check Out</label>
                <input required type="date" min={checkIn || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#004A99] outline-none" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </form>
          </div>
        </div>

        {/* LIVE DYNAMIC INVENTORY */}
        <div className="max-w-5xl mx-auto px-6 mt-12 mb-16">
          <h2 className="text-xl font-black text-gray-900 mb-6">Available Executive Suites</h2>

          {!checkIn || !checkOut ? (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-sm text-blue-800 font-bold flex items-center gap-2">
              <span>📅</span> Please select your Check-In and Check-Out dates to check real-time availability.
            </div>
          ) : null}

          {isLoading ? (
            <div className="text-center py-12 text-gray-500 font-bold animate-pulse">Scanning live matrices...</div>
          ) : liveRooms.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center shadow-sm">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-black text-[#004A99] mb-2">Curating Premium Stays</h3>
              <p className="text-gray-500 max-w-md mx-auto">Our hotel partners are currently onboarding their properties. Please check back shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveRooms.map((room) => {
                const available = isRoomAvailable(room);

                return (
                  <div key={room._id} className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition duration-300 ${available ? 'hover:shadow-lg' : 'opacity-60 grayscale'}`}>
                    <div className="h-48 overflow-hidden relative">
                      <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                      {!available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                          <span className="bg-red-600 text-white font-black px-4 py-2 rounded-lg text-sm uppercase tracking-wider transform -rotate-12 shadow-xl">Sold Out</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-black text-[#004A99] uppercase tracking-wider mb-1">{room.hotelName}</p>
                      <h3 className="font-bold text-gray-900 text-xl mb-2 leading-tight">{room.name}</h3>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{room.amenities}</p>

                      <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                        <div>
                          <p className="text-sm font-black text-[#004A99]">₦{calculateTotal(room.pricePerNight).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{checkIn && checkOut ? 'Total Price' : 'Per Night'}</p>
                        </div>
                        <button
                          onClick={() => available ? setSelectedRoom(room) : null}
                          disabled={!available || !checkIn || !checkOut}
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition ${!checkIn || !checkOut ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : available ? 'bg-[#FFB81C] text-[#004A99] hover:bg-yellow-400' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
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

      {/* 🟢 FRICTIONLESS BOOKING MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto border border-gray-100">
            <div className="bg-[#004A99] p-6 text-white flex justify-between items-start">
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
                <span className="text-3xl font-black text-[#004A99]">₦{calculateTotal(selectedRoom.pricePerNight).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              {!user && <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-xs font-bold mb-4">Please log in to your Airgo account to secure this booking.</div>}

              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Guest Name</label><input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#004A99] outline-none" value={clientData.name} onChange={(e) => setClientData({ ...clientData, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email (For Invoice)</label><input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#004A99] outline-none" value={clientData.email} onChange={(e) => setClientData({ ...clientData, email: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label><input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#004A99] outline-none" value={clientData.phone} onChange={(e) => setClientData({ ...clientData, phone: e.target.value })} /></div>
              </div>

              <p className="text-[10px] text-gray-500 leading-relaxed mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                🔒 By confirming, your funds will be securely held in the Airgo Escrow framework. The partner will only be paid upon successful completion of your stay. Cancellations are subject to a 70% refund policy.
              </p>

              <button disabled={isBooking || !user} type="submit" className={`w-full py-4 rounded-xl shadow-lg text-lg font-black text-[#004A99] transition mt-2 ${(isBooking || !user) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FFB81C] hover:bg-yellow-400'}`}>
                {isBooking ? 'Locking Inventory & Encrypting...' : 'Confirm Escrow Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}