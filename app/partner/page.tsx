"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AMENITIES_LIST = [
  "High-speed WiFi",
  "24hrs Electricity",
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

const formatDisplayDate = (dateStr: string, itemType: string) => {
    if (!dateStr) return 'N/A';
    try {
        const parts = dateStr.split('T');
        const datePart = parts[0];
        
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const [year, month, day] = datePart.split('-').map(Number);
        
        if (!year || !month || !day) return dateStr;
        
        const formattedDate = `${months[month - 1]} ${day}, ${year}`;
        
        if (itemType === 'hotel') {
            return `${formattedDate} at 12:00 PM`;
        } else {
            if (parts[1]) {
                const [hourStr, minStr] = parts[1].split(':');
                let hour = parseInt(hourStr, 10);
                const min = minStr ? minStr.substring(0, 2) : '00';
                const ampm = hour >= 12 ? 'PM' : 'AM';
                hour = hour % 12;
                hour = hour ? hour : 12;
                return `${formattedDate} at ${hour}:${min} ${ampm}`;
            }
            return formattedDate;
        }
    } catch (e) {
        return dateStr;
    }
};

export default function PartnerDashboard() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'bookings' | 'profile'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // PROFILE STATES
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        businessName: '',
        businessAddress: '',
        cacNumber: ''
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const secureId = user.id || user.userId || user._id;

            const res = await fetch(`${apiUrl}/api/auth/profile/${secureId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Profile settings updated!");
                const updatedUser = { ...user, ...data.user };
                setUser(updatedUser);
                localStorage.setItem('airgo_user', JSON.stringify(updatedUser));
            } else {
                toast.error(data.message || "Failed to save profile details.");
            }
        } catch (error) {
            toast.error("Error connecting to server.");
        } finally {
            setIsSavingProfile(false);
        }
    };

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
        name: '', price: '', totalAllocated: '', amenities: '', type: '', capacity: '', features: '', hotelAddress: '', vehicleNumber: '', location: '', state: '', description: ''
    });

    // EDIT INVENTORY MODAL STATE
    const [selectedInventoryForEdit, setSelectedInventoryForEdit] = useState<any>(null);
    const [isEditInventoryModalOpen, setIsEditInventoryModalOpen] = useState(false);
    const [editItemData, setEditItemData] = useState<any>({
        name: '', price: '', totalAllocated: '', amenities: '', type: '', capacity: '', features: '', hotelAddress: '', vehicleNumber: '', location: '', state: '', description: ''
    });



    const router = useRouter();

    const togglePartnerAmenity = (amenity: string, isEdit: boolean = false) => {
        const target = isEdit ? editItemData : newItem;
        const setTarget = isEdit ? setEditItemData : setNewItem;

        let list: string[] = target.amenities ? target.amenities.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
        if (list.includes(amenity)) {
            list = list.filter(item => item !== amenity);
        } else {
            list.push(amenity);
        }
        setTarget({ ...target, amenities: list.join(', ') });
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

        // 30s background silent auto-refresh
        const interval = setInterval(() => {
            fetchPartnerData(parsedUser, true);
        }, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const fetchPartnerData = async (partnerData: any, silent = false) => {
        if (!silent) setIsLoading(true);
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
                    setUser(updatedStorage);
                    localStorage.setItem('airgo_user', JSON.stringify(updatedStorage));
                }
            }

            // Fetch Bookings with unified secure ID
            const token = localStorage.getItem('airgo_token');
            const bookingsRes = await fetch(`${apiUrl}/api/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (bookingsRes.ok) {
                const allBookings = await bookingsRes.json();
                const filteredBookings = allBookings.filter((b: any) => b.partnerId === secureId);
                setMyBookings(filteredBookings);
            }

            // Fetch Inventory with unified secure ID maps
            const currentPartnerType = partnerData.partnerType || '';
            if (currentPartnerType.toLowerCase().includes('car')) {
                const carsRes = await fetch(`${apiUrl}/api/cars`);
                if (carsRes.ok) {
                    const allCars = await carsRes.json();
                    setMyInventory(allCars.filter((c: any) => c.partnerId === secureId));
                }
            } else if (currentPartnerType === 'hotel' || currentPartnerType === 'apartment') {
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

    const handleUploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'airgo_fleet');
        const res = await fetch(`https://api.cloudinary.com/v1_1/drdosbrru/image/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.secure_url) return data.secure_url;
        throw new Error("Upload failed");
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let finalImageUrl = "";
            let finalImageUrls: string[] = [];
            const isCar = user.partnerType?.toLowerCase().includes('car');

            if (carImageFiles.length > 0) {
                for (const file of carImageFiles) {
                    const url = await handleUploadToCloudinary(file);
                    finalImageUrls.push(url);
                }
                if (finalImageUrls.length > 0) {
                    finalImageUrl = finalImageUrls[0];
                }
            } else if (imageFile) {
                finalImageUrl = await handleUploadToCloudinary(imageFile);
                finalImageUrls.push(finalImageUrl);
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const secureId = user.id || user.userId || user._id;
            const endpoint = isCar ? '/api/cars' : '/api/rooms';

            const payload = isCar ? {
                name: newItem.name, type: newItem.type, price: Number(newItem.price), capacity: newItem.capacity, features: newItem.features, image: finalImageUrl, images: finalImageUrls, previewImage: finalImageUrl, partnerId: secureId, vehicleNumber: newItem.vehicleNumber, location: newItem.location, state: newItem.state
            } : {
                partnerId: secureId, hotelName: user.businessName || user.name, hotelAddress: newItem.hotelAddress, name: newItem.name, pricePerNight: Number(newItem.price), totalAllocated: Number(newItem.totalAllocated), amenities: newItem.amenities, description: newItem.description, image: finalImageUrl, images: finalImageUrls, previewImage: finalImageUrl
            };

            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success(`${user.partnerType?.toLowerCase().includes('car') ? 'Vehicle' : 'Tier'} listed successfully!`);
                setIsModalOpen(false);
                setImageFile(null);
                setCarImageFiles([]);
                setNewItem({ name: '', price: '', totalAllocated: '', amenities: '', type: '', capacity: '', features: '', hotelAddress: '', vehicleNumber: '', location: '', state: '', description: '' });
                fetchPartnerData(user);
            }
        } catch (error) {
            toast.error("❌ Error listing item. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditListingClick = (item: any) => {
        setSelectedInventoryForEdit(item);
        setEditItemData({
            name: item.name || '',
            price: String(item.price || item.pricePerNight || ''),
            totalAllocated: String(item.totalAllocated || '1'),
            amenities: item.amenities || '',
            type: item.type || '',
            capacity: String(item.capacity || ''),
            features: item.features || '',
            hotelAddress: item.hotelAddress || '',
            image: item.image || '',
            images: item.images || [],
            previewImage: item.previewImage || '',
            vehicleNumber: item.vehicleNumber || '',
            location: item.location || '',
            state: item.state || '',
            description: item.description || ''
        });
        setIsEditInventoryModalOpen(true);
    };

    const handleSaveEditListing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInventoryForEdit) return;
        setIsUploading(true);
        try {
            const isCar = user.partnerType?.toLowerCase().includes('car');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const endpoint = isCar ? `/api/cars/${selectedInventoryForEdit._id}` : `/api/rooms/${selectedInventoryForEdit._id}`;

            const payload = isCar ? {
                name: editItemData.name,
                type: editItemData.type,
                price: Number(editItemData.price),
                capacity: editItemData.capacity,
                features: editItemData.features,
                totalAllocated: Number(editItemData.totalAllocated),
                image: editItemData.image,
                images: editItemData.images,
                previewImage: editItemData.previewImage,
                vehicleNumber: editItemData.vehicleNumber,
                location: editItemData.location,
                state: editItemData.state
            } : {
                hotelAddress: editItemData.hotelAddress,
                name: editItemData.name,
                pricePerNight: Number(editItemData.price),
                totalAllocated: Number(editItemData.totalAllocated),
                amenities: editItemData.amenities,
                description: editItemData.description,
                image: editItemData.image,
                images: editItemData.images,
                previewImage: editItemData.previewImage
            };

            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success("Listing updated successfully!");
                setIsEditInventoryModalOpen(false);
                setSelectedInventoryForEdit(null);
                fetchPartnerData(user);
            } else {
                toast.error("Failed to update listing.");
            }
        } catch (error) {
            toast.error("Error saving corrections.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteListing = async (id: string) => {
        if (!window.confirm("Are you sure you want to remove this listing?")) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const isCar = user.partnerType?.toLowerCase().includes('car');
            const endpoint = isCar ? `/api/cars/${id}` : `/api/rooms/${id}`;
            const res = await fetch(`${apiUrl}${endpoint}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Listing removed from matrix.");
                fetchPartnerData(user);
            } else {
                toast.error("Failed to delete listing.");
            }
        } catch (error) {
            toast.error("Connection error.");
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
    const isApartmentPartner = user?.partnerType === 'apartment';

    const totalAllocatedRooms = (!isCarPartner) ? myInventory.reduce((sum, item) => sum + (item.totalAllocated || 0), 0) : 0;
    const totalAvailableRoomsToday = (!isCarPartner)
        ? myInventory.reduce((sum, item) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const dayMatch = item.bookedDates?.find((b: any) => b.date === todayStr);
            const bookedCount = dayMatch ? dayMatch.count : 0;
            return sum + Math.max(0, (item.totalAllocated || 0) - bookedCount);
          }, 0)
        : 0;
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
                            {isApartmentPartner ? 'Apartment Host' : isCarPartner ? 'Fleet Manager' : 'Hotelier'}
                        </p>
                    </Link>
                    <button className="md:hidden text-blue-200 text-xl" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'overview' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800'}`}>📊 Dashboard</button>
                    <button onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'inventory' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800'}`}>
                        {isCarPartner ? '🚘 My Fleet' : isApartmentPartner ? '🏨 My Apartments' : '🏨 Room Categories'}
                    </button>
                    <button onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'bookings' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800'}`}>📅 Reservations</button>
                    <button onClick={() => { 
                        setActiveTab('profile'); 
                        setIsMobileMenuOpen(false);
                        setProfileData({
                            name: user.name || '',
                            email: user.email || '',
                            phoneNumber: user.phoneNumber || user.phone || '',
                            businessName: user.businessName || '',
                            businessAddress: user.businessAddress || '',
                            cacNumber: user.cacNumber || ''
                        });
                    }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition ${activeTab === 'profile' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800'}`}>👤 My Profile</button>
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
                            ? (isCarPartner ? '🚘 Fleet Control Panel' : isApartmentPartner ? '🏨 Apartment Host Panel' : '🏨 Property Management Panel') 
                            : activeTab === 'inventory' 
                                ? (isCarPartner ? 'My Fleet Matrix' : isApartmentPartner ? 'Apartments Catalog' : 'Room Categories') 
                                : activeTab === 'profile' 
                                    ? 'My Profile Settings' 
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
                                                <p className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">{isApartmentPartner ? 'Apartment Rental Revenue' : 'Hotel Stay Revenue'}</p>
                                                <p className="text-4xl md:text-5xl font-black mb-2">₦{calculateTotalRevenue()}</p>
                                                <p className="text-xs text-blue-300">Total gross revenue from {isApartmentPartner ? 'apartment' : 'hotel'} reservation escrow bookings.</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between min-h-[140px]">
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{isApartmentPartner ? 'My Apartments' : 'Room Categories'}</p>
                                                <p className="text-4xl font-black text-gray-900">{myInventory.length}</p>
                                                <p className="text-[10px] text-gray-400 mt-2 font-bold">Active {isApartmentPartner ? 'apartment listings' : 'room tiers'} listed</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 md:col-span-1 flex flex-col justify-between min-h-[140px]">
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{isApartmentPartner ? 'Units Available Today' : 'Available Rooms Today'}</p>
                                                <p className="text-4xl font-black text-[#004A99]">{totalAvailableRoomsToday} / {totalAllocatedRooms}</p>
                                                <p className="text-[10px] text-gray-400 mt-2 font-bold">Currently unbooked units for today</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* INVENTORY TAB */}
                            {activeTab === 'inventory' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h2 className="text-lg font-bold text-gray-800">{isCarPartner ? 'My Fleet' : isApartmentPartner ? 'My Apartments' : 'Room Categories'}</h2>
                                        <button onClick={() => setIsModalOpen(true)} className="bg-[#004A99] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition">
                                            + Configure {isCarPartner ? 'Vehicle' : isApartmentPartner ? 'Apartment Unit' : 'Room Tier'}
                                        </button>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myInventory.length === 0 ? (
                                            <p className="col-span-full text-center text-gray-500 py-10">You have not listed any inventory yet.</p>
                                        ) : myInventory.map(item => (
                                            <div key={item._id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-gray-50 flex flex-col justify-between">
                                                <div>
                                                    <img src={item.image} alt={item.name} className="w-full h-44 object-cover" />
                                                    <div className="p-4">
                                                        <h3 className="font-black text-gray-900 text-lg">{item.name}</h3>
                                                        <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                                                            {isCarPartner ? `Class: ${item.type}` : `Amenities: ${item.amenities}`}
                                                        </p>
                                                        {item.hotelAddress && (
                                                            <p className="text-[10px] text-gray-400 mt-1">📍 {item.hotelAddress}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-4 border-t border-gray-200">
                                                    <div className="flex flex-col">
                                                        <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
                                                            <p className="font-black text-[#004A99]">₦{(item.price || item.pricePerNight)?.toLocaleString()} <span className="text-[10px] text-gray-400 font-medium">/ {isCarPartner ? 'day' : 'night'}</span></p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-gray-500">Discount:</span>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-16 px-2 py-1 border rounded text-xs text-center bg-white text-gray-900" 
                                                                    value={item.discountPercentage || 0}
                                                                    onChange={(e) => handleUpdateInventory(item._id, { discountPercentage: parseInt(e.target.value) || 0 })}
                                                                    min="0" max="100"
                                                                />
                                                                <span className="text-xs font-bold text-gray-500">%</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg mb-3">
                                                            <span className="text-xs font-bold text-gray-600">{!isCarPartner ? 'Airgo Pool Allocation (Available Today)' : 'Airgo Pool Allocation'}</span>
                                                            <div className="flex items-center gap-3">
                                                                <button 
                                                                    onClick={() => handleUpdateInventory(item._id, { totalAllocated: Math.max(0, (item.totalAllocated || 0) - 1) })}
                                                                    className="w-6 h-6 bg-white text-[#004A99] rounded font-bold shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center justify-center cursor-pointer"
                                                                >-</button>
                                                                <span className="font-black text-gray-900 min-w-[20px] text-center">{item.totalAllocated || 0}</span>
                                                                <button 
                                                                    onClick={() => handleUpdateInventory(item._id, { totalAllocated: (item.totalAllocated || 0) + 1 })}
                                                                    className="w-6 h-6 bg-[#004A99] text-white rounded font-bold shadow-sm hover:bg-blue-800 flex items-center justify-center cursor-pointer"
                                                                >+</button>
                                                            </div>
                                                        </div>

                                                        {(() => {
                                                            const todayStr = new Date().toISOString().split('T')[0];
                                                            const dayMatch = item.bookedDates?.find((b: any) => b.date === todayStr);
                                                            const bookedCount = dayMatch ? dayMatch.count : 0;
                                                            const remaining = Math.max(0, (item.totalAllocated || 0) - bookedCount);
                                                            return (
                                                                <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2 rounded-lg mb-3">
                                                                    <span className="text-xs text-gray-500 font-bold">Available Today</span>
                                                                    <span className={`text-xs font-black px-2 py-0.5 rounded ${remaining > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                        {remaining} left
                                                                    </span>
                                                                </div>
                                                            );
                                                        })()}

                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleEditListingClick(item)} 
                                                                className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-1.5 rounded-lg text-xs font-black transition cursor-pointer text-center"
                                                            >
                                                                ✏️ Edit Details
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteListing(item._id)} 
                                                                className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer border border-red-100"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
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
                                                    <th className="p-4 font-bold border-b">{isCarPartner ? 'Vehicle' : 'Room / Unit'}</th>
                                                    <th className="p-4 font-bold border-b">{isCarPartner ? 'Rental Dates' : 'Stay Dates'}</th>
                                                    <th className="p-4 font-bold border-b text-right">Value</th>
                                                    <th className="p-4 font-bold border-b text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
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
                                                                    <p>Out: {formatDisplayDate(booking.checkIn, 'car')}</p>
                                                                ) : (
                                                                    <p>In: {formatDisplayDate(booking.checkIn, 'hotel')}</p>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-right font-black text-[#004A99]">₦{Number(booking.totalPrice?.replace(/[^0-9.-]+/g,"") || booking.totalPrice || 0).toLocaleString()}</td>
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
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Booking Ref & Info</p>
                                                                            <p className="text-sm font-black text-gray-900">{booking._id.substring(0, 12).toUpperCase()}</p>
                                                                            <p className="text-xs text-gray-500 font-bold mt-1">Guests: {booking.guests || 1}</p>
                                                                            {booking.itemType === 'car' && booking.vehicleNumber && (
                                                                                <p className="text-xs text-green-700 font-bold mt-1 uppercase">Plate: {booking.vehicleNumber}</p>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Guest Details</p>
                                                                            <p className="text-xs font-black text-gray-900">Name: {booking.clientName || 'N/A'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Exact Timeframe</p>
                                                                            <p className="text-xs font-bold text-green-700">In / Out: {formatDisplayDate(booking.checkIn, booking.itemType)}</p>
                                                                            <p className="text-xs font-bold text-red-700 mt-1">Out / Return: {formatDisplayDate(booking.checkOut, booking.itemType)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Reserved At</p>
                                                                            <p className="text-xs text-gray-700 font-bold">{booking.createdAt ? formatDisplayDate(booking.createdAt, 'other') : 'N/A'}</p>
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
                            {/* PROFILE TAB */}
                            {activeTab === 'profile' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 max-w-2xl mx-auto overflow-hidden animate-fade-in w-full">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-lg font-black text-gray-900">Partner Profile Settings</h2>
                                            <p className="text-xs text-gray-500 mt-1">Update your personal and business specifications</p>
                                        </div>
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Verified {user.partnerType} Partner</span>
                                    </div>
                                    <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Name</label>
                                                <input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Phone</label>
                                                <input required type="tel" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={profileData.phoneNumber} onChange={e => setProfileData({ ...profileData, phoneNumber: e.target.value })} />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address (Read-only)</label>
                                            <input disabled type="email" className="w-full px-4 py-2 border rounded-xl text-gray-400 bg-gray-50 cursor-not-allowed" value={profileData.email} />
                                        </div>

                                        <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
                                            <h3 className="text-xs font-black text-[#004A99] uppercase tracking-wider">Business Verification Details</h3>
                                            
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Name</label>
                                                <input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={profileData.businessName} onChange={e => setProfileData({ ...profileData, businessName: e.target.value })} />
                                            </div>

                                            {(!user.partnerType?.toLowerCase().includes('car')) && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CAC Corporate Number</label>
                                                    <input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={profileData.cacNumber} onChange={e => setProfileData({ ...profileData, cacNumber: e.target.value })} />
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Physical Address</label>
                                                <textarea required rows={3} className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white resize-none" value={profileData.businessAddress} onChange={e => setProfileData({ ...profileData, businessAddress: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <button disabled={isSavingProfile} type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#004A99] hover:bg-blue-800 transition shadow-md cursor-pointer">
                                                {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* DYNAMIC ADD INVENTORY MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <h2 className="text-xl font-black text-[#004A99]">List New {isCarPartner ? 'Vehicle' : isApartmentPartner ? 'Apartment' : 'Room Tier'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleAddItem} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Name / Title</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Price per {isCarPartner ? 'day' : 'night'} (₦)</label><input required type="number" min="0" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} /></div>
                            </div>

                            {isCarPartner ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Type (e.g. SUV, Sedan)</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Capacity (Seats)</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.capacity} onChange={e => setNewItem({ ...newItem, capacity: e.target.value })} /></div>
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Features</label><input required type="text" placeholder="e.g. Wi-Fi, Bluetooth" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.features} onChange={e => setNewItem({ ...newItem, features: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Total Fleet Count</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.totalAllocated} onChange={e => setNewItem({ ...newItem, totalAllocated: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Plate / Vehicle Number</label><input required type="text" placeholder="e.g. ABJ-888-GW" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.vehicleNumber} onChange={e => setNewItem({ ...newItem, vehicleNumber: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Location (City/Area)</label><input required type="text" placeholder="e.g. Maitama" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">State</label><input required type="text" placeholder="e.g. Abuja" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.state} onChange={e => setNewItem({ ...newItem, state: e.target.value })} /></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Property Address *</label><input required type="text" placeholder="e.g. 1 Aguiyi Ironsi St, Abuja" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.hotelAddress} onChange={e => setNewItem({ ...newItem, hotelAddress: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Units Allocated to Airgo Pool *</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.totalAllocated} onChange={e => setNewItem({ ...newItem, totalAllocated: e.target.value })} /></div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Listing Description (Rooms, Parlour, Kitchen details) *</label>
                                        <textarea required placeholder="Describe layout details e.g., how many rooms, parlour, kitchen, etc." className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white h-24 resize-none" value={newItem.description || ''} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                                    </div>
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
                                                        onClick={() => togglePartnerAmenity(amenity, false)}
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
                                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Upload Photo(s) *</label>
                                <input required type="file" multiple accept="image/*" className="w-full px-4 py-2 border rounded-xl file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-[#004A99] text-gray-900 bg-white" onChange={(e) => {
                                    setCarImageFiles(Array.from(e.target.files || []));
                                }} />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={isUploading} type="submit" className={`px-6 py-2 rounded-xl font-bold text-white shadow-md ${isUploading ? 'bg-gray-400' : 'bg-[#004A99] hover:bg-blue-800'}`}>{isUploading ? 'Uploading...' : 'Publish Listing'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT INVENTORY MODAL */}
            {isEditInventoryModalOpen && selectedInventoryForEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <h2 className="text-xl font-black text-[#004A99]">Edit Listing Specifications</h2>
                            <button onClick={() => { setIsEditInventoryModalOpen(false); setSelectedInventoryForEdit(null); }} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleSaveEditListing} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Name / Title</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.name} onChange={e => setEditItemData({ ...editItemData, name: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Price per {isCarPartner ? 'day' : 'night'} (₦)</label><input required type="number" min="0" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.price} onChange={e => setEditItemData({ ...editItemData, price: e.target.value })} /></div>
                            </div>

                            {isCarPartner ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Type (e.g. SUV, Sedan)</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.type} onChange={e => setEditItemData({ ...editItemData, type: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Capacity (Seats)</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.capacity} onChange={e => setEditItemData({ ...editItemData, capacity: e.target.value })} /></div>
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Features</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.features} onChange={e => setEditItemData({ ...editItemData, features: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Total Fleet Count</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.totalAllocated} onChange={e => setEditItemData({ ...editItemData, totalAllocated: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Plate / Vehicle Number</label><input required type="text" placeholder="e.g. ABJ-888-GW" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.vehicleNumber} onChange={e => setEditItemData({ ...editItemData, vehicleNumber: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Location (City/Area)</label><input required type="text" placeholder="e.g. Maitama" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.location} onChange={e => setEditItemData({ ...editItemData, location: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">State</label><input required type="text" placeholder="e.g. Abuja" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.state} onChange={e => setEditItemData({ ...editItemData, state: e.target.value })} /></div>
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Description</label><textarea className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.description || ''} onChange={e => setEditItemData({ ...editItemData, description: e.target.value })} /></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Property Address *</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.hotelAddress} onChange={e => setEditItemData({ ...editItemData, hotelAddress: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Units Allocated to Airgo Pool *</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.totalAllocated} onChange={e => setEditItemData({ ...editItemData, totalAllocated: e.target.value })} /></div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Listing Description (Rooms, Parlour, Kitchen details) *</label>
                                        <textarea required placeholder="Describe layout details e.g., how many rooms, parlour, kitchen, etc." className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white h-24 resize-none" value={editItemData.description || ''} onChange={e => setEditItemData({ ...editItemData, description: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Luxury Amenities</label>
                                        <input 
                                            type="text" 
                                            required 
                                            readOnly
                                            placeholder="Select amenities from list below..."
                                            className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-gray-50/50 mb-2 focus:outline-none"
                                            value={editItemData.amenities}
                                        />
                                        <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200/50 max-h-40 overflow-y-auto">
                                            {AMENITIES_LIST.map((amenity) => {
                                                const isSelected = editItemData.amenities ? editItemData.amenities.split(',').map((s: string) => s.trim()).filter(Boolean).includes(amenity) : false;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={amenity}
                                                        onClick={() => togglePartnerAmenity(amenity, true)}
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

                            {/* Photo Gallery Manager */}
                            <div className="border-t border-gray-200 pt-4 mt-4 col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Listing Image Gallery</label>
                                
                                {/* Photo grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                    {(editItemData.images && editItemData.images.length > 0 ? editItemData.images : (editItemData.image ? [editItemData.image] : [])).map((imgUrl: string, idx: number) => {
                                        const isHomepage = editItemData.image === imgUrl;
                                        const isPreview = editItemData.previewImage === imgUrl || (!editItemData.previewImage && idx === 0);
                                        
                                        return (
                                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white">
                                                <img src={imgUrl} className="w-full h-20 object-cover" />
                                                
                                                <div className="p-1 space-y-1 bg-gray-50 border-t flex flex-col">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setEditItemData({ ...editItemData, image: imgUrl })}
                                                        className={`w-full text-[8px] font-black uppercase py-0.5 rounded text-center transition ${isHomepage ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-200 text-gray-700 border'}`}
                                                    >
                                                        {isHomepage ? '✓ Homepage' : 'Set Homepage'}
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setEditItemData({ ...editItemData, previewImage: imgUrl })}
                                                        className={`w-full text-[8px] font-black uppercase py-0.5 rounded text-center transition ${isPreview ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200 text-gray-700 border'}`}
                                                    >
                                                        {isPreview ? '✓ Preview' : 'Set Preview'}
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            const currentImages = editItemData.images && editItemData.images.length > 0 ? [...editItemData.images] : (editItemData.image ? [editItemData.image] : []);
                                                            if (currentImages.length <= 1) {
                                                                toast.error("You must keep at least 1 image.");
                                                                return;
                                                            }
                                                            const newImages = currentImages.filter((img: string) => img !== imgUrl);
                                                            setEditItemData({
                                                                ...editItemData,
                                                                images: newImages,
                                                                image: editItemData.image === imgUrl ? newImages[0] : editItemData.image,
                                                                previewImage: editItemData.previewImage === imgUrl ? newImages[0] : editItemData.previewImage
                                                            });
                                                        }}
                                                        className="w-full text-[8px] font-bold text-red-600 hover:bg-red-50 py-0.5 rounded text-center cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Upload More Photo */}
                                <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300">
                                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Add Photo to Gallery</label>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-blue-50 file:text-[#004A99] file:cursor-pointer" 
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setIsUploading(true);
                                            try {
                                                const url = await handleUploadToCloudinary(file);
                                                const currentImages = editItemData.images && editItemData.images.length > 0 ? [...editItemData.images] : (editItemData.image ? [editItemData.image] : []);
                                                const newImages = [...currentImages, url];
                                                setEditItemData({
                                                    ...editItemData,
                                                    images: newImages,
                                                    image: editItemData.image || url,
                                                    previewImage: editItemData.previewImage || url
                                                });
                                                toast.success("Photo added to gallery!");
                                            } catch (err) {
                                                toast.error("Upload failed.");
                                            } finally {
                                                setIsUploading(false);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => { setIsEditInventoryModalOpen(false); setSelectedInventoryForEdit(null); }} className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={isUploading} type="submit" className="px-6 py-2 rounded-xl font-bold text-white bg-[#004A99] hover:bg-blue-800 transition">
                                    {isUploading ? 'Saving...' : 'Save Corrections'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}