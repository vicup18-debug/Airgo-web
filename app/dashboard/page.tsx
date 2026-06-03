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

    // Booking edit state
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editData, setEditData] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        deliveryAddress: '',
        checkIn: '',
        checkOut: '',
        guests: 1
    });
    const fetchMyBookings = async (parsedUser: any) => {
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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
        const token = localStorage.getItem('airgo_token');
        const userData = localStorage.getItem('airgo_user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);

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
                const userData = localStorage.getItem('airgo_user');
                if (userData) {
                    fetchMyBookings(JSON.parse(userData));
                }
            } else {
                toast.error("Failed to update status on server.");
            }
        } catch (error) {
            console.error("Error confirming payment:", error);
            toast.error("Error confirming payment with server.");
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking) return;
        setIsSavingEdit(true);
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings/${selectedBooking._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Reservation details corrected successfully!");
                setIsEditModalOpen(false);
                setSelectedBooking(null);
                fetchMyBookings(user);
            } else {
                toast.error(data.message || "Failed to save corrections.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        if (!window.confirm("Are you sure you want to cancel this reservation and release the locked inventory?")) return;
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Reservation cancelled and inventory released!");
                fetchMyBookings(user);
            } else {
                toast.error(data.message || "Failed to cancel reservation.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        }
    };

    const handleShareBooking = async (booking: any) => {
        const checkInDate = booking.checkIn ? new Date(booking.checkIn).toLocaleString() : 'N/A';
        const checkOutDate = booking.checkOut ? new Date(booking.checkOut).toLocaleString() : 'N/A';
        const priceNum = Number(booking.totalPrice?.replace(/[^0-9.-]+/g,"") || booking.totalPrice || 0);
        
        const shareText = `Airgo Car Rental Booking Details:\n---------------------------------\nVehicle: ${booking.itemName}\nPlate Number: ${booking.vehicleNumber || 'N/A'}\nClient Name: ${booking.clientName || 'N/A'}\nPickup: ${checkInDate}\nReturn: ${checkOutDate}\nStatus: ${booking.status}\nTotal Price: ₦${priceNum.toLocaleString()}\n---------------------------------\nBook securely via Airgo Escrow.`;
        
        const invoiceUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com'}/api/bookings/${booking._id}/invoice`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Airgo Booking - ${booking.itemName}`,
                    text: shareText,
                    url: invoiceUrl
                });
                toast.success("Booking details shared successfully!");
            } catch (err) {
                console.error("Native share failed:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareText}\nInvoice: ${invoiceUrl}`);
                toast.success("📋 Booking details copied to clipboard!");
            } catch (err) {
                toast.error("Failed to copy booking details.");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('airgo_token');
        localStorage.removeItem('airgo_user');
        window.location.href = '/login';
    };

    if (!user) return null;

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
                            <div className="text-5xl mb-4">🏨</div>
                            <h3 className="text-xl font-bold text-gray-800">No Active Bookings</h3>
                            <p className="text-gray-500 mb-6">Ready for your next luxury stay or executive trip?</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/hotels">
                                    <button className="bg-[#000080] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-900 transition">
                                        Browse Hotels
                                    </button>
                                </Link>
                                <Link href="/cars">
                                    <button className="bg-white text-[#000080] border border-[#000080] px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition">
                                        Browse Fleet
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myBookings.map((booking) => (
                                <div key={booking._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{booking.itemType}</p>
                                        <h3 className="text-xl font-black text-[#004A99]">{booking.itemName}</h3>
                                        {booking.itemType === 'car' && booking.vehicleNumber && (
                                            <p className="text-xs font-black text-green-700 bg-green-50 px-2.5 py-1.5 rounded-xl border border-green-100 inline-block mt-2">
                                                🚘 Plate No: {booking.vehicleNumber}
                                            </p>
                                        )}
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
                                    <div className="text-left md:text-right mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 flex flex-col items-start md:items-end gap-2">
                                        <p className="text-sm text-gray-500 font-bold mb-0">Total Escrow</p>
                                        <p className="text-2xl font-black text-gray-900">₦{Number(booking.totalPrice?.replace(/[^0-9.-]+/g,"") || booking.totalPrice || 0).toLocaleString()}</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                            booking.status === 'Pending Escrow' 
                                                ? 'bg-yellow-100 text-yellow-800' 
                                                : booking.status === 'Approved for Disbursement'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                        }`}>
                                            {booking.status}
                                        </span>
                                        
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com'}/api/bookings/${booking._id}/invoice`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-bold text-[#004A99] hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100"
                                            >
                                                📄 Receipt/Invoice
                                            </a>
                                            {booking.itemType === 'car' && (
                                                <button
                                                    onClick={() => handleShareBooking(booking)}
                                                    className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-1 bg-green-50 border border-green-100 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition"
                                                >
                                                    🔗 Share Booking
                                                </button>
                                            )}
                                            {booking.status === 'Pending Escrow' && (
                                                <>
                                                    <button 
                                                        onClick={() => { 
                                                            setSelectedBooking(booking); 
                                                            setEditData({ 
                                                                clientName: booking.clientName || '', 
                                                                clientEmail: booking.clientEmail || '', 
                                                                clientPhone: booking.clientPhone || '', 
                                                                deliveryAddress: booking.deliveryAddress || '', 
                                                                checkIn: booking.checkIn || '', 
                                                                checkOut: booking.checkOut || '', 
                                                                guests: booking.guests || 1 
                                                            }); 
                                                            setIsEditModalOpen(true); 
                                                        }}
                                                        className="text-xs font-bold text-gray-600 hover:text-[#000080] flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-white"
                                                    >
                                                        ✏️ Correct Details
                                                    </button>
                                                    <button 
                                                        onClick={() => handleCancelBooking(booking._id)}
                                                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition"
                                                    >
                                                        ✕ Cancel Booking
                                                    </button>
                                                </>
                                            )}
                                        </div>

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
                                    <p className="font-black text-sm tracking-wide">+234 707 834 4409</p>
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

            {/* EDIT BOOKING MODAL */}
            {isEditModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <h2 className="text-xl font-black text-[#000080]">Correct Reservation Details</h2>
                            <button onClick={() => { setIsEditModalOpen(false); setSelectedBooking(null); }} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Guest Name</label>
                                    <input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={editData.clientName} onChange={e => setEditData({ ...editData, clientName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Guests Count</label>
                                    <input required type="number" min="1" max="2" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={editData.guests} onChange={e => setEditData({ ...editData, guests: Math.min(2, Math.max(1, parseInt(e.target.value) || 1)) })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                                    <input required type="email" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={editData.clientEmail} onChange={e => setEditData({ ...editData, clientEmail: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                    <input required type="tel" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={editData.clientPhone} onChange={e => setEditData({ ...editData, clientPhone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery / Stay Address</label>
                                <input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={editData.deliveryAddress} onChange={e => setEditData({ ...editData, deliveryAddress: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check In / Pickup Date</label>
                                    <input required type="date" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={editData.checkIn ? editData.checkIn.split('T')[0] : ''} onChange={e => setEditData({ ...editData, checkIn: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check Out / Return Date</label>
                                    <input required type="date" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={editData.checkOut ? editData.checkOut.split('T')[0] : ''} onChange={e => setEditData({ ...editData, checkOut: e.target.value })} />
                                </div>
                            </div>
                            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl border border-yellow-100 text-xs leading-relaxed font-medium">
                                ⚠️ Changing stay or rental dates will trigger an inventory matrix check. If the new timeframe is available, the final escrow total will be adjusted automatically.
                            </div>
                            <div className="pt-4 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedBooking(null); }} className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={isSavingEdit} type="submit" className="px-6 py-2 rounded-xl font-bold text-white bg-[#000080] hover:bg-blue-900 transition flex items-center gap-2">
                                    {isSavingEdit ? 'Applying corrections...' : 'Apply Corrections'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}