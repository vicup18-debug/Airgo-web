"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function CorporatePage() {
    const [formData, setFormData] = useState({ name: '', company: '', email: '', message: '' });

    const handleWhatsAppSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const text = `Hi, I am interested in Corporate Services. 
Name: ${formData.name}
Company: ${formData.company}
Email: ${formData.email}
Message: ${formData.message}`;
        window.open(`https://wa.me/2347078344409?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            

            <main className="flex-grow max-w-4xl mx-auto py-16 px-6 w-full">
                <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Corporate Contract Services</h1>

                    <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                        <p>At Airgo.ng, we understand that corporate travel requires efficiency, cost control, flexibility, and reliable support. Our Corporate Contract Service is designed to help businesses streamline their travel operations while enjoying exclusive benefits, negotiated rates, and dedicated account management.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">What is a Corporate Contract?</h2>
                        <p>A corporate contract is a customized travel management agreement between Airgo.ng and your organization. It enables your company to access special travel rates, structured booking processes, and dedicated support for all your travel needs—including flight bookings, hotel reservations, and car rental services.</p>

                        <div className="bg-[#F0F7FF] border border-blue-100 p-8 rounded-2xl mt-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Key Benefits of Partnering with Airgo.ng</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700 font-medium">
                                <li>Cost Optimization through negotiated deals</li>
                                <li>Dedicated Account Management</li>
                                <li>24/7 Priority Support</li>
                                <li>Detailed Reporting & Analytics</li>
                                <li>Flexible Payment Options, including invoicing</li>
                            </ul>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">Get Started Today</h2>
                        <p>Partner with Airgo.ng and transform the way your organization manages travel. Contact our corporate team today to discuss your needs and discover how our tailored corporate contract solutions can support your business growth. Airgo.ng – Simplifying Corporate Travel, Empowering Your Business.</p>
                    </div>

                    {/* 🟢 CTA SECTION */}
                    <div className="mt-16 border-t border-gray-100 pt-12">
                        <h2 className="text-3xl font-black text-[#000080] mb-6">Start Your Corporate Agreement</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <p className="text-gray-600">Reach out to our corporate team directly or fill out the inquiry form to get a personalized consultation.</p>
                                <div className="space-y-4 text-gray-800 font-medium">
                                    <p className="flex items-center gap-3">
                                        <span className="text-xl">✉️</span> 
                                        <a href="mailto:Info@airgo.ng" className="hover:text-[#000080] transition">Info@airgo.ng</a>
                                    </p>
                                    <p className="flex items-center gap-3">
                                        <span className="text-xl">📞</span> 
                                        <a href="tel:+2347078344409" className="hover:text-[#000080] transition">+234 707 834 4409 (Corporate Line)</a>
                                    </p>
                                    <p className="flex items-center gap-3">
                                        <span className="text-xl">💬</span> 
                                        <a href="https://wa.me/2347078344409" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-bold transition">Message Us on WhatsApp</a>
                                    </p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleWhatsAppSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                    <input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
                                    <textarea required rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                                </div>
                                <button type="submit" className="w-full bg-[#000080] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition shadow-md">
                                    Send Inquiry
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            
        </div>
    );
}