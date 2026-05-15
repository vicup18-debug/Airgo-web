"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HotelHomepage() {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const [user, setUser] = useState<any>(null);

  // 🟢 Live Database States
  const [liveHotels, setLiveHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check for logged-in user
    const userData = localStorage.getItem('airgo_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // 2. Fetch Real Hotels from Database
    const fetchHotels = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
        const res = await fetch(`${apiUrl}/api/hotels`);
        if (res.ok) {
          const data = await res.json();
          setLiveHotels(data);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 md:pb-0">

      {/* SMART DESKTOP NAVIGATION */}
      <nav className="hidden md:flex bg-[#004A99] text-white py-4 px-8 justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center space-x-12">
          <Link href="/">
            <div className="text-2xl font-black text-white tracking-tight cursor-pointer">
              Airgo<span className="text-[#FFB81C]">.ng</span>
            </div>
          </Link>
          <div className="flex space-x-6 font-semibold text-sm items-center">
            <Link href="/" className="text-[#FFB81C] border-b-2 border-[#FFB81C] pb-1">Hotels</Link>
            <span className="text-blue-300 flex items-center cursor-not-allowed">
              Flights <span className="ml-1.5 text-[9px] uppercase tracking-wider bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded-sm">Soon</span>
            </span>
            <Link href="/cars" className="hover:text-[#FFB81C] transition">Car Rentals</Link>
          </div>
        </div>
        <div>
          {user ? (
            <Link href={user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard'}>
              <button className="bg-[#FFB81C] text-[#004A99] px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition shadow-md">
                Dashboard
              </button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="bg-white text-[#004A99] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition shadow-md">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* SMART MOBILE TOP BAR */}
      <div className="md:hidden bg-[#004A99] text-white py-4 px-6 sticky top-0 z-40 shadow-md flex justify-between items-center">
        <div className="text-xl font-black tracking-tight">
          Airgo<span className="text-[#FFB81C]">.ng</span>
        </div>
        <Link href={user ? (user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard') : '/login'}>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#004A99] font-bold shadow-sm">
            {user ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>
        </Link>
      </div>

      {/* HERO & SEARCH ENGINE */}
      <header className="bg-[#004A99] pt-8 pb-32 px-6 rounded-b-[2.5rem] md:rounded-none relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">Find Your Perfect Stay</h1>
          <p className="text-blue-100 text-sm md:text-lg mb-8">Secure luxury hotels with Airgo Escrow Protection.</p>
        </div>
      </header>

      {/* SEARCH BOX */}
      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <form className="flex flex-col md:flex-row gap-4">
            <div className="flex-[2]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Where to?</label>
              {/* 🟢 ADDED text-gray-900 to fix invisible text */}
              <input type="text" placeholder="City, Hotel, or Neighborhood" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#004A99] focus:ring-2 outline-none" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Check In</label>
              {/* 🟢 ADDED text-gray-900 to fix invisible text */}
              <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#004A99] outline-none" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Check Out</label>
              {/* 🟢 ADDED text-gray-900 to fix invisible text */}
              <input type="date" min={checkIn || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#004A99] outline-none" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button type="button" className="w-full md:w-auto bg-[#FFB81C] text-[#004A99] px-8 py-3.5 rounded-xl font-black hover:bg-yellow-400 transition shadow-md">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* LIVE FEATURED PROPERTIES */}
      <div className="max-w-5xl mx-auto px-6 mt-12 mb-8">
        <h2 className="text-xl font-black text-gray-900 mb-6">Featured Properties</h2>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500 font-bold animate-pulse">Connecting to live inventory...</div>
        ) : liveHotels.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center shadow-sm">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-xl font-black text-[#004A99] mb-2">Curating Premium Stays</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Our hotel partners are currently onboarding their properties. Please check back shortly to view our exclusive inventory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveHotels.slice(0, 3).map((hotel) => (
              <div key={hotel._id || hotel.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition group cursor-pointer">
                <div className="h-48 overflow-hidden relative">
                  <img src={hotel.image || 'https://via.placeholder.com/600'} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                    <p className="text-xs font-black text-[#004A99]">₦{typeof hotel.price === 'number' ? hotel.price.toLocaleString() : hotel.price}</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{hotel.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">📍 {hotel.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center text-[#004A99]">
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L4 9v12h5v-7h6v7h5V9z" /></svg>
          <span className="text-[10px] font-bold">Hotels</span>
        </Link>
        <Link href="/cars" className="flex flex-col items-center text-gray-400 hover:text-[#004A99] transition">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          {/* 🟢 CHANGED from "Cars" to "Car Rental" */}
          <span className="text-[10px] font-bold">Car Rental</span>
        </Link>
        <Link href={user ? (user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard') : '/login'} className="flex flex-col items-center text-gray-400 hover:text-[#004A99] transition">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-bold">Account</span>
        </Link>
      </div>

    </div>
  );
}