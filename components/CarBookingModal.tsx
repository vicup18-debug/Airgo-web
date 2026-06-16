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
        fromAddress: '',
        toAddress: '',
        checkIn: '',
        checkOut: ''
    });

    const rentalType = 'Self Drive';
    const fuelPlan = 'Self Fueling';
    const [travelScope, setTravelScope] = useState<'Intra-City' | 'Inter-State'>('Intra-City');
    const [isCustomOffer, setIsCustomOffer] = useState(false);
    const [customOfferPrice, setCustomOfferPrice] = useState('');

    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: string; discountValue: number } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

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
                formattedCheckOut = initialCheckOut.includes('T') ? initialCheckOut.substring(0, 16) : `${initialCheckOut}T09:00`;
            }

            setBookingDetails({
                name,
                email,
                phone,
                fromAddress: '',
                toAddress: '',
                checkIn: formattedCheckIn,
                checkOut: formattedCheckOut
            });
            setTravelScope('Intra-City');
            setIsCustomOffer(false);
            setCustomOfferPrice('');
            setCouponCodeInput('');
            setAppliedCoupon(null);
            setCouponError('');
            setIsValidatingCoupon(false);
            setStep(1); // Reset to first step
        }
    }, [isOpen, initialCheckIn, initialCheckOut]);

    if (!isOpen || !car) return null;

    const rawPrice = car.retailPrice !== undefined && car.retailPrice !== null ? car.retailPrice : car.price;
    const numericPrice = typeof rawPrice === 'string'
        ? parseInt(rawPrice.replace(/[^0-9]/g, ''))
        : (typeof rawPrice === 'object' && rawPrice !== null && rawPrice.$numberDecimal)
            ? Number(rawPrice.$numberDecimal)
            : Number(rawPrice) || 0;

    const calculateTotal = () => {
        const discount = car.discountPercentage || 0;
        const discountedRate = Math.round(numericPrice * (1 - discount / 100));
        
        let dailyExtra = 0;
        if (travelScope === 'Inter-State') dailyExtra += 35000;
        
        const totalDailyRate = discountedRate + dailyExtra;

        if (!bookingDetails.checkIn || !bookingDetails.checkOut) return totalDailyRate;
        const start = new Date(bookingDetails.checkIn);
        const end = new Date(bookingDetails.checkOut);
        const hours = Math.max((end.getTime() - start.getTime()) / (1000 * 3600), 1);
        const days = Math.ceil(hours / 24);
        return totalDailyRate * days;
    };

    const finalPrice = calculateTotal();

    const getDiscountAmount = () => {
        if (!appliedCoupon || isCustomOffer) return 0;
        if (appliedCoupon.discountType === 'percentage') {
            return Math.round(finalPrice * (appliedCoupon.discountValue / 100));
        } else if (appliedCoupon.discountType === 'flat') {
            return Math.min(finalPrice, appliedCoupon.discountValue);
        }
        return 0;
    };

    const discountAmount = getDiscountAmount();
    const netPrice = Math.max(0, finalPrice - discountAmount);

    const handleApplyCoupon = async () => {
        if (!couponCodeInput.trim()) {
            setCouponError("Please enter a coupon code");
            return;
        }
        setIsValidatingCoupon(true);
        setCouponError('');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const response = await fetch(`${apiUrl}/api/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCodeInput })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setAppliedCoupon({
                    code: data.code,
                    discountType: data.discountType,
                    discountValue: data.discountValue
                });
                toast.success(`Coupon ${data.code} applied successfully!`);
            } else {
                setAppliedCoupon(null);
                setCouponError(data.message || "Invalid coupon code");
                toast.error(data.message || "Invalid coupon code");
            }
        } catch (error) {
            console.error("Error validating coupon:", error);
            setCouponError("Failed to validate coupon");
            toast.error("Error validating coupon");
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCodeInput('');
        setCouponError('');
    };

    const handleClose = () => {
        setStep(1);
        setBookingDetails({
            name: '',
            email: '',
            phone: '',
            fromAddress: '',
            toAddress: '',
            checkIn: '',
            checkOut: ''
        });
        setTravelScope('Intra-City');
        setIsCustomOffer(false);
        setCustomOfferPrice('');
        setCouponCodeInput('');
        setAppliedCoupon(null);
        setCouponError('');
        setIsValidatingCoupon(false);
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

        const storedUser = localStorage.getItem('airgo_user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        if (parsedUser && parsedUser.role === 'partner') {
            toast.error("Partners are not authorized to make bookings.");
            return;
        }

        setIsProcessing(true);

        try {
            const finalUserId = parsedUser ? parsedUser.id || parsedUser.userId || parsedUser._id : '';
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const referredBy = localStorage.getItem('airgo_ref') || '';

            const payload = {
                userId: finalUserId,
                itemId: car._id || car.id,
                itemName: car.name,
                itemType: 'car',
                partnerId: car.partnerId || 'airgo_direct',
                checkIn: bookingDetails.checkIn,
                checkOut: bookingDetails.checkOut,
                guests: 1,
                totalPrice: isCustomOffer ? Number(customOfferPrice).toLocaleString() : netPrice.toLocaleString(),
                status: 'Pending Escrow',
                clientName: bookingDetails.name,
                clientEmail: bookingDetails.email,
                clientPhone: bookingDetails.phone,
                deliveryAddress: `From: ${bookingDetails.fromAddress} | To: ${bookingDetails.toAddress}`,
                referredBy,
                rentalType,
                fuelPlan,
                travelScope,
                isOffer: isCustomOffer,
                offerStatus: isCustomOffer ? 'Pending Partner' : 'None',
                offeredPrice: isCustomOffer ? Number(customOfferPrice).toLocaleString() : '',
                couponCode: appliedCoupon ? appliedCoupon.code : undefined
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
                                <svg className="w-5 h-5 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">FROM (Pickup / Delivery Address)</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" placeholder="Pickup location" value={bookingDetails.fromAddress} onChange={e => setBookingDetails({ ...bookingDetails, fromAddress: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">TO (Return / Destination)</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" placeholder="Destination location" value={bookingDetails.toAddress} onChange={e => setBookingDetails({ ...bookingDetails, toAddress: e.target.value })} />
                                </div>
                            </div>

                            {/* Service Configurations */}
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Travel Scope</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-semibold text-xs cursor-pointer"
                                        value={travelScope}
                                        onChange={(e: any) => setTravelScope(e.target.value)}
                                    >
                                        <option value="Intra-City">Intra-City (₦0)</option>
                                        <option value="Inter-State">Inter-State (+₦35k/day)</option>
                                    </select>
                                </div>
                            </div>
 
                            {/* CUSTOM PRICE OFFER (INDRIVE STYLE) */}
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/65 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Make a custom price offer?</label>
                                    <input
                                        type="checkbox"
                                        checked={isCustomOffer}
                                        onChange={(e) => setIsCustomOffer(e.target.checked)}
                                        className="w-4 h-4 text-[#000080] border-gray-300 rounded focus:ring-[#000080]/30 cursor-pointer"
                                    />
                                </div>
                                {isCustomOffer && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                        <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">YOUR OFFERED PRICE (₦)</label>
                                        <input
                                            required
                                            type="number"
                                            min="1000"
                                            placeholder="e.g. 150000"
                                            className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white text-gray-900 focus:border-[#000080] outline-none transition font-medium"
                                            value={customOfferPrice}
                                            onChange={(e) => setCustomOfferPrice(e.target.value)}
                                        />
                                        <p className="text-[9px] text-blue-600 font-medium mt-1">Recommended price is ₦{finalPrice.toLocaleString()}. Your custom bid will be sent to the partner for approval.</p>
                                    </div>
                                )}
                            </div>

                            {/* COUPON CODE INPUT */}
                            {!isCustomOffer && (
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">PROMO / COUPON CODE</label>
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-green-600 text-white font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                                    {appliedCoupon.code}
                                                </span>
                                                <span className="text-xs font-semibold text-green-800">
                                                    {appliedCoupon.discountType === 'percentage' 
                                                        ? `${appliedCoupon.discountValue}% Off applied` 
                                                        : `₦${appliedCoupon.discountValue.toLocaleString()} Off applied`}
                                                </span>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={handleRemoveCoupon} 
                                                className="text-red-500 hover:text-red-700 font-bold text-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter coupon code (e.g. WELCOME10)"
                                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#000080] outline-none transition font-medium uppercase placeholder-gray-400"
                                                value={couponCodeInput}
                                                onChange={(e) => setCouponCodeInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleApplyCoupon();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                disabled={isValidatingCoupon}
                                                onClick={handleApplyCoupon}
                                                className="bg-[#000080] hover:bg-blue-900 text-white font-bold px-5 py-3 rounded-xl transition duration-150 text-sm disabled:bg-gray-300"
                                            >
                                                {isValidatingCoupon ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                    )}
                                    {couponError && (
                                        <p className="text-[10px] text-red-500 font-bold mt-1">{couponError}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
                                <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">TOTAL ESCROW</span>
                                <div className="flex flex-col items-end">
                                    {(car.discountPercentage > 0 || discountAmount > 0) && !isCustomOffer && (
                                        <span className="text-xs text-gray-400 line-through font-bold">
                                            ₦{(((bookingDetails.checkIn && bookingDetails.checkOut) ? Math.ceil(Math.max((new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000 * 3600), 1) / 24) : 1) * (numericPrice + (travelScope === 'Inter-State' ? 35000 : 0))).toLocaleString()}
                                        </span>
                                    )}
                                    <span className="text-3xl font-black text-[#000080]">
                                        ₦{isCustomOffer && customOfferPrice ? Number(customOfferPrice).toLocaleString() : netPrice.toLocaleString()}
                                    </span>
                                    {discountAmount > 0 && !isCustomOffer && (
                                        <span className="text-[9px] text-green-600 font-bold uppercase mt-0.5 flex items-center gap-1">
                                            🛡️ Coupon Discount Applied (-₦{discountAmount.toLocaleString()})
                                        </span>
                                    )}
                                    {car.discountPercentage > 0 && !isCustomOffer && discountAmount === 0 && (
                                        <span className="text-[9px] text-red-600 font-bold uppercase mt-0.5 flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.318-4.318a1.5 1.5 0 000-2.122L10.16 3.659A2.25 2.25 0 009.568 3z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h.008v.008H6V7.5z" />
                                            </svg>
                                            {car.discountPercentage}% OFF APPLIED
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={isProcessing} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition shadow-lg mt-4 ${isProcessing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#FFB81C] text-[#000080] hover:bg-yellow-400'}`}>
                                {isProcessing ? 'Locking Asset...' : (isCustomOffer ? 'Send Custom Offer' : 'Confirm Booking')}
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
                                A PDF invoice has been generated and sent to you. Our dispatch manager will contact you on <span className="font-bold text-gray-900">{bookingDetails.phone}</span> shortly to confirm your trip from <span className="font-bold text-gray-900">{bookingDetails.fromAddress}</span> to <span className="font-bold text-gray-900">{bookingDetails.toAddress}</span>.
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
