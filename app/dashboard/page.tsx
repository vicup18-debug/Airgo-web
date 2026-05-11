"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientDashboard() {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // 🟢 1. SECURITY CHECK: Ensure user is actually logged in
        const token = localStorage.getItem('airgo_token');
        const userData = localStorage.getItem('airgo_user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);

        // 🟢 2. ROLE ROUTING: Keep Admins and Partners out of the Client area
        if (parsedUser.role === 'admin') {
            router.push('/admin');
            return;
        }
        if (parsedUser.role === 'partner') {
            router.push('/partner');
            return;
        }

        setUser(parsedUser);

        // 🟢 3. FETCH LIVE BOOKINGS (Ready for your backend booking engine)
        const fetchBookings = async () => {
            try {
                const apiUrl = 'https://airgo-backend.onrender.com';
                // This assumes your backend will have this route ready soon
                const res = await fetch(`${apiUrl}/api/bookings/user/${parsedUser.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBookings(data);
                }
            } catch (error) {
                console.error("No live bookings found yet.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('airgo_token');
        localStorage.removeItem('airgo_user');
        router.push('/login');
    };

    if (!user) return null; // Prevent flash of content before redirect

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* 🟢 TOP NAVIGATION */}
            <nav className="bg-[#000080] text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md sticky top-0 z-40">
                <Link href="/">
                    <div className="text-2xl font-black tracking-tight cursor-pointer">
                        Airgo<span className="text-[#FFB81C]">.ng</span>
                    </div>
                </Link>
                <div className="flex items-center gap-6">
                    <span className="hidden md:block font-medium text-blue-200">
                        {user.email}
                    </span>
                    <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition">
                        Sign Out
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* 🟢 WELCOME HEADER */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                        Welcome back, {user.name.split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-500 text-lg">Manage your luxury reservations and account details.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 🟢 LEFT COLUMN: QUICK STATS & PROFILE */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-blue-50 text-[#000080] rounded-full flex items-center justify-center text-2xl font-black mb-4">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="text-xl font-black text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">{user.email}</p>
                            <div className="border-t border-gray-100 pt-4">
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Verified Client
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#000080] to-blue-900 p-6 rounded-3xl shadow-md text-white">
                            <h3 className="text-lg font-bold mb-2">Need Escrow Assistance?</h3>
                            <p className="text-sm text-blue-200 mb-4">Our concierge team is available 24/7 to manage your secure bookings.</p>
                            <button className="bg-[#FFB81C] text-[#000080] w-full py-3 rounded-xl font-black shadow-md hover:bg-yellow-400 transition">
                                Contact Support
                            </button>
                        </div>
                    </div>

                    {/* 🟢 RIGHT COLUMN: ACTIVE BOOKINGS */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full">
                            <h2 className="text-2xl font-black text-gray-900 mb-6">Your Reservations</h2>

                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#000080]"></div>
                                </div>
                            ) : bookings.length === 0 ? (
                                /* 🟢 EMPTY STATE: NO BOOKINGS */
                                <div className="text-center py-16 px-4">
                                    <div className="text-5xl mb-4">🚘</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No active reservations</h3>
                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                        You haven't booked any vehicles or hotels yet. Ready to experience premium travel?
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <Link href="/cars">
                                            <button className="bg-[#000080] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-900 transition">
                                                Browse Fleet
                                            </button>
                                        </Link>
                                        <Link href="/hotels">
                                            <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                                                View Hotels
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                /* 🟢 LIVE BOOKINGS LIST (When API is ready) */
                                <div className="space-y-4">
                                    {bookings.map((booking, idx) => (
                                        <div key={idx} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center bg-gray-50">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{booking.itemName}</h4>
                                                <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                                            </div>
                                            <span className="bg-[#87CEEB] text-[#000080] px-3 py-1 rounded-md text-xs font-bold uppercase">
                                                {booking.status || 'Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}