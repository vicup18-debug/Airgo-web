"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BookingModal from './bookings-modal';

const categories = ["All", "Luxury", "Apartments", "Villas", "Penthouses", "Business"];

export default function HotelsPage() {
    const [selectedHotel, setSelectedHotel] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState("All");

    // 🟢 NEW STATES FOR LIVE DATA
    const [liveHotels, setLiveHotels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🟢 FETCH FROM RENDER
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const apiUrl = 'https://airgo-backend.onrender.com';
                const response = await fetch(`${apiUrl}/api/hotels`);

                if (response.ok) {
                    const data = await response.json();
                    setLiveHotels(data);
                }
            } catch (error) {
                console.error("Error fetching hotels:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHotels();
    }, []);

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24">

            {/* 🟢 TOP NAVIGATION */}
            

            {/* 🟢 APP-STYLE DASHBOARD CONTAINER */}
            <div className="max-w-5xl mx-auto px-6 mt-8">

                {/* User Greeting & Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Hello, Victor 👋</h1>
                        <p className="text-gray-500 font-medium mt-1">Find your next premium stay</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-[#004A99] overflow-hidden shadow-sm">
                        <span className="text-lg font-bold text-[#004A99]">V</span>
                    </div>
                </div>

                {/* Floating Search Bar */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center mb-8">
                    <div className="pl-4 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input type="text" placeholder="Search hotels, cities, or properties..." className="w-full bg-transparent outline-none px-4 py-3 text-gray-700 font-medium" />
                    <button className="bg-[#004A99] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-800 transition">Search</button>
                </div>

                {/* App-Style Category Pills (Horizontal Scroll) */}
                <div className="flex overflow-x-auto gap-3 pb-4 mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${activeCategory === cat ? 'bg-[#004A99] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* 🟢 LOADING / EMPTY STATE HANDLING */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A99]"></div>
                    </div>
                ) : liveHotels.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center mt-10">
                        <div className="text-4xl mb-4">🏨</div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Curating Premium Properties</h2>
                        <p className="text-gray-500 mb-6">We are currently onboarding exclusive hotel partners. The Hotel booking engine will be live shortly.</p>
                        <Link href="/cars">
                            <button className="bg-[#004A99] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-800 transition">Explore Luxury Fleet</button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* 🟢 FEATURED STAYS (Live Data) */}
                        <div className="mb-10">
                            <div className="flex justify-between items-end mb-4">
                                <h2 className="text-xl font-black text-gray-900">Featured Luxury Stays</h2>
                            </div>

                            <div className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {liveHotels.map((hotel) => (
                                    <div key={hotel._id} className="min-w-[300px] md:min-w-[380px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
                                        <div className="relative h-56 overflow-hidden">
                                            <img src={hotel.image || 'https://via.placeholder.com/400'} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-md">
                                                <span className="text-xs font-black text-gray-900">⭐ {hotel.rating || 'New'}</span>
                                            </div>
                                            <div className="absolute bottom-4 right-4 bg-[#FFB81C] text-[#004A99] font-black px-4 py-1.5 rounded-xl shadow-lg">
                                                ₦{hotel.price?.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-black text-gray-900 truncate">{hotel.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">📍 {hotel.location}</p>
                                            <button
                                                onClick={() => setSelectedHotel(hotel)}
                                                className="w-full mt-4 bg-gray-50 hover:bg-[#F0F7FF] text-[#004A99] border border-[#E2E8F0] hover:border-[#004A99] py-3 rounded-xl font-bold transition-colors"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* 🟢 LIVE BOOKING MODAL INJECTION */}
            {selectedHotel && (
                <BookingModal
                    isOpen={!!selectedHotel}
                    onClose={() => setSelectedHotel(null)}
                    hotel={selectedHotel}
                />
            )}

        </div>
    );
}