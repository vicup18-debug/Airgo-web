"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function SupportPage() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            alert("Please fill out all fields.");
            return;
        }
        alert("Message Sent! Our 24/7 support team will contact you shortly.");
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            

            <main className="flex-grow max-w-6xl mx-auto py-16 px-6 w-full flex flex-col md:flex-row gap-12">

                {/* 🟢 LEFT SIDE: CONTACT INFO */}
                <div className="w-full md:w-5/12 flex flex-col justify-center">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">How can we help?</h1>
                    <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                        Airgo.ng stands out with its commitment to customer satisfaction. With a dedicated 24/7 customer support team, users receive prompt assistance for bookings, inquiries, and travel-related concerns anytime, anywhere.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-[#004A99] transition duration-300">
                            <div className="w-14 h-14 bg-[#F0F7FF] text-[#004A99] flex items-center justify-center rounded-full text-2xl mr-6">📞</div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Call Us 24/7</h3>
                                <p className="text-xl font-black text-gray-900">+234 707 834 4409</p>
                            </div>
                        </div>

                        <div className="flex items-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-[#004A99] transition duration-300">
                            <div className="w-14 h-14 bg-[#F0F7FF] text-[#004A99] flex items-center justify-center rounded-full text-2xl mr-6">✉️</div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Email Support</h3>
                                <p className="text-xl font-black text-gray-900">info@airgo.ng</p>
                                <p className="text-sm text-gray-500">airgotravelandtour@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🟢 RIGHT SIDE: MESSAGE FORM */}
                <div className="w-full md:w-7/12">
                    <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">Send a Direct Message</h2>
                        <form onSubmit={handleSend} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004A99] bg-gray-50 transition"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004A99] bg-gray-50 transition"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">How can we assist you?</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004A99] bg-gray-50 transition h-40 resize-none"
                                    placeholder="Please include any relevant booking reference numbers..."
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full bg-[#004A99] text-white py-4 rounded-xl font-black text-lg hover:bg-blue-800 transition shadow-md">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>

            </main>

            
        </div>
    );
}