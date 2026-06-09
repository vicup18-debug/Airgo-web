"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const PaystackPaymentButton = dynamic(() => import('./paystack-button'), { ssr: false });

const formatDisplayDate = (dateStr: string, itemType: string) => {
    if (!dateStr) return 'N/A';
    try {
        const parts = dateStr.split('T');
        const datePart = parts[0];
        
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const [year, month, day] = datePart.split('-').map(Number);
        
        if (!year || !month || !day) return dateStr;
        
        const formattedDate = `${months[month - 1]} ${day}, ${year}`;
        
        if (itemType === 'hotel') {
            return `${formattedDate} at 12:00 PM`;
        } else {
            if (parts[1]) {
                const [hourStr, minStr] = parts[1].split(':');
                let hour = parseInt(hourStr, 10);
                const min = minStr ? minStr.substring(0, 2) : '00';
                const ampm = hour >= 12 ? 'PM' : 'AM';
                hour = hour % 12;
                hour = hour ? hour : 12;
                return `${formattedDate} at ${hour}:${min} ${ampm}`;
            }
            return formattedDate;
        }
    } catch (e) {
        return dateStr;
    }
};

// Simulated Live GPS tracking component for active car rentals
function LiveCarTracker({ booking }: { booking: any }) {
    const [progress, setProgress] = React.useState(0);
    const [speed, setSpeed] = React.useState(60);
    const [fuel, setFuel] = React.useState(82);
    const [eta, setEta] = React.useState(15);
    const [statusText, setStatusText] = React.useState('En Route to Delivery Address');

    React.useEffect(() => {
        // Animate the progress along the path (0 to 100)
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setStatusText('Delivered to Destination');
                    setSpeed(0);
                    setEta(0);
                    return 100;
                }
                const next = prev + 1.5;
                // Update ETA proportionally
                setEta(Math.max(1, Math.ceil(15 * (1 - next / 100))));
                return next;
            });
        }, 3000);

        // Fluctuate speed and slowly decrease fuel
        const telemetryInterval = setInterval(() => {
            setSpeed((prev) => {
                if (progress >= 100) return 0;
                const change = Math.floor(Math.random() * 15) - 7;
                return Math.min(85, Math.max(40, prev + change));
            });
            setFuel((prev) => Math.max(15, prev - (Math.random() > 0.7 ? 1 : 0)));
        }, 1500);

        return () => {
            clearInterval(progressInterval);
            clearInterval(telemetryInterval);
        };
    }, [progress]);

    // Calculate position of car along a simulated S-curve path on a 300x120 SVG grid
    const getCarCoordinates = (p: number) => {
        const t = p / 100;
        const x = (1-t)**3 * 20 + 3 * (1-t)**2 * t * 100 + 3 * (1-t) * t**2 * 200 + t**3 * 280;
        const y = (1-t)**3 * 90 + 3 * (1-t)**2 * t * 10 + 3 * (1-t) * t**2 * 110 + t**3 * 40;
        return { x, y };
    };

    const carPos = getCarCoordinates(progress);

    return (
        <div className="w-full mt-4 bg-gray-900 text-white p-5 rounded-2xl border border-gray-800 shadow-inner flex flex-col gap-4 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-3 gap-2">
                <div>
                    <h4 className="text-sm font-black text-green-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                        Live GPS Tracking Active
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">Status: <span className="text-gray-200 font-bold">{statusText}</span></p>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500 font-bold">Estimated Arrival</p>
                    <p className="text-lg font-black text-[#FFB81C]">{eta > 0 ? `${eta} mins` : 'Arrived'}</p>
                </div>
            </div>

            <div className="relative w-full h-36 bg-gray-950 rounded-xl overflow-hidden border border-gray-800/80">
                <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                    <defs>
                        <pattern id="grid" width="15" height="15" patternUnits="userSpaceOnUse">
                            <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    <text x="15" y="110" className="fill-gray-600 font-bold text-[8px] tracking-wider uppercase">Airgo Depot</text>
                    <text x="110" y="25" className="fill-gray-600 font-bold text-[8px] tracking-wider uppercase">Wuse II Toll</text>
                    <text x="225" y="110" className="fill-gray-600 font-bold text-[8px] tracking-wider uppercase">Maitama Ring</text>
                    <text x="215" y="25" className="fill-gray-400 font-bold text-[8px] tracking-wider uppercase font-black">Your Location</text>

                    <path 
                        d="M 20 90 C 100 10, 200 110, 280 40" 
                        fill="none" 
                        stroke="#1f2937" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                    />
                    <path 
                        d="M 20 90 C 100 10, 200 110, 280 40" 
                        fill="none" 
                        stroke="#004A99" 
                        strokeWidth="2.5" 
                        strokeDasharray="4 2"
                        strokeLinecap="round"
                    />

                    <circle cx="20" cy="90" r="5" className="fill-blue-500 stroke-white stroke-2" />
                    <circle cx="280" cy="40" r="5" className="fill-green-500 stroke-white stroke-2 animate-ping" />
                    <circle cx="280" cy="40" r="5" className="fill-green-500 stroke-white stroke-2" />

                    <g transform={`translate(${carPos.x - 6}, ${carPos.y - 6})`}>
                        <circle cx="6" cy="6" r="8" className="fill-green-500/20 stroke-green-500/40 stroke-1 animate-pulse" />
                        <circle cx="6" cy="6" r="4" className="fill-green-400 stroke-white stroke-1" />
                    </g>
                </svg>
                
                <div className="absolute bottom-2 left-2 flex gap-1.5 flex-wrap">
                    <span className="bg-[#000080]/85 text-blue-200 border border-blue-800 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">{booking.rentalType || 'Chauffeur Driven'}</span>
                    <span className="bg-[#FFB81C]/25 text-yellow-200 border border-yellow-800 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">{booking.fuelPlan || 'Self Fueling'}</span>
                    <span className="bg-green-900/80 text-green-200 border border-green-800 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">{booking.travelScope || 'Intra-City'}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800/80">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Speed</span>
                    <span className="text-sm font-black text-gray-200">{speed} km/h</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Fuel Level</span>
                    <span className="text-sm font-black text-gray-200">{fuel}%</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Assigned Driver</span>
                    <span className="text-sm font-black text-[#FFB81C]">Chinedu Okafor</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Driver Rating</span>
                    <span className="text-sm font-black text-gray-200">4.9⭐ (VIP Class)</span>
                </div>
            </div>

            <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-xl border border-gray-800/50">
                <span className="text-xs text-gray-400 font-medium">Contact dispatch driver for any changes:</span>
                <a href="tel:+2347078344409" className="bg-[#FFB81C] hover:bg-yellow-400 text-[#000080] font-black text-xs px-3.5 py-1.5 rounded-lg shadow transition">
                    📞 Call Dispatcher
                </a>
            </div>
        </div>
    );
}

export default function ClientDashboard() {
    const [user, setUser] = useState<any>(null);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [trackingBookingId, setTrackingBookingId] = useState<string | null>(null);
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

    // Profile edit state
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phoneNumber: ''
    });

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const userId = user.id || user.userId || user._id;

            const res = await fetch(`${apiUrl}/api/auth/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Profile updated successfully!");
                setIsProfileModalOpen(false);
                
                // Update local storage and state
                const updatedUser = { ...user, ...data.user };
                setUser(updatedUser);
                localStorage.setItem('airgo_user', JSON.stringify(updatedUser));
            } else {
                toast.error(data.message || "Failed to update profile.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        } finally {
            setIsSavingProfile(false);
        }
    };
    const fetchMyBookings = async (parsedUser: any, silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.status === 401) {
                localStorage.removeItem('airgo_token');
                localStorage.removeItem('airgo_user');
                router.push('/login');
                toast.error("Session expired. Please sign in again.");
                return;
            }
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

        // 30s background silent auto-refresh
        const interval = setInterval(() => {
            fetchMyBookings(parsedUser, true);
        }, 30000);
        return () => clearInterval(interval);
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
        const checkInDate = booking.checkIn ? formatDisplayDate(booking.checkIn, booking.itemType) : 'N/A';
        const checkOutDate = booking.checkOut ? formatDisplayDate(booking.checkOut, booking.itemType) : 'N/A';
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
                                <Link href="/">
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
                            {myBookings.map((booking) => {
                                const allowedInvoiceStatuses = ['Paid', 'Paid Out', 'Approved for Disbursement', 'Confirmed', 'Completed'];
                                const canDownloadInvoice = allowedInvoiceStatuses.includes(booking.status);
                                const isPaidCar = booking.itemType === 'car' && ['Paid', 'Paid Out', 'Approved for Disbursement', 'Confirmed'].includes(booking.status);

                                return (
                                    <div key={booking._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition">
                                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{booking.itemType}</p>
                                                <h3 className="text-xl font-black text-[#004A99]">{booking.itemName}</h3>
                                                {booking.itemType === 'car' && booking.vehicleNumber && (
                                                    <p className="text-xs font-black text-green-700 bg-green-50 px-2.5 py-1.5 rounded-xl border border-green-100 inline-block mt-2">
                                                        🚘 Plate No: {booking.vehicleNumber}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600 font-medium mt-2">
                                                    <span className="font-bold">From:</span> {booking.checkIn ? formatDisplayDate(booking.checkIn, booking.itemType) : 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-600 font-medium">
                                                    <span className="font-bold">To:</span> {booking.checkOut ? formatDisplayDate(booking.checkOut, booking.itemType) : 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-400 font-medium mt-2">
                                                    Reserved at: {booking.createdAt ? formatDisplayDate(booking.createdAt, 'other') : 'N/A'}
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
                                                            : booking.status === 'Cancelled'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                                
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {!canDownloadInvoice ? (
                                                        <button
                                                            disabled
                                                            title="Available after payment confirmation"
                                                            className="text-xs font-bold text-gray-400 flex items-center gap-1 bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200 cursor-not-allowed opacity-60"
                                                        >
                                                            📄 Receipt/Invoice (Locked)
                                                        </button>
                                                    ) : (
                                                        <a
                                                            href={`${process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com'}/api/bookings/${booking._id}/invoice`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs font-bold text-[#004A99] hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100"
                                                        >
                                                            📄 Receipt/Invoice
                                                        </a>
                                                    )}
                                                    {isPaidCar && (
                                                        <button
                                                            onClick={() => setTrackingBookingId(trackingBookingId === booking._id ? null : booking._id)}
                                                            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition"
                                                        >
                                                            🗺️ {trackingBookingId === booking._id ? 'Hide Live Map' : 'Track Live Location'}
                                                        </button>
                                                    )}
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
                                        
                                        {/* Nested Simulated Map tracker inside paid car rentals */}
                                        {isPaidCar && trackingBookingId === booking._id && (
                                            <LiveCarTracker booking={booking} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 🟢 OFFICIAL SUPPORT COLUMN */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-blue-50 text-[#004A99] rounded-full flex items-center justify-center text-2xl font-black mb-4">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-xl font-black text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500 mb-1">{user.email}</p>
                        <p className="text-sm text-gray-500 mb-4">📞 {user.phoneNumber || user.phone || 'No phone number'}</p>
                        <button 
                            onClick={() => {
                                setProfileData({
                                    name: user.name || '',
                                    email: user.email || '',
                                    phoneNumber: user.phoneNumber || user.phone || ''
                                });
                                setIsProfileModalOpen(true);
                            }}
                            className="w-full mb-4 bg-gray-100 hover:bg-gray-200 text-[#000080] py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                            ✏️ Edit Profile Settings
                        </button>
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
            {/* EDIT PROFILE MODAL */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <h2 className="text-xl font-black text-[#000080]">Edit Profile Settings</h2>
                            <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                                <input required type="email" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                <input required type="tel" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={profileData.phoneNumber} onChange={e => setProfileData({ ...profileData, phoneNumber: e.target.value })} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={isSavingProfile} type="submit" className="px-6 py-2 rounded-xl font-bold text-white bg-[#000080] hover:bg-blue-900 transition flex items-center gap-2">
                                    {isSavingProfile ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}