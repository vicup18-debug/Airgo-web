"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface CarBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    car: any;
    initialCheckIn?: string;
    initialCheckOut?: string;
}

export default function CarBookingModal({ isOpen, onClose, car, initialCheckIn, initialCheckOut }: CarBookingModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    const [bookingDetails, setBookingDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        checkIn: '',
        checkOut: ''
    });

    useEffect(() => {
        if (isOpen) {
            const storedUser = localStorage.getItem('airgo_user');
            let name = '';
            let email = '';
            let phone = '';
            if (storedUser) {
                const u = JSON.parse(storedUser);
                name = u.name || '';
                email = u.email || '';
                phone = u.phone || '';
            }
            
            // Format check-in and check-out to YYYY-MM-DDTHH:mm if they exist
            let formattedCheckIn = '';
            if (initialCheckIn) {
                formattedCheckIn = initialCheckIn.includes('T') ? initialCheckIn.substring(0, 16) : `${initialCheckIn}T09:00`;
            }
            let formattedCheckOut = '';
            if (initialCheckOut) {
                formattedCheckOut = initialCheckOut.includes('T') ? initialCheckOut.substring(0, 16) : `${initialCheckOut}T18:00`;
            }

            setBookingDetails({
                name,
                email,
                phone,
                address: '',
                checkIn: formattedCheckIn,
                checkOut: formattedCheckOut
            });
            setStep(1); // Reset to first step
        }
    }, [isOpen, initialCheckIn, initialCheckOut]);

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
        
        // Require login before confirming booking
        const token = localStorage.getItem('airgo_token');
        if (!token) {
            toast.success("Please sign in to secure this booking.");
            router.push('/login');
            return;
        }

        setIsProcessing(true);

        try {
            const storedUser = localStorage.getItem('airgo_user');
            const finalUserId = storedUser ? JSON.parse(storedUser).id || JSON.parse(storedUser).userId || JSON.parse(storedUser)._id : '';
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
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#000080]/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">

                {step === 1 && (
                    <div className="p-8 overflow-y-auto flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">Confirm Vehicle</h2>
                            <button onClick={handleClose} className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition">✕</button>
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
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Daily Rate</p>
                                    <p className="text-2xl font-black text-gray-900 mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                        {car.discountPercentage > 0 && (
                                            <span className="text-sm text-gray-400 line-through font-bold">
                                                ₦{numericPrice.toLocaleString()}
                                            </span>
                                        )}
                                        <span>₦{Math.round(numericPrice * (1 - (car.discountPercentage || 0) / 100)).toLocaleString()}</span>
                                        {car.discountPercentage > 0 && (
                                            <span className="bg-red-500 text-white font-black px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">
                                                {car.discountPercentage}% OFF
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                                <img src={car.image} alt={car.name} className="w-24 h-24 rounded-xl object-cover shadow-sm" />
                                <div>
                                    <h3 className="text-lg font-bold text-[#000080]">{car.name}</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Daily Rate</p>
                                    <p className="text-2xl font-black text-gray-900 mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                        {car.discountPercentage > 0 && (
                                            <span className="text-sm text-gray-400 line-through font-bold">
                                                ₦{numericPrice.toLocaleString()}
                                            </span>
                                        )}
                                        <span>₦{Math.round(numericPrice * (1 - (car.discountPercentage || 0) / 100)).toLocaleString()}</span>
                                        {car.discountPercentage > 0 && (
                                            <span className="bg-red-500 text-white font-black px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">
                                                {car.discountPercentage}% OFF
                                            </span>
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
                            <p className="text-xs text-blue-900 leading-relaxed font-medium">
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
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">FULL NAME</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" value={bookingDetails.name} onChange={e => setBookingDetails({ ...bookingDetails, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">EMAIL</label>
                                    <input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" value={bookingDetails.email} onChange={e => setBookingDetails({ ...bookingDetails, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">PHONE</label>
                                    <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" value={bookingDetails.phone} onChange={e => setBookingDetails({ ...bookingDetails, phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">PICKUP DATE/TIME</label>
                                    <input required type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" value={bookingDetails.checkIn} onChange={e => setBookingDetails({ ...bookingDetails, checkIn: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">RETURN DATE/TIME</label>
                                    <input required type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" value={bookingDetails.checkOut} onChange={e => setBookingDetails({ ...bookingDetails, checkOut: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">DELIVERY ADDRESS</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" placeholder="Where should we bring the car?" value={bookingDetails.address} onChange={e => setBookingDetails({ ...bookingDetails, address: e.target.value })} />
                            </div>

                            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
                                <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">TOTAL ESCROW</span>
                                <div className="flex flex-col items-end">
                                    {car.discountPercentage > 0 && (
                                        <span className="text-xs text-gray-400 line-through font-bold">
                                            ₦{((bookingDetails.checkIn && bookingDetails.checkOut) ? Math.ceil(Math.max((new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000 * 3600), 1) / 24) : 1 * numericPrice).toLocaleString()}
                                        </span>
                                    )}
                                    <span className="text-3xl font-black text-[#000080]">₦{finalPrice.toLocaleString()}</span>
                                    {car.discountPercentage > 0 && (
                                        <span className="text-[9px] text-red-600 font-bold uppercase mt-0.5">🔥 {car.discountPercentage}% OFF APPLIED</span>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={isProcessing} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition shadow-lg mt-4 ${isProcessing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#FFB81C] text-[#000080] hover:bg-yellow-400'}`}>
                                {isProcessing ? 'Locking Asset...' : 'Confirm Booking'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-10 text-center flex flex-col items-center overflow-y-auto flex-1 animate-in fade-in duration-300">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                            <span className="text-4xl text-green-600">✓</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Escrow Confirmed!</h2>
                        <p className="text-gray-500 mb-6 text-sm font-medium">Your <span className="font-bold text-[#000080]">{car.name}</span> has been securely reserved.</p>

                        <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl w-full text-left mb-6">
                            <h4 className="font-bold text-[#000080] text-xs mb-1.5 uppercase tracking-wider">Dispatch Scheduled</h4>
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                A PDF invoice has been generated and sent to you. Our dispatch manager will contact you on <span className="font-bold text-gray-900">{bookingDetails.phone}</span> shortly to confirm your delivery to <span className="font-bold text-gray-900">{bookingDetails.address}</span>.
                            </p>
                        </div>
                        <button onClick={() => { handleClose(); router.push('/dashboard'); }} className="w-full bg-[#000080] text-white py-4 rounded-xl font-black text-lg hover:bg-blue-900 transition shadow-lg">
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
