"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import Chatroom from '../../components/Chatroom';
import Link from 'next/link';

interface DriverCar {
    _id: string;
    name: string;
    type: string;
    retailPrice: number;
    vehicleNumber: string;
    location: string;
    state: string;
    available: boolean;
}

export default function DriverDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [myUserId, setMyUserId] = useState<string>('');
    const [assignedCar, setAssignedCar] = useState<DriverCar | null>(null);
    
    // Tab system: available dispatches vs active driver trips
    const [activeTab, setActiveTab] = useState<'dispatches' | 'trips'>('dispatches');
    const [availableRequests, setAvailableRequests] = useState<any[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Bidding states
    const [bidFares, setBidFares] = useState<Record<string, string>>({});
    const [submittingBidId, setSubmittingBidId] = useState<string | null>(null);
    const [isAcceptingId, setIsAcceptingId] = useState<string | null>(null);

    // Trip action states
    const [isUpdatingTripId, setIsUpdatingTripId] = useState<string | null>(null);

    // Active Chat states
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatBookingId, setChatBookingId] = useState('');
    const [chatBookingName, setChatBookingName] = useState('');

    // Telemetry simulator states
    const [simulatedSpeed, setSimulatedSpeed] = useState(0);
    const [simulatedFuel, setSimulatedFuel] = useState(82);

    const socketRef = useRef<Socket | null>(null);
    const isMutedSound = useRef(false);

    // 🟢 1. Authentication & Initial Loading
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('airgo_user');
            const token = localStorage.getItem('airgo_token');

            if (!storedUser || !token) {
                toast.error("Please log in first.");
                router.push('/login');
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'driver') {
                toast.error("Unauthorized access. Redirected.");
                router.push('/login');
                return;
            }

            setUser(parsedUser);
            const secureId = parsedUser.id || parsedUser.userId || parsedUser._id;
            setMyUserId(secureId);

            // Fetch assigned vehicle & initial listings
            fetchDriverData(secureId);
        }
    }, [router]);

    // 🟢 2. Fetch Driver & Assigned Vehicle Details
    const fetchDriverData = async (driverId: string) => {
        setIsLoading(true);
        const token = localStorage.getItem('airgo_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

        try {
            // Fetch assigned vehicle
            const carRes = await fetch(`${apiUrl}/api/cars/driver/${driverId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (carRes.ok) {
                const carData = await carRes.json();
                setAssignedCar(carData);
            } else {
                setAssignedCar(null);
            }

            // Fetch available dispatches
            const reqRes = await fetch(`${apiUrl}/api/ride-requests/available`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (reqRes.ok) {
                const reqData = await reqRes.json();
                setAvailableRequests(reqData);
            }

            // Fetch driver bookings
            const bookingsRes = await fetch(`${apiUrl}/api/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                setMyBookings(bookingsData);
            }
        } catch (err) {
            console.error("Error fetching driver data:", err);
            toast.error("Failed to load active portal data.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper refresh trigger
    const silentRefresh = async () => {
        if (!myUserId) return;
        const token = localStorage.getItem('airgo_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
        try {
            const reqRes = await fetch(`${apiUrl}/api/ride-requests/available`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (reqRes.ok) {
                const reqData = await reqRes.json();
                setAvailableRequests(reqData);
            }

            const bookingsRes = await fetch(`${apiUrl}/api/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                setMyBookings(bookingsData);
            }
        } catch (err) {
            console.warn("Silent refresh error", err);
        }
    };

    // 🟢 3. WebSockets setup for dispatches & updates
    useEffect(() => {
        if (!user || !myUserId) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
        const socket = io(apiUrl, {
            transports: ['websocket', 'polling']
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log("📡 Driver Portal Connected to WebSocket!");
            socket.emit('join_drivers', { city: user.city || 'Abuja' });
            socket.emit('join_partner', { partnerId: myUserId });
        });

        // Live dispatch broadcast
        socket.on('new_booking_request', (booking: any) => {
            console.log("📡 WebSocket: Live dispatch offer:", booking);
            setAvailableRequests(prev => {
                if (prev.some(r => r._id === booking._id)) return prev;
                return [booking, ...prev];
            });
            playNotificationSound();
            toast.success(`⚡ New Ride Request from ${booking.clientName || 'Guest'}!`, {
                duration: 6000,
                position: 'top-center',
                icon: '🚕'
            });
        });

        // Real-time dispatch claimed check
        socket.on('booking_claimed', (data: any) => {
            setAvailableRequests(prev => prev.filter(r => r._id !== data.bookingId));
        });

        // Booking status changes
        socket.on('booking_updated', (updated: any) => {
            setMyBookings(prev => {
                const index = prev.findIndex(b => b._id === updated._id);
                if (index !== -1) {
                    const next = [...prev];
                    next[index] = updated;
                    return next;
                } else if (updated.driverId === myUserId) {
                    return [updated, ...prev];
                }
                return prev;
            });
            silentRefresh();
        });

        return () => {
            socket.disconnect();
        };
    }, [user, myUserId]);

    // Telemetry animation simulator
    useEffect(() => {
        const interval = setInterval(() => {
            const hasActiveTrip = myBookings.some(b => b.status === 'Trip Started');
            if (hasActiveTrip) {
                setSimulatedSpeed(Math.floor(40 + Math.random() * 35));
                setSimulatedFuel(prev => Math.max(10, prev - (Math.random() > 0.8 ? 1 : 0)));
            } else {
                setSimulatedSpeed(0);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [myBookings]);

    // Notification Sound helper
    const playNotificationSound = () => {
        if (isMutedSound.current) return;
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.15); // E6
            
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } catch (e) {
            console.warn("Notification sound blocked by browser autoplay rules.");
        }
    };

    // 🟢 4. Bidding Controls
    const handleQuickIncrement = (reqId: string, baseFare: number, increment: number) => {
        const currentVal = parseInt(bidFares[reqId] || String(baseFare), 10);
        setBidFares(prev => ({
            ...prev,
            [reqId]: String(currentVal + increment)
        }));
    };

    const submitBidOffer = async (reqId: string, basePrice: number, isBookingBased = false) => {
        const inputVal = bidFares[reqId];
        const fare = inputVal ? parseInt(inputVal, 10) : basePrice;

        if (!fare || fare <= 0) {
            toast.error("Please enter a valid fare amount.");
            return;
        }

        setSubmittingBidId(reqId);
        const token = localStorage.getItem('airgo_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
        
        // Decide if booking-based bidding or rideRequest bidding
        const endpoint = isBookingBased ? `/api/bookings/${reqId}/driver-offers` : `/api/ride-requests/${reqId}/driver-offers`;

        try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fare, vehicleDetails: assignedCar ? `${assignedCar.name} (${assignedCar.vehicleNumber})` : 'Premium Vehicle' })
            });

            if (response.ok) {
                toast.success("Your bid offer has been submitted!");
                silentRefresh();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to submit bid.");
            }
        } catch (err) {
            toast.error("Connection error. Could not place offer.");
        } finally {
            setSubmittingBidId(null);
        }
    };

    const acceptClientOffer = async (reqId: string) => {
        setIsAcceptingId(reqId);
        const token = localStorage.getItem('airgo_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

        try {
            const response = await fetch(`${apiUrl}/api/ride-requests/${reqId}/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success("Offer accepted! Check 'My Trips' for pickup locations.", { duration: 5000 });
                setActiveTab('trips');
                silentRefresh();
            } else {
                const data = await response.json();
                toast.error(data.message || "Could not claim dispatch request.");
            }
        } catch (err) {
            toast.error("Network issue. Failed to accept.");
        } finally {
            setIsAcceptingId(null);
        }
    };

    // 🟢 5. Trip Management Operations
    const handleStartTrip = async (bookingId: string) => {
        setIsUpdatingTripId(bookingId);
        const token = localStorage.getItem('airgo_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

        try {
            const response = await fetch(`${apiUrl}/api/bookings/${bookingId}/start-trip`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success("Trip started! Drive safe.");
                silentRefresh();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to initiate trip.");
            }
        } catch (err) {
            toast.error("Server connection lost.");
        } finally {
            setIsUpdatingTripId(null);
        }
    };

    const handleEndTrip = async (bookingId: string) => {
        setIsUpdatingTripId(bookingId);
        const token = localStorage.getItem('airgo_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

        try {
            const response = await fetch(`${apiUrl}/api/bookings/${bookingId}/end-trip`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success("Trip completed successfully! Ride ended.");
                silentRefresh();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to finalize trip.");
            }
        } catch (err) {
            toast.error("Server connection lost.");
        } finally {
            setIsUpdatingTripId(null);
        }
    };

    // Logout controller
    const handleLogout = () => {
        localStorage.removeItem('airgo_token');
        localStorage.removeItem('airgo_user');
        toast.success("Signed out successfully.");
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#0D1117] text-white flex flex-col font-sans">
            {/* TOP PREMIUM DRIVER HEADER */}
            <header className="bg-slate-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-20 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🚕</span>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                            Airgo <span className="text-[#FFB81C] uppercase text-xs px-2 py-0.5 bg-yellow-400/10 rounded-full border border-yellow-400/20">Driver Portal</span>
                        </h1>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Welcome back, {user?.name || 'Driver'}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-black text-green-400 uppercase tracking-wider">Online ({user?.city || 'City'})</span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-inner"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* VEHICLE DETAILS SUMMARY BAR */}
            <section className="bg-gradient-to-r from-blue-900/40 to-slate-900 px-6 py-5 border-b border-gray-800 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {assignedCar ? (
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl border border-blue-500/30 flex items-center justify-center text-2xl">
                                🚗
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-white">{assignedCar.name}</h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Plate: <span className="font-mono bg-slate-800 text-yellow-400 px-1.5 py-0.5 rounded text-[11px] font-bold border border-gray-700">{assignedCar.vehicleNumber}</span> | Type: {assignedCar.type}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl text-xs font-bold">
                            <span>⚠️</span>
                            <span>No active vehicle profile linked to your driver profile. Fleet Managers must assign you to a vehicle.</span>
                        </div>
                    )}

                    {/* Sim telemetry indicators */}
                    {myBookings.some(b => b.status === 'Trip Started') && (
                        <div className="flex items-center gap-5 bg-slate-800/80 p-3 rounded-2xl border border-gray-700/50 shadow-inner">
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Speed</p>
                                <p className="text-lg font-black text-blue-400">{simulatedSpeed} <span className="text-[10px]">km/h</span></p>
                            </div>
                            <div className="w-px h-8 bg-gray-700"></div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fuel</p>
                                <p className="text-lg font-black text-green-400">{simulatedFuel}%</p>
                            </div>
                            <div className="w-px h-8 bg-gray-700"></div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Telemetry</p>
                                <span className="text-xs text-blue-400 font-bold animate-pulse">🛰️ Syncing</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* TAB SELECTORS */}
            <div className="flex bg-slate-900 border-b border-gray-800 shadow-sm sticky top-[73px] z-10">
                <button 
                    onClick={() => setActiveTab('dispatches')}
                    className={`flex-1 py-4 text-center text-sm font-black transition relative ${activeTab === 'dispatches' ? 'text-[#FFB81C]' : 'text-gray-400 hover:text-white'}`}
                >
                    Available Dispatches
                    {availableRequests.length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                            {availableRequests.length}
                        </span>
                    )}
                    {activeTab === 'dispatches' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFB81C]"></div>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('trips')}
                    className={`flex-1 py-4 text-center text-sm font-black transition relative ${activeTab === 'trips' ? 'text-[#FFB81C]' : 'text-gray-400 hover:text-white'}`}
                >
                    My Active Trips
                    {myBookings.filter(b => ['Paid', 'Paid - Escrow Secured', 'Trip Started', 'Approved for Disbursement', 'Confirmed'].includes(b.status)).length > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                            {myBookings.filter(b => ['Paid', 'Paid - Escrow Secured', 'Trip Started', 'Approved for Disbursement', 'Confirmed'].includes(b.status)).length}
                        </span>
                    )}
                    {activeTab === 'trips' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFB81C]"></div>
                    )}
                </button>
            </div>

            {/* MAIN DYNAMIC CONTENT CONTAINER */}
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-semibold text-sm">Syncing with live dispatch server...</p>
                    </div>
                ) : activeTab === 'dispatches' ? (
                    /* 🚕 DISPATCHES TAB */
                    <div className="space-y-6">
                        {availableRequests.length === 0 ? (
                            <div className="text-center py-16 bg-slate-900/50 border border-gray-800 rounded-3xl p-8 shadow-inner">
                                <span className="text-5xl">📡</span>
                                <h3 className="text-lg font-extrabold text-white mt-4">Waiting for dispatches...</h3>
                                <p className="text-sm text-gray-400 max-w-sm mx-auto mt-2 leading-relaxed">
                                    New taxi ride requests broadcasted by passengers in your city will appear here in real-time. Keep this page open.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {availableRequests.map((req) => {
                                    const hasSubmittedBid = req.driverOffers?.some((o: any) => o.driverId === myUserId);
                                    const myBid = req.driverOffers?.find((o: any) => o.driverId === myUserId);
                                    const rawPrice = parseFloat(req.offeredPrice?.replace(/[^0-9.-]+/g, "")) || 0;

                                    return (
                                        <div 
                                            key={req._id}
                                            className="bg-slate-900 border border-gray-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-gray-700 transition duration-300 relative overflow-hidden"
                                        >
                                            {/* Accent line */}
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#000080] to-blue-600"></div>
                                            
                                            <div>
                                                <div className="flex justify-between items-start gap-3">
                                                    <div>
                                                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                                            {req.clientName || 'Valued Guest'}
                                                        </h3>
                                                        <p className="text-xs text-[#FFB81C] font-semibold mt-0.5 uppercase tracking-wider">{req.travelScope || 'Intra-City'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Passenger Offer</p>
                                                        <p className="text-xl font-black text-emerald-400 mt-0.5">₦{rawPrice.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 bg-slate-800/40 rounded-2xl p-4 border border-gray-850 space-y-3">
                                                    <div className="flex gap-3 text-sm">
                                                        <span className="text-blue-400">🟢</span>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pickup Location</p>
                                                            <p className="text-xs font-semibold text-gray-200 mt-0.5">{req.fromAddress}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 text-sm">
                                                        <span className="text-red-400">🔴</span>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Destination</p>
                                                            <p className="text-xs font-semibold text-gray-200 mt-0.5">{req.toAddress}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-6 mt-4 text-xs font-bold text-gray-400">
                                                    <div>
                                                        <span>📏 Distance:</span> <span className="text-white">{req.distance || '0'} km</span>
                                                    </div>
                                                    <div>
                                                        <span>📅 Time:</span> <span className="text-white">{req.checkIn}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-gray-800">
                                                {hasSubmittedBid ? (
                                                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-wider">Your Active Bid Offer</p>
                                                            <p className="text-xl font-black text-[#FFB81C] mt-0.5">₦{myBid.fare.toLocaleString()}</p>
                                                        </div>
                                                        
                                                        {/* Let driver resubmit/update bid */}
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="number"
                                                                placeholder="Update fare"
                                                                className="w-24 px-3 py-1.5 rounded-xl border border-gray-700 bg-slate-900 text-white text-xs font-semibold text-center"
                                                                value={bidFares[req._id] || ''}
                                                                onChange={e => setBidFares(prev => ({ ...prev, [req._id]: e.target.value }))}
                                                            />
                                                            <button
                                                                disabled={submittingBidId === req._id}
                                                                onClick={() => submitBidOffer(req._id, rawPrice)}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50"
                                                            >
                                                                {submittingBidId === req._id ? 'Updating...' : 'Update'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {/* Indrive Counter bidding interface */}
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Counter Bid Option (₦)</label>
                                                            
                                                            {/* Quick bid helpers */}
                                                            <div className="flex gap-2 mb-3">
                                                                <button 
                                                                    onClick={() => handleQuickIncrement(req._id, rawPrice, 500)}
                                                                    className="bg-slate-800 hover:bg-slate-700 text-xs font-extrabold px-3 py-1.5 rounded-lg border border-gray-700 transition"
                                                                >
                                                                    +₦500
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleQuickIncrement(req._id, rawPrice, 1000)}
                                                                    className="bg-slate-800 hover:bg-slate-700 text-xs font-extrabold px-3 py-1.5 rounded-lg border border-gray-700 transition"
                                                                >
                                                                    +₦1k
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleQuickIncrement(req._id, rawPrice, 2000)}
                                                                    className="bg-slate-800 hover:bg-slate-700 text-xs font-extrabold px-3 py-1.5 rounded-lg border border-gray-700 transition"
                                                                >
                                                                    +₦2k
                                                                </button>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <div className="relative flex-1">
                                                                    <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-500">₦</span>
                                                                    <input 
                                                                        type="number"
                                                                        placeholder={`e.g. ${rawPrice + 1000}`}
                                                                        className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-gray-700 bg-slate-850 text-white font-bold"
                                                                        value={bidFares[req._id] || ''}
                                                                        onChange={e => setBidFares(prev => ({ ...prev, [req._id]: e.target.value }))}
                                                                    />
                                                                </div>
                                                                
                                                                <button
                                                                    disabled={submittingBidId === req._id}
                                                                    onClick={() => submitBidOffer(req._id, rawPrice)}
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black tracking-tight transition disabled:opacity-50 shadow-md"
                                                                >
                                                                    {submittingBidId === req._id ? 'Bidding...' : 'Submit Bid Offer'}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Direct Accept button */}
                                                        <button 
                                                            disabled={isAcceptingId === req._id}
                                                            onClick={() => acceptClientOffer(req._id)}
                                                            className="w-full bg-[#000080] hover:bg-blue-900 text-white py-3 rounded-xl text-xs font-black tracking-wider uppercase transition shadow-lg disabled:opacity-50"
                                                        >
                                                            {isAcceptingId === req._id ? 'Claiming ride...' : `Accept Passenger Fare (₦${rawPrice.toLocaleString()})`}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* 🧳 ACTIVE TRIPS TAB */
                    <div className="space-y-6">
                        {myBookings.filter(b => ['Pending Escrow', 'Accepted', 'Paid - Escrow Secured', 'Approved for Disbursement', 'Confirmed', 'Trip Started', 'Trip Start Pending', 'Trip End Pending', 'Completed'].includes(b.status)).length === 0 ? (
                            <div className="text-center py-16 bg-slate-900/50 border border-gray-800 rounded-3xl p-8 shadow-inner">
                                <span className="text-5xl">🚗</span>
                                <h3 className="text-lg font-extrabold text-white mt-4">No active trips found</h3>
                                <p className="text-sm text-gray-400 max-w-sm mx-auto mt-2 leading-relaxed">
                                    When you accept dispatches or when client bookings are assigned to you, your active trips and details will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {myBookings
                                    .filter(b => ['Pending Escrow', 'Accepted', 'Paid - Escrow Secured', 'Approved for Disbursement', 'Confirmed', 'Trip Started', 'Trip Start Pending', 'Trip End Pending', 'Completed'].includes(b.status))
                                    .map((booking) => {
                                        const rawPrice = parseFloat(booking.totalPrice?.replace(/[^0-9.-]+/g, "")) || 0;
                                        const isTripActive = booking.status === 'Trip Started';
                                        const isTripPendingStart = booking.status === 'Trip Start Pending' || ['Paid', 'Paid - Escrow Secured', 'Approved for Disbursement', 'Confirmed', 'Accepted'].includes(booking.status);

                                        return (
                                            <div 
                                                key={booking._id}
                                                className="bg-slate-900 border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden"
                                            >
                                                {/* Header status badge */}
                                                <div className="flex flex-wrap justify-between items-start gap-3">
                                                    <div>
                                                        <h3 className="text-base font-extrabold text-white">{booking.itemName}</h3>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">Booking Ref: {booking._id.toString().substring(0, 8)}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                        isTripActive 
                                                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse'
                                                            : booking.status === 'Completed'
                                                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                                    {/* Passenger Details */}
                                                    <div className="bg-slate-850 p-4 rounded-2xl border border-gray-800">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Client Details</p>
                                                        <p className="text-sm font-extrabold text-white">{booking.clientName || 'Passenger'}</p>
                                                        <p className="text-xs text-gray-400 mt-1">📧 {booking.clientEmail || 'N/A'}</p>
                                                        <p className="text-xs text-gray-400 mt-1">📞 {booking.clientPhone || 'N/A'}</p>
                                                    </div>

                                                    {/* Route details */}
                                                    <div className="bg-slate-850 p-4 rounded-2xl border border-gray-800 col-span-1 md:col-span-2">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Trip Specifications</p>
                                                        <p className="text-xs text-gray-300 font-medium leading-relaxed">{booking.deliveryAddress}</p>
                                                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-800 text-xs font-bold text-gray-400">
                                                            <div>
                                                                <span>Pickup Date:</span> <span className="text-white block mt-0.5">{booking.checkIn}</span>
                                                            </div>
                                                            <div>
                                                                <span>Payout Fare:</span> <span className="text-emerald-400 block mt-0.5 text-base font-black">₦{rawPrice.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Simulated Live Route Map Telemetry when active */}
                                                {isTripActive && (
                                                    <div className="mt-6 bg-slate-950/80 p-5 rounded-3xl border border-gray-800">
                                                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2">
                                                            <span>🚀 Simulating Live Telemetry Route...</span>
                                                            <span className="text-blue-400">{simulatedSpeed} km/h</span>
                                                        </div>
                                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full transition-all duration-1000"
                                                                style={{ width: '45%' }}
                                                            ></div>
                                                            <div className="absolute left-[45%] top-[-3px] w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow animate-ping"></div>
                                                        </div>
                                                        <div className="flex justify-between text-[9px] text-gray-500 mt-1.5 font-bold uppercase tracking-wider">
                                                            <span>Origin Address</span>
                                                            <span>Simulating Ride Status (45% Complete)</span>
                                                            <span>Destination Address</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actions block */}
                                                <div className="mt-6 pt-4 border-t border-gray-800 flex flex-wrap gap-3 items-center justify-between">
                                                    <div>
                                                        {/* Passenger Chat Trigger */}
                                                        {booking.status !== 'Completed' && (
                                                            <button 
                                                                onClick={() => {
                                                                    setChatBookingId(booking._id);
                                                                    setChatBookingName(booking.itemName);
                                                                    setIsChatOpen(true);
                                                                }}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-md"
                                                            >
                                                                💬 Chat with Passenger
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {/* Start Trip state machine controls */}
                                                        {isTripPendingStart && booking.status !== 'Completed' && (
                                                            <button
                                                                disabled={isUpdatingTripId === booking._id}
                                                                onClick={() => handleStartTrip(booking._id)}
                                                                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition shadow-md disabled:opacity-50"
                                                            >
                                                                {isUpdatingTripId === booking._id ? 'Starting...' : '🟢 Start Trip'}
                                                            </button>
                                                        )}

                                                        {/* End Trip controls */}
                                                        {isTripActive && (
                                                            <button
                                                                disabled={isUpdatingTripId === booking._id}
                                                                onClick={() => handleEndTrip(booking._id)}
                                                                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white px-6 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition shadow-md disabled:opacity-50"
                                                            >
                                                                {isUpdatingTripId === booking._id ? 'Ending...' : '🔴 Complete / End Trip'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* passenger real-time chat overlay */}
            {isChatOpen && chatBookingId && (
                <Chatroom
                    isOpen={isChatOpen}
                    onClose={() => {
                        setIsChatOpen(false);
                        setChatBookingId('');
                        setChatBookingName('');
                    }}
                    bookingId={chatBookingId}
                    bookingName={chatBookingName}
                    currentUser={{
                        id: myUserId,
                        name: user?.name || 'Driver',
                        role: 'partner' // Act as partner role for chat compatibility
                    }}
                />
            )}
        </div>
    );
}
