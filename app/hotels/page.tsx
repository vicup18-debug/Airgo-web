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
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
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
                        <h1 className="text-3xl font-black text-gray-900">Hello, Victor</h1>
                        <p className="text-gray-500 font-medium mt-1">Find your next premium stay</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-[#004A99] overflow-hidden shadow-sm">
                        <span className="text-lg font-bold text-[#004A99]">V</span>
                    </div>
                </div>

                {/* Floating Search Bar */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center mb-8 max-w-2xl mx-auto w-full">
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
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center mt-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 text-[#004A99] rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-[#004A99]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Curating Premium Properties</h2>
                        <p className="text-gray-500 mb-6">We are currently onboarding exclusive hotel partners. The Hotel booking engine will be live shortly.</p>
                        <Link href="/taxi">
                            <button className="bg-[#004A99] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-800 transition">Explore Taxi Services</button>
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
                                            <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 backdrop-blur-md">
                                                <svg className="w-3.5 h-3.5 text-[#FFB81C] fill-[#FFB81C]" viewBox="0 0 24 24">
                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                </svg>
                                                <span className="text-xs font-black text-gray-900">{hotel.rating || 'New'}</span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-black text-gray-900 truncate">{hotel.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {hotel.location}
                                            </p>
                                            <button
                                                onClick={() => setSelectedHotel(hotel)}
                                                className="w-full mt-4 bg-gray-50 hover:bg-[#F0F7FF] text-[#004A99] border border-[#E2E8F0] hover:border-[#004A99] py-3 rounded-xl font-bold transition-colors"
                                            >
                                                View Rooms
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