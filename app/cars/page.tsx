"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import CarBookingModal from '../../components/CarBookingModal';

// 🟢 THE FALLBACK MATRIX: If the database is empty, we inject this premium fleet automatically so the site never looks broken!
const FALLBACK_FLEET = [
    {
        id: 'airgo_fleet_01',
        name: 'Mercedes-Benz G-Wagon G63',
        type: 'SUV',
        price: 350000,
        capacity: '5',
        features: 'Chauffeur Driven, V8 Biturbo, Leather Interior',
        image: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&w=800&q=80',
        partnerId: 'airgo_direct',
        isFallback: true,
        location: 'Maitama',
        state: 'Abuja',
        vehicleNumber: 'ABJ-888-GW',
        totalAllocated: 1,
        vehicleCategory: 'car'
    }
];

export default function CarsPage() {
    const [selectedCar, setSelectedCar] = useState<any>(null);
    const [carFleet, setCarFleet] = useState<any[]>(FALLBACK_FLEET);
    const [isLoading, setIsLoading] = useState(false);

    // SEARCH BAR STATES
    const [searchQuery, setSearchQuery] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [transportType, setTransportType] = useState('all'); // 'all' | 'car' | 'shuttle'
    const [isTransportTypeOpen, setIsTransportTypeOpen] = useState(false);

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('airgo_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const fetchCars = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
                const res = await fetch(`${apiUrl}/api/cars`);

                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setCarFleet(data);
                    } else {
                        setCarFleet(FALLBACK_FLEET); // 🟢 Inject fallback if DB is empty
                    }
                }
            } catch (error) {
                console.log("Error fetching fleet, using fallback data.");
            }
        };

        fetchCars();
    }, []);

    // LIVE FILTERING LOGIC
    const filteredCars = carFleet.filter(car => {
        // 1. Location/State match
        const matchesLocation = !searchQuery || (
            (car.location && car.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (car.state && car.state.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        // 2. Transport type match
        const matchesTransportType = transportType === 'all' ||
            (transportType === 'car' && car.vehicleCategory === 'car') ||
            (transportType === 'shuttle' && car.vehicleCategory === 'shuttle');

        return matchesLocation && matchesTransportType;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-[72px] md:pb-0 flex flex-col">

            

            

            {/* HEADER */}
            <div className="flex-grow">
                <header className="bg-[#000080] pb-32 pt-12 px-6 rounded-b-[2.5rem] md:rounded-none relative text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Premium Executive Fleet</h1>
                        <p className="text-sm md:text-lg text-blue-100 max-w-2xl mx-auto">
                            Arrive in style. Book luxury vehicles and executive sedans with professional chauffeurs or self-drive options.
                        </p>
                    </div>
                </header>

                {/* FLOATING SEARCH BAR */}
                <div className="max-w-3xl mx-auto px-4 -mt-24 relative z-10 mb-12">
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                        <form className="flex flex-col md:flex-row gap-4">
                            <div className="flex-[2]">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">State / Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Lagos, Abuja, Lekki..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] focus:ring-2 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Pickup</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Return</label>
                                <input
                                    type="date"
                                    min={pickupDate || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Vehicle Type</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsTransportTypeOpen(!isTransportTypeOpen)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-950 focus:border-[#000080] outline-none text-left flex items-center justify-between cursor-pointer"
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
                                            <div className="absolute z-50 mt-2 w-full bg-white rounded-xl border border-gray-150 shadow-xl overflow-hidden py-1">
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
                        </form>
                    </div>
                </div>

                {/* FLEET GRID */}
                <div className="max-w-7xl mx-auto px-6 mb-16">
                    {isLoading ? (
                        <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Loading Live Fleet...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCars.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-900 font-bold text-xl">No vehicles matched your search.</p>
                                    <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                                </div>
                            ) : (
                                filteredCars.map((car) => {
                                    const rawPrice = car.retailPrice !== undefined && car.retailPrice !== null ? car.retailPrice : car.price;
                                    const numericPrice = typeof rawPrice === 'string'
                                        ? parseInt(rawPrice.replace(/[^0-9]/g, ''))
                                        : (typeof rawPrice === 'object' && rawPrice !== null && rawPrice.$numberDecimal)
                                            ? Number(rawPrice.$numberDecimal)
                                            : Number(rawPrice) || 0;
                                    const discountedPrice = Math.round(numericPrice * (1 - (car.discountPercentage || 0) / 100));

                                    return (
                                        <div key={car._id || car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 group flex flex-col animate-fade-in">
                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    src={car.image}
                                                    alt={car.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                                                    {car.type}
                                                </div>
                                                {car.discountPercentage > 0 && (
                                                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md animate-pulse">
                                                        {car.discountPercentage}% OFF
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 flex flex-col flex-grow">
                                                <h3 className="text-xl font-bold text-gray-900 leading-tight">{car.name}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-1 mb-4">
                                                    <span className="text-xs font-bold text-gray-500">👤 Up to {car.capacity} Passengers</span>
                                                    {car.location && car.state && (
                                                        <span className="text-xs font-black text-[#000080] bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">📍 {car.location}, {car.state}</span>
                                                    )}
                                                </div>

                                                <div className="bg-gray-50 p-3 rounded-lg mb-6 border border-gray-100 flex-grow">
                                                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{car.features}</p>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center border-t border-gray-100 pt-4 mt-auto">
                                                    <div>
                                                        <p className="text-xl font-black text-[#000080] italic">
                                                            Bids from Drivers
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Fare pricing</p>
                                                    </div>
                                                    {car.isFallback ? (
                                                        <a
                                                            href={`https://wa.me/2348026696170?text=Hi, I want to enquire about the ${encodeURIComponent(car.name)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full sm:w-auto bg-[#25D366] text-white px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-[#1ebd57] transition shadow-md text-center whitespace-nowrap"
                                                        >
                                                            Enquire via WhatsApp
                                                        </a>
                                                    ) : (
                                                        <button
                                                            onClick={() => setSelectedCar(car)}
                                                            className="w-full sm:w-auto bg-[#FFB81C] text-[#000080] px-6 py-3 rounded-xl font-black text-sm hover:bg-yellow-400 transition shadow-md text-center"
                                                        >
                                                            Book Escrow
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            

            {/* LIVE CAR BOOKING MODAL */}
            <CarBookingModal
                isOpen={!!selectedCar}
                onClose={() => setSelectedCar(null)}
                car={selectedCar}
                initialCheckIn={pickupDate}
                initialCheckOut={returnDate}
            />

            
        </div>
    );
}

