"use client";

import React, { useState } from 'react';
import Link from 'next/link';

// 🟢 PREMIUM CAR DATA WITH CORRECTED REAL IMAGES
const carFleet = [
  {
    id: 1,
    name: "Mercedes-Benz G-Wagon",
    type: "Luxury SUV",
    price: "₦350,000",
    image: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=800&auto=format&fit=crop",
    capacity: "5 Seats",
    features: "Chauffeur Included • Armored Option Available"
  },
  {
    id: 2,
    name: "Range Rover Autobiography",
    type: "Luxury SUV",
    price: "₦300,000",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=800&auto=format&fit=crop",
    capacity: "5 Seats",
    features: "Chauffeur Included • Panoramic Roof"
  },
  {
    id: 3,
    name: "Toyota Land Cruiser Prado",
    type: "Premium SUV",
    price: "₦200,000",
    image: "https://images.unsplash.com/photo-1593013820725-ca0b69824de4?q=80&w=800&auto=format&fit=crop",
    capacity: "7 Seats",
    features: "Self-Drive/Chauffeur • Off-Road Capable"
  },
  {
    id: 4,
    name: "Lexus LX 570",
    type: "Premium SUV",
    price: "₦250,000",
    image: "https://images.unsplash.com/photo-1626668893632-6ea7bdc62ebc?q=80&w=800&auto=format&fit=crop",
    capacity: "7 Seats",
    features: "Chauffeur Included • Rear Entertainment"
  },
  {
    id: 5,
    name: "Mercedes-Benz S-Class",
    type: "Luxury Sedan",
    price: "₦400,000",
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=800&auto=format&fit=crop",
    capacity: "4 Seats",
    features: "Executive Chauffeur • Massaging Seats"
  },
  {
    id: 6,
    name: "Toyota Camry (2022)",
    type: "Executive Sedan",
    price: "₦80,000",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?q=80&w=800&auto=format&fit=crop",
    capacity: "5 Seats",
    features: "Self-Drive Available • Fuel Efficient"
  }
];

export default function CarsPage() {
  const [selectedCar, setSelectedCar] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">

      {/* 🟢 NAVIGATION */}
      <nav className="bg-[#004A99] text-white py-4 px-8 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center space-x-12">
          <Link href="/">
            <div className="text-2xl font-black text-white tracking-tight cursor-pointer">
              Airgo<span className="text-[#FFB81C]">.ng</span>
            </div>
          </Link>
          <div className="hidden md:flex space-x-6 font-semibold text-sm items-center">
            <Link href="/hotels" className="hover:text-[#FFB81C] transition">Hotels</Link>
            <span className="text-blue-300 flex items-center cursor-not-allowed">
              Flights <span className="ml-1.5 text-[9px] uppercase tracking-wider bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded-sm">Soon</span>
            </span>
            <Link href="/cars" className="text-[#FFB81C] border-b-2 border-[#FFB81C] pb-1">Car Rentals</Link>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/login">
            <button className="bg-white text-[#004A99] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition shadow-md">
              Sign In
            </button>
          </Link>
        </div>
      </nav>

      {/* 🟢 HEADER */}
      <header className="bg-white border-b border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Premium Executive Fleet</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Arrive in style. Book luxury vehicles and executive sedans with professional chauffeurs or self-drive options across Nigeria.
          </p>
        </div>
      </header>

      {/* 🟢 FLEET GRID */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {carFleet.map((car) => (
            <div key={car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
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
                    <p className="text-2xl font-black text-[#004A99]">{car.price}</p>
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
          ))}
        </div>
      </div>

      {/* 🟢 LIVE CAR BOOKING MODAL */}
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
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '', address: '' });

  if (!isOpen || !car) return null;

  const numericPrice = parseInt(car.price.replace(/[^0-9]/g, ''));
  const refundAmount = numericPrice * 0.7;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 2500);
  };

  const handleClose = () => {
    setStep(1);
    setGuestInfo({ name: '', email: '', phone: '', address: '' });
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
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
              <img src={car.image} alt={car.name} className="w-24 h-24 rounded-xl object-cover" />
              <div>
                <h3 className="text-lg font-bold text-[#004A99]">{car.name}</h3>
                <p className="text-sm text-gray-500 mt-1">1 Vehicle • 1 Day</p>
                <p className="text-xl font-black text-gray-900 mt-2">{car.price}</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🛡️</span>
                <h4 className="text-sm font-black text-yellow-800 uppercase tracking-wide">Airgo Escrow Protection</h4>
              </div>
              <p className="text-sm text-yellow-700 leading-relaxed mb-3">
                Your funds are held securely. The fleet manager will only receive payment after your vehicle is delivered to your location.
              </p>
              <div className="bg-white bg-opacity-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800 font-medium">
                  <span className="font-bold text-red-600">Cancellation:</span> Eligible for a <strong className="text-green-700">70% refund (₦{refundAmount.toLocaleString()})</strong> if cancelled before dispatch.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#004A99] text-white py-4 rounded-xl font-black text-lg hover:bg-blue-800 transition shadow-lg"
            >
              Accept & Continue
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT & DETAILS */}
        {step === 2 && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setStep(1)} className="text-[#004A99] font-bold text-sm flex items-center gap-1 hover:underline">
                <span>←</span> Back
              </button>
              <h2 className="text-xl font-black text-gray-900">Delivery Details</h2>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#004A99]" value={guestInfo.name} onChange={e => setGuestInfo({ ...guestInfo, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Delivery Address / Hotel</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#004A99]" placeholder="Where should we bring the car?" value={guestInfo.address} onChange={e => setGuestInfo({ ...guestInfo, address: e.target.value })} />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Card Information</label>
                <div className="relative">
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 mb-2" placeholder="0000 0000 0000 0000" maxLength={19} />
                  <div className="flex gap-2">
                    <input required type="text" className="w-1/2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="MM/YY" maxLength={5} />
                    <input required type="text" className="w-1/2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="CVC" maxLength={3} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-black text-lg transition shadow-lg mt-4 flex justify-center items-center ${isProcessing ? 'bg-gray-300 text-gray-500' : 'bg-[#FFB81C] text-[#004A99] hover:bg-yellow-400'}`}
              >
                {isProcessing ? 'Processing Securely...' : `Pay ${car.price}`}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-8">
              Your <span className="font-bold text-[#004A99]">{car.name}</span> has been reserved successfully.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl w-full text-left mb-8">
              <h4 className="font-bold text-gray-900 text-sm mb-1">Dispatch Scheduled</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your assigned chauffeur and dispatch manager will contact you shortly to confirm the delivery time to your provided address.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-[#004A99] text-white py-4 rounded-xl font-black text-lg hover:bg-blue-800 transition shadow-lg"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}