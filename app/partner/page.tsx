"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PartnerDashboard() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'bookings'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 🟢 DATA STATES
    const [myInventory, setMyInventory] = useState<any[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

    // 🟢 MODAL STATES
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // 🟢 UPDATED: Dynamic Form State (Added totalAllocated for the Hotel Matrix)
    const [newItem, setNewItem] = useState<any>({
        name: '', price: '', totalAllocated: '', amenities: '', // For Hotels
        type: '', capacity: '', features: '' // For Cars
    });

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('airgo_token');
        const userData = localStorage.getItem('airgo_user');

        if (!token || !userData) return router.push('/login');

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'partner') {
            alert("Unauthorized Access.");
            return router.push('/dashboard');
        }

        if (!parsedUser.isApproved) {
            alert("Your account is currently under review by Airgo Admin. You will be granted full access once your documents are verified.");
        }

        setUser(parsedUser);
        fetchPartnerData(parsedUser);
    }, [router]);

    const fetchPartnerData = async (partnerData: any) => {
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

            const bookingsRes = await fetch(`${apiUrl}/api/bookings`);
            if (bookingsRes.ok) {
                const allBookings = await bookingsRes.json();
                const filteredBookings = allBookings.filter((b: any) => b.partnerId === partnerData.id);
                setMyBookings(filteredBookings);
            }

            if (partnerData.partnerType === 'car') {
                const carsRes = await fetch(`${apiUrl}/api/cars`);
                if (carsRes.ok) {
                    const allCars = await carsRes.json();
                    setMyInventory(allCars.filter((c: any) => c.partnerId === partnerData.id));
                }
            } else if (partnerData.partnerType === 'hotel') {
                // 🟢 FIXED: Now correctly fetches from the new Rooms collection!
                const roomsRes = await fetch(`${apiUrl}/api/rooms/partner/${partnerData.id}`);
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

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

            // 🟢 FIXED: Routes to the correct database depending on the partner type
            const isCar = user.partnerType === 'car';
            const endpoint = isCar ? '/api/cars' : '/api/rooms';

            const payload = isCar ? {
                name: newItem.name, type: newItem.type, price: Number(newItem.price), capacity: newItem.capacity, features: newItem.features, image: finalImageUrl, partnerId: user.id
            } : {
                partnerId: user.id, hotelName: user.businessName || user.name, name: newItem.name, pricePerNight: Number(newItem.price), totalAllocated: Number(newItem.totalAllocated), amenities: newItem.amenities, image: finalImageUrl
            };

            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(`✅ ${user.partnerType === 'car' ? 'Vehicle' : 'Room Tier'} listed successfully!`);
                setIsModalOpen(false);
                setImageFile(null);
                setNewItem({ name: '', price: '', totalAllocated: '', amenities: '', type: '', capacity: '', features: '' });
                fetchPartnerData(user);
            }
        } catch (error) {
            alert("❌ Error listing item. Please try again.");
        } finally {
            setIsUploading(false);
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

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans">

            {/* MOBILE HEADER */}
            <div className="md:hidden bg-[#004A99] text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                <h2 className="text-xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.partner</span></h2>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-2xl">☰</button>
            </div>

            {/* SIDEBAR */}
            <aside className={`fixed md:relative top-0 left-0 h-full w-64 bg-[#004A99] text-white flex-col shadow-xl z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex`}>
                <div className="p-6 border-b border-blue-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.partner</span></h2>
                        <p className="text-[10px] text-blue-200 mt-1 uppercase tracking-widest font-bold">
                            {user.partnerType === 'car' ? 'Fleet Manager' : 'Hotelier'}
                        </p>
                    </div>
                    <button className="md:hidden text-blue-200 text-xl" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'overview' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800'}`}>📊 Dashboard</button>
                    <button onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'inventory' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800'}`}>{user.partnerType === 'car' ? '🚘 My Fleet' : '🏨 Room Categories'}</button>
                    <button onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'bookings' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800'}`}>📅 Reservations</button>
                </nav>
                <div className="p-4 border-t border-blue-800">
                    <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold transition shadow-md">Sign Out</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative w-full bg-gray-100">
                <header className="bg-white px-8 py-5 border-b border-gray-200 hidden md:flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-2xl font-black text-gray-900 capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        {!user.isApproved && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Account Under Review</span>}
                        {user.isApproved && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Verified Partner</span>}
                        <div className="w-10 h-10 bg-[#004A99] rounded-full flex items-center justify-center text-white font-black shadow-inner">{user.name.charAt(0)}</div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {!user.isApproved ? (
                        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-200 max-w-2xl mx-auto mt-10">
                            <div className="text-5xl mb-4">🛡️</div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Verification Pending</h2>
                            <p className="text-gray-500">Your documents are currently being reviewed by the Airgo compliance team. You will be able to upload inventory once approved.</p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A99]"></div></div>
                    ) : (
                        <>
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-[#004A99] to-blue-900 p-6 rounded-3xl shadow-lg text-white md:col-span-2">
                                        <p className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">Gross Revenue (Escrow)</p>
                                        <p className="text-4xl md:text-5xl font-black mb-2">₦{calculateTotalRevenue()}</p>
                                        <p className="text-xs text-blue-300">Total value of all incoming and completed reservations.</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Active Listings</p>
                                        <p className="text-4xl font-black text-gray-900">{myInventory.length}</p>
                                    </div>
                                </div>
                            )}

                            {/* INVENTORY TAB */}
                            {activeTab === 'inventory' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h2 className="text-lg font-bold text-gray-800">{user.partnerType === 'car' ? 'My Fleet' : 'Room Categories'}</h2>
                                        <button onClick={() => setIsModalOpen(true)} className="bg-[#004A99] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition">
                                            + Configure {user.partnerType === 'car' ? 'Vehicle' : 'Room Tier'}
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
                                                    <p className="text-xs font-bold text-gray-400 uppercase mt-1">{item.type || 'Amenities: ' + item.amenities}</p>
                                                    <div className="flex justify-between items-center mt-4 pt-2 border-t">
                                                        <p className="font-black text-[#004A99]">₦{(item.price || item.pricePerNight)?.toLocaleString()} <span className="text-[10px] text-gray-400 font-medium">/ night</span></p>
                                                        {item.totalAllocated && <span className="bg-blue-50 text-[#004A99] font-bold text-xs px-2.5 py-1 rounded-md">Pool: {item.totalAllocated} Rooms</span>}
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
                                                    <th className="p-4 font-bold border-b">Asset</th>
                                                    <th className="p-4 font-bold border-b">Dates</th>
                                                    <th className="p-4 font-bold border-b text-right">Value</th>
                                                    <th className="p-4 font-bold border-b text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {myBookings.length === 0 ? (
                                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No active reservations.</td></tr>
                                                ) : myBookings.map((booking) => (
                                                    <React.Fragment key={booking._id}>
                                                        <tr onClick={() => toggleExpand(booking._id)} className="hover:bg-blue-50 transition cursor-pointer">
                                                            <td className="p-4">
                                                                <p className="font-black text-gray-900">{booking.itemName}</p>
                                                                <p className="text-[10px] text-[#004A99] font-bold uppercase mt-1">Tap to view details ▼</p>
                                                            </td>
                                                            <td className="p-4 text-sm text-gray-600 font-medium">
                                                                <p>In: {new Date(booking.checkIn).toLocaleDateString()}</p>
                                                            </td>
                                                            <td className="p-4 text-right font-black text-[#004A99]">₦{booking.totalPrice}</td>
                                                            <td className="p-4 text-center">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'Pending Escrow' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                                    {booking.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        {expandedBookingId === booking._id && (
                                                            <tr className="bg-gray-50 border-b border-gray-200 shadow-inner">
                                                                <td colSpan={4} className="p-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Dispatch Contact</p>
                                                                            <p className="text-sm font-black text-gray-900">{booking.clientName || 'N/A'}</p>
                                                                            <p className="text-xs font-bold text-[#004A99] mt-1 flex items-center gap-1">📞 {booking.clientPhone || 'N/A'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Delivery / Address</p>
                                                                            <p className="text-xs font-bold text-gray-700 leading-relaxed pr-4">
                                                                                {booking.deliveryAddress || 'No address provided'}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Booking Ref</p>
                                                                            <p className="text-sm font-black text-gray-900">{booking._id.substring(0, 10).toUpperCase()}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Exact Timeframe</p>
                                                                            <p className="text-xs font-bold text-green-700">In: {new Date(booking.checkIn).toLocaleString()}</p>
                                                                            <p className="text-xs font-bold text-red-700 mt-1">Out: {new Date(booking.checkOut).toLocaleString()}</p>
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
                            <h2 className="text-xl font-black text-[#004A99]">List New {user.partnerType === 'car' ? 'Vehicle' : 'Room Tier'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleAddItem} className="p-6 space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Name / Title</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Price per day (₦)</label><input required type="number" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} /></div>
                            </div>

                            {user.partnerType === 'car' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Type (e.g. SUV, Sedan)</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Capacity</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.capacity} onChange={e => setNewItem({ ...newItem, capacity: e.target.value })} /></div>
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Features (e.g. Chauffeur, Bulletproof)</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.features} onChange={e => setNewItem({ ...newItem, features: e.target.value })} /></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {/* 🟢 FIXED: Required Allocation Field for Hotel Inventory Matrix */}
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Rooms Allocated to Airgo Matrix Pool *</label><input required type="number" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.totalAllocated} onChange={e => setNewItem({ ...newItem, totalAllocated: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Luxury Amenities</label><input required type="text" placeholder="e.g. Pool, WiFi, King Bed" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.amenities} onChange={e => setNewItem({ ...newItem, amenities: e.target.value })} /></div>
                                </div>
                            )}

                            <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">High-Quality Photo *</label><input required type="file" accept="image/*" className="w-full px-4 py-2 border rounded-xl file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-[#004A99] file:font-bold text-gray-900" onChange={(e) => setImageFile(e.target.files?.[0] || null)} /></div>

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