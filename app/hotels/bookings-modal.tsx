"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function RoomImageCarousel({ images, primaryImage, className }: { images?: string[], primaryImage: string, className?: string }) {
    const allImages = Array.from(new Set([primaryImage, ...(images || [])].filter(Boolean)));
    const [currentIndex, setCurrentIndex] = useState(0);

    if (allImages.length <= 1) {
        return <img src={allImages[0] || primaryImage} alt="Room" className={`${className} object-cover`} />;
    }

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    return (
        <div className={`relative overflow-hidden group ${className}`}>
            <img 
                src={allImages[currentIndex]} 
                alt={`Room View ${currentIndex + 1}`} 
                className="w-full h-full object-cover transition-all duration-300"
            />
            
            {/* Arrows */}
            <button 
                type="button"
                onClick={prevSlide} 
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center text-[10px] backdrop-blur-sm transition opacity-0 group-hover:opacity-100 z-10 select-none cursor-pointer font-bold"
            >
                ◀
            </button>
            <button 
                type="button"
                onClick={nextSlide} 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center text-[10px] backdrop-blur-sm transition opacity-0 group-hover:opacity-100 z-10 select-none cursor-pointer font-bold"
            >
                ▶
            </button>

            {/* Dots */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                {allImages.map((_, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(idx);
                        }}
                        className={`w-1 h-1 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    hotel: any;
    initialCheckIn?: string;
    initialCheckOut?: string;
}

export default function BookingModal({ isOpen, onClose, hotel, initialCheckIn, initialCheckOut }: BookingModalProps) {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    
    // Concierge third-party details for super admin bookings
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    const router = useRouter();
    const isAdmin = user?.role === 'admin';

    // 🟢 SECURITY: Check if user is logged in
    useEffect(() => {
        const userData = localStorage.getItem('airgo_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        
        if (isOpen && hotel) {
            fetchRooms();
            if (initialCheckIn) setCheckIn(initialCheckIn);
            if (initialCheckOut) setCheckOut(initialCheckOut);
            setClientName('');
            setClientEmail('');
            setClientPhone('');
            setDeliveryAddress('');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setContactPhone(parsedUser.phoneNumber || parsedUser.phone || '');
            }
        } else {
            setSelectedRoom(null);
            setRooms([]);
            setCheckIn('');
            setCheckOut('');
            setGuests(1);
            setClientName('');
            setClientEmail('');
            setClientPhone('');
            setDeliveryAddress('');
            setContactPhone('');
        }
    }, [isOpen, hotel, initialCheckIn, initialCheckOut]);

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
        e.preventDefault();

        // 🟢 REQUIRE LOGIN BEFORE BOOKING
        if (!user) {
            toast.success("Please sign in to secure this booking.");
            router.push('/login');
            return;
        }

        if (user.role === 'partner') {
            toast.error("Partners are not authorized to make bookings.");
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const referredBy = localStorage.getItem('airgo_ref') || '';

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
                    checkIn: checkIn ? `${checkIn.split('T')[0]}T12:00` : '',
                    checkOut: checkOut ? `${checkOut.split('T')[0]}T12:00` : '',
                    guests,
                    totalPrice: calculateTotal(),
                    status: 'Pending Escrow',
                    clientName: isAdmin ? clientName : user.name,
                    clientEmail: isAdmin ? clientEmail : user.email,
                    clientPhone: isAdmin ? clientPhone : contactPhone || user.phoneNumber || user.phone || '',
                    deliveryAddress: isAdmin ? deliveryAddress : '',
                    referredBy
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Booking failed to process.");
            }

            toast.success("Booking Secured! Redirecting to dashboard to complete escrow payment.");
            onClose();
            router.push('/dashboard?hotelBooked=true');

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

                    {hotel.description && (
                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl mb-6 text-xs text-gray-600 leading-relaxed italic">
                            <span className="font-black text-[#000080] block mb-1 uppercase tracking-wide text-[9px] not-italic">About this Stay</span>
                            {hotel.description}
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

                                        // 🛡️ DYNAMIC REMAINING ROOMS ENGINE
                                        const getRemainingRooms = (r: any) => {
                                            if ((r.totalAllocated || 0) <= 0) return 0;
                                            if (!checkIn || !checkOut || !r.bookedDates) return r.totalAllocated;

                                            let d = new Date(checkIn);
                                            const endD = new Date(checkOut);
                                            let maxBooked = 0;

                                            while (d < endD) {
                                                const dateStr = d.toISOString().split('T')[0];
                                                const dayMatch = r.bookedDates?.find((b: any) => b.date === dateStr);
                                                if (dayMatch && dayMatch.count > maxBooked) {
                                                    maxBooked = dayMatch.count;
                                                }
                                                d.setUTCDate(d.getUTCDate() + 1);
                                            }
                                            return Math.max(0, r.totalAllocated - maxBooked);
                                        };

                                        const remainingCount = getRemainingRooms(room);
                                        const isSoldOut = remainingCount <= 0;

                                        return (
                                            <div key={room._id} className={`border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 transition bg-gray-50 animate-fade-in ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#000080] hover:shadow-md'}`} onClick={() => !isSoldOut && setSelectedRoom(room)}>
                                                <RoomImageCarousel images={room.images} primaryImage={room.image} className="w-full h-36 sm:w-24 sm:h-24 rounded-lg shadow-sm shrink-0" />
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h4 className="font-bold text-lg text-gray-900 leading-snug">{room.name}</h4>
                                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                                {room.discountPercentage > 0 && (
                                                                    <span className="bg-red-500 text-white font-black px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">
                                                                        {room.discountPercentage}% OFF
                                                                    </span>
                                                                )}
                                                                <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider border border-red-100/50">
                                                                    {remainingCount} left
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 my-1">{room.amenities}</p>
                                                        {room.description && (
                                                            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed italic bg-white p-2 rounded-lg border border-gray-100">{room.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 justify-between items-end mt-2">
                                                        <div>
                                                            <p className="font-black text-[#004A99] flex flex-wrap items-baseline gap-1">
                                                                {room.discountPercentage > 0 && (
                                                                    <span className="text-xs text-gray-400 line-through font-bold">
                                                                        ₦{rawRoomPrice.toLocaleString()}
                                                                    </span>
                                                                )}
                                                                <span className="text-base">₦{discountedRoomRate.toLocaleString()}</span>
                                                                <span className="text-[10px] text-gray-400 font-medium">/ night</span>
                                                            </p>
                                                        </div>
                                                        {isSoldOut ? (
                                                            <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider select-none text-center w-full sm:w-auto">Sold Out</span>
                                                        ) : (
                                                            <button className="bg-[#FFB81C] text-[#000080] px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-400 w-full sm:w-auto">Select</button>
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
                            
                            <div className="p-4 bg-blue-50 rounded-xl mb-6 border border-blue-100 flex flex-col sm:flex-row gap-4">
                                <RoomImageCarousel images={selectedRoom.images} primaryImage={selectedRoom.image} className="w-full h-36 sm:w-20 sm:h-20 rounded-lg shadow-sm shrink-0" />
                                <div className="flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-lg text-[#000080]">{selectedRoom.name}</h4>
                                        {selectedRoom.description && (
                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed italic">{selectedRoom.description}</p>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <p className="font-black text-gray-900 flex flex-wrap items-baseline gap-1">
                                            {selectedRoom.discountPercentage > 0 && (
                                                <span className="text-xs text-gray-400 line-through font-bold">
                                                    ₦{(typeof selectedRoom.pricePerNight === 'string' ? parseInt(selectedRoom.pricePerNight.replace(/\D/g, '')) : selectedRoom.pricePerNight)?.toLocaleString()}
                                                </span>
                                            )}
                                            <span>₦{Math.round((typeof selectedRoom.pricePerNight === 'string' ? parseInt(selectedRoom.pricePerNight.replace(/\D/g, '')) : selectedRoom.pricePerNight) * (1 - (selectedRoom.discountPercentage || 0) / 100)).toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">/ night</span>
                                        </p>
                                        {selectedRoom.discountPercentage > 0 && (
                                            <p className="text-[10px] text-red-600 font-black uppercase mt-0.5 animate-pulse">🔥 {selectedRoom.discountPercentage}% Discount Applied</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {user && user.role === 'admin' && (
                                <div className="space-y-4 mb-6 p-4 bg-yellow-50/50 border border-yellow-100 rounded-2xl animate-fade-in">
                                    <h4 className="font-black text-[#000080] text-xs uppercase tracking-wider mb-2">Concierge: Book as Third Party</h4>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Client Full Name</label>
                                        <input required type="text" className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white outline-none focus:border-[#000080] transition" placeholder="e.g. John Doe" value={clientName} onChange={e => setClientName(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Client Email Address</label>
                                            <input required type="email" className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white outline-none focus:border-[#000080] transition" placeholder="client@example.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Client Phone Number</label>
                                            <input required type="tel" className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white outline-none focus:border-[#000080] transition" placeholder="e.g. +234..." value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stay / Location Address</label>
                                        <input required type="text" className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white outline-none focus:border-[#000080] transition" placeholder="Stay destination/delivery address" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                                    </div>
                                </div>
                            )}
                            
                            {!isAdmin && (
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Phone Number</label>
                                    <input required type="tel" className="w-full px-4 py-3 border rounded-xl text-gray-900 bg-white outline-none focus:border-[#000080] transition" placeholder="e.g. +234..." value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-in Date</label>
                                    <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#000080] outline-none text-gray-900" value={checkIn ? checkIn.split('T')[0] : ''} onChange={(e) => setCheckIn(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-out Date</label>
                                    <input required type="date" min={checkIn ? checkIn.split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#000080] outline-none text-gray-900" value={checkOut ? checkOut.split('T')[0] : ''} onChange={(e) => setCheckOut(e.target.value)} />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Number of Guests</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#000080] outline-none text-gray-900 bg-white" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                                    {[1, 2].map(num => <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>)}
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
