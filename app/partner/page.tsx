"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AMENITIES_LIST = [
  "High-speed WiFi",
  "Swimming Pool",
  "Gym / Fitness Center",
  "Spa & Wellness",
  "Restaurant & Bar",
  "Room Service",
  "Air Conditioning",
  "Free Parking",
  "Complimentary Breakfast",
  "King Bed",
  "Private Balcony",
  "Mini Bar"
];

export default function PartnerDashboard() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'bookings'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // DATA STATES
    const [myInventory, setMyInventory] = useState<any[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

    // MODAL STATES
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [carImageFiles, setCarImageFiles] = useState<File[]>([]);

    const [newItem, setNewItem] = useState<any>({
        name: '', price: '', totalAllocated: '', amenities: '', type: '', capacity: '', features: '', hotelAddress: ''
    });

    const router = useRouter();

    const togglePartnerAmenity = (amenity: string) => {
        let list: string[] = newItem.amenities ? newItem.amenities.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
        if (list.includes(amenity)) {
            list = list.filter(item => item !== amenity);
        } else {
            list.push(amenity);
        }
        setNewItem({ ...newItem, amenities: list.join(', ') });
    };

    useEffect(() => {
        const token = localStorage.getItem('airgo_token');
        const userData = localStorage.getItem('airgo_user');

        if (!token || !userData) return router.push('/login');

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'partner') {
            toast.error("Unauthorized Access.");
            return router.push('/dashboard');
        }

        setUser(parsedUser);
        fetchPartnerData(parsedUser);
    }, [router]);

    const fetchPartnerData = async (partnerData: any) => {
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const secureId = partnerData.id || partnerData.userId || partnerData._id;

            // SILENTLY SYNC LATEST APPROVAL STATUS FROM BACKEND
            const partnersRes = await fetch(`${apiUrl}/api/auth/partners`);
            if (partnersRes.ok) {
                const allPartners = await partnersRes.json();
                const myLatestData = allPartners.find((p: any) => p._id === secureId);

                if (myLatestData) {
                    const updatedStorage = { 
                        ...partnerData, 
                        isApproved: myLatestData.isApproved,
                        partnerType: myLatestData.partnerType,
                        businessName: myLatestData.businessName,
                        name: myLatestData.name
                    };
                    
                    // Update React State
                    setUser(updatedStorage);

                    // Update LocalStorage so it remembers for next time!
                    localStorage.setItem('airgo_user', JSON.stringify(updatedStorage));
                }
            }

            // Fetch Bookings with unified secure ID
            const bookingsRes = await fetch(`${apiUrl}/api/bookings`);
            if (bookingsRes.ok) {
                const allBookings = await bookingsRes.json();
                const filteredBookings = allBookings.filter((b: any) => b.partnerId === secureId);
                setMyBookings(filteredBookings);
            }

            // Fetch Inventory with unified secure ID maps
            if (partnerData.partnerType?.toLowerCase().includes('car')) {
                const carsRes = await fetch(`${apiUrl}/api/cars`);
                if (carsRes.ok) {
                    const allCars = await carsRes.json();
                    setMyInventory(allCars.filter((c: any) => c.partnerId === secureId));
                }
            } else if (partnerData.partnerType === 'hotel') {
                const roomsRes = await fetch(`${apiUrl}/api/rooms/partner/${secureId}`);
                if (roomsRes.ok) {
                    setMyInventory(await roomsRes.json());
                }
            }
        } catch (error) {
            console.error("Error fetching partner data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let finalImageUrl = "";
            let finalImageUrls: string[] = [];
            const isCar = user.partnerType?.toLowerCase().includes('car');

            if (isCar) {
                if (carImageFiles.length > 0) {
                    for (const file of carImageFiles) {
                        const imgData = new FormData();
                        imgData.append('file', file);
                        imgData.append('upload_preset', 'airgo_fleet');

                        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/drdosbrru/image/upload`, {
                            method: 'POST', body: imgData
                        });
                        const cloudData = await cloudRes.json();
                        if (cloudData.secure_url) {
                            finalImageUrls.push(cloudData.secure_url);
                        }
                    }
                    if (finalImageUrls.length > 0) {
                        finalImageUrl = finalImageUrls[0];
                    } else {
                        throw new Error("Upload failed");
                    }
                }
            } else {
                if (imageFile) {
                    const imgData = new FormData();
                    imgData.append('file', imageFile);
                    imgData.append('upload_preset', 'airgo_fleet');

                    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/drdosbrru/image/upload`, {
                        method: 'POST', body: imgData
                    });
                    const cloudData = await cloudRes.json();
                    if (cloudData.secure_url) finalImageUrl = cloudData.secure_url;
                    else throw new Error("Upload failed");
                }
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const secureId = user.id || user.userId || user._id;

            const endpoint = isCar ? '/api/cars' : '/api/rooms';

            const payload = isCar ? {
                name: newItem.name, type: newItem.type, price: Number(newItem.price), capacity: newItem.capacity, features: newItem.features, image: finalImageUrl, images: finalImageUrls, partnerId: secureId
            } : {
                partnerId: secureId, hotelName: user.businessName || user.name, hotelAddress: newItem.hotelAddress, name: newItem.name, pricePerNight: Number(newItem.price), totalAllocated: Number(newItem.totalAllocated), amenities: newItem.amenities, image: finalImageUrl
            };

            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success(`${user.partnerType?.toLowerCase().includes('car') ? 'Vehicle' : 'Room Tier'} listed successfully!`);
                setIsModalOpen(false);
                setImageFile(null);
                setCarImageFiles([]);
                setNewItem({ name: '', price: '', totalAllocated: '', amenities: '', type: '', capacity: '', features: '', hotelAddress: '' });
                fetchPartnerData(user);
            }
        } catch (error) {
            toast.error("❌ Error listing item. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateInventory = async (id: string, updates: any) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const isCar = user.partnerType?.toLowerCase().includes('car');
            const endpoint = isCar ? `/api/cars/${id}` : `/api/rooms/${id}`;
            
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                toast.success("Inventory updated successfully!");
                fetchPartnerData(user);
            } else {
                toast.error("Failed to update inventory.");
            }
        } catch (error) {
            toast.error("Error updating inventory.");
        }
    };

const handleLogout = () => {
        localStorage.removeItem('airgo_token');
        localStorage.removeItem('airgo_user');
        window.location.href = '/login';
    };

    const calculateTotalRevenue = () => {
        return myBookings.reduce((sum, b) => {
            const num = typeof b.totalPrice === 'string' ? parseInt(b.totalPrice.replace(/[^0-9]/g, '')) : b.totalPrice;
            return sum + (num || 0);
        }, 0).toLocaleString();
    };

    const toggleExpand = (id: string) => {
        setExpandedBookingId(expandedBookingId === id ? null : id);
    };

    const isCarPartner = user?.partnerType?.toLowerCase().includes('car');

    const totalAllocatedRooms = !isCarPartner ? myInventory.reduce((sum, item) => sum + (item.totalAllocated || 0), 0) : 0;
    const totalRentalDays = isCarPartner ? myBookings.reduce((sum, b) => {
        if (!b.checkIn || !b.checkOut) return sum;
        const start = new Date(b.checkIn);
        const end = new Date(b.checkOut);
        const days = Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)), 1);
        return sum + days;
    }, 0) : 0;

    if (!user) return null;

    if (!user.isApproved) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
                <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-200 max-w-md w-full">
                    <div className="text-6xl mb-6 animate-pulse">🛡️</div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Verification Pending</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        Your partner registration has been received and is currently under review by our compliance team. You will be granted dashboard access once approved.
                    </p>
                    <button 
                        onClick={handleLogout} 
                        className="w-full bg-[#004A99] hover:bg-blue-800 text-white py-3 rounded-xl font-bold transition shadow-md"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans">

            {/* MOBILE HEADER */}
            <div className="md:hidden bg-[#004A99] text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                <Link href="/" className="hover:opacity-85 transition">
                    <h2 className="text-xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.partner</span></h2>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-2xl">☰</button>
            </div>

            {/* SIDEBAR */}
            <aside className={`fixed md:relative top-0 left-0 h-full w-64 bg-[#004A99] text-white flex-col shadow-xl z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex`}>
                <div className="p-6 border-b border-blue-800 flex justify-between items-center">
                    <Link href="/" className="hover:opacity-80 transition block text-left">
                        <h2 className="text-2xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.partner</span></h2>
                        <p className="text-[10px] text-blue-200 mt-1 uppercase tracking-widest font-bold">
                            {user.partnerType?.toLowerCase().includes('car') ? 'Fleet Manager' : 'Hotelier'}
                        </p>
                    </Link>
                    <button className="md:hidden text-blue-200 text-xl" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'overview' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800'}`}>📊 Dashboard</button>
                    <button onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'inventory' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800'}`}>{user.partnerType?.toLowerCase().includes('car') ? '🚘 My Fleet' : '🏨 Room Categories'}</button>
                    <button onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'bookings' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800'}`}>📅 Reservations</button>
                </nav>
                <div className="p-4 border-t border-blue-800">
                    <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold transition shadow-md">Sign Out</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative w-full bg-gray-100">
                <header className="bg-white px-8 py-5 border-b border-gray-200 hidden md:flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-2xl font-black text-gray-900 capitalize">
                        {activeTab === 'overview' 
                            ? (isCarPartner ? '🚘 Fleet Control Panel' : '🏨 Property Management Panel') 
                            : activeTab}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Verified Partner</span>
                        <div className="w-10 h-10 bg-[#004A99] rounded-full flex items-center justify-center text-white font-black shadow-inner">{user.name.charAt(0)}</div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A99]"></div></div>
                    ) : (
                        <>
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {isCarPartner ? (
                                        <>
                                            <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-6 rounded-3xl shadow-lg text-white md:col-span-2 border border-slate-800">
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Fleet Rental Revenue</p>
                                                <p className="text-4xl md:text-5xl font-black mb-2">₦{calculateTotalRevenue()}</p>
                                                <p className="text-xs text-slate-400">Total gross revenue from vehicle rental escrow bookings.</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between min-h-[140px]">
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Active Fleet Vehicles</p>
                                                <p className="text-4xl font-black text-slate-800">{myInventory.length}</p>
                                                <p className="text-[10px] text-gray-400 mt-2 font-bold">Vehicles registered on Airgo Matrix</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 md:col-span-1 flex flex-col justify-between min-h-[140px]">
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Rental Days Booked</p>
                                                <p className="text-4xl font-black text-slate-800">{totalRentalDays} Days</p>
                                                <p className="text-[10px] text-gray-400 mt-2 font-bold">Cumulative time across all dispatches</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-gradient-to-br from-[#004A99] to-blue-900 p-6 rounded-3xl shadow-lg text-white md:col-span-2">
                                                <p className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">Hotel Stay Revenue</p>
                                                <p className="text-4xl md:text-5xl font-black mb-2">₦{calculateTotalRevenue()}</p>
                                                <p className="text-xs text-blue-300">Total gross revenue from hotel reservation escrow bookings.</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between min-h-[140px]">
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Room Categories</p>
                                                <p className="text-4xl font-black text-gray-900">{myInventory.length}</p>
                                                <p className="text-[10px] text-gray-400 mt-2 font-bold">Active room tiers listed</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 md:col-span-1 flex flex-col justify-between min-h-[140px]">
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Allocated Rooms</p>
                                                <p className="text-4xl font-black text-gray-900">{totalAllocatedRooms} Rooms</p>
                                                <p className="text-[10px] text-gray-400 mt-2 font-bold">Total room matrix inventory capacity</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* INVENTORY TAB */}
                            {activeTab === 'inventory' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h2 className="text-lg font-bold text-gray-800">{user.partnerType?.toLowerCase().includes('car') ? 'My Fleet' : 'Room Categories'}</h2>
                                        <button onClick={() => setIsModalOpen(true)} className="bg-[#004A99] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition">
                                            + Configure {user.partnerType?.toLowerCase().includes('car') ? 'Vehicle' : 'Room Tier'}
                                        </button>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myInventory.length === 0 ? (
                                            <p className="col-span-full text-center text-gray-500 py-10">You have not listed any inventory yet.</p>
                                        ) : myInventory.map(item => (
                                            <div key={item._id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-gray-50">
                                                <img src={item.image} alt={item.name} className="w-full h-44 object-cover" />
                                                <div className="p-4">
                                                    <h3 className="font-black text-gray-900 text-lg">{item.name}</h3>
                                                    <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                                                        {user.partnerType?.toLowerCase().includes('car') ? `Class: ${item.type}` : `Amenities: ${item.amenities}`}
                                                    </p>
                                                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                                                        {isCarPartner ? (
                                                            <>
                                                                <p className="font-black text-[#004A99]">₦{item.price?.toLocaleString()} <span className="text-[10px] text-gray-400 font-medium">/ day</span></p>
                                                                <span className="bg-amber-50 text-amber-700 font-bold text-xs px-2.5 py-1 rounded-md border border-amber-100">
                                                                    Pool: {item.totalAllocated || 1} Vehicle{(item.totalAllocated || 1) > 1 ? 's' : ''}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="font-black text-[#004A99]">₦{item.pricePerNight?.toLocaleString()} <span className="text-[10px] text-gray-400 font-medium">/ night</span></p>
                                                                {item.totalAllocated && (
                                                                    <span className="bg-blue-50 text-[#004A99] font-bold text-xs px-2.5 py-1 rounded-md border border-blue-100">
                                                                        Pool: {item.totalAllocated} Room{item.totalAllocated > 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* BOOKINGS TAB */}
                            {activeTab === 'bookings' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50"><h2 className="text-lg font-black text-gray-900">Client Reservations</h2></div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="p-4 font-bold border-b">{isCarPartner ? 'Vehicle' : 'Room / Stay'}</th>
                                                    <th className="p-4 font-bold border-b">{isCarPartner ? 'Rental Dates' : 'Stay Dates'}</th>
                                                    <th className="p-4 font-bold border-b text-right">Value</th>
                                                    <th className="p-4 font-bold border-b text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {/* 🟢 UPGRADED: Beautiful Empty State Banner */}
                                                {myBookings.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="p-0">
                                                            <div className="p-12 text-center bg-white border border-gray-100 shadow-sm m-6 rounded-3xl">
                                                                 <div className="text-6xl mb-4">📭</div>
                                                                 <h3 className="text-2xl font-black text-[#004A99] mb-2">No Reservations Yet</h3>
                                                                 <p className="text-gray-500 max-w-md mx-auto">When clients make a reservation, all booking details and dispatch information will appear here.</p>
                                                             </div>
                                                        </td>
                                                    </tr>
                                                ) : myBookings.map((booking) => (
                                                    <React.Fragment key={booking._id}>
                                                        <tr onClick={() => toggleExpand(booking._id)} className="hover:bg-blue-50 transition cursor-pointer">
                                                            <td className="p-4">
                                                                <p className="font-black text-gray-900">{booking.itemName}</p>
                                                                <p className="text-[10px] text-[#004A99] font-bold uppercase mt-1">Tap to view details ▼</p>
                                                            </td>
                                                            <td className="p-4 text-sm text-gray-600 font-medium">
                                                                {isCarPartner ? (
                                                                    <p>Out: {new Date(booking.checkIn).toLocaleDateString()}</p>
                                                                ) : (
                                                                    <p>In: {new Date(booking.checkIn).toLocaleDateString()}</p>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-right font-black text-[#004A99]">₦{booking.totalPrice}</td>
                                                            <td className="p-4 text-center">
                                                                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                     booking.status === 'Pending Escrow' 
                                                                         ? 'bg-yellow-100 text-yellow-800' 
                                                                         : booking.status === 'Approved for Disbursement'
                                                                             ? 'bg-blue-100 text-blue-800'
                                                                             : 'bg-green-100 text-green-800'
                                                                 }`}>
                                                                     {booking.status}
                                                                 </span>
                                                            </td>
                                                        </tr>
                                                        {expandedBookingId === booking._id && (
                                                            <tr className="bg-gray-50 border-b border-gray-200 shadow-inner">
                                                                <td colSpan={4} className="p-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{isCarPartner ? 'Driver / Client' : 'Dispatch Contact'}</p>
                                                                            <p className="text-sm font-black text-gray-900">{booking.clientName || 'N/A'}</p>
                                                                            <p className="text-xs font-bold text-[#004A99] mt-1 flex items-center gap-1">📞 {booking.clientPhone || 'N/A'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{isCarPartner ? 'Delivery Location' : 'Delivery / Address'}</p>
                                                                            <p className="text-xs font-bold text-gray-700 leading-relaxed pr-4">
                                                                                {booking.deliveryAddress || (isCarPartner ? 'Terminal Pick-Up' : 'Walk-In / Property Visit')}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Booking Ref</p>
                                                                            <p className="text-sm font-black text-gray-900">{booking._id.substring(0, 10).toUpperCase()}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Exact Timeframe</p>
                                                                            {isCarPartner ? (
                                                                                <>
                                                                                    <p className="text-xs font-bold text-green-700">Pick-up: {new Date(booking.checkIn).toLocaleDateString()}</p>
                                                                                    <p className="text-xs font-bold text-red-700 mt-1">Return: {new Date(booking.checkOut).toLocaleDateString()}</p>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <p className="text-xs font-bold text-green-700">Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
                                                                                    <p className="text-xs font-bold text-red-700 mt-1">Check-out: {new Date(booking.checkOut).toLocaleDateString()}</p>
                                                                                </>
                                                                            )}
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mt-2 mb-1">Reserved At</p>
                                                                            <p className="text-xs text-gray-700 font-bold">{booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* DYNAMIC ADD INVENTORY MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-black text-[#004A99]">List New {user.partnerType?.toLowerCase().includes('car') ? 'Vehicle' : 'Room Tier'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleAddItem} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Name / Title</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} /></div>
                                {/* 🟢 UPGRADED: Smart Field - Min 0 */}
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Price per day (₦)</label><input required type="number" min="0" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} /></div>
                            </div>

                            {user.partnerType?.toLowerCase().includes('car') ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Type (e.g. SUV, Sedan)</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Capacity</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.capacity} onChange={e => setNewItem({ ...newItem, capacity: e.target.value })} /></div>
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Features</label><input required type="text" placeholder="e.g. Wi-Fi, Bluetooth" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.features} onChange={e => setNewItem({ ...newItem, features: e.target.value })} /></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Hotel Address *</label><input required type="text" placeholder="e.g. 1 Aguiyi Ironsi St, Abuja" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.hotelAddress} onChange={e => setNewItem({ ...newItem, hotelAddress: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Rooms Allocated to Airgo Matrix Pool *</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.totalAllocated} onChange={e => setNewItem({ ...newItem, totalAllocated: e.target.value })} /></div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Luxury Amenities</label>
                                        <input 
                                            type="text" 
                                            required 
                                            readOnly
                                            placeholder="Select amenities from list below..."
                                            className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-gray-50/50 mb-2 focus:outline-none"
                                            value={newItem.amenities}
                                        />
                                        <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200/50 max-h-40 overflow-y-auto">
                                            {AMENITIES_LIST.map((amenity) => {
                                                const isSelected = newItem.amenities ? newItem.amenities.split(',').map((s: string) => s.trim()).filter(Boolean).includes(amenity) : false;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={amenity}
                                                        onClick={() => togglePartnerAmenity(amenity)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                                                            isSelected 
                                                                ? 'bg-[#004A99] text-white border-[#004A99] shadow-sm' 
                                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        {amenity}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Upload Listing Photo{user.partnerType?.toLowerCase().includes('car') ? '(s)' : ''} *</label>
                                <input required type="file" multiple={user.partnerType?.toLowerCase().includes('car')} accept="image/*" className="w-full px-4 py-2 border rounded-xl file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-[#004A99] text-gray-900" onChange={(e) => {
                                    if (user.partnerType?.toLowerCase().includes('car')) {
                                        setCarImageFiles(Array.from(e.target.files || []));
                                    } else {
                                        setImageFile(e.target.files?.[0] || null);
                                    }
                                }} />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={isUploading} type="submit" className={`px-6 py-2 rounded-xl font-bold text-white shadow-md ${isUploading ? 'bg-gray-400' : 'bg-[#004A99] hover:bg-blue-800'}`}>{isUploading ? 'Uploading...' : 'Publish Listing'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}