"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import BookingModal from './bookings-modal';

// 🟢 PREMIUM HOTEL DATA
const featuredHotels = [
    {
        id: 1,
        name: "The Signature Suite at Eko",
        location: "Victoria Island, Lagos",
        price: "₦250,000",
        rating: 4.9,
        reviews: 128,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop",
        amenities: ["Ocean View", "Private Butler"]
    },
    {
        id: 6,
        name: "Fraser Executive Penthouse",
        location: "CBD, Abuja",
        price: "₦450,000",
        rating: 5.0,
        reviews: 42,
        image: "https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?q=80&w=1000&auto=format&fit=crop",
        amenities: ["City Panorama", "Private Pool"]
    },
    {
        id: 2,
        name: "Transcorp Executive Villa",
        location: "Maitama, Abuja",
        price: "₦320,000",
        rating: 4.8,
        reviews: 245,
        image: "https://images.unsplash.com/photo-1566073171589-28f136d8eb16?q=80&w=1000&auto=format&fit=crop",
        amenities: ["VIP Lounge", "Breakfast Included"]
    }
];

const recommendedHotels = [
    {
        id: 3,
        name: "The Wheatbaker Premium",
        location: "Ikoyi, Lagos",
        price: "₦180,000",
        rating: 4.7,
        reviews: 94,
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000&auto=format&fit=crop",
        amenities: ["Art Gallery", "Fine Dining", "Free WiFi"]
    },
    {
        id: 4,
        name: "Nordic Luxury Apartment",
        location: "Jabi, Abuja",
        price: "₦150,000",
        rating: 4.9,
        reviews: 312,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
        amenities: ["Kitchenette", "Smart Home", "Pool"]
    },
    {
        id: 5,
        name: "Legend Airport Suite",
        location: "Ikeja, Lagos",
        price: "₦200,000",
        rating: 4.6,
        reviews: 88,
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop",
        amenities: ["Runway View", "Executive Desk", "Lounge Access"]
    }
];

const categories = ["All", "Luxury", "Apartments", "Villas", "Penthouses", "Business"];

export default function HotelsPage() {
    const [selectedHotel, setSelectedHotel] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState("All");

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24">

            {/* 🟢 TOP NAVIGATION */}
            <nav className="bg-[#004A99] text-white py-4 px-8 flex justify-between items-center shadow-lg sticky top-0 z-40">
                <div className="flex items-center space-x-12">
                    <Link href="/">
                        <div className="text-2xl font-black text-white tracking-tight cursor-pointer">
                            Airgo<span className="text-[#FFB81C]">.ng</span>
                        </div>
                    </Link>
                    <div className="hidden md:flex space-x-6 font-semibold text-sm items-center">
                        <Link href="/hotels" className="text-[#FFB81C] border-b-2 border-[#FFB81C] pb-1">Hotels</Link>
                        <span className="text-blue-300 flex items-center cursor-not-allowed">
                            Flights <span className="ml-1.5 text-[9px] uppercase tracking-wider bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded-sm">Soon</span>
                        </span>
                        <Link href="/cars" className="hover:text-[#FFB81C] transition">Car Rentals</Link>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <Link href="/login">
                        <button className="bg-white text-[#004A99] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition shadow-md">
                            Sign In
                        </button>
                    </Link>
                </div>
            </nav>

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
                    <input
                        type="text"
                        placeholder="Search hotels, cities, or properties..."
                        className="w-full bg-transparent outline-none px-4 py-3 text-gray-700 font-medium"
                    />
                    <button className="bg-[#004A99] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-800 transition">
                        Search
                    </button>
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

                {/* 🟢 FEATURED STAYS (HORIZONTAL SCROLL LIKE APP) */}
                <div className="mb-10">
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-xl font-black text-gray-900">Featured Luxury Stays</h2>
                        <span className="text-[#004A99] font-bold text-sm hover:underline cursor-pointer">See all</span>
                    </div>

                    <div className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {featuredHotels.map((hotel) => (
                            <div key={hotel.id} className="min-w-[300px] md:min-w-[380px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
                                <div className="relative h-56 overflow-hidden">
                                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-md">
                                        <span className="text-xs font-black text-gray-900">⭐ {hotel.rating}</span>
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-[#FFB81C] text-[#004A99] font-black px-4 py-1.5 rounded-xl shadow-lg">
                                        {hotel.price}
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

                {/* 🟢 RECOMMENDED STAYS (VERTICAL STACK) */}
                <div>
                    <h2 className="text-xl font-black text-gray-900 mb-4">Recommended for You</h2>
                    <div className="grid grid-cols-1 gap-5">
                        {recommendedHotels.map((hotel) => (
                            <div key={hotel.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-4 items-center pr-5">
                                <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0">
                                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover rounded-xl" />
                                </div>
                                <div className="flex-1 py-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-base md:text-lg font-black text-gray-900 leading-tight">{hotel.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">📍 {hotel.location}</p>
                                        </div>
                                        <div className="hidden md:flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                            <span className="text-xs font-bold text-gray-900">⭐ {hotel.rating}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-4">
                                        <p className="text-lg font-black text-[#004A99]">{hotel.price}<span className="text-xs text-gray-500 font-medium">/night</span></p>
                                        <button
                                            onClick={() => setSelectedHotel(hotel)}
                                            className="bg-[#004A99] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition"
                                        >
                                            Book
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 🟢 LIVE BOOKING MODAL INJECTION */}
            <BookingModal
                isOpen={!!selectedHotel}
                onClose={() => setSelectedHotel(null)}
                hotel={selectedHotel}
            />

        </div>
    );
}