"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function HotelHomepage() {
  const [location, setLocation] = useState('');
  const [dates, setDates] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 md:pb-0">

      {/* 🟢 DESKTOP NAVIGATION (Hidden on Mobile) */}
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
          <Link href="/login">
            <button className="bg-white text-[#004A99] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition shadow-md">
              Sign In / Dashboard
            </button>
          </Link>
        </div>
      </nav>

      {/* 🟢 MOBILE TOP BAR (App-like Header) */}
      <div className="md:hidden bg-[#004A99] text-white py-4 px-6 sticky top-0 z-40 shadow-md flex justify-between items-center">
        <div className="text-xl font-black tracking-tight">
          Airgo<span className="text-[#FFB81C]">.ng</span>
        </div>
        <Link href="/login">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#004A99] font-bold shadow-sm">
            👤
          </div>
        </Link>
      </div>

      {/* 🟢 HERO & SEARCH ENGINE */}
      <header className="bg-[#004A99] pt-8 pb-32 px-6 rounded-b-[2.5rem] md:rounded-none relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">Find Your Perfect Stay</h1>
          <p className="text-blue-100 text-sm md:text-lg mb-8">Secure luxury hotels with Airgo Escrow Protection.</p>
        </div>
      </header>

      {/* 🟢 FLOATING SEARCH BOX */}
      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <form className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Where to?</label>
              <input
                type="text"
                placeholder="City, Hotel, or Neighborhood"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#004A99] focus:ring-2 outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Dates</label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#004A99] focus:ring-2 outline-none"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                className="w-full md:w-auto bg-[#FFB81C] text-[#004A99] px-8 py-3.5 rounded-xl font-black hover:bg-yellow-400 transition shadow-md"
              >
                Search Hotels
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🟢 FEATURED HOTELS PREVIEW */}
      <div className="max-w-4xl mx-auto px-6 mt-12 mb-8">
        <h2 className="text-xl font-black text-gray-900 mb-6">Popular Destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl h-48 bg-[url('https://images.unsplash.com/photo-1551882547-ff40c0d5e9af?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-bold text-lg">Lagos</p>
              <p className="text-xs text-gray-300">124 Properties</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl h-48 bg-[url('https://images.unsplash.com/photo-1542314831-c6a4d27ece11?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-bold text-lg">Abuja</p>
              <p className="text-xs text-gray-300">86 Properties</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 MOBILE BOTTOM NAVIGATION (Fixed the Profile link!) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center text-[#004A99]">
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L4 9v12h5v-7h6v7h5V9z" /></svg>
          <span className="text-[10px] font-bold">Hotels</span>
        </Link>
        <Link href="/cars" className="flex flex-col items-center text-gray-400 hover:text-[#004A99] transition">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          <span className="text-[10px] font-bold">Cars</span>
        </Link>
        <Link href="/login" className="flex flex-col items-center text-gray-400 hover:text-[#004A99] transition">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-bold">Account</span>
        </Link>
      </div>

    </div>
  );
}