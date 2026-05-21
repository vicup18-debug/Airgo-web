"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function FlightsPage() {
    const [flights] = useState([
        { id: 1, airline: "Air Peace", route: "LOS (Lagos) → ABV (Abuja)", time: "08:00 AM - 09:15 AM", duration: "1h 15m", price: "₦85,000", type: "Direct" },
        { id: 2, airline: "Ibom Air", route: "LOS (Lagos) → ABV (Abuja)", time: "10:30 AM - 11:45 AM", duration: "1h 15m", price: "₦92,000", type: "Direct" },
        { id: 3, airline: "British Airways", route: "LOS (Lagos) → LHR (London)", time: "10:50 PM - 05:30 AM", duration: "6h 40m", price: "₦1,850,000", type: "Direct" },
    ]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            

            <div className="max-w-7xl mx-auto py-8 px-6 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-1/4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-8">
                    <h2 className="text-lg font-black text-gray-900 mb-6">Filter Flights</h2>
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-700 mb-3">Stops</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <label className="flex items-center space-x-2"><input type="checkbox" className="rounded text-[#004A99]" defaultChecked /> <span>Direct only</span></label>
                            <label className="flex items-center space-x-2"><input type="checkbox" className="rounded text-[#004A99]" /> <span>1 Stop</span></label>
                        </div>
                    </div>
                </aside>

                {/* Results */}
                <main className="w-full md:w-3/4 flex flex-col gap-4">
                    <h1 className="text-2xl font-black text-gray-900 mb-4">Available Flights</h1>
                    {flights.map((flight) => (
                        <div key={flight.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition">
                            <div className="flex flex-col mb-4 md:mb-0">
                                <span className="text-sm font-bold text-gray-500 mb-1">{flight.airline}</span>
                                <span className="text-lg font-black text-[#004A99]">{flight.time}</span>
                                <span className="text-sm text-gray-600">{flight.route}</span>
                            </div>
                            <div className="text-center hidden md:block">
                                <span className="text-xs text-gray-400 font-bold block">{flight.duration}</span>
                                <div className="w-24 border-b-2 border-gray-300 my-1 relative">
                                    <span className="absolute -top-2.5 left-10 text-gray-400">✈️</span>
                                </div>
                                <span className="text-xs text-green-600 font-bold">{flight.type}</span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-2xl font-black text-gray-900">{flight.price}</span>
                                <button className="mt-2 bg-[#FFB81C] text-[#004A99] px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition">Select</button>
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
}