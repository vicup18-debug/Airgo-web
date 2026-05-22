"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 🟢 PHASE 2: THE FALLBACK MATRIX - Keeps the site looking premium if the DB is empty
const FALLBACK_ROOMS = [
  {
    _id: 'airgo_room_01',
    hotelName: 'Transcorp Hilton Abuja',
    name: 'Presidential Suite',
    pricePerNight: 350000,
    totalAllocated: 5,
    amenities: 'Private Pool, Executive Lounge Access, City View',
    image: 'https://images.unsplash.com/photo-1582719478250-c89404bb8a0e?auto=format&fit=crop&w=800&q=80',
    partnerId: 'airgo_direct',
    bookedDates: []
  },
  {
    _id: 'airgo_room_02',
    hotelName: 'The Wheatbaker Lagos',
    name: 'Luxury Executive Penthouse',
    pricePerNight: 280000,
    totalAllocated: 3,
    amenities: 'Spa Access, Free Wi-Fi, Chauffeur Service',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    partnerId: 'airgo_direct',
    bookedDates: []
  },
  {
    _id: 'airgo_room_03',
    hotelName: 'Fraser Suites Abuja',
    name: 'Diplomatic Studio',
    pricePerNight: 195000,
    totalAllocated: 8,
    amenities: 'Kitchenette, Gym Access, Premium Security',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    partnerId: 'airgo_direct',
    bookedDates: []
  }
];

export default function HotelHomepage() {
  const [user, setUser] = useState<any>(null);
  const [liveRooms, setLiveRooms] = useState<any[]>(FALLBACK_ROOMS);
  const [isLoading, setIsLoading] = useState(false);

  // SEARCH & DATE STATES
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // BOOKING MODAL STATES
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [clientData, setClientData] = useState({ name: '', email: '', phone: '' });

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('airgo_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setClientData({ name: parsedUser.name, email: parsedUser.email, phone: parsedUser.phone || '' });
    }

    const fetchRooms = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
        const res = await fetch(`${apiUrl}/api/rooms`);

        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setLiveRooms(data);
          } else {
            setLiveRooms(FALLBACK_ROOMS); // 🟢 Fallback on empty DB
          }
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchRooms();
  }, []);

  // 🛡️ DYNAMIC AVAILABILITY ENGINE
  const isRoomAvailable = (room: any) => {
    if (!checkIn || !checkOut) return true;
    if (!room.bookedDates) return true; // Safeguard for fallback data

    let d = new Date(checkIn);
    const endD = new Date(checkOut);

    while (d < endD) {
      const dateStr = d.toISOString().split('T')[0];
      const dayMatch = room.bookedDates?.find((b: any) => b.date === dateStr);
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-xs font-black text-[#000080] uppercase tracking-wider mb-1 line-clamp-1">{room.hotelName}</p>
                      <h3 className="font-bold text-gray-900 text-xl mb-2 leading-tight">{room.name}</h3>

                      <div className="bg-gray-50 p-3 rounded-lg mb-6 border border-gray-100 flex-grow">
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">{room.amenities}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                        <div>
                          <p className="text-2xl font-black text-[#000080]">₦{calculateTotal(room).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{checkIn && checkOut ? 'Total Price' : 'Per Night'}</p>
                        </div>
                        <button
                          onClick={() => available ? setSelectedRoom(room) : null}
                          disabled={!available || !checkIn || !checkOut}
                          className={`px-5 py-3 rounded-xl font-black text-sm shadow-md transition ${!checkIn || !checkOut ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : available ? 'bg-[#FFB81C] text-[#000080] hover:bg-yellow-400' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                          {available ? 'Book Escrow' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      
      

      {/* FRICTIONLESS BOOKING MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto border border-gray-100">
            <div className="bg-[#000080] p-6 text-white flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black">{selectedRoom.hotelName}</h2>
                <p className="text-blue-200 text-sm font-bold mt-1">{selectedRoom.name}</p>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="text-white hover:text-red-300 text-2xl font-bold transition">✕</button>
            </div>

            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                <span>Check-In: <span className="text-gray-900">{new Date(checkIn).toLocaleDateString()}</span></span>
                <span>Check-Out: <span className="text-gray-900">{new Date(checkOut).toLocaleDateString()}</span></span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <span className="text-xs uppercase font-black text-gray-400">Total Escrow Hold</span>
                <span className="text-3xl font-black text-[#000080]">₦{calculateTotal(selectedRoom).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              {!user && <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-xs font-bold mb-4">Please log in to your Airgo account to secure this booking.</div>}

              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Guest Name</label><input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#000080] outline-none" value={clientData.name} onChange={(e) => setClientData({ ...clientData, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email (For Invoice)</label><input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#000080] outline-none" value={clientData.email} onChange={(e) => setClientData({ ...clientData, email: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label><input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-[#000080] outline-none" value={clientData.phone} onChange={(e) => setClientData({ ...clientData, phone: e.target.value })} /></div>
              </div>

              <p className="text-[10px] text-gray-500 leading-relaxed mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                🔒 By confirming, your funds will be securely held in the Airgo Escrow framework. The partner will only be paid upon successful completion of your stay.
              </p>

              <button disabled={isBooking || !user} type="submit" className={`w-full py-4 rounded-xl shadow-lg text-lg font-black transition mt-2 ${(isBooking || !user) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FFB81C] text-[#000080] hover:bg-yellow-400'}`}>
                {isBooking ? 'Locking Inventory & Encrypting...' : 'Confirm Escrow Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}