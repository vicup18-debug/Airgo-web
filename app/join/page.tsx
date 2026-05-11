"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function PartnerRegisterPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-[#004A99] text-white py-4 px-8 flex justify-between items-center shadow-md">
                <Link href="/">
                    <div className="text-2xl font-black tracking-tight cursor-pointer">
                        Airgo<span className="text-[#FFB81C]">.ng</span>
                    </div>
                </Link>
            </nav>

            <div className="max-w-4xl mx-auto py-16 px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">List Your Property on Airgo</h1>
                        <p className="text-gray-600 text-lg">Reach thousands of travelers and corporate clients daily. Partner with Nigeria's fastest-growing OTA.</p>
                    </div>

                    <form className="space-y-6 max-w-2xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004A99]" placeholder="John" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004A99]" placeholder="Doe" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Property Name</label>
                            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004A99]" placeholder="e.g. The Grand Hotel" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004A99]" placeholder="manager@hotel.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Property Type</label>
                            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004A99] bg-white">
                                <option>Hotel</option>
                                <option>Apartment / Shortlet</option>
                                <option>Resort</option>
                                <option>Car Rental Fleet</option>
                            </select>
                        </div>

                        <button type="button" className="w-full mt-8 bg-[#004A99] text-white py-4 rounded-lg font-black text-lg hover:bg-blue-800 transition shadow-lg">
                            Start Registration
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}