import React, { useState } from 'react';

interface Hotel {
    id: number;
    name: string;
    location: string;
    price: string;
    rating: number;
    reviews: number;
    image: string;
    amenities: string[];
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    hotel: Hotel | null;
}

export default function BookingModal({ isOpen, onClose, hotel }: BookingModalProps) {
    const [bookingState, setBookingState] = useState<'idle' | 'loading' | 'success'>('idle');

    if (!isOpen || !hotel) return null;

    const handleBooking = () => {
        setBookingState('loading');
        // Simulate a network request
        setTimeout(() => {
            setBookingState('success');
            setTimeout(() => {
                setBookingState('idle');
                onClose();
            }, 2000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl transform transition-all duration-300 scale-100 flex flex-col md:flex-row relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur text-gray-800 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md hover:bg-gray-200 transition z-10"
                    aria-label="Close modal"
                >
                    ✕
                </button>

                {/* Left Side: Image & Info */}
                <div className="w-full md:w-5/12 relative h-64 md:h-auto">
                    <img 
                        src={hotel.image} 
                        alt={hotel.name} 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-[#FFB81C] text-[#004A99] text-xs font-black px-2.5 py-1 rounded-md shadow-sm">⭐ {hotel.rating}</span>
                            <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md">{hotel.reviews} reviews</span>
                        </div>
                        <h2 className="text-3xl font-black leading-tight mb-2">{hotel.name}</h2>
                        <p className="text-sm text-gray-300 flex items-center gap-1 font-medium">📍 {hotel.location}</p>
                    </div>
                </div>

                {/* Right Side: Booking Form */}
                <div className="w-full md:w-7/12 p-8 bg-gray-50 flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-2xl font-black text-gray-900 mb-1">Complete your reservation</h3>
                        <p className="text-sm text-gray-500 font-medium">Secure your luxury stay instantly.</p>
                    </div>

                    <div className="space-y-5 flex-grow">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Dates of stay</label>
                            <div className="flex gap-3">
                                <div className="w-1/2">
                                    <input type="date" className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold outline-none focus:border-[#004A99] focus:ring-2 focus:ring-[#004A99]/20 transition shadow-sm" />
                                    <span className="text-xs text-gray-400 mt-1 ml-1 block font-medium">Check-in</span>
                                </div>
                                <div className="w-1/2">
                                    <input type="date" className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold outline-none focus:border-[#004A99] focus:ring-2 focus:ring-[#004A99]/20 transition shadow-sm" />
                                    <span className="text-xs text-gray-400 mt-1 ml-1 block font-medium">Check-out</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Guests & Rooms</label>
                            <select className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold outline-none focus:border-[#004A99] focus:ring-2 focus:ring-[#004A99]/20 transition appearance-none shadow-sm cursor-pointer">
                                <option>1 Room, 1 Adult</option>
                                <option>1 Room, 2 Adults</option>
                                <option>2 Rooms, 4 Adults</option>
                                <option>Family Suite</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Special Requests</label>
                            <textarea 
                                rows={2} 
                                className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold outline-none focus:border-[#004A99] focus:ring-2 focus:ring-[#004A99]/20 transition shadow-sm resize-none"
                                placeholder="Any specific needs?"
                            ></textarea>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total amount</p>
                                <p className="text-xs text-gray-400 font-medium">Includes taxes and fees</p>
                            </div>
                            <p className="text-3xl font-black text-[#004A99]">{hotel.price}</p>
                        </div>
                        
                        <button 
                            onClick={handleBooking}
                            disabled={bookingState !== 'idle'}
                            className={`w-full py-4 rounded-xl font-black text-sm shadow-xl transition-all duration-300 flex justify-center items-center gap-2 ${
                                bookingState === 'success' 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-[#FFB81C] text-[#004A99] hover:bg-yellow-400'
                            }`}
                        >
                            {bookingState === 'idle' && 'Confirm Reservation'}
                            {bookingState === 'loading' && 'Processing...'}
                            {bookingState === 'success' && 'Reservation Confirmed! 🎉'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
