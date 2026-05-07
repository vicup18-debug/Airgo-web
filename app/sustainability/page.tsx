import React from 'react';
import Link from 'next/link';

export default function SustainabilityPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <nav className="bg-[#004A99] text-white py-4 px-8 border-b border-blue-800">
                <Link href="/">
                    <div className="text-2xl font-black tracking-tight cursor-pointer">
                        Airgo<span className="text-[#FFB81C]">.ng</span>
                    </div>
                </Link>
            </nav>

            <main className="flex-grow max-w-5xl mx-auto py-16 px-6 w-full">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Sustainability at Airgo.ng</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Sustainability is not just a trend—it’s a responsibility. We are committed to reducing the environmental footprint of travel by promoting responsible choices[cite: 427, 431].
                    </p>
                </div>

                {/* 🟢 INTERACTIVE INITIATIVE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

                    <div className="bg-white border border-gray-200 p-8 rounded-3xl hover:-translate-y-2 hover:border-[#38A169] transition-all duration-300">
                        <div className="w-12 h-12 bg-green-50 text-green-600 flex items-center justify-center rounded-full mb-6 text-xl">🌱</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Eco-Friendly Hotels</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            We collaborate with hotels that implement energy and water conservation systems, waste reduction, and the use of eco-friendly materials.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 p-8 rounded-3xl hover:-translate-y-2 hover:border-[#004A99] transition-all duration-300">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-full mb-6 text-xl">✈️</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Smarter Transit</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Partnering with airlines that prioritize fuel efficiency, and promoting low-emission vehicles and shared mobility for our car rentals.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 p-8 rounded-3xl hover:-translate-y-2 hover:border-[#FFB81C] transition-all duration-300">
                        <div className="w-12 h-12 bg-yellow-50 text-yellow-600 flex items-center justify-center rounded-full mb-6 text-xl">📱</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Digital-First</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Minimizing paper use and reducing operational waste by offering e-tickets, digital confirmations, and paperless transactions.
                        </p>
                    </div>

                </div>
            </main>

            <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
                <p>© 2026 Airgo.ng. All rights reserved.</p>
            </footer>
        </div>
    );
}