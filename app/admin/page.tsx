"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperadminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'escrow' | 'approvals'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data States
    const [allBookings, setAllBookings] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('airgo_token');
        const userData = localStorage.getItem('airgo_user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'admin') {
            alert("Unauthorized Access. Redirecting...");
            router.push('/dashboard');
            return;
        }

        setUser(parsedUser);
        fetchAllSystemData();
    }, [router]);

    const fetchAllSystemData = async () => {
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

            // Fetch Bookings
            const bookingsRes = await fetch(`${apiUrl}/api/bookings`);
            if (bookingsRes.ok) setAllBookings(await bookingsRes.json());

            // Fetch Partners
            const partnersRes = await fetch(`${apiUrl}/api/auth/partners`);
            if (partnersRes.ok) setPartners(await partnersRes.json());

        } catch (error) {
            console.error("Error fetching system data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisburse = (bookingId: string) => {
        const confirmPayout = window.confirm(`Authorize payout?`);
        if (confirmPayout) {
            alert(`✅ Payout Authorized!`);
            setAllBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Paid Out' } : b));
        }
    };

    // 🟢 APPROVE PARTNER FUNCTION
    const handleApprovePartner = async (partnerId: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/approve-partner/${partnerId}`, {
                method: 'PUT'
            });
            if (res.ok) {
                alert("✅ Partner Approved! They can now upload fleets.");
                // Update UI instantly without reloading
                setPartners(prev => prev.map(p => p._id === partnerId ? { ...p, isApproved: true } : p));
            } else {
                alert("❌ Failed to approve partner.");
            }
        } catch (error) {
            alert("❌ Error communicating with the server.");
        }
    };

    // 🟢 LOGOUT FUNCTION
    const handleLogout = () => {
        localStorage.removeItem('airgo_token');
        localStorage.removeItem('airgo_user');
        window.location.href = '/login'; // Force reload
    };

    const calculateTotalEscrow = () => {
        return allBookings
            .filter(b => b.status === 'Pending Escrow')
            .reduce((sum, b) => {
                const num = typeof b.totalPrice === 'string' ? parseInt(b.totalPrice.replace(/[^0-9]/g, '')) : b.totalPrice;
                return sum + (num || 0);
            }, 0)
            .toLocaleString();
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans">

            {/* 🟢 MOBILE HEADER */}
            <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                <h2 className="text-xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.HQ</span></h2>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

            {/* 🟢 SIDEBAR COMMAND CENTER */}
            <aside className={`fixed md:relative top-0 left-0 h-full w-64 bg-gray-900 text-white flex-col shadow-xl z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex`}>
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.HQ</span></h2>
                        <p className="text-xs text-green-400 mt-1 uppercase tracking-widest font-bold">System Online</p>
                    </div>
                    <button className="md:hidden text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'overview' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>
                        📊 Global Overview
                    </button>
                    <button onClick={() => { setActiveTab('escrow'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'escrow' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>
                        💰 Escrow Ledger
                    </button>
                    <button onClick={() => { setActiveTab('approvals'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'approvals' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>
                        🛡️ Partner Approvals
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="w-full bg-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm font-bold border border-red-900/50 hover:bg-red-900 hover:text-white transition">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* 🟢 MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative w-full bg-gray-100">
                <header className="bg-white px-6 md:px-8 py-5 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10 hidden md:flex">
                    <h1 className="text-2xl font-black text-gray-900 capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Superadmin</span>
                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-black shadow-inner">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>
                    ) : (
                        <>
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-[#000080] to-blue-900 p-8 rounded-3xl shadow-lg text-white">
                                        <p className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">Funds in Escrow</p>
                                        <p className="text-5xl font-black mb-2">₦{calculateTotalEscrow()}</p>
                                        <p className="text-xs text-blue-300">Awaiting partner disbursement</p>
                                    </div>
                                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Bookings</p>
                                        <p className="text-5xl font-black text-gray-900">{allBookings.length}</p>
                                    </div>
                                </div>
                            )}

                            {/* ESCROW TAB */}
                            {activeTab === 'escrow' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <h2 className="text-lg font-black text-gray-900">Live Escrow Ledger</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="p-4 font-bold border-b">Asset</th>
                                                    <th className="p-4 font-bold border-b">Status</th>
                                                    <th className="p-4 font-bold border-b text-right">Escrow Amount</th>
                                                    <th className="p-4 font-bold border-b text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {allBookings.length === 0 ? (
                                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No transactions yet.</td></tr>
                                                ) : allBookings.map((booking) => (
                                                    <tr key={booking._id} className="hover:bg-gray-50 transition">
                                                        <td className="p-4 font-black text-gray-900">{booking.itemName}</td>
                                                        <td className="p-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'Pending Escrow' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right font-black text-[#000080]">₦{booking.totalPrice}</td>
                                                        <td className="p-4 text-center">
                                                            {booking.status === 'Pending Escrow' && (
                                                                <button onClick={() => handleDisburse(booking._id)} className="bg-[#10B981] text-white px-4 py-2 rounded-lg text-xs font-black">Disburse</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* PARTNER APPROVALS TAB */}
                            {activeTab === 'approvals' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <h2 className="text-lg font-black text-gray-900">Partner Registrations</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="p-4 font-bold border-b">Partner Name</th>
                                                    <th className="p-4 font-bold border-b">Business Name</th>
                                                    <th className="p-4 font-bold border-b">Email</th>
                                                    <th className="p-4 font-bold border-b">Status</th>
                                                    <th className="p-4 font-bold border-b text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {partners.length === 0 ? (
                                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No partners found.</td></tr>
                                                ) : (
                                                    partners.map((partner) => (
                                                        <tr key={partner._id} className="hover:bg-gray-50 transition">
                                                            <td className="p-4 font-bold text-gray-900">{partner.name}</td>
                                                            <td className="p-4 text-gray-600">{partner.businessName || 'N/A'}</td>
                                                            <td className="p-4 text-gray-600">{partner.email}</td>
                                                            <td className="p-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${partner.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {partner.isApproved ? 'Active' : 'Pending'}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                {!partner.isApproved && (
                                                                    <button
                                                                        onClick={() => handleApprovePartner(partner._id)}
                                                                        className="bg-[#000080] text-white px-4 py-2 rounded-lg text-xs font-black shadow-sm"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}