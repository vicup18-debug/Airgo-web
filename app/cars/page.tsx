"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 🟢 THE FALLBACK MATRIX: If the database is empty, we inject this premium fleet automatically so the site never looks broken!
const FALLBACK_FLEET = [
    {
        id: 'airgo_fleet_01',
        name: 'Mercedes-Benz G63 AMG',
        type: 'Luxury SUV',
        price: 450000,
        capacity: '4',
        features: 'Bulletproof (B6), VIP Chauffeur, Armed Escort Optional',
        image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=800&q=80',
        partnerId: 'airgo_direct'
    },
    {
        id: 'airgo_fleet_02',
        name: 'Range Rover Autobiography',
        type: 'Premium SUV',
        price: 350000,
        capacity: '4',
        features: 'Chauffeur Included, Airport Meet & Greet, Deep Tint',
        image: 'https://images.unsplash.com/photo-1606016159991-d8544e311546?auto=format&fit=crop&w=800&q=80',
        partnerId: 'airgo_direct'
    },
    {
        id: 'airgo_fleet_03',
        name: 'Mercedes-Benz Maybach S680',
        type: 'Executive Sedan',
        price: 500000,
        capacity: '3',
        features: 'Executive Rear Seating, Champagne Cooler, VIP Escort',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?auto=format&fit=crop&w=800&q=80',
        partnerId: 'airgo_direct'
    }
];

export default function CarsPage() {
    const [selectedCar, setSelectedCar] = useState<any>(null);
    const [carFleet, setCarFleet] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // SEARCH BAR STATES
    const [searchQuery, setSearchQuery] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('airgo_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const fetchCars = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
                const res = await fetch(`${apiUrl}/api/cars`);

                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setCarFleet(data);
                    } else {
                        setCarFleet(FALLBACK_FLEET); // 🟢 Inject fallback if DB is empty
                    }
                }
            } catch (error) {
                console.log("Error fetching fleet, using fallback data.");
                setCarFleet(FALLBACK_FLEET); // 🟢 Inject fallback on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchCars();
    }, []);

    // LIVE FILTERING LOGIC
    const filteredCars = carFleet.filter(car => {
        const searchLower = searchQuery.toLowerCase();
        return (
            (car.name && car.name.toLowerCase().includes(searchLower)) ||
            (car.type && car.type.toLowerCase().includes(searchLower)) ||
            (car.features && car.features.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-[72px] md:pb-0 flex flex-col">

            {/* SMART DESKTOP NAVIGATION */}
            <nav className="hidden md:flex bg-[#000080] text-white py-4 px-8 justify-between items-center shadow-lg sticky top-0 z-40">
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
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-sm text-white">Hello, {user.name ? user.name.split(' ')[0] : 'Guest'}</span>
                            <Link href={user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard'}>
                                <button className="bg-[#FFB81C] text-[#000080] px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition shadow-md">
                                    Dashboard
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/login">
                            <button className="bg-white text-[#000080] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition shadow-md">
                                Sign In
                            </button>
                        </Link>
                    )}
                </div>
            </nav>

            {/* SMART MOBILE TOP BAR */}
            <div className="md:hidden bg-[#000080] text-white py-4 px-6 sticky top-0 z-40 shadow-md flex justify-between items-center">
                <div className="text-xl font-black tracking-tight">
                    Airgo<span className="text-[#FFB81C]">.ng</span>
                </div>
                <Link href={user ? (user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard') : '/login'}>
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#000080] font-bold shadow-sm">
                        {user ? (user.name ? user.name.charAt(0).toUpperCase() : '👤') : '👤'}
                    </div>
                </Link>
            </div>

            {/* HEADER */}
            <div className="flex-grow">
                <header className="bg-[#000080] pb-32 pt-12 px-6 rounded-b-[2.5rem] md:rounded-none relative text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Premium Executive Fleet</h1>
                        <p className="text-sm md:text-lg text-blue-100 max-w-2xl mx-auto">
                            Arrive in style. Book luxury vehicles and executive sedans with professional chauffeurs or self-drive options.
                        </p>
                    </div>
                </header>

                {/* FLOATING SEARCH BAR */}
                <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-10 mb-12">
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                        <form className="flex flex-col md:flex-row gap-4">
                            <div className="flex-[2]">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Where to / Vehicle?</label>
                                <input
                                    type="text"
                                    placeholder="City, SUV, Bulletproof..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] focus:ring-2 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Pickup</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Return</label>
                                <input
                                    type="date"
                                    min={pickupDate || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>
                </div>

                {/* FLEET GRID */}
                <div className="max-w-7xl mx-auto px-6 mb-16">
                    {isLoading ? (
                        <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Loading Live Fleet...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCars.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-900 font-bold text-xl">No vehicles matched your search.</p>
                                    <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                                </div>
                            ) : (
                                filteredCars.map((car) => (
                                    <div key={car._id || car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 group flex flex-col">
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={car.image}
                                                alt={car.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                                                {car.type}
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight">{car.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1 mb-4 flex items-center gap-1 font-bold">
                                                <span>👤 Up to {car.capacity} Passengers</span>
                                            </p>

                                            <div className="bg-gray-50 p-3 rounded-lg mb-6 border border-gray-100 flex-grow">
                                                <p className="text-xs text-gray-600 font-medium leading-relaxed">{car.features}</p>
                                            </div>

                                            <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                                                <div>
                                                    <p className="text-2xl font-black text-[#000080]">
                                                        {typeof car.price === 'number' ? `₦${car.price.toLocaleString()}` : car.price}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">per day</p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedCar(car)}
                                                    className="bg-[#FFB81C] text-[#000080] px-6 py-3 rounded-xl font-black text-sm hover:bg-yellow-400 transition shadow-md"
                                                >
                                                    Book Escrow
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 🟢 UPGRADED: Clean, Institutional Labeled Footer */}
            <footer className="bg-[#000080] text-white py-16 px-6 mt-auto border-t-4 border-[#FFB81C]">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <h3 className="text-2xl font-black mb-4">Airgo<span className="text-[#FFB81C]">.ng</span></h3>
                        <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
                            Airgo.ng is Nigeria's premier escrow-protected luxury asset marketplace. We secure your transactions, holding booking funds safely until your stay or rental is completed flawlessly.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-[#FFB81C] uppercase tracking-wider text-xs">24/7 Support & Dispatch</h4>
                        <div className="space-y-3 text-sm text-blue-200 font-medium">
                            <p className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Hotel Operations & Lodging</span>
                                <a href="tel:+2348066058930" className="hover:text-white transition mt-0.5 text-base font-black">📞 +234 806 605 8930</a>
                            </p>
                            <p className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">VIP Fleet & Chauffeur Logistics</span>
                                <a href="tel:+2348026696170" className="hover:text-white transition mt-0.5 text-base font-black">📞 +234 802 669 6170</a>
                            </p>
                            <p className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Official Escalations & Corporate Line</span>
                                <a href="tel:07078344409" className="hover:text-white transition mt-0.5 text-base font-black">📞 07078344409</a>
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-[#FFB81C] uppercase tracking-wider text-xs">Platform Governance</h4>
                        <ul className="text-sm text-blue-200 space-y-3 font-medium">
                            <li><Link href="/escrow" className="hover:text-white transition">Escrow Protection Agreement</Link></li>
                            <li><Link href="/join" className="hover:text-[#FFB81C] transition">Become a Verified Partner</Link></li>
                            <li><a href="mailto:support@airgo.ng" className="hover:text-white transition">Corporate Inquiry: support@airgo.ng</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-blue-900 text-center text-xs text-blue-300 font-medium">
                    &copy; {new Date().getFullYear()} Airgo Travel & Tour Ltd (Airgo.ng). All rights reserved. Managed across Abuja and Kaduna regions, Nigeria.
                </div>
            </footer>

            {/* LIVE CAR BOOKING MODAL */}
            <CarBookingModal
                isOpen={!!selectedCar}
                onClose={() => setSelectedCar(null)}
                car={selectedCar}
            />

            {/* MOBILE BOTTOM NAVIGATION */}
            <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-[#000080] transition">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="text-[10px] font-bold">Hotels</span>
                </Link>
                <Link href="/cars" className="flex flex-col items-center text-[#000080]">
                    <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-3.3-1.8c-.5-.1-1.1-.2-1.7-.2H9c-.6 0-1.2.1-1.7.2C3.6 8.6 2.3 10 2.3 10S-.3 10.6.2 11.1C.2 11.9 0 12.8 0 13v3c0 .6.4 1 1 1h2c0 1.7 1.3 3 3 3s3-1.3 3-3h6c0 1.7 1.3 3 3 3s3-1.3 3-3zm-13 1c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm10 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" /></svg>
                    <span className="text-[10px] font-bold">Car Rental</span>
                </Link>
                <Link href={user ? (user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard') : '/login'} className="flex flex-col items-center text-gray-400 hover:text-[#000080] transition">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-[10px] font-bold">Account</span>
                </Link>
            </div>
        </div>
    );
}

// 🟢 INTERNAL MODAL COMPONENT
function CarBookingModal({ isOpen, onClose, car }: { isOpen: boolean, onClose: () => void, car: any }) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const [bookingDetails, setBookingDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        checkIn: '',
        checkOut: ''
    });

    if (!isOpen || !car) return null;

    const numericPrice = typeof car.price === 'string'
        ? parseInt(car.price.replace(/[^0-9]/g, ''))
        : car.price;

    const calculateTotal = () => {
        if (!bookingDetails.checkIn || !bookingDetails.checkOut) return numericPrice;
        const start = new Date(bookingDetails.checkIn);
        const end = new Date(bookingDetails.checkOut);
        const hours = Math.max((end.getTime() - start.getTime()) / (1000 * 3600), 1);
        const days = Math.ceil(hours / 24);
        return numericPrice * days;
    };

    const finalPrice = calculateTotal();

    const handleClose = () => {
        setStep(1);
        setBookingDetails({
            name: '',
            email: '',
            phone: '',
            address: '',
            checkIn: '',
            checkOut: ''
        });
        onClose();
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const storedUser = localStorage.getItem('airgo_user');
            const finalUserId = storedUser ? JSON.parse(storedUser).id || JSON.parse(storedUser).userId : `guest_${Math.random().toString(36).substring(7)}`;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

            const payload = {
                userId: finalUserId,
                itemId: car._id || car.id,
                itemName: car.name,
                itemType: 'car',
                partnerId: car.partnerId || 'airgo_direct',
                checkIn: bookingDetails.checkIn,
                checkOut: bookingDetails.checkOut,
                guests: 1,
                totalPrice: finalPrice.toLocaleString(),
                status: 'Pending Escrow',
                clientName: bookingDetails.name,
                clientEmail: bookingDetails.email,
                clientPhone: bookingDetails.phone,
                deliveryAddress: bookingDetails.address
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

            setStep(3);

        } catch (error: any) {
            console.error("Booking Error:", error);
            alert(`Booking failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

                {step === 1 && (
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">Confirm Vehicle</h2>
                            <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition text-2xl font-black">✕</button>
                        </div>

                        <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                            <img src={car.image} alt={car.name} className="w-24 h-24 rounded-xl object-cover shadow-sm" />
                            <div>
                                <h3 className="text-lg font-bold text-[#000080]">{car.name}</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Daily Rate</p>
                                <p className="text-2xl font-black text-gray-900 mt-0.5">₦{numericPrice.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">🛡️</span>
                                <h4 className="text-sm font-black text-[#000080] uppercase tracking-wide">Airgo Escrow Protection</h4>
                            </div>
                            <p className="text-sm text-blue-900 leading-relaxed font-medium">
                                Your funds are held securely. The fleet manager will only receive payment after your vehicle is delivered.
                            </p>
                        </div>

                        <button onClick={() => setStep(2)} className="w-full bg-[#000080] text-white py-4 rounded-xl font-black text-lg hover:bg-blue-900 transition shadow-lg">
                            Accept & Continue
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-8 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
                            <button onClick={() => setStep(1)} className="text-[#000080] font-black text-sm mr-4 hover:underline">← Back</button>
                            <h2 className="text-xl font-black text-gray-900">Delivery Logistics</h2>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={bookingDetails.name} onChange={e => setBookingDetails({ ...bookingDetails, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                                    <input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={bookingDetails.email} onChange={e => setBookingDetails({ ...bookingDetails, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                                    <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={bookingDetails.phone} onChange={e => setBookingDetails({ ...bookingDetails, phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Pickup Date/Time</label>
                                    <input required type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={bookingDetails.checkIn} onChange={e => setBookingDetails({ ...bookingDetails, checkIn: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Return Date/Time</label>
                                    <input required type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={bookingDetails.checkOut} onChange={e => setBookingDetails({ ...bookingDetails, checkOut: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Delivery Address</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" placeholder="Where should we bring the car?" value={bookingDetails.address} onChange={e => setBookingDetails({ ...bookingDetails, address: e.target.value })} />
                            </div>

                            <div className="flex justify-between items-end pt-4 mt-2 border-t border-gray-100">
                                <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Total Escrow</span>
                                <span className="text-3xl font-black text-[#000080]">₦{finalPrice.toLocaleString()}</span>
                            </div>

                            <button type="submit" disabled={isProcessing} className={`w-full py-4 rounded-xl font-black text-lg transition shadow-lg mt-4 ${isProcessing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FFB81C] text-[#000080] hover:bg-yellow-400'}`}>
                                {isProcessing ? 'Locking Asset...' : 'Confirm Escrow Booking'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-10 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <span className="text-5xl text-green-600">✓</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Escrow Confirmed!</h2>
                        <p className="text-gray-600 mb-8 font-medium">Your <span className="font-bold text-[#000080]">{car.name}</span> has been securely reserved.</p>

                        <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl w-full text-left mb-8 shadow-sm">
                            <h4 className="font-black text-[#000080] text-sm mb-2 uppercase tracking-wider">Dispatch Scheduled</h4>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                A PDF invoice has been generated. Our dispatch manager will contact you on <span className="font-bold text-gray-900">{bookingDetails.phone}</span> shortly to confirm your delivery to <span className="font-bold text-gray-900">{bookingDetails.address}</span>.
                            </p>
                        </div>
                        <button onClick={handleClose} className="w-full bg-[#000080] text-white py-4 rounded-xl font-black text-lg hover:bg-blue-900 transition shadow-lg">
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}