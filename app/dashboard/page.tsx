"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const PaystackPaymentButton = dynamic(() => import('./paystack-button'), { ssr: false });

export default function ClientDashboard() {
    const [user, setUser] = useState<any>(null);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchMyBookings = async (parsedUser: any) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings`);
            if (res.ok) {
                const allBookings = await res.json();

                // 🟢 FILTER: Match the booking's userId to the logged-in client's ID
                const clientBookings = allBookings.filter((b: any) =>
                    b.userId === parsedUser.id || b.userId === parsedUser.userId
                );
                setMyBookings(clientBookings);
            }
        } catch (error) {
            console.error("Failed to fetch bookings");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // 1. SECURITY CHECK: Ensure user is actually logged in
        const token = localStorage.getItem('airgo_token');
        const userData = localStorage.getItem('airgo_user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);

        // 2. ROLE ROUTING: Keep Admins and Partners out of the Client area
        if (parsedUser.role === 'admin') return router.push('/admin');
        if (parsedUser.role === 'partner') return router.push('/partner');

        setUser(parsedUser);

        fetchMyBookings(parsedUser);
    }, [router]);

    const handlePaymentSuccess = async (bookingId: string, reference: string) => {
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            
            const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'Paid',
                    paymentReference: reference
                })
            });

            if (res.ok) {
                toast.success("🎉 Payment verified! Escrow holds activated.");
                // Reload bookings
                const userData = localStorage.getItem('airgo_user');
                if (userData) {
                    fetchMyBookings(JSON.parse(userData));
                }
            } else {
                toast.error("Failed to update status on server.");
            }
        } catch (error) {
            console.error("Error updating payment status:", error);
            toast.error("Error confirming payment with server.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('airgo_token');
        localStorage.removeItem('airgo_user');
        window.location.href = '/login'; // Force reload
    };

    if (!user) return null; // Prevent flash of content

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* 🟢 NAVBAR */}
            <div className="bg-[#000080] p-4 flex justify-between items-center text-white shadow-md">
                <Link href="/" className="font-black text-xl tracking-tight hover:text-blue-200 transition">
                    Airgo<span className="text-[#FFB81C]">.ng</span>
                </Link>
                <div className="flex gap-4">
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition shadow-md">
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 🟢 RESERVATIONS COLUMN */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">My Reservations</h2>

                    {isLoading ? (
                        <div className="text-gray-500 animate-pulse font-bold">Loading your itinerary...</div>
                    ) : myBookings.length === 0 ? (
                        <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 text-center shadow-sm">
                            <div className="text-5xl mb-4">🛣️</div>
                            <h3 className="text-xl font-bold text-gray-800">No Active Bookings</h3>
                            <p className="text-gray-500 mb-6">Ready for your next executive trip?</p>
                            <Link href="/cars">
                                <button className="bg-[#004A99] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-800 transition">
                                    Browse Fleet
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myBookings.map((booking) => (
                                <div key={booking._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{booking.itemType}</p>
                                        <h3 className="text-xl font-black text-[#004A99]">{booking.itemName}</h3>
                                        <p className="text-sm text-gray-600 font-medium mt-2">
                                            <span className="font-bold">From:</span> {booking.checkIn ? new Date(booking.checkIn).toLocaleString() : 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600 font-medium">
                                            <span className="font-bold">To:</span> {booking.checkOut ? new Date(booking.checkOut).toLocaleString() : 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-400 font-medium mt-2">
                                            Reserved at: {booking.createdAt ? new Date(booking.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-left md:text-right mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 flex flex-col items-start md:items-end">
                                        <p className="text-sm text-gray-500 font-bold mb-1">Total Escrow</p>
                                        <p className="text-2xl font-black text-gray-900">₦{booking.totalPrice}</p>
                                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                                            booking.status === 'Pending Escrow' 
                                                ? 'bg-yellow-100 text-yellow-800' 
                                                : booking.status === 'Approved for Disbursement'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                        }`}>
                                            {booking.status}
                                        </span>
                                        {booking.status === 'Pending Escrow' && (
                                            <PaystackPaymentButton 
                                                booking={booking} 
                                                user={user} 
                                                onSuccess={handlePaymentSuccess} 
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 🟢 OFFICIAL SUPPORT COLUMN */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-blue-50 text-[#004A99] rounded-full flex items-center justify-center text-2xl font-black mb-4">
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

                    <div className="bg-gradient-to-br from-[#004A99] to-blue-900 p-6 rounded-3xl shadow-lg text-white">
                        <h3 className="text-lg font-black text-[#FFB81C] mb-2">24/7 Concierge</h3>
                        <p className="text-sm text-blue-100 mb-6">Need modifications to your itinerary or immediate dispatch assistance? We are here to help.</p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
                                <div className="text-xl">📞</div>
                                <div>
                                    <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Dispatch Hotline 1</p>
                                    <p className="font-black text-sm tracking-wide">+234 806 605 8930</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
                                <div className="text-xl">📞</div>
                                <div>
                                    <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Dispatch Hotline 2</p>
                                    <p className="font-black text-sm tracking-wide">+234 802 669 6170</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}