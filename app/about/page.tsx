import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <nav className="bg-[#004A99] text-white py-4 px-8 border-b border-blue-800">
                <Link href="/">
                    <div className="text-2xl font-black tracking-tight cursor-pointer">
                        Airgo<span className="text-[#FFB81C]">.ng</span>
                    </div>
                </Link>
            </nav>

            <main className="flex-grow max-w-6xl mx-auto py-16 px-6 w-full">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">About Airgo.ng</h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Airgo.ng is a fast-growing Online Travel Agency (OTA) dedicated to making travel simple, affordable, and stress-free for individuals, families, and businesses.
                    </p>
                </div>

                {/* 🟢 INTERACTIVE CARD GRID (No Glow, Crisp Borders) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

                    <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-[#004A99] hover:-translate-y-2 transition-all duration-300 cursor-default">
                        <div className="w-14 h-14 bg-[#F0F7FF] text-[#004A99] flex items-center justify-center rounded-xl mb-6 text-2xl">✈️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Flight Bookings</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Find the best flight deals quickly and easily. Search, compare, and book flights across multiple airlines, ensuring competitive prices and flexible travel options with instant confirmation.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-[#004A99] hover:-translate-y-2 transition-all duration-300 cursor-default">
                        <div className="w-14 h-14 bg-[#F0F7FF] text-[#004A99] flex items-center justify-center rounded-xl mb-6 text-2xl">🏨</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Hotel Reservations</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Connect to a wide range of hotels worldwide, from budget-friendly accommodations to luxury stays. Explore verified listings and secure reservations that guarantee comfort and value.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-[#004A99] hover:-translate-y-2 transition-all duration-300 cursor-default">
                        <div className="w-14 h-14 bg-[#F0F7FF] text-[#004A99] flex items-center justify-center rounded-xl mb-6 text-2xl">🚘</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Car Rentals</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Dependable car rental services for ultimate convenience. From airport pickups to executive vehicle hire, access well-maintained vehicles and trusted partners to move around easily.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-[#004A99] hover:-translate-y-2 transition-all duration-300 cursor-default">
                        <div className="w-14 h-14 bg-[#F0F7FF] text-[#004A99] flex items-center justify-center rounded-xl mb-6 text-2xl">🎧</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">24/7 Support</h2>
                        <p className="text-gray-600 leading-relaxed">
                            A dedicated support team ready to assist you around the clock. Receive prompt assistance for bookings, inquiries, and travel-related concerns anytime, anywhere.
                        </p>
                    </div>

                </div>

                <div className="bg-[#004A99] text-white p-10 md:p-12 rounded-3xl text-center">
                    <h3 className="text-2xl font-black mb-4">Travel Smarter</h3>
                    <p className="text-blue-100 max-w-2xl mx-auto italic">
                        "At Airgo.ng, travel is not just about getting from one place to another—it’s about creating memorable experiences with ease and confidence."
                    </p>
                </div>
            </main>

            <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
                <p>© 2026 Airgo.ng. All rights reserved.</p>
            </footer>
        </div>
    );
}