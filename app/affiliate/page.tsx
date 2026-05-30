"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AffiliatePage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        websiteOrChannel: '',
        strategy: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const loadingToast = toast.loading("Submitting your application...");
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/affiliates/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            toast.dismiss(loadingToast);

            if (res.ok) {
                toast.success("Application submitted successfully!");
                setSubmitted(true);
            } else {
                toast.error(data.message || "Failed to submit application.");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Error connecting to server. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <main className="flex-grow max-w-6xl mx-auto py-16 px-6 w-full">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="bg-blue-100 text-[#000080] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                        Partner With Us
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-6">
                        Airgo Affiliate Program
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Earn premium commissions by introducing your audience to Nigeria's most trusted, escrow-protected booking platform for luxury hotel properties, suites, and executive car hires.
                    </p>
                </div>

                {/* Grid Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 text-[#000080] flex items-center justify-center rounded-2xl mb-4 text-2xl">💰</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">High Commission</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Earn up to 10% commission on every validated hotel booking and 5% on executive car fleet checkouts.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 text-[#000080] flex items-center justify-center rounded-2xl mb-4 text-2xl">🛡️</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Escrow-Assured</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            With Airgo Escrow Guarantee, trust rates are incredibly high, yielding industry-leading conversion ratios.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 text-[#000080] flex items-center justify-center rounded-2xl mb-4 text-2xl">📊</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Stats</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Track every click, dynamic registration, completed checkout, and accumulated commission in real time.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 text-[#000080] flex items-center justify-center rounded-2xl mb-4 text-2xl">⚡</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">On-Time Payouts</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Receive your earnings directly into your local or international bank account monthly on a fixed schedule.
                        </p>
                    </div>
                </div>

                {/* Form or Success Card */}
                <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200/80 p-8 md:p-12 shadow-md">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-6">🎉</div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4">Application Submitted!</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Thank you for applying to the Airgo.ng Affiliate Program. Our compliance and partner success team will review your channel and strategy. We will get back to you via email within 48 hours.
                            </p>
                            <Link href="/" className="inline-block bg-[#000080] text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-900 transition shadow-md">
                                Back to Homepage
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Become an Airgo Partner</h2>
                            <p className="text-gray-500 text-sm mb-8">
                                Complete the short application form below to request access to your custom affiliate code and marketing materials pool.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Full Name / Entity Name</label>
                                    <input 
                                        required 
                                        type="text" 
                                        className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none transition" 
                                        placeholder="e.g. John Doe or Travel Media LTD"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Email Address</label>
                                        <input 
                                            required 
                                            type="email" 
                                            className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none transition" 
                                            placeholder="e.g. partner@example.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Phone Number</label>
                                        <input 
                                            required 
                                            type="tel" 
                                            className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none transition" 
                                            placeholder="e.g. +234..."
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Website URL / Principal Social Media Channel</label>
                                    <input 
                                        required 
                                        type="url" 
                                        className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none transition" 
                                        placeholder="e.g. https://youtube.com/mychannel or https://myblog.com"
                                        value={formData.websiteOrChannel}
                                        onChange={e => setFormData({ ...formData, websiteOrChannel: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">How do you plan to promote Airgo?</label>
                                    <textarea 
                                        required 
                                        rows={4}
                                        className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none transition resize-none" 
                                        placeholder="Briefly describe your marketing strategy, audience size, and geographic target..."
                                        value={formData.strategy}
                                        onChange={e => setFormData({ ...formData, strategy: e.target.value })}
                                    />
                                </div>

                                <button 
                                    disabled={isSubmitting}
                                    type="submit" 
                                    className="w-full bg-[#000080] hover:bg-blue-900 text-white font-bold py-4 rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-100 flex items-center justify-center"
                                >
                                    {isSubmitting ? "Processing Application..." : "Submit Affiliate Request"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
