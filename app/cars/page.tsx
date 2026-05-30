"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
        partnerId: 'airgo_direct',
        isFallback: true
    },
    {
        id: 'airgo_fleet_02',
        name: 'Range Rover Autobiography',
        type: 'Premium SUV',
        price: 350000,
        capacity: '4',
        features: 'Chauffeur Included, Airport Meet & Greet, Deep Tint',
        image: 'https://images.unsplash.com/photo-1606016159991-d8544e311546?auto=format&fit=crop&w=800&q=80',
        partnerId: 'airgo_direct',
        isFallback: true
    },
    {
        id: 'airgo_fleet_03',
        name: 'Mercedes-Benz Maybach S680',
        type: 'Executive Sedan',
        price: 500000,
        capacity: '3',
        features: 'Executive Rear Seating, Champagne Cooler, VIP Escort',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?auto=format&fit=crop&w=800&q=80',
        partnerId: 'airgo_direct',
        isFallback: true
    }
];

export default function CarsPage() {
    const [selectedCar, setSelectedCar] = useState<any>(null);
    const [carFleet, setCarFleet] = useState<any[]>(FALLBACK_FLEET);
    const [isLoading, setIsLoading] = useState(false);

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
                                filteredCars.map((car) => {
                                    const numericPrice = typeof car.price === 'string'
                                        ? parseInt(car.price.replace(/[^0-9]/g, ''))
                                        : (typeof car.price === 'object' && car.price !== null && car.price.$numberDecimal)
                                            ? Number(car.price.$numberDecimal)
                                            : Number(car.price) || 0;
                                    const discountedPrice = Math.round(numericPrice * (1 - (car.discountPercentage || 0) / 100));

                                    return (
                                        <div key={car._id || car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 group flex flex-col animate-fade-in">
                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    src={car.image}
                                                    alt={car.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                                                    {car.type}
                                                </div>
                                                {car.discountPercentage > 0 && (
                                                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md animate-pulse">
                                                        {car.discountPercentage}% OFF
                                                    </div>
                                                )}
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
                                                            {car.discountPercentage > 0 && (
                                                                <span className="text-sm text-gray-400 line-through mr-2 font-bold">
                                                                    ₦{numericPrice.toLocaleString()}
                                                                </span>
                                                            )}
                                                            ₦{discountedPrice.toLocaleString()}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">per day</p>
                                                    </div>
                                                    {car.isFallback ? (
                                                        <a
                                                            href={`https://wa.me/2348026696170?text=Hi, I want to enquire about the ${encodeURIComponent(car.name)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-[#25D366] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#1ebd57] transition shadow-md text-center whitespace-nowrap"
                                                        >
                                                            Enquire via WhatsApp
                                                        </a>
                                                    ) : (
                                                        <button
                                                            onClick={() => setSelectedCar(car)}
                                                            className="bg-[#FFB81C] text-[#000080] px-6 py-3 rounded-xl font-black text-sm hover:bg-yellow-400 transition shadow-md"
                                                        >
                                                            Book Escrow
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            

            {/* LIVE CAR BOOKING MODAL */}
            <CarBookingModal
                isOpen={!!selectedCar}
                onClose={() => setSelectedCar(null)}
                car={selectedCar}
            />

            
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
        : (typeof car.price === 'object' && car.price !== null && car.price.$numberDecimal)
            ? Number(car.price.$numberDecimal)
            : Number(car.price) || 0;

    const calculateTotal = () => {
        const discount = car.discountPercentage || 0;
        const discountedRate = Math.round(numericPrice * (1 - discount / 100));
        if (!bookingDetails.checkIn || !bookingDetails.checkOut) return discountedRate;
        const start = new Date(bookingDetails.checkIn);
        const end = new Date(bookingDetails.checkOut);
        const hours = Math.max((end.getTime() - start.getTime()) / (1000 * 3600), 1);
        const days = Math.ceil(hours / 24);
        return discountedRate * days;
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
            toast.error(`Booking failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">

                {step === 1 && (
                    <div className="p-8 overflow-y-auto flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">Confirm Vehicle</h2>
                            <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition text-2xl font-black">✕</button>
                        </div>

                        {car.images && car.images.length > 0 ? (
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {car.images.map((img: string, idx: number) => (
                                        <img key={idx} src={img} alt={`${car.name} ${idx}`} className="w-40 h-28 rounded-xl object-cover shadow-sm flex-shrink-0 border border-gray-200" />
                                    ))}
                                </div>
                                <div className="mt-2">
                                    <h3 className="text-xl font-bold text-[#000080]">{car.name}</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Daily Rate</p>
                                    <p className="text-2xl font-black text-gray-900 mt-0.5">
                                        {car.discountPercentage > 0 && (
                                            <span className="text-sm text-gray-400 line-through mr-2 font-bold">
                                                ₦{numericPrice.toLocaleString()}
                                            </span>
                                        )}
                                        ₦{Math.round(numericPrice * (1 - (car.discountPercentage || 0) / 100)).toLocaleString()}
                                        {car.discountPercentage > 0 && (
                                            <span className="text-xs text-red-600 font-black ml-2 uppercase">({car.discountPercentage}% OFF)</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                                <img src={car.image} alt={car.name} className="w-24 h-24 rounded-xl object-cover shadow-sm" />
                                <div>
                                    <h3 className="text-lg font-bold text-[#000080]">{car.name}</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Daily Rate</p>
                                    <p className="text-2xl font-black text-gray-900 mt-0.5">
                                        {car.discountPercentage > 0 && (
                                            <span className="text-sm text-gray-400 line-through mr-2 font-bold">
                                                ₦{numericPrice.toLocaleString()}
                                            </span>
                                        )}
                                        ₦{Math.round(numericPrice * (1 - (car.discountPercentage || 0) / 100)).toLocaleString()}
                                        {car.discountPercentage > 0 && (
                                            <span className="text-xs text-red-600 font-black ml-2 uppercase">({car.discountPercentage}% OFF)</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

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
                    <div className="p-8 overflow-y-auto flex-1">
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
                                <div className="flex flex-col items-end">
                                    {car.discountPercentage > 0 && (
                                        <span className="text-xs text-gray-400 line-through font-bold">
                                            ₦{((bookingDetails.checkIn && bookingDetails.checkOut) ? Math.ceil(Math.max((new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000 * 3600), 1) / 24) : 1 * numericPrice).toLocaleString()}
                                        </span>
                                    )}
                                    <span className="text-3xl font-black text-[#000080]">₦{finalPrice.toLocaleString()}</span>
                                    {car.discountPercentage > 0 && (
                                        <span className="text-[10px] text-red-600 font-bold uppercase mt-0.5">🔥 {car.discountPercentage}% Discount Applied</span>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={isProcessing} className={`w-full py-4 rounded-xl font-black text-lg transition shadow-lg mt-4 ${isProcessing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FFB81C] text-[#000080] hover:bg-yellow-400'}`}>
                                {isProcessing ? 'Locking Asset...' : 'Confirm Escrow Booking'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-10 text-center flex flex-col items-center overflow-y-auto flex-1">
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