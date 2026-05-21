"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    hotel: any;
}

export default function BookingModal({ isOpen, onClose, hotel }: BookingModalProps) {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    // 🟢 SECURITY: Check if user is logged in
    useEffect(() => {
        const userData = localStorage.getItem('airgo_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [isOpen]);

    if (!isOpen || !hotel) return null;

    // 🟢 CALCULATE TOTAL NIGHTS & PRICE
    const calculateTotal = () => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const nights = Math.max((end.getTime() - start.getTime()) / (1000 * 3600 * 24), 1);

        // Strip out the "₦" and commas to do math, then multiply by nights
        const rawPrice = typeof hotel.price === 'string'
            ? parseInt(hotel.price.replace(/\D/g, ''))
            : hotel.price;

        return (rawPrice * nights).toLocaleString();
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🟢 REQUIRE LOGIN BEFORE BOOKING
        if (!user) {
            toast.success("Please sign in to secure this booking.");
            router.push('/login');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = 'https://airgo-backend.onrender.com';

            // Send the booking to your live backend
            const res = await fetch(`${apiUrl}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    itemId: hotel._id || hotel.id,
                    itemName: hotel.name,
                    itemType: 'hotel',
                    partnerId: hotel.partnerId || 'airgo_direct',
                    checkIn,
                    checkOut,
                    guests,
                    totalPrice: calculateTotal(),
                    status: 'Pending Escrow'
                }),
            });

            if (!res.ok) throw new Error("Booking failed to process.");

            toast.success("Booking Secured! Redirecting to your dashboard to complete escrow payment.");
            onClose();
            router.push('/dashboard');

        } catch (error: any) {
            toast.error(error.message || "An error occurred during booking.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000080]/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="relative h-32 overflow-hidden bg-gray-200">
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                        <h2 className="text-2xl font-black text-white leading-tight">{hotel.name}</h2>
                        <p className="text-blue-200 text-sm">📍 {hotel.location}</p>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center text-white font-bold transition">
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleBooking} className="p-6">
                    {!user && (
                        <div className="bg-blue-50 text-[#000080] p-3 rounded-xl text-sm font-bold border border-blue-100 mb-6 flex justify-between items-center">
                            <span>You must be signed in to book.</span>
                            <Link href="/login" className="underline hover:text-blue-900">Sign In</Link>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-in</label>
                            <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#000080] outline-none text-gray-900" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-out</label>
                            <input required type="date" min={checkIn || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#000080] outline-none text-gray-900" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Number of Guests</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#000080] outline-none text-gray-900 bg-white" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                            {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>)}
                        </select>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-500 font-medium">Rate per night</span>
                            <span className="font-bold text-gray-900">₦{typeof hotel.price === 'string' ? hotel.price : hotel.price?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-lg font-black text-gray-900">Total Escrow</span>
                            <span className="text-2xl font-black text-[#000080]">₦{calculateTotal()}</span>
                        </div>
                    </div>

                    <button
                        disabled={isSubmitting || !user}
                        type="submit"
                        className={`w-full py-4 rounded-xl font-black text-white text-lg shadow-lg transition ${isSubmitting || !user ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#000080] hover:bg-blue-900'}`}
                    >
                        {isSubmitting ? 'Securing Booking...' : 'Proceed to Escrow'}
                    </button>
                </form>
            </div>
        </div>
    );
}