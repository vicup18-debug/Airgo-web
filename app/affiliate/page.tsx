"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ReferralBooking {
    _id: string;
    itemName: string;
    itemType: 'hotel' | 'car';
    totalPrice: string;
    status: string;
    createdAt: string;
    affiliateCredited: boolean;
}

export default function AffiliatePage() {
    // viewMode: 'apply' | 'login' | 'dashboard'
    const [viewMode, setViewMode] = useState<'apply' | 'login' | 'dashboard'>('apply');
    
    // Apply Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        websiteOrChannel: '',
        strategy: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Login Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Dashboard State
    const [activeAffiliate, setActiveAffiliate] = useState<any>(null);
    const [referredBookings, setReferredBookings] = useState<ReferralBooking[]>([]);
    const [isFetchingDashboard, setIsFetchingDashboard] = useState(false);

    // Auto-login if session exists in localStorage
    useEffect(() => {
        const savedEmail = localStorage.getItem('airgo_affiliate_email');
        if (savedEmail) {
            fetchAffiliateDashboard(savedEmail, true);
        }
    }, []);

    const fetchAffiliateDashboard = async (email: string, autoLogin = false) => {
        setIsFetchingDashboard(true);
        if (!autoLogin) setIsLoggingIn(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/affiliates/by-email/${encodeURIComponent(email.trim().toLowerCase())}`);
            const data = await res.json();

            if (res.ok) {
                setActiveAffiliate(data.affiliate);
                setReferredBookings(data.bookings || []);
                localStorage.setItem('airgo_affiliate_email', email.trim().toLowerCase());
                setViewMode('dashboard');
                if (!autoLogin) toast.success("Access granted to affiliate portal!");
            } else {
                if (autoLogin) {
                    localStorage.removeItem('airgo_affiliate_email');
                } else {
                    toast.error(data.message || "Access denied. Check your email or registration status.");
                }
            }
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            if (!autoLogin) toast.error("Error connecting to server. Please try again.");
        } finally {
            setIsFetchingDashboard(false);
            setIsLoggingIn(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            toast.error("Please enter a valid email address.");
            setIsSubmitting(false);
            return;
        }

        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!phoneRegex.test(formData.phone.trim())) {
            toast.error("Please enter a valid phone number (10-15 digits).");
            setIsSubmitting(false);
            return;
        }

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

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) {
            toast.error("Email and password are required.");
            return;
        }
        setIsLoggingIn(true);
        const loadingToast = toast.loading("Signing in...");
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/affiliates/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });
            const data = await res.json();
            toast.dismiss(loadingToast);

            if (res.ok) {
                setActiveAffiliate(data.affiliate);
                setReferredBookings(data.bookings || []);
                localStorage.setItem('airgo_affiliate_email', loginEmail.trim().toLowerCase());
                setViewMode('dashboard');
                toast.success("Welcome to your Affiliate Dashboard!");
            } else {
                toast.error(data.message || "Invalid credentials.");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Login error:", error);
            toast.error("Error connecting to server. Please try again.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('airgo_affiliate_email');
        setActiveAffiliate(null);
        setReferredBookings([]);
        setViewMode('apply');
        toast.success("Signed out of affiliate portal.");
    };

    const copyReferralLink = () => {
        if (!activeAffiliate) return;
        const refUrl = `https://airgo.ng/?ref=${encodeURIComponent(activeAffiliate.email)}`;
        navigator.clipboard.writeText(refUrl)
            .then(() => toast.success("📋 Referral link copied to clipboard!"))
            .catch(() => toast.error("Failed to copy link."));
    };

    // Calculate dynamic commission statistics
    const calculateCommissions = () => {
        return referredBookings.reduce((acc, b) => {
            const price = typeof b.totalPrice === 'string'
                ? parseInt(b.totalPrice.replace(/[^0-9]/g, ''))
                : Number(b.totalPrice) || 0;
            const rate = b.itemType === 'hotel' ? 0.10 : 0.05;
            const commission = Math.round(price * rate);
            
            if (b.status === 'Paid' || b.status === 'Paid Out' || b.status === 'Approved for Disbursement') {
                acc.settled += commission;
            } else {
                acc.pending += commission;
            }
            return acc;
        }, { settled: 0, pending: 0 });
    };

    const commissionStats = calculateCommissions();

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <main className="flex-grow max-w-6xl mx-auto py-12 px-6 w-full">
                
                {/* 🟢 NAVIGATION TABS (Only shown if not logged in to dashboard) */}
                {viewMode !== 'dashboard' && (
                    <div className="flex justify-center gap-4 mb-12">
                        <button
                            onClick={() => setViewMode('apply')}
                            className={`px-6 py-2.5 rounded-full text-sm font-black transition-all ${
                                viewMode === 'apply'
                                    ? 'bg-[#000080] text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            Become a Partner
                        </button>
                        <button
                            onClick={() => setViewMode('login')}
                            className={`px-6 py-2.5 rounded-full text-sm font-black transition-all ${
                                viewMode === 'login'
                                    ? 'bg-[#000080] text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            Affiliate Portal Login
                        </button>
                    </div>
                )}

                {/* 🟢 VIEW 1: REGISTRATION / APPLICATION FORM */}
                {viewMode === 'apply' && (
                    <>
                        {/* Header */}
                        <div className="text-center mb-16 animate-fade-in">
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
                            <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-blue-50 text-[#000080] flex items-center justify-center rounded-2xl mb-4 text-2xl">💰</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">High Commission</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Earn up to 10% commission on every validated hotel booking and 5% on executive car fleet checkouts.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-blue-50 text-[#000080] flex items-center justify-center rounded-2xl mb-4 text-2xl">🛡️</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Escrow-Assured</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    With Airgo Escrow Guarantee, trust rates are incredibly high, yielding industry-leading conversion ratios.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-blue-50 text-[#000080] flex items-center justify-center rounded-2xl mb-4 text-2xl">📊</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Stats</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Track every click, dynamic registration, completed checkout, and accumulated commission in real time.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-md transition">
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
                                    <button onClick={() => setViewMode('login')} className="inline-block bg-[#000080] text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-900 transition shadow-md">
                                        Proceed to Login
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 mb-2">Become an Airgo Partner</h2>
                                    <p className="text-gray-500 text-sm mb-8">
                                        Complete the short application form below to request access to your custom affiliate code and marketing materials pool.
                                    </p>

                                    <form onSubmit={handleApply} className="space-y-6">
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
                                            <label className="block text-xs font-bold text-gray-950 uppercase mb-1.5">Create Password</label>
                                            <input 
                                                required 
                                                type="password" 
                                                minLength={6}
                                                className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none transition" 
                                                placeholder="Minimum 6 characters"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
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
                    </>
                )}

                {/* 🟢 VIEW 2: PASSWORD LOGIN PORTAL */}
                {viewMode === 'login' && (
                    <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-200 p-8 md:p-10 shadow-lg animate-fade-in mt-12">
                        <div className="text-center mb-8">
                            <div className="text-4xl mb-4">🔐</div>
                            <h2 className="text-2xl font-black text-gray-900">Affiliate Portal</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Access your real-time referred metrics and dashboard.
                            </p>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-950 uppercase mb-1.5">Registered Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="partner@example.com"
                                    className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                                    value={loginEmail}
                                    onChange={e => setLoginEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-950 uppercase mb-1.5">Password</label>
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                                    value={loginPassword}
                                    onChange={e => setLoginPassword(e.target.value)}
                                />
                            </div>

                            <button
                                disabled={isLoggingIn}
                                type="submit"
                                className="w-full bg-[#000080] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center"
                            >
                                {isLoggingIn ? "Signing In..." : "Sign In"}
                            </button>
                        </form>
                    </div>
                )}

                {/* 🟢 VIEW 3: LIVE AFFILIATE DASHBOARD */}
                {viewMode === 'dashboard' && activeAffiliate && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Dashboard Top Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-sm">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Affiliate Center</h1>
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                        Approved Partner
                                    </span>
                                </div>
                                <p className="text-gray-500 font-semibold mt-1">Welcome back, {activeAffiliate.name} 👋</p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-5 py-2.5 rounded-xl text-sm font-black transition border border-red-100/50"
                            >
                                Sign Out of Portal
                            </button>
                        </div>

                        {/* Quick Statistics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-[#000080] to-blue-900 p-6 rounded-3xl shadow-lg text-white">
                                <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Commissions Paid</p>
                                <p className="text-3xl font-black mb-2">₦{(activeAffiliate.commissionEarned || 0).toLocaleString()}</p>
                                <p className="text-[10px] text-blue-300">Accumulated unpayout earnings in account.</p>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Referrals</p>
                                    <p className="text-3xl font-black text-gray-900">{referredBookings.length}</p>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold mt-2 border-t pt-2">Successful referred checkout listings</p>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Commissions</p>
                                    <p className="text-3xl font-black text-[#000080]">₦{commissionStats.pending.toLocaleString()}</p>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold mt-2 border-t pt-2">Awaiting reservation checks completion</p>
                            </div>
                        </div>

                        {/* Referral Link Sharing Tool */}
                        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-blue-900 flex items-center gap-2 mb-1">🔗 Your Unique Referral Link</h3>
                                <p className="text-xs text-blue-700 leading-relaxed font-semibold">
                                    Share this link via social media, YouTube description, blog, or whatsapp. Customers booking through this link credit you automatically.
                                </p>
                            </div>
                            <div className="flex w-full md:w-auto items-center gap-2 bg-white p-2 border border-blue-200/80 rounded-2xl shadow-sm">
                                <code className="text-xs font-bold text-gray-800 px-2 select-all max-w-[200px] sm:max-w-xs md:max-w-md truncate">
                                    {`https://airgo.ng/?ref=${activeAffiliate.email}`}
                                </code>
                                <button
                                    onClick={copyReferralLink}
                                    className="bg-[#000080] hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap transition"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>

                        {/* Referred Bookings Ledger */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-lg font-black text-gray-900">Your Referral Ledger</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider font-bold">
                                            <th className="p-4 border-b">Booking Ref</th>
                                            <th className="p-4 border-b">Asset / Service</th>
                                            <th className="p-4 border-b text-center">Type</th>
                                            <th className="p-4 border-b text-right">Gross Value</th>
                                            <th className="p-4 border-b text-right">Commission Earned</th>
                                            <th className="p-4 border-b text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {referredBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-12 text-center text-gray-500">
                                                    <div className="text-5xl mb-4">🔗</div>
                                                    <h4 className="font-bold text-gray-800 text-lg">No referrals tracked yet</h4>
                                                    <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                                                        Once customers complete bookings using your referral code, their payout status will populate here.
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            referredBookings.map((b) => {
                                                const price = typeof b.totalPrice === 'string'
                                                    ? parseInt(b.totalPrice.replace(/[^0-9]/g, ''))
                                                    : Number(b.totalPrice) || 0;
                                                const rate = b.itemType === 'hotel' ? 0.10 : 0.05;
                                                const commission = Math.round(price * rate);

                                                return (
                                                    <tr key={b._id} className="hover:bg-gray-50/50 transition">
                                                        <td className="p-4 font-mono text-xs text-gray-400 font-bold uppercase">
                                                            {b._id.substring(0, 10)}
                                                        </td>
                                                        <td className="p-4 font-black text-gray-950 text-sm">
                                                            {b.itemName}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#000080] border border-blue-100 px-2 py-0.5 rounded">
                                                                {b.itemType}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right text-gray-900 font-bold text-sm">
                                                            ₦{price.toLocaleString()}
                                                        </td>
                                                        <td className="p-4 text-right text-green-700 font-black text-sm">
                                                            ₦{commission.toLocaleString()}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                b.status === 'Paid' || b.status === 'Paid Out' || b.status === 'Approved for Disbursement'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {b.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
