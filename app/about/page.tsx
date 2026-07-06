import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
    return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col pb-[72px] md:pb-0">
            

            <main className="flex-grow max-w-6xl mx-auto py-16 px-6 w-full">
                {/* HERO HEADER */}
                <div className="relative bg-[#000080] rounded-3xl overflow-hidden px-8 py-16 md:py-20 text-center mb-16 shadow-navy-lg">
                    {/* Ambient orbs */}
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#FFB81C]/8 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">About Airgo.ng</h1>
                    <p className="text-lg text-blue-100 max-w-3xl mx-auto relative z-10">
                        Airgo.ng is a fast-growing Online Travel Agency (OTA) dedicated to making travel simple, affordable, and stress-free for individuals, families, and businesses.
                    </p>
                </div>

                {/* 🟢 WHO WE ARE NARRATIVE */}
                <div className="bg-white p-10 md:p-12 rounded-3xl shadow-navy border border-gray-100 mb-16">
                    <h2 className="text-3xl font-black text-gray-900 mb-6">Who We Are</h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Airgo.ng was built to solve a real problem: in Nigeria, booking a hotel or hiring a car online too often ends in disappointment — or worse, fraud. We created Airgo as a verified marketplace where every transaction is escrow-protected, every partner is screened, and every customer has a real support line to call. We operate across Abuja and Kaduna, with plans to expand nationally. Behind Airgo is a team that believes trust should be the foundation of every booking.
                    </p>
                </div>

                {/* 🟢 INTERACTIVE CARD GRID (No Glow, Crisp Borders) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">



                    <div className="bg-white p-8 rounded-3xl shadow-navy border border-gray-100 hover:shadow-navy-lg hover:-translate-y-2 transition-all duration-300 cursor-default">
                        <div className="w-14 h-14 bg-[#F0F7FF] text-[#004A99] flex items-center justify-center rounded-xl mb-6 text-2xl">🏨</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Hotel Reservations</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Connect to a wide range of hotels worldwide, from budget-friendly accommodations to luxury stays. Explore verified listings and secure reservations that guarantee comfort and value.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-navy border border-gray-100 hover:shadow-navy-lg hover:-translate-y-2 transition-all duration-300 cursor-default">
                        <div className="w-14 h-14 bg-[#F0F7FF] text-[#004A99] flex items-center justify-center rounded-xl mb-6 text-2xl">🚘</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Car Rentals</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Dependable car rental services for ultimate convenience. From airport pickups to executive vehicle hire, access well-maintained vehicles and trusted partners to move around easily.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-navy border border-gray-100 hover:shadow-navy-lg hover:-translate-y-2 transition-all duration-300 cursor-default">
                        <div className="w-14 h-14 bg-[#F0F7FF] text-[#004A99] flex items-center justify-center rounded-xl mb-6 text-2xl">🎧</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">24/7 Support</h2>
                        <p className="text-gray-600 leading-relaxed">
                            A dedicated support team ready to assist you around the clock. Receive prompt assistance for bookings, inquiries, and travel-related concerns anytime, anywhere.
                        </p>
                    </div>

                </div>

                <div className="bg-[#000080] text-white p-10 md:p-12 rounded-3xl text-center shadow-navy-lg">
                    <h3 className="text-2xl font-black mb-4">Travel Smarter</h3>
                    <p className="text-blue-100 max-w-2xl mx-auto italic">
                        "At Airgo.ng, travel is not just about getting from one place to another—it’s about creating memorable experiences with ease and confidence."
                    </p>
                </div>
            </main>

            
        </div>
    );
}