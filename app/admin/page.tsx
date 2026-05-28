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

export default function SuperadminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'escrow' | 'approvals' | 'fleet' | 'rooms'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // ALL SYSTEM DATA STATES
    const [allBookings, setAllBookings] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [cars, setCars] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // EXPANDABLE ESCROW STATE
    const [expandedEscrowId, setExpandedEscrowId] = useState<string | null>(null);
    const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>(null);
    const [partnerFilter, setPartnerFilter] = useState<'active' | 'deleted'>('active');

    // CAR FORM STATES
    const [isCarModalOpen, setIsCarModalOpen] = useState(false);
    const [newCar, setNewCar] = useState({ name: '', type: '', price: '', capacity: '', features: '' });
    const [carImageFile, setCarImageFile] = useState<File | null>(null);

    // ROOM MATRIX FORM STATES 
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [newRoom, setNewRoom] = useState({ hotelName: '', hotelAddress: '', name: '', pricePerNight: '', totalAllocated: '', amenities: '' });
    const [roomImageFile, setRoomImageFile] = useState<File | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const toggleRoomAmenity = (amenity: string) => {
        let list: string[] = newRoom.amenities ? newRoom.amenities.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
        if (list.includes(amenity)) {
            list = list.filter(item => item !== amenity);
        } else {
            list.push(amenity);
        }
        setNewRoom({ ...newRoom, amenities: list.join(', ') });
    };

    useEffect(() => {
        const token = localStorage.getItem('airgo_token');
        const userData = localStorage.getItem('airgo_user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'admin') {
            toast.error("Unauthorized Access. Redirecting...");
            router.push('/dashboard');
            return;
        }

        setUser(parsedUser);
        fetchAllSystemData();
    }, [router]);

    const fetchAllSystemData = async () => {
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

            const [bookingsRes, partnersRes, carsRes, roomsRes] = await Promise.all([
                fetch(`${apiUrl}/api/bookings`),
                fetch(`${apiUrl}/api/auth/partners`),
                fetch(`${apiUrl}/api/cars`),
                fetch(`${apiUrl}/api/rooms`)
            ]);

            if (bookingsRes.ok) setAllBookings(await bookingsRes.json());
            if (partnersRes.ok) setPartners(await partnersRes.json());
            if (carsRes.ok) setCars(await carsRes.json());
            if (roomsRes.ok) setRooms(await roomsRes.json());
        } catch (error) {
            console.error("Error fetching system data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- ESCROW & PARTNER ACTIONS ---
    const handleUpdateEscrowStatus = async (bookingId: string, nextStatus: string, actionLabel: string) => {
        if (window.confirm(`${actionLabel} for this reservation?`)) {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
                const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: nextStatus })
                });

                if (res.ok) {
                    toast.success(`${actionLabel} Successful!`);
                    setAllBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: nextStatus } : b));
                } else {
                    toast.error(`❌ Failed to update status.`);
                }
            } catch (error) {
                toast.error("❌ Error connecting to server.");
            }
        }
    };

    const handleApprovePartner = async (partnerId: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/approve-partner/${partnerId}`, { method: 'PUT' });
            if (res.ok) {
                toast.success("Partner Approved!");
                setPartners(prev => prev.map(p => p._id === partnerId ? { ...p, isApproved: true } : p));
            }
        } catch (error) { toast.error("❌ Error connecting to server."); }
    };

    const handleToggleStatus = async (partnerId: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/toggle-status/${partnerId}`, { method: 'PUT' });
            if (res.ok) {
                const data = await res.json();
                toast.success(`${data.message}`);
                setPartners(prev => prev.map(p => p._id === partnerId ? { ...p, isActive: data.isActive } : p));
            }
        } catch (error) { toast.error("❌ Error changing partner status."); }
    };

    const handleDeletePartner = async (partnerId: string) => {
        if (window.confirm("Are you sure you want to delete this partner? This will restrict their login and hide their listings.")) {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
                const res = await fetch(`${apiUrl}/api/auth/delete-partner/${partnerId}`, { method: 'PUT' });
                if (res.ok) {
                    toast.success("Partner Deleted!");
                    setPartners(prev => prev.map(p => p._id === partnerId ? { ...p, isDeleted: true } : p));
                }
            } catch (error) { toast.error("❌ Error connecting to server."); }
        }
    };

    const handleRestorePartner = async (partnerId: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/restore-partner/${partnerId}`, { method: 'PUT' });
            if (res.ok) {
                toast.success("Partner Restored!");
                setPartners(prev => prev.map(p => p._id === partnerId ? { ...p, isDeleted: false } : p));
            }
        } catch (error) { toast.error("❌ Error connecting to server."); }
    };

    // --- CLOUDINARY UPLOAD HELPER ---
    const handleUploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'airgo_fleet');
        const res = await fetch(`https://api.cloudinary.com/v1_1/drdosbrru/image/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.secure_url) return data.secure_url;
        throw new Error("Upload failed");
    };

    // --- ADD CAR ---
    const handleAddCar = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            const finalImageUrl = carImageFile ? await handleUploadToCloudinary(carImageFile) : '';
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const response = await fetch(`${apiUrl}/api/cars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newCar, image: finalImageUrl, price: Number(newCar.price), partnerId: 'airgo_direct' })
            });

            if (response.ok) {
                toast.success("Vehicle deployed successfully!");
                setIsCarModalOpen(false);
                setNewCar({ name: '', type: '', price: '', capacity: '', features: '' });
                setCarImageFile(null);
                fetchAllSystemData();
            }
        } catch (error) { toast.error("❌ Error adding vehicle."); } finally { setIsUploading(false); }
    };

    // --- ADD ROOM MATRIX ---
    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            const finalImageUrl = roomImageFile ? await handleUploadToCloudinary(roomImageFile) : '';
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const response = await fetch(`${apiUrl}/api/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    partnerId: 'airgo_direct',
                    hotelName: newRoom.hotelName,
                    hotelAddress: newRoom.hotelAddress,
                    name: newRoom.name,
                    pricePerNight: Number(newRoom.pricePerNight),
                    totalAllocated: Number(newRoom.totalAllocated),
                    amenities: newRoom.amenities,
                    image: finalImageUrl
                })
            });

            if (response.ok) {
                toast.success("Room Category published to live matrix pool!");
                setIsRoomModalOpen(false);
                setNewRoom({ hotelName: '', hotelAddress: '', name: '', pricePerNight: '', totalAllocated: '', amenities: '' });
                setRoomImageFile(null);
                fetchAllSystemData();
            }
        } catch (error) { toast.error("❌ Error adding room category configuration."); } finally { setIsUploading(false); }
    };

    // --- DELETE ITEM (Generic) ---
    const handleDelete = async (type: 'cars' | 'rooms', id: string) => {
        if (!window.confirm(`Are you sure you want to remove this listing?`)) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const response = await fetch(`${apiUrl}/api/${type}/${id}`, { method: 'DELETE' });
            if (response.ok) fetchAllSystemData();
        } catch (error) { console.error("Error deleting item:", error); }
    };

    const handleLogout = () => {
        localStorage.removeItem('airgo_token');
        localStorage.removeItem('airgo_user');
        window.location.href = '/login';
    };

    const calculateTotalEscrow = () => {
        return allBookings.filter(b => b.status === 'Pending Escrow').reduce((sum, b) => {
            const num = typeof b.totalPrice === 'string' ? parseInt(b.totalPrice.replace(/[^0-9]/g, '')) : b.totalPrice;
            return sum + (num || 0);
        }, 0).toLocaleString();
    };

    const toggleEscrowExpand = (id: string) => {
        setExpandedEscrowId(expandedEscrowId === id ? null : id);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans">
            {/* MOBILE HEADER */}
            <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                <Link href="/" className="hover:opacity-85 transition">
                    <h2 className="text-xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.HQ</span></h2>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

            {/* SIDEBAR COMMAND CENTER */}
            <aside className={`fixed md:relative top-0 left-0 h-full w-64 bg-gray-900 text-white flex-col shadow-xl z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex`}>
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <Link href="/" className="hover:opacity-80 transition block">
                        <h2 className="text-2xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.HQ</span></h2>
                        <p className="text-xs text-green-400 mt-1 uppercase tracking-widest font-bold">System Online</p>
                    </Link>
                    <button className="md:hidden text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'overview' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>📊 Global Overview</button>
                    <button onClick={() => { setActiveTab('escrow'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'escrow' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>💰 Escrow Ledger</button>
                    <button onClick={() => { setActiveTab('approvals'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'approvals' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>🛡️ Partner Approvals</button>
                    <div className="my-2 border-b border-gray-800"></div>
                    <button onClick={() => { setActiveTab('fleet'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'fleet' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>🚘 Manage Fleet</button>
                    <button onClick={() => { setActiveTab('rooms'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'rooms' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>🏨 Manage Room Matrix</button>
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="w-full bg-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm font-bold border border-red-900/50 hover:bg-red-900 hover:text-white transition">Sign Out</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative w-full bg-gray-100">
                <header className="bg-white px-6 md:px-8 py-5 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10 hidden md:flex">
                    <h1 className="text-2xl font-black text-gray-900 capitalize">{activeTab === 'rooms' ? 'Room Matrix' : activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Superadmin</span>
                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-black shadow-inner">{user.name.charAt(0)}</div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>
                    ) : (
                        <>
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    <div className="bg-gradient-to-br from-[#000080] to-blue-900 p-6 rounded-3xl shadow-lg text-white col-span-1 lg:col-span-2">
                                        <p className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">Funds in Escrow</p>
                                        <p className="text-4xl md:text-5xl font-black mb-2">₦{calculateTotalEscrow()}</p>
                                        <p className="text-xs text-blue-300">Awaiting partner disbursement</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Bookings</p>
                                        <p className="text-4xl font-black text-gray-900">{allBookings.length}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Active Vehicles</p>
                                        <p className="text-4xl font-black text-[#000080]">{cars.length}</p>
                                    </div>
                                </div>
                            )}

                            {/* ESCROW TAB */}
                            {activeTab === 'escrow' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50"><h2 className="text-lg font-black text-gray-900">Live Escrow Ledger</h2></div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="p-4 font-bold border-b">Asset</th>
                                                    <th className="p-4 font-bold border-b">Status</th>
                                                    <th className="p-4 font-bold border-b text-right">Escrow Amount</th>
                                                    <th className="p-4 font-bold border-b text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {allBookings.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="p-0">
                                                            <div className="p-12 text-center bg-white border border-gray-100 shadow-sm m-6 rounded-3xl">
                                                                <div className="text-6xl mb-4">📭</div>
                                                                <h3 className="text-2xl font-black text-[#000080] mb-2">No Transactions Yet</h3>
                                                                <p className="text-gray-500 max-w-md mx-auto">When clients make a reservation, all escrow details and dispatch information will appear here.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : allBookings.map((booking) => (
                                                    <React.Fragment key={booking._id}>
                                                        <tr onClick={() => toggleEscrowExpand(booking._id)} className="hover:bg-blue-50 transition cursor-pointer">
                                                            <td className="p-4">
                                                                <p className="font-black text-gray-900">{booking.itemName}</p>
                                                                <p className="text-[10px] text-[#000080] font-bold uppercase mt-1">Tap for details ▼</p>
                                                            </td>
                                                            <td className="p-4">
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
                                                            <td className="p-4 text-right font-black text-[#000080]">₦{booking.totalPrice}</td>
                                                            <td className="p-4 text-center">
                                                                {booking.status === 'Pending Escrow' && (
                                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateEscrowStatus(booking._id, 'Approved for Disbursement', 'Approve Payout'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-md hover:scale-105 transition">Approve Payout</button>
                                                                )}
                                                                {booking.status === 'Approved for Disbursement' && (
                                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateEscrowStatus(booking._id, 'Paid Out', 'Disburse Payout'); }} className="bg-[#10B981] text-white px-4 py-2 rounded-lg text-xs font-black shadow-md hover:scale-105 transition">Disburse Payout</button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {expandedEscrowId === booking._id && (
                                                            <tr className="bg-gray-50 border-b border-gray-200 shadow-inner">
                                                                <td colSpan={4} className="p-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Client Details</p>
                                                                            <p className="text-sm font-black text-gray-900">{booking.clientName || 'N/A'}</p>
                                                                            <p className="text-xs font-bold text-[#000080] mt-1 flex items-center gap-1">📞 {booking.clientPhone || 'N/A'}</p>
                                                                            <p className="text-xs text-gray-500 mt-1">{booking.clientEmail || 'No email provided'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Delivery Address</p>
                                                                            <p className="text-xs font-bold text-gray-700 leading-relaxed pr-4">
                                                                                {booking.deliveryAddress || 'No address provided'}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Booking Ref & Asset</p>
                                                                            <p className="text-xs font-black text-gray-900 mb-1">{booking._id.substring(0, 12).toUpperCase()}</p>
                                                                            <p className="text-[10px] font-bold text-gray-500 uppercase">Partner: {booking.partnerId.substring(0, 8)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Exact Timeframe</p>
                                                                            <p className="text-xs font-bold text-green-700">In: {new Date(booking.checkIn).toLocaleString()}</p>
                                                                            <p className="text-xs font-bold text-red-700 mt-1">Out: {new Date(booking.checkOut).toLocaleString()}</p>
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

                            {/* PARTNER APPROVALS TAB */}
                            {activeTab === 'approvals' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                        <h2 className="text-lg font-black text-gray-900">Partner Registrations</h2>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setPartnerFilter('active')} 
                                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${partnerFilter === 'active' ? 'bg-[#000080] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                Active ({partners.filter(p => !p.isDeleted).length})
                                            </button>
                                            <button 
                                                onClick={() => setPartnerFilter('deleted')} 
                                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${partnerFilter === 'deleted' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                Archived / Deleted ({partners.filter(p => p.isDeleted).length})
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="p-4 font-bold border-b">Partner / Type</th>
                                                    <th className="p-4 font-bold border-b">Business Name</th>
                                                    <th className="p-4 font-bold border-b">Contact Info</th>
                                                    <th className="p-4 font-bold border-b">Status</th>
                                                    <th className="p-4 font-bold border-b text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {partners.filter(p => partnerFilter === 'active' ? !p.isDeleted : p.isDeleted).length === 0 ? (
                                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No partners found in this view.</td></tr>
                                                ) : partners.filter(p => partnerFilter === 'active' ? !p.isDeleted : p.isDeleted).map((partner) => (
                                                    <React.Fragment key={partner._id}>
                                                        <tr onClick={() => setExpandedPartnerId(expandedPartnerId === partner._id ? null : partner._id)} className={`transition cursor-pointer ${partner.isActive === false ? 'bg-red-50/50' : 'hover:bg-blue-50'}`}>
                                                            <td className="p-4">
                                                                <p className="font-bold text-gray-900">{partner.name}</p>
                                                                <p className="text-[10px] uppercase font-black text-blue-600">{partner.partnerType === 'car' ? '🚘 Fleet' : partner.partnerType === 'hotel' ? '🏨 Hotel' : 'Partner'}</p>
                                                                <p className="text-[10px] text-[#000080] font-bold uppercase mt-1">Tap for details ▼</p>
                                                            </td>
                                                            <td className="p-4 text-gray-600 font-medium">{partner.businessName || 'N/A'}</td>
                                                            <td className="p-4"><p className="text-sm text-gray-900">{partner.email}</p><p className="text-xs text-gray-500">{partner.phoneNumber || 'No phone'}</p></td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${partner.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{partner.isApproved ? 'Approved' : 'Pending'}</span>
                                                                {partner.isActive === false && <span className="block mt-1 text-[10px] font-bold text-red-600">Deactivated</span>}
                                                            </td>
                                                            <td className="p-4 flex flex-wrap gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                                                                {partnerFilter === 'active' ? (
                                                                    <>
                                                                        {!partner.isApproved && <button onClick={() => handleApprovePartner(partner._id)} className="bg-[#000080] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:scale-105 transition">Approve</button>}
                                                                        <button onClick={() => handleToggleStatus(partner._id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${partner.isActive !== false ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white' : 'bg-green-600 text-white shadow-md'}`}>
                                                                            {partner.isActive !== false ? 'Deactivate' : 'Reactivate'}
                                                                        </button>
                                                                        <button onClick={() => handleDeletePartner(partner._id)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition shadow-sm">
                                                                            Delete
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button onClick={() => handleRestorePartner(partner._id)} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-black shadow-md hover:bg-green-700 transition">
                                                                        Restore / Add Back
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {expandedPartnerId === partner._id && (
                                                            <tr className="bg-gray-50 border-b border-gray-200 shadow-inner">
                                                                <td colSpan={5} className="p-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Business Details</p>
                                                                            <p className="text-sm font-black text-gray-900">{partner.businessName || 'N/A'}</p>
                                                                            <p className="text-xs text-gray-700 mt-1">{partner.businessAddress || 'No address provided'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Registration</p>
                                                                            <p className="text-xs font-bold text-gray-900">CAC Number: <span className="font-normal text-gray-600">{partner.cacNumber || 'N/A'}</span></p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Documents</p>
                                                                            {partner.cacCertificateUrl && <a href={partner.cacCertificateUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#000080] hover:underline block mb-1">📄 View CAC Certificate</a>}
                                                                            {partner.driversLicenseUrl && <a href={partner.driversLicenseUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#000080] hover:underline block mb-1">📄 View Driver's License</a>}
                                                                            {!partner.cacCertificateUrl && !partner.driversLicenseUrl && <p className="text-xs text-gray-500">No documents uploaded</p>}
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

                            {/* FLEET MANAGEMENT TAB */}
                            {activeTab === 'fleet' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h2 className="text-lg font-bold text-gray-800">Global Fleet</h2>
                                        <button onClick={() => setIsCarModalOpen(true)} className="bg-[#000080] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-900 transition">+ Add Vehicle</button>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {cars.length === 0 ? (
                                            <p className="col-span-full text-center text-gray-500 py-10">No vehicles in the database.</p>
                                        ) : cars.map(car => (
                                            <div key={car._id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                                <img src={car.image} alt={car.name} className="w-full h-40 object-cover" />
                                                <div className="p-4">
                                                    <h3 className="font-black text-gray-900">{car.name}</h3>
                                                    <p className="text-sm text-gray-500 mb-2">{car.type}</p>
                                                    <div className="flex justify-between items-center mt-4">
                                                        <p className="font-bold text-[#000080]">₦{car.price?.toLocaleString()}</p>
                                                        <button onClick={() => handleDelete('cars', car._id)} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-3 py-1 rounded">Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ROOM CONFIGURATION MATRIX TAB */}
                            {activeTab === 'rooms' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h2 className="text-lg font-bold text-gray-800">Global Properties & Room Pools</h2>
                                        <button onClick={() => setIsRoomModalOpen(true)} className="bg-[#000080] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-900 transition">+ Add Room Category</button>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {rooms.length === 0 ? (
                                            <p className="col-span-full text-center text-gray-500 py-10">No room allocations active in the grid.</p>
                                        ) : rooms.map(room => (
                                            <div key={room._id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-gray-50">
                                                <img src={room.image} alt={room.name} className="w-full h-40 object-cover" />
                                                <div className="p-4">
                                                    <span className="text-[10px] uppercase tracking-wider text-blue-600 font-black">{room.hotelName}</span>
                                                    <h3 className="font-black text-gray-900 text-lg mt-0.5">{room.name}</h3>
                                                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">Amenities: {room.amenities}</p>
                                                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">📍 {room.hotelAddress || 'No address'}</p>
                                                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                                                        <p className="font-bold text-[#000080]">₦{room.pricePerNight?.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">/ night</span></p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs bg-blue-50 text-[#000080] font-bold px-2 py-1 rounded">Pool: {room.totalAllocated}</span>
                                                            <button onClick={() => handleDelete('rooms', room._id)} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-2 py-1 rounded">Delete</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* ADD CAR MODAL */}
            {isCarModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-black text-[#000080]">Add Global Vehicle</h2>
                            <button onClick={() => setIsCarModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleAddCar} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Name</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.name} onChange={e => setNewCar({ ...newCar, name: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Type</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.type} onChange={e => setNewCar({ ...newCar, type: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Price (₦)</label><input required type="number" min="0" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.price} onChange={e => setNewCar({ ...newCar, price: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Capacity</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.capacity} onChange={e => setNewCar({ ...newCar, capacity: e.target.value })} /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Upload Photo</label>
                                <input required type="file" accept="image/*" className="w-full px-4 py-2 border rounded-xl file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-[#000080] text-gray-900" onChange={(e) => setCarImageFile(e.target.files?.[0] || null)} />
                            </div>
                            <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Features</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.features} onChange={e => setNewCar({ ...newCar, features: e.target.value })} /></div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCarModalOpen(false)} className="px-5 py-2 rounded-xl font-bold text-gray-600">Cancel</button>
                                <button disabled={isUploading} type="submit" className={`px-6 py-2 rounded-xl font-bold text-white ${isUploading ? 'bg-gray-400' : 'bg-[#000080]'}`}>{isUploading ? 'Deploying...' : 'Deploy Vehicle'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DYNAMIC ROOM ALLOCATION MODAL */}
            {isRoomModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-black text-[#000080]">Add Global Room Category</h2>
                            <button onClick={() => setIsRoomModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleAddRoom} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Hotel / Property Name</label><input required type="text" placeholder="e.g. Transcorp Hilton" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newRoom.hotelName} onChange={e => setNewRoom({ ...newRoom, hotelName: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Hotel Address</label><input required type="text" placeholder="e.g. 1 Aguiyi Ironsi St, Abuja" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newRoom.hotelAddress} onChange={e => setNewRoom({ ...newRoom, hotelAddress: e.target.value })} /></div>
                                <div className="col-span-2"><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Room Tier Name</label><input required type="text" placeholder="e.g. Presidential Suite" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Price Per Night (₦)</label><input required type="number" min="0" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newRoom.pricePerNight} onChange={e => setNewRoom({ ...newRoom, pricePerNight: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Matrix Pool Allocation</label><input required type="number" min="1" placeholder="e.g. 5" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newRoom.totalAllocated} onChange={e => setNewRoom({ ...newRoom, totalAllocated: e.target.value })} /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Luxury Amenities</label>
                                <input 
                                    type="text" 
                                    required 
                                    readOnly
                                    placeholder="Select amenities from list below..."
                                    className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-gray-50/50 mb-2 focus:outline-none"
                                    value={newRoom.amenities}
                                />
                                <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200/50 max-h-40 overflow-y-auto">
                                    {AMENITIES_LIST.map((amenity) => {
                                        const isSelected = newRoom.amenities ? newRoom.amenities.split(',').map((s: string) => s.trim()).filter(Boolean).includes(amenity) : false;
                                        return (
                                            <button
                                                type="button"
                                                key={amenity}
                                                onClick={() => toggleRoomAmenity(amenity)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-[#000080] text-white border-[#000080] shadow-sm' 
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {amenity}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Upload Photo</label>
                                <input required type="file" accept="image/*" className="w-full px-4 py-2 border rounded-xl text-gray-900 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-[#000080]" onChange={(e) => setRoomImageFile(e.target.files?.[0] || null)} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsRoomModalOpen(false)} className="px-5 py-2 rounded-xl font-bold text-gray-600">Cancel</button>
                                <button disabled={isUploading} type="submit" className={`px-6 py-2 rounded-xl font-bold text-white ${isUploading ? 'bg-gray-400' : 'bg-[#000080]'}`}>{isUploading ? 'Uploading Matrix...' : 'Publish Room'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}