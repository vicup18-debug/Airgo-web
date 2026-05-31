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
    const [rooms, setRooms] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const router = useRouter();

    // 🟢 SECURITY: Check if user is logged in
    useEffect(() => {
        const userData = localStorage.getItem('airgo_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        
        if (isOpen && hotel) {
            fetchRooms();
        } else {
            setSelectedRoom(null);
            setRooms([]);
            setCheckIn('');
            setCheckOut('');
            setGuests(1);
        }
    }, [isOpen, hotel]);

    const fetchRooms = async () => {
        setIsLoadingRooms(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/rooms`);
            if (res.ok) {
                const allRooms = await res.json();
                // Find rooms belonging to this hotel's partner (with robust case-insensitive and trimmed checking)
                const hotelRooms = allRooms.filter((r: any) => {
                    const matchPartner = r.partnerId && hotel.partnerId && r.partnerId.toString() === hotel.partnerId.toString();
                    const matchName = r.hotelName && hotel.name && r.hotelName.toLowerCase().trim() === hotel.name.toLowerCase().trim();
                    return matchPartner || matchName;
                });
                setRooms(hotelRooms);
            }
        } catch (e) {
            console.error("Error fetching rooms", e);
        } finally {
            setIsLoadingRooms(false);
        }
    };

    if (!isOpen || !hotel) return null;

    // 🟢 CALCULATE TOTAL NIGHTS & PRICE
    const calculateTotal = () => {
        if (!checkIn || !checkOut || !selectedRoom) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const nights = Math.max((end.getTime() - start.getTime()) / (1000 * 3600 * 24), 1);

        // Strip out the "₦" and commas to do math, then multiply by nights
        const rawPrice = typeof selectedRoom.pricePerNight === 'string'
            ? parseInt(selectedRoom.pricePerNight.replace(/\D/g, ''))
            : selectedRoom.pricePerNight;

        const discount = selectedRoom.discountPercentage || 0;
        const discountedRate = Math.round(rawPrice * (1 - discount / 100));

        return (discountedRate * nights).toLocaleString();
    };

    const handleBooking = async (e: React.FormEvent) => {
        // 🟢 REQUIRE LOGIN BEFORE BOOKING
        if (!user) {
            toast.success("Please sign in to secure this booking.");
            router.push('/login');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

            // Send the booking to your live backend
            const res = await fetch(`${apiUrl}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id || user.userId || user._id,
                    itemId: selectedRoom._id,
                    itemName: `${hotel.name} - ${selectedRoom.name}`,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000080]/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="relative h-32 overflow-hidden bg-gray-200 shrink-0">
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                        <h2 className="text-2xl font-black text-white leading-tight">{hotel.name}</h2>
                        <p className="text-blue-200 text-sm">📍 {hotel.location}</p>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center text-white font-bold transition">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {!user && (
                        <div className="bg-blue-50 text-[#000080] p-3 rounded-xl text-sm font-bold border border-blue-100 mb-6 flex justify-between items-center">
                            <span>You must be signed in to book.</span>
                            <Link href="/login" className="underline hover:text-blue-900">Sign In</Link>
                        </div>
                    )}

                    {!selectedRoom ? (
                        <div>
                            <h3 className="text-xl font-bold mb-4">Select Room Category</h3>
                            {isLoadingRooms ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004A99]"></div>
                                </div>
                            ) : rooms.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">No rooms available for this hotel yet.</div>
                            ) : (
                                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                                    {rooms.map(room => {
                                        const rawRoomPrice = typeof room.pricePerNight === 'string'
                                            ? parseInt(room.pricePerNight.replace(/\D/g, ''))
                                            : room.pricePerNight || 0;
                                        const discountedRoomRate = Math.round(rawRoomPrice * (1 - (room.discountPercentage || 0) / 100));

                                        const isSoldOut = (room.totalAllocated || 0) <= 0;

                                        return (
                                            <div key={room._id} className={`border border-gray-100 rounded-xl p-4 flex gap-4 transition bg-gray-50 animate-fade-in ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#000080] hover:shadow-md'}`} onClick={() => !isSoldOut && setSelectedRoom(room)}>
                                                <img src={room.image} className="w-24 h-24 rounded-lg object-cover shadow-sm" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-lg text-gray-900">{room.name}</h4>
                                                        {room.discountPercentage > 0 && (
                                                            <span className="bg-red-500 text-white font-black px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">
                                                                {room.discountPercentage}% OFF
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 my-1">{room.amenities}</p>
                                                    <div className="flex justify-between items-end mt-2">
                                                        <div>
                                                            <p className="font-black text-[#004A99]">
                                                                {room.discountPercentage > 0 && (
                                                                    <span className="text-xs text-gray-400 line-through mr-1.5 font-bold">
                                                                        ₦{rawRoomPrice.toLocaleString()}
                                                                    </span>
                                                                )}
                                                                ₦{discountedRoomRate.toLocaleString()} <span className="text-[10px] text-gray-400 font-medium">/ night</span>
                                                            </p>
                                                        </div>
                                                        {isSoldOut ? (
                                                            <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider select-none">Sold Out</span>
                                                        ) : (
                                                            <button className="bg-[#FFB81C] text-[#000080] px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-400">Select</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleBooking}>
                            <div className="mb-4 flex items-center gap-2">
                                <button type="button" onClick={() => setSelectedRoom(null)} className="text-[#000080] font-bold text-sm hover:underline">← Back to rooms</button>
                            </div>
                            
                            <div className="p-4 bg-blue-50 rounded-xl mb-6 border border-blue-100 flex gap-4">
                                <img src={selectedRoom.image} className="w-16 h-16 rounded-lg object-cover shadow-sm" />
                                <div className="flex-grow">
                                    <h4 className="font-bold text-lg text-[#000080]">{selectedRoom.name}</h4>
                                    <p className="font-black text-gray-900">
                                        {selectedRoom.discountPercentage > 0 && (
                                            <span className="text-xs text-gray-400 line-through mr-1.5 font-bold">
                                                ₦{(typeof selectedRoom.pricePerNight === 'string' ? parseInt(selectedRoom.pricePerNight.replace(/\D/g, '')) : selectedRoom.pricePerNight)?.toLocaleString()}
                                            </span>
                                        )}
                                        ₦{Math.round((typeof selectedRoom.pricePerNight === 'string' ? parseInt(selectedRoom.pricePerNight.replace(/\D/g, '')) : selectedRoom.pricePerNight) * (1 - (selectedRoom.discountPercentage || 0) / 100)).toLocaleString()} / night
                                    </p>
                                    {selectedRoom.discountPercentage > 0 && (
                                        <p className="text-[10px] text-red-600 font-black uppercase mt-0.5 animate-pulse">🔥 {selectedRoom.discountPercentage}% Discount Applied</p>
                                    )}
                                </div>
                            </div>

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
                                    <span className="font-bold text-gray-900">
                                        ₦{Math.round((typeof selectedRoom.pricePerNight === 'string' ? parseInt(selectedRoom.pricePerNight.replace(/\D/g, '')) : selectedRoom.pricePerNight) * (1 - (selectedRoom.discountPercentage || 0) / 100)).toLocaleString()}
                                    </span>
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
                    )}
                </div>
            </div>
        </div>
    );
}
