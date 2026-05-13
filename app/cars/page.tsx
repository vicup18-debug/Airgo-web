"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CarsPage() {
    const [selectedCar, setSelectedCar] = useState<any>(null);
    const [carFleet, setCarFleet] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🟢 SMART USER STATE
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // 1. Check for logged in user
        const userData = localStorage.getItem('airgo_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // 2. Fetch Cars
        const fetchCars = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
                const res = await fetch(`${apiUrl}/api/cars`);

                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setCarFleet(data);
                    }
                }
            } catch (error) {
                console.log("Error fetching fleet");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCars();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">

            {/* 🟢 SMART DESKTOP NAVIGATION */}
            <nav className="hidden md:flex bg-[#004A99] text-white py-4 px-8 justify-between items-center shadow-lg sticky top-0 z-40">
                <div className="flex items-center space-x-12">
                    <Link href="/">
                        <div className="text-2xl font-black text-white tracking-tight cursor-pointer">
                            Airgo<span className="text-[#FFB81C]">.ng</span>
                        </div>
                    </Link>
                    <div className="hidden md:flex space-x-6 font-semibold text-sm items-center">
                        <Link href="/" className="hover:text-[#FFB81C] transition">Hotels</Link>
                        <Link href="/cars" className="text-[#FFB81C] border-b-2 border-[#FFB81C] pb-1">Car Rentals</Link>
                    </div>
                </div>
                <div>
                    {/* 🟢 DYNAMIC BUTTON: Shows Dashboard if logged in, Sign In if not */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-sm">Hello, {user.name ? user.name.split(' ')[0] : 'Guest'}</span>
                            <Link href={user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard'}>
                                <button className="bg-[#FFB81C] text-[#004A99] px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition shadow-md">
                                    Dashboard
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/login">
                            <button className="bg-white text-[#004A99] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition shadow-md">
                                Sign In
                            </button>
                        </Link>
                    )}
                </div>
            </nav>

            {/* 🟢 SMART MOBILE TOP BAR */}
            <div className="md:hidden bg-[#004A99] text-white py-4 px-6 sticky top-0 z-40 shadow-md flex justify-between items-center">
                <div className="text-xl font-black tracking-tight">
                    Airgo<span className="text-[#FFB81C]">.ng</span>
                </div>
                <Link href={user ? (user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard') : '/login'}>
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#004A99] font-bold shadow-sm">
                        {user ? (user.name ? user.name.charAt(0).toUpperCase() : '👤') : '👤'}
                    </div>
                </Link>
            </div>

            {/* HEADER */}
            <header className="bg-white border-b border-gray-200 py-12 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Premium Executive Fleet</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Arrive in style. Book luxury vehicles and executive sedans with professional chauffeurs or self-drive options across Nigeria.
                    </p>
                </div>
            </header>

            {/* FLEET GRID */}
            <div className="max-w-7xl mx-auto px-6 mt-12">
                {isLoading ? (
                    <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Loading Live Fleet...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {carFleet.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 font-bold">No vehicles currently available in the fleet.</p>
                            </div>
                        ) : (
                            carFleet.map((car) => (
                                <div key={car._id || car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={car.image}
                                            alt={car.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                                            {car.type}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900">{car.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1 mb-4 flex items-center gap-1">
                                            <span>👤 {car.capacity}</span>
                                        </p>

                                        <div className="bg-gray-50 p-3 rounded-lg mb-6 border border-gray-100">
                                            <p className="text-xs text-gray-600 font-medium">{car.features}</p>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-2xl font-black text-[#004A99]">
                                                    {typeof car.price === 'number' ? `₦${car.price.toLocaleString()}` : car.price}
                                                </p>
                                                <p className="text-xs text-gray-500">per day</p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedCar(car)}
                                                className="bg-[#FFB81C] text-[#004A99] px-6 py-3 rounded-xl font-black text-sm hover:bg-yellow-400 transition shadow-md"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* LIVE CAR BOOKING MODAL */}
            <CarBookingModal
                isOpen={!!selectedCar}
                onClose={() => setSelectedCar(null)}
                car={selectedCar}
            />

            {/* MOBILE BOTTOM NAVIGATION */}
            <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-[#004A99] transition">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="text-[10px] font-bold">Hotels</span>
                </Link>
                <Link href="/cars" className="flex flex-col items-center text-[#004A99]">
                    <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-3.3-1.8c-.5-.1-1.1-.2-1.7-.2H9c-.6 0-1.2.1-1.7.2C3.6 8.6 2.3 10 2.3 10S-.3 10.6.2 11.1C.2 11.9 0 12.8 0 13v3c0 .6.4 1 1 1h2c0 1.7 1.3 3 3 3s3-1.3 3-3h6c0 1.7 1.3 3 3 3s3-1.3 3-3zm-13 1c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm10 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" /></svg>
                    <span className="text-[10px] font-bold">Cars</span>
                </Link>
                <Link href={user ? (user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard') : '/login'} className="flex flex-col items-center text-gray-400 hover:text-[#004A99] transition">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-[10px] font-bold">Account</span>
                </Link>
            </div>
        </div>
    );
}

// 🟢 INTERNAL MODAL COMPONENT (ALIGNED WITH BACKEND SCHEMA)
function CarBookingModal({ isOpen, onClose, car }: { isOpen: boolean, onClose: () => void, car: any }) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isProcessing, setIsProcessing] = useState(false);

    // We need dates to match the backend schema
    const [bookingDetails, setBookingDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        checkIn: '',
        checkOut: ''
    });

    if (!isOpen || !car) return null;

    // Handle string (fallback) or number (database) price
    const numericPrice = typeof car.price === 'string'
        ? parseInt(car.price.replace(/[^0-9]/g, ''))
        : car.price;

    // Optional: Calculate price based on hours/days
    const calculateTotal = () => {
        if (!bookingDetails.checkIn || !bookingDetails.checkOut) return numericPrice;
        const start = new Date(bookingDetails.checkIn);
        const end = new Date(bookingDetails.checkOut);

        // Calculate the difference in hours
        const hours = Math.max((end.getTime() - start.getTime()) / (1000 * 3600), 1);

        // Convert to days (e.g., 25 hours = 2 days of billing)
        const days = Math.ceil(hours / 24);

        return numericPrice * days;
    };

    const finalPrice = calculateTotal();

    // 🟢 REAL DATABASE SUBMISSION
    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const apiUrl = 'https://airgo-backend.onrender.com';

            // Generate a guest ID since they aren't logged in via the Client Dashboard
            const guestId = 'guest_' + Math.random().toString(36).substr(2, 9);

            // 🟢 THIS PAYLOAD NOW PERFECTLY MATCHES YOUR BACKEND SCHEMA
            const payload = {
                userId: guestId,
                itemId: car._id || car.id,
                itemName: car.name,
                itemType: 'car',
                partnerId: car.partnerId || 'airgo_direct', // Assign to partner if available
                checkIn: bookingDetails.checkIn, // Uses Datetime format
                checkOut: bookingDetails.checkOut, // Uses Datetime format
                guests: 1,
                totalPrice: finalPrice.toLocaleString(),
                status: 'Pending Escrow'
            };

            const response = await fetch(`${apiUrl}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Booking failed on server");
            }

            console.log("✅ Booking Saved Successfully");
            setStep(3); // Show Success UI

        } catch (error: any) {
            console.error("❌ Checkout Error:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setBookingDetails({ name: '', email: '', phone: '', address: '', checkIn: '', checkOut: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* STEP 1: CONFIRMATION & POLICY */}
                {step === 1 && (
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">Confirm Vehicle</h2>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
                        </div>

                        <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                            <img src={car.image} alt={car.name} className="w-24 h-24 rounded-xl object-cover" />
                            <div>
                                <h3 className="text-lg font-bold text-[#004A99]">{car.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">Daily Rate</p>
                                <p className="text-xl font-black text-gray-900 mt-1">₦{numericPrice.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">🛡️</span>
                                <h4 className="text-sm font-black text-yellow-800 uppercase tracking-wide">Airgo Escrow Protection</h4>
                            </div>
                            <p className="text-sm text-yellow-700 leading-relaxed">
                                Your funds are held securely. The fleet manager will only receive payment after your vehicle is delivered to your location.
                            </p>
                        </div>

                        <button onClick={() => setStep(2)} className="w-full bg-[#004A99] text-white py-4 rounded-xl font-black text-lg hover:bg-blue-800 transition shadow-lg">
                            Accept & Continue
                        </button>
                    </div>
                )}

                {/* STEP 2: PAYMENT & DETAILS */}
                {step === 2 && (
                    <div className="p-8 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center mb-6">
                            <button onClick={() => setStep(1)} className="text-[#004A99] font-bold text-sm mr-4">← Back</button>
                            <h2 className="text-xl font-black text-gray-900">Delivery Details</h2>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#004A99]" value={bookingDetails.name} onChange={e => setBookingDetails({ ...bookingDetails, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    {/* 🟢 DATETIME LOCAL INPUT */}
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Pickup (Date & Time)</label>
                                    <input required type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#004A99]" value={bookingDetails.checkIn} onChange={e => setBookingDetails({ ...bookingDetails, checkIn: e.target.value })} />
                                </div>
                                <div>
                                    {/* 🟢 DATETIME LOCAL INPUT */}
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Return (Date & Time)</label>
                                    <input required type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#004A99]" value={bookingDetails.checkOut} onChange={e => setBookingDetails({ ...bookingDetails, checkOut: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Delivery Address / Hotel</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#004A99]" placeholder="Where should we bring the car?" value={bookingDetails.address} onChange={e => setBookingDetails({ ...bookingDetails, address: e.target.value })} />
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Card Information</label>
                                <div className="relative">
                                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 mb-2 opacity-50 cursor-not-allowed" placeholder="Card processing disabled in demo mode" disabled />
                                </div>
                                <p className="text-xs text-blue-600 font-bold mt-2">Testing Mode: This will create the booking without charging a card.</p>
                            </div>

                            <div className="flex justify-between items-end pt-2">
                                <span className="text-gray-500 font-bold">Total Escrow</span>
                                <span className="text-2xl font-black text-[#004A99]">₦{finalPrice.toLocaleString()}</span>
                            </div>

                            <button type="submit" disabled={isProcessing} className={`w-full py-4 rounded-xl font-black text-lg transition shadow-lg mt-4 ${isProcessing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FFB81C] text-[#004A99] hover:bg-yellow-400'}`}>
                                {isProcessing ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </form>
                    </div>
                )}

                {/* STEP 3: SUCCESS */}
                {step === 3 && (
                    <div className="p-10 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <span className="text-4xl text-green-600">✓</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-600 mb-8">Your <span className="font-bold text-[#004A99]">{car.name}</span> has been reserved.</p>

                        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl w-full text-left mb-8">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">Dispatch Scheduled</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Our dispatch manager will contact you shortly at the details provided to confirm delivery.
                            </p>
                        </div>
                        <button onClick={handleClose} className="w-full bg-[#004A99] text-white py-4 rounded-xl font-black text-lg hover:bg-blue-800 transition shadow-lg">
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}