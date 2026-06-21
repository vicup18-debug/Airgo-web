"use client";

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { io } from 'socket.io-client';

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

export default function SuperadminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'escrow' | 'approvals' | 'fleet' | 'rooms' | 'affiliates' | 'chats'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // CHAT MONITOR STATE
    const [activeChatrooms, setActiveChatrooms] = useState<any[]>([]);
    const [selectedChatroom, setSelectedChatroom] = useState<any>(null);
    const [chatroomMessages, setChatroomMessages] = useState<any[]>([]);
    const [chatInputText, setChatInputText] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isChatConnected, setIsChatConnected] = useState(false);
    const socketRef = useRef<any>(null);
    const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

    // BOOKINGS TAB SEARCH & FILTERS
    const [bookingSearchQuery, setBookingSearchQuery] = useState('');
    const [bookingStatusFilter, setBookingStatusFilter] = useState<'All' | 'Pending Escrow' | 'Paid' | 'Approved for Disbursement' | 'Paid Out' | 'Archived'>('All');

    // CONCIERGE BOOKING CREATION STATE
    const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
    const [newBookingData, setNewBookingData] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        itemType: 'hotel' as 'hotel' | 'car',
        itemId: '',
        itemName: '',
        partnerId: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        deliveryAddress: '',
        totalPrice: '',
        status: 'Pending Escrow'
    });

    // ALL SYSTEM DATA STATES
    const [allBookings, setAllBookings] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [cars, setCars] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // EXPANDABLE ESCROW STATE
    const [expandedEscrowId, setExpandedEscrowId] = useState<string | null>(null);
    const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>(null);
    const [expandedAffiliateId, setExpandedAffiliateId] = useState<string | null>(null);
    const [partnerFilter, setPartnerFilter] = useState<'active' | 'deleted'>('active');
    const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
    const [fleetSearchQuery, setFleetSearchQuery] = useState('');
    const [roomSearchQuery, setRoomSearchQuery] = useState('');

    // CAR FORM STATES
    const [isCarModalOpen, setIsCarModalOpen] = useState(false);
    const [newCar, setNewCar] = useState({ name: '', type: '', netPrice: '', retailPrice: '', vehicleCategory: 'car', capacity: '', features: '', vehicleNumber: '', location: '', state: '' });
    const [carImageFile, setCarImageFile] = useState<File | null>(null);

    // ROOM MATRIX FORM STATES 
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [newRoom, setNewRoom] = useState({ hotelName: '', hotelAddress: '', name: '', netPrice: '', totalAllocated: '', amenities: '' });
    const [roomImageFile, setRoomImageFile] = useState<File | null>(null);

    // EDIT INVENTORY MODAL STATE
    const [selectedInventoryForEdit, setSelectedInventoryForEdit] = useState<any>(null);
    const [isEditInventoryModalOpen, setIsEditInventoryModalOpen] = useState(false);
    const [editItemData, setEditItemData] = useState<any>({
        name: '', netPrice: '', retailPrice: '', vehicleCategory: 'car', totalAllocated: '', amenities: '', type: '', capacity: '', features: '', hotelAddress: '', vehicleNumber: '', location: '', state: ''
    });

    // EDIT BOOKING MODAL STATE
    const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<any>(null);
    const [isEditBookingModalOpen, setIsEditBookingModalOpen] = useState(false);
    const [editBookingData, setEditBookingData] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        deliveryAddress: '',
        checkIn: '',
        checkOut: '',
        guests: 1
    });

    const [isUploading, setIsUploading] = useState(false);
    const [isResendingEmail, setIsResendingEmail] = useState<string | null>(null);
    const router = useRouter();

    const toggleRoomAmenity = (amenity: string, isEdit: boolean = false) => {
        const target = isEdit ? editItemData : newRoom;
        const setTarget = isEdit ? setEditItemData : setNewRoom;

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

        // 30s background silent auto-refresh
        const interval = setInterval(() => {
            fetchAllSystemData(true);
        }, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const fetchAllSystemData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

            const [bookingsRes, partnersRes, carsRes, roomsRes, affiliatesRes, activeChatsRes] = await Promise.all([
                fetch(`${apiUrl}/api/bookings`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiUrl}/api/auth/partners`),
                fetch(`${apiUrl}/api/cars`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiUrl}/api/rooms`),
                fetch(`${apiUrl}/api/affiliates`),
                fetch(`${apiUrl}/api/chats/active`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (bookingsRes.status === 401) {
                toast.error("Your login session has expired. Please log in again.");
                localStorage.removeItem('airgo_token');
                localStorage.removeItem('airgo_user');
                router.push('/login');
                return;
            }

            if (bookingsRes.ok) setAllBookings(await bookingsRes.json());
            if (partnersRes.ok) setPartners(await partnersRes.json());
            if (carsRes.ok) setCars(await carsRes.json());
            if (roomsRes.ok) setRooms(await roomsRes.json());
            if (affiliatesRes.ok) setAffiliates(await affiliatesRes.json());
            if (activeChatsRes && activeChatsRes.ok) setActiveChatrooms(await activeChatsRes.json());
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
                const token = localStorage.getItem('airgo_token');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
                const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/status`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: nextStatus })
                });

                if (res.ok) {
                    toast.success(`${actionLabel} Successful!`);
                    setAllBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: nextStatus } : b));
                } else {
                    const data = await res.json().catch(() => ({}));
                    toast.error(`❌ Failed to update status: ${data.message || 'Unknown error'}`);
                }
            } catch (error) {
                toast.error("❌ Error connecting to server.");
            }
        }
    };

    const handleVerifyPlateAdmin = async (bookingId: string, status: 'Verified' | 'Rejected') => {
        if (window.confirm(`Are you sure you want to mark this plate status as ${status}?`)) {
            try {
                const token = localStorage.getItem('airgo_token');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
                const res = await fetch(`${apiUrl}/api/bookings/${bookingId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ vehiclePlateStatus: status })
                });

                if (res.ok) {
                    toast.success(`Plate marked as ${status}!`);
                    setAllBookings(prev => prev.map(b => b._id === bookingId ? { ...b, vehiclePlateStatus: status } : b));
                } else {
                    toast.error(`❌ Failed to update plate status.`);
                }
            } catch (error) {
                toast.error("❌ Error connecting to server.");
            }
        }
    };

    const handleConfirmDirectDeposit = async (bookingId: string) => {
        const ref = window.prompt("Enter Bank Transfer Reference (optional):");
        if (ref === null) return; // User cancelled prompt

        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Paid', paymentReference: ref || 'Direct Bank Deposit' })
            });

            if (res.ok) {
                toast.success("Deposit Confirmed! Booking is now Paid.");
                setAllBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Paid', paymentReference: ref || 'Direct Bank Deposit' } : b));
            } else {
                toast.error("Failed to confirm deposit.");
            }
        } catch (error) {
            toast.error("Error connecting to server.");
        }
    };

    const handleResendEmail = async (bookingId: string) => {
        setIsResendingEmail(bookingId);
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/resend-email`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "Emails resent successfully!");
            } else {
                toast.error(data.message || "Failed to resend email.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        } finally {
            setIsResendingEmail(null);
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

    const handleEditListingClick = (item: any, type: 'room' | 'car') => {
        setSelectedInventoryForEdit({ ...item, listingType: type });
        const isShuttle = type === 'car' && (item.vehicleCategory === 'shuttle' || item.partnerType === 'shuttle');
        setEditItemData({
            name: item.name || '',
            netPrice: isShuttle ? '' : String(item.netPrice || item.price || item.pricePerNight || ''),
            retailPrice: isShuttle ? String(item.retailPrice || item.price || '') : '',
            vehicleCategory: item.vehicleCategory || (isShuttle ? 'shuttle' : 'car'),
            totalAllocated: String(item.totalAllocated || '1'),
            amenities: item.amenities || '',
            type: item.type || '',
            capacity: String(item.capacity || ''),
            features: item.features || '',
            hotelAddress: item.hotelAddress || '',
            vehicleNumber: item.vehicleNumber || '',
            location: item.location || '',
            state: item.state || ''
        });
        setIsEditInventoryModalOpen(true);
    };

    const handleSaveEditListing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInventoryForEdit) return;
        setIsUploading(true);
        try {
            const isCar = selectedInventoryForEdit.listingType === 'car';
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const endpoint = isCar ? `/api/cars/${selectedInventoryForEdit._id}` : `/api/rooms/${selectedInventoryForEdit._id}`;
            const isShuttle = editItemData.vehicleCategory === 'shuttle';
            const payload = isCar ? {
                name: editItemData.name,
                type: editItemData.type,
                netPrice: isShuttle ? undefined : Number(editItemData.netPrice),
                retailPrice: isShuttle ? Number(editItemData.retailPrice) : undefined,
                vehicleCategory: editItemData.vehicleCategory,
                capacity: editItemData.capacity,
                features: editItemData.features,
                totalAllocated: 1,
                vehicleNumber: editItemData.vehicleNumber,
                location: editItemData.location,
                state: editItemData.state
            } : {
                hotelAddress: editItemData.hotelAddress,
                name: editItemData.name,
                netPrice: Number(editItemData.netPrice),
                totalAllocated: Number(editItemData.totalAllocated),
                amenities: editItemData.amenities
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
                fetchAllSystemData();
            } else {
                toast.error("Failed to update listing.");
            }
        } catch (error) {
            toast.error("Error saving corrections.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditBookingClick = (booking: any) => {
        setSelectedBookingForEdit(booking);
        setEditBookingData({
            clientName: booking.clientName || '',
            clientEmail: booking.clientEmail || '',
            clientPhone: booking.clientPhone || '',
            deliveryAddress: booking.deliveryAddress || '',
            checkIn: booking.checkIn ? new Date(booking.checkIn).toISOString().slice(0, 16) : '',
            checkOut: booking.checkOut ? new Date(booking.checkOut).toISOString().slice(0, 16) : '',
            guests: booking.guests || 1
        });
        setIsEditBookingModalOpen(true);
    };

    const handleSaveEditBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBookingForEdit) return;
        setIsUploading(true);
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings/${selectedBookingForEdit._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editBookingData)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Booking details corrected successfully!");
                setIsEditBookingModalOpen(false);
                setSelectedBookingForEdit(null);
                fetchAllSystemData();
            } else {
                toast.error(data.message || "Failed to update booking details.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleItemSelection = (itemId: string, type: 'hotel' | 'car') => {
        if (type === 'hotel') {
            const room = rooms.find(r => r._id === itemId);
            if (room) {
                setNewBookingData(prev => ({
                    ...prev,
                    itemId: room._id,
                    itemName: `${room.hotelName} - ${room.name}`,
                    partnerId: room.partnerId || 'airgo_direct',
                    deliveryAddress: room.hotelAddress || ''
                }));
            }
        } else {
            const car = cars.find(c => c._id === itemId);
            if (car) {
                setNewBookingData(prev => ({
                    ...prev,
                    itemId: car._id,
                    itemName: car.name,
                    partnerId: car.partnerId || 'airgo_direct',
                    deliveryAddress: car.location || ''
                }));
            }
        }
    };

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBookingData.clientEmail || !newBookingData.itemId) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setIsUploading(true);
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    clientName: newBookingData.clientName,
                    clientEmail: newBookingData.clientEmail,
                    clientPhone: newBookingData.clientPhone,
                    itemType: newBookingData.itemType,
                    itemId: newBookingData.itemId,
                    itemName: newBookingData.itemName,
                    partnerId: newBookingData.partnerId,
                    checkIn: newBookingData.checkIn,
                    checkOut: newBookingData.checkOut,
                    guests: Number(newBookingData.guests),
                    deliveryAddress: newBookingData.deliveryAddress,
                    totalPrice: newBookingData.totalPrice || '0',
                    status: newBookingData.status
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Booking created successfully!");
                setIsNewBookingModalOpen(false);
                setNewBookingData({
                    clientName: '',
                    clientEmail: '',
                    clientPhone: '',
                    itemType: 'hotel',
                    itemId: '',
                    itemName: '',
                    partnerId: '',
                    checkIn: '',
                    checkOut: '',
                    guests: 1,
                    deliveryAddress: '',
                    totalPrice: '',
                    status: 'Pending Escrow'
                });
                fetchAllSystemData();
            } else {
                toast.error(data.message || "Failed to create booking.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateAffiliateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
        if (!window.confirm(`Are you sure you want to update this affiliate's status to ${status}?`)) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/affiliates/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                toast.success(`Affiliate application updated to ${status}!`);
                fetchAllSystemData();
            } else {
                toast.error("Failed to update status.");
            }
        } catch (err) {
            toast.error("Error updating affiliate status.");
        }
    };

    const handleDisburseAffiliateCommission = async (id: string) => {
        if (!window.confirm("Are you sure you have paid this affiliate and want to mark their commissions as settled/disbursed?")) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/affiliates/${id}/disburse`, {
                method: 'POST'
            });
            if (res.ok) {
                toast.success("Affiliate commissions marked as disbursed!");
                fetchAllSystemData();
            } else {
                toast.error("Failed to disburse affiliate commissions.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        }
    };

    const handleToggleAffiliateActive = async (id: string, currentActive: boolean) => {
        const actionLabel = currentActive !== false ? "Deactivate" : "Reactivate";
        if (!window.confirm(`Are you sure you want to ${actionLabel} this affiliate account?`)) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/affiliates/${id}/toggle-active`, {
                method: 'PUT'
            });
            if (res.ok) {
                toast.success(`Affiliate account has been ${currentActive !== false ? 'Deactivated' : 'Reactivated'} successfully!`);
                fetchAllSystemData();
            } else {
                toast.error("Failed to toggle affiliate active status.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        }
    };

    const handleDeleteAffiliate = async (id: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this affiliate application? This cannot be undone.")) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/affiliates/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Affiliate application deleted successfully!");
                setExpandedAffiliateId(null);
                fetchAllSystemData();
            } else {
                toast.error("Failed to delete affiliate.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        }
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
            
            const isShuttle = newCar.vehicleCategory === 'shuttle';
            const payload = {
                ...newCar,
                image: finalImageUrl,
                netPrice: isShuttle ? undefined : Number(newCar.netPrice),
                retailPrice: isShuttle ? Number(newCar.retailPrice) : undefined,
                partnerId: 'airgo_direct'
            };

            const response = await fetch(`${apiUrl}/api/cars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success("Vehicle deployed successfully!");
                setIsCarModalOpen(false);
                setNewCar({ name: '', type: '', netPrice: '', retailPrice: '', vehicleCategory: 'car', capacity: '', features: '', vehicleNumber: '', location: '', state: '' });
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
                    netPrice: Number(newRoom.netPrice),
                    totalAllocated: Number(newRoom.totalAllocated),
                    amenities: newRoom.amenities,
                    image: finalImageUrl,
                    images: [finalImageUrl],
                    previewImage: finalImageUrl
                })
            });

            if (response.ok) {
                toast.success("Room category published successfully!");
                setIsRoomModalOpen(false);
                setNewRoom({ hotelName: '', hotelAddress: '', name: '', netPrice: '', totalAllocated: '', amenities: '' });
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

    const handleDeleteBooking = async (bookingId: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this booking and release its inventory?")) return;
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                toast.success("Booking deleted and inventory slots released!");
                fetchAllSystemData();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to delete booking.");
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
            toast.error("Network error deleting booking.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('airgo_token');
        localStorage.removeItem('airgo_user');
        window.location.href = '/login';
    };

    useEffect(() => {
        if (chatroomMessages.length > 0) {
            chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatroomMessages]);

    useEffect(() => {
        if (activeTab !== 'chats' || !selectedChatroom?.booking?._id) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setIsChatConnected(false);
            return;
        }

        const bookingId = selectedChatroom.booking._id;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
        
        setIsChatLoading(true);
        setChatroomMessages([]);

        // 1. Fetch chat history
        const fetchChatHistory = async () => {
            try {
                const token = localStorage.getItem('airgo_token');
                const res = await fetch(`${apiUrl}/api/chats/booking/${bookingId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setChatroomMessages(data);
                } else {
                    toast.error("Failed to load chat history.");
                }
            } catch (e) {
                console.error("Chat history fetch error:", e);
                toast.error("Error connecting to chat server.");
            } finally {
                setIsChatLoading(false);
            }
        };

        fetchChatHistory();

        // 2. Establish Socket connection
        const socket = io(apiUrl, {
            transports: ['websocket', 'polling']
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsChatConnected(true);
            socket.emit('join_booking_chat', { bookingId });
            console.log("⚡ Admin Connected to Airgo Socket Server");
        });

        socket.on('disconnect', () => {
            setIsChatConnected(false);
            console.log("❌ Admin Disconnected from Airgo Socket Server");
        });

        socket.on('receive_chat_message', (msg: any) => {
            setChatroomMessages((prev) => {
                const exists = prev.some(m => m._id === msg._id || (m.createdAt === msg.createdAt && m.senderId === msg.senderId && m.text === msg.text));
                if (exists) return prev;
                return [...prev, msg];
            });
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave_booking_chat', { bookingId });
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setIsChatConnected(false);
        };
    }, [activeTab, selectedChatroom?.booking?._id]);

    const handleSendAdminMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = chatInputText.trim();
        if (!trimmed || !selectedChatroom?.booking?._id) return;

        // 🚨 PHONE NUMBER PROTECTION: Block numbers with more than 9 digits
        const phoneRegex = /(?:\d[\s\-\.\(\)\+]*){10,}/;
        if (phoneRegex.test(trimmed)) {
            toast.error("🔒 Phone number exchange is prohibited to prevent off-platform transactions.");
            return;
        }

        const bookingId = selectedChatroom.booking._id;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

        try {
            const token = localStorage.getItem('airgo_token');
            const res = await fetch(`${apiUrl}/api/chats/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookingId,
                    text: trimmed
                })
            });

            if (res.ok) {
                const savedMsg = await res.json();
                
                // Broadcast via Socket.io
                if (socketRef.current && isChatConnected) {
                    socketRef.current.emit('new_chat_message', savedMsg);
                }

                setChatroomMessages(prev => [...prev, savedMsg]);
                setChatInputText('');
                
                // Update activeChatrooms list to show this new lastMessage
                setActiveChatrooms(prev => prev.map(c => 
                    c.booking._id === bookingId 
                        ? { ...c, lastMessage: savedMsg } 
                        : c
                ));
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to deliver message.");
            }
        } catch (error) {
            toast.error("Network error sending message.");
        }
    };

    const calculateTotalEscrow = () => {
        return allBookings.filter(b => ['Paid', 'Approved for Disbursement'].includes(b.status)).reduce((sum, b) => {
            const num = typeof b.totalPrice === 'string' ? parseInt(b.totalPrice.replace(/[^0-9]/g, '')) : b.totalPrice;
            return sum + (num || 0);
        }, 0).toLocaleString();
    };

    const toggleEscrowExpand = (id: string) => {
        setExpandedEscrowId(expandedEscrowId === id ? null : id);
    };

    const activeHotelsCount = new Set(rooms.map(r => r.hotelName?.trim()).filter(Boolean)).size;

    const filteredCars = cars.filter(car => {
        const query = fleetSearchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            (car.name && car.name.toLowerCase().includes(query)) ||
            (car.type && car.type.toLowerCase().includes(query)) ||
            (car.location && car.location.toLowerCase().includes(query)) ||
            (car.state && car.state.toLowerCase().includes(query)) ||
            (car.vehicleNumber && car.vehicleNumber.toLowerCase().includes(query))
        );
    });

    const filteredRooms = rooms.filter(room => {
        const query = roomSearchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            (room.name && room.name.toLowerCase().includes(query)) ||
            (room.hotelName && room.hotelName.toLowerCase().includes(query)) ||
            (room.hotelAddress && room.hotelAddress.toLowerCase().includes(query)) ||
            (room.amenities && room.amenities.toLowerCase().includes(query))
        );
    });

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
                    <button onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'bookings' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>📅 Bookings Manager</button>
                    <button onClick={() => { setActiveTab('escrow'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'escrow' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>💰 Escrow Ledger</button>
                    <button onClick={() => { setActiveTab('approvals'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'approvals' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>🛡️ Partner Approvals</button>
                    <div className="my-2 border-b border-gray-800"></div>
                    <button onClick={() => { setActiveTab('fleet'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'fleet' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>🚘 Manage Fleet</button>
                    <button onClick={() => { setActiveTab('rooms'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'rooms' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>🏨 Manage Room Matrix</button>
                    <button onClick={() => { setActiveTab('affiliates'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'affiliates' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>🤝 Affiliates Hub</button>
                    <button onClick={() => { setActiveTab('chats'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'chats' ? 'bg-[#000080] text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}>💬 Chat Monitor</button>
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="w-full bg-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm font-bold border border-red-900/50 hover:bg-red-900 hover:text-white transition">Sign Out</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative w-full bg-gray-100">
                <header className="bg-white px-6 md:px-8 py-5 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10 hidden md:flex">
                    <h1 className="text-2xl font-black text-gray-900 capitalize">
                        {activeTab === 'rooms' ? 'Room Matrix' 
                            : activeTab === 'affiliates' ? 'Affiliates Hub' 
                            : activeTab === 'bookings' ? 'Bookings Manager' 
                            : activeTab === 'escrow' ? 'Escrow Ledger' 
                            : activeTab === 'chats' ? 'Chat Monitor'
                            : activeTab}
                    </h1>
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    <div className="bg-gradient-to-br from-[#000080] to-blue-900 p-6 rounded-3xl shadow-lg text-white">
                                        <p className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">Funds in Escrow</p>
                                        <p className="text-3xl font-black mb-2">₦{calculateTotalEscrow()}</p>
                                        <p className="text-xs text-blue-300">Awaiting partner disbursement</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Bookings</p>
                                        <p className="text-4xl font-black text-gray-900">{allBookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Archived').length}</p>
                                        <p className="text-xs text-gray-400 mt-2 font-bold">Escrow transactions ledger</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Active Vehicles</p>
                                        <p className="text-4xl font-black text-[#000080]">{cars.length}</p>
                                        <p className="text-xs text-gray-400 mt-2 font-bold">Global fleet listed</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Active Hotels</p>
                                        <p className="text-4xl font-black text-[#000080]">{activeHotelsCount}</p>
                                        <p className="text-xs text-gray-400 mt-2 font-bold">Unique properties in grid</p>
                                    </div>
                                </div>
                                            )}

                            {/* BOOKINGS TAB */}
                            {activeTab === 'bookings' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                        <div>
                                            <h2 className="text-lg font-black text-gray-900">All System Bookings</h2>
                                            <p className="text-xs text-gray-500 mt-1">Manage and audit all reservations across the Airgo system</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsNewBookingModalOpen(true)}
                                            className="bg-[#000080] hover:bg-blue-900 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all hover:scale-105"
                                        >
                                            ➕ Create Concierge Booking
                                        </button>
                                    </div>

                                    {/* 🔍 SEARCH AND FILTERS */}
                                    <div className="p-4 border-b border-gray-100 bg-white flex flex-col md:flex-row gap-4 items-center justify-between">
                                        <div className="relative w-full md:max-w-md">
                                            <input 
                                                type="text" 
                                                placeholder="Search bookings by client name, email, phone, asset..." 
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#000080] focus:bg-white transition-all"
                                                value={bookingSearchQuery}
                                                onChange={(e) => setBookingSearchQuery(e.target.value)}
                                            />
                                            <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                            {(['All', 'Pending Escrow', 'Paid', 'Approved for Disbursement', 'Paid Out', 'Archived'] as const).map((filter) => (
                                                <button
                                                    key={filter}
                                                    onClick={() => setBookingStatusFilter(filter)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${bookingStatusFilter === filter ? 'bg-[#000080] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    {filter}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
 
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="p-4 font-bold border-b">Booking Ref / Asset</th>
                                                    <th className="p-4 font-bold border-b">Client Info</th>
                                                    <th className="p-4 font-bold border-b">Timeframe</th>
                                                    <th className="p-4 font-bold border-b">Status</th>
                                                    <th className="p-4 font-bold border-b text-right">Price</th>
                                                    <th className="p-4 font-bold border-b text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {allBookings
                                                    .filter(b => {
                                                        if (bookingStatusFilter === 'All') return b.status !== 'Archived';
                                                        return b.status === bookingStatusFilter;
                                                    })
                                                    .filter(b => {
                                                        if (!bookingSearchQuery) return true;
                                                        const q = bookingSearchQuery.toLowerCase();
                                                        return (
                                                             (b.clientName && b.clientName.toLowerCase().includes(q)) ||
                                                             (b.clientEmail && b.clientEmail.toLowerCase().includes(q)) ||
                                                             (b.clientPhone && b.clientPhone.toLowerCase().includes(q)) ||
                                                             (b.itemName && b.itemName.toLowerCase().includes(q)) ||
                                                             (b._id && b._id.toLowerCase().includes(q))
                                                        );
                                                    }).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="p-12 text-center text-gray-500 bg-white">
                                                            <div className="text-4xl mb-2">📅</div>
                                                            <p className="font-bold">No bookings found matching filter criteria.</p>
                                                        </td>
                                                    </tr>
                                                ) : allBookings
                                                    .filter(b => {
                                                        if (bookingStatusFilter === 'All') return true;
                                                        return b.status === bookingStatusFilter;
                                                    })
                                                    .filter(b => {
                                                        if (!bookingSearchQuery) return true;
                                                        const q = bookingSearchQuery.toLowerCase();
                                                        return (
                                                             (b.clientName && b.clientName.toLowerCase().includes(q)) ||
                                                             (b.clientEmail && b.clientEmail.toLowerCase().includes(q)) ||
                                                             (b.clientPhone && b.clientPhone.toLowerCase().includes(q)) ||
                                                             (b.itemName && b.itemName.toLowerCase().includes(q)) ||
                                                             (b._id && b._id.toLowerCase().includes(q))
                                                        );
                                                    }).map((booking) => (
                                                    <React.Fragment key={booking._id}>
                                                        <tr onClick={() => toggleEscrowExpand(booking._id)} className="hover:bg-blue-50 transition cursor-pointer">
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-black text-gray-900 pr-1">{booking.itemName}</span>
                                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${booking.itemType === 'hotel' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}`}>{booking.itemType}</span>
                                                                </div>
                                                                <p className="text-[10px] text-gray-400 mt-1 font-bold">Ref: {booking._id.substring(0, 10).toUpperCase()}</p>
                                                            </td>
                                                            <td className="p-4">
                                                                <p className="text-sm font-bold text-gray-900">{booking.clientName || 'Guest'}</p>
                                                                <p className="text-xs text-gray-500">{booking.clientEmail || 'No email'}</p>
                                                            </td>
                                                            <td className="p-4">
                                                                <p className="text-xs text-green-700 font-bold">Check-in: {formatDisplayDate(booking.checkIn, booking.itemType)}</p>
                                                                <p className="text-xs text-red-700 mt-0.5 font-bold">Check-out: {formatDisplayDate(booking.checkOut, booking.itemType)}</p>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                    booking.status === 'Pending Escrow' 
                                                                        ? 'bg-yellow-100 text-yellow-800' 
                                                                        : booking.status === 'Approved for Disbursement'
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : booking.status === 'Paid'
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : 'bg-emerald-100 text-emerald-800'
                                                                }`}>
                                                                    {booking.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right font-black text-[#000080]">₦{booking.totalPrice}</td>
                                                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                                 <div className="flex items-center justify-center gap-2">
                                                                     {booking.status === 'Pending Escrow' && (
                                                                         <button onClick={() => handleConfirmDirectDeposit(booking._id)} className="bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-green-600 hover:text-white transition">Confirm Deposit</button>
                                                                     )}
                                                                     <button onClick={() => handleEditBookingClick(booking)} className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-600 hover:text-white transition">Correct Details</button>
                                                                     {booking.status !== 'Archived' && (
                                                                         <button onClick={() => handleDeleteBooking(booking._id)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-red-600 hover:text-white transition">Delete</button>
                                                                     )}
                                                                 </div>
                                                             </td>
                                                        </tr>
                                                        {expandedEscrowId === booking._id && (
                                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                                <td colSpan={6} className="p-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Detailed Client Info</p>
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
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Details & Partners</p>
                                                                            <p className="text-xs font-black text-gray-900 mb-1">Asset ID: {booking.itemId || 'N/A'}</p>
                                                                            <p className="text-[10px] font-bold text-gray-500 uppercase">Partner ID: {booking.partnerId || 'N/A'}</p>
                                                                             {booking.itemType === 'car' && booking.vehicleNumber && (
                                                                                 <div className="mt-2 space-y-1">
                                                                                     <p className="text-[10px] font-bold text-green-700 uppercase">Plate: {booking.vehicleNumber}</p>
                                                                                     <div className="flex items-center gap-1.5 flex-wrap">
                                                                                         <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                                                                             booking.vehiclePlateStatus === 'Verified' ? 'bg-green-100 text-green-800' :
                                                                                             booking.vehiclePlateStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                                                             booking.vehiclePlateUrl ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                                                         }`}>
                                                                                             Plate: {booking.vehiclePlateStatus || 'Pending'}
                                                                                         </span>
                                                                                         {booking.vehiclePlateUrl && (
                                                                                             <a href={booking.vehiclePlateUrl} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-[#000080] hover:underline">
                                                                                                 📷 View Photo
                                                                                             </a>
                                                                                         )}
                                                                                     </div>
                                                                                     {booking.vehiclePlateUrl && booking.vehiclePlateStatus !== 'Verified' && (
                                                                                         <div className="flex gap-1.5 mt-1.5">
                                                                                             <button
                                                                                                 onClick={(e) => { e.stopPropagation(); handleVerifyPlateAdmin(booking._id, 'Verified'); }}
                                                                                                 className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[8px] font-bold shadow-sm hover:bg-green-600 hover:text-white transition"
                                                                                             >
                                                                                                 ✓ Verify
                                                                                             </button>
                                                                                             <button
                                                                                                 onClick={(e) => { e.stopPropagation(); handleVerifyPlateAdmin(booking._id, 'Rejected'); }}
                                                                                                 className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[8px] font-bold shadow-sm hover:bg-red-600 hover:text-white transition"
                                                                                             >
                                                                                                 ✗ Reject
                                                                                             </button>
                                                                                         </div>
                                                                                     )}
                                                                                 </div>
                                                                             )}
                                                                        </div>
                                                                        <div className="flex flex-col gap-2 justify-center">
                                                                             {booking.status === 'Pending Escrow' && (
                                                                                 <button 
                                                                                     onClick={(e) => { e.stopPropagation(); handleConfirmDirectDeposit(booking._id); }} 
                                                                                     className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-green-700 text-center transition"
                                                                                 >
                                                                                     💵 Confirm Deposit
                                                                                 </button>
                                                                             )}
                                                                             {!['Paid', 'Paid Out', 'Approved for Disbursement', 'Confirmed', 'Completed'].includes(booking.status) ? (
                                                 <span className="text-xs text-center font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-2">Receipt Locked ({booking.status})</span>
                                             ) : (
                                                 <a 
                                                     href={`${process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com'}/api/bookings/${booking._id}/invoice`} 
                                                     target="_blank" 
                                                     rel="noreferrer"
                                                     className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-900 text-center transition"
                                                 >
                                                     📄 Get Invoice Receipt PDF
                                                 </a>
                                             )}
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
                                                                     <button onClick={(e) => { e.stopPropagation(); handleConfirmDirectDeposit(booking._id); }} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-md hover:scale-105 transition">Confirm Deposit</button>
                                                                 )}
                                                                 {booking.status === 'Paid' && (
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
                                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                                                                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Partner: {booking.partnerId ? booking.partnerId.substring(0, 8) : 'N/A'}</p>
                                                                            {booking.itemType === 'car' && booking.vehicleNumber && (
                                                                                <div className="mt-2 space-y-1">
                                                                                    <p className="text-[10px] font-bold text-green-700 uppercase">Plate: {booking.vehicleNumber}</p>
                                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                                                                            booking.vehiclePlateStatus === 'Verified' ? 'bg-green-100 text-green-800' :
                                                                                            booking.vehiclePlateStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                                                            booking.vehiclePlateUrl ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                                                        }`}>
                                                                                            Plate: {booking.vehiclePlateStatus || 'Pending'}
                                                                                        </span>
                                                                                        {booking.vehiclePlateUrl && (
                                                                                            <a href={booking.vehiclePlateUrl} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-[#000080] hover:underline">
                                                                                                📷 View Photo
                                                                                            </a>
                                                                                        )}
                                                                                    </div>
                                                                                    {booking.vehiclePlateUrl && booking.vehiclePlateStatus !== 'Verified' && (
                                                                                        <div className="flex gap-1.5 mt-1.5">
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); handleVerifyPlateAdmin(booking._id, 'Verified'); }}
                                                                                                className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[8px] font-bold shadow-sm hover:bg-green-600 hover:text-white transition"
                                                                                            >
                                                                                                ✓ Verify
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); handleVerifyPlateAdmin(booking._id, 'Rejected'); }}
                                                                                                className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[8px] font-bold shadow-sm hover:bg-red-600 hover:text-white transition"
                                                                                            >
                                                                                                ✗ Reject
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Exact Timeframe</p>
                                                                            <p className="text-xs font-bold text-green-700">In: {formatDisplayDate(booking.checkIn, booking.itemType)}</p>
                                                                            <p className="text-xs font-bold text-red-700 mt-1">Out: {formatDisplayDate(booking.checkOut, booking.itemType)}</p>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mt-2 mb-1">Reserved At</p>
                                                                            <p className="text-xs font-bold text-gray-700">{booking.createdAt ? new Date(booking.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</p>
                                                                        </div>
                                                                        <div className="flex flex-col gap-2 justify-center">
                                                                             {booking.status === 'Pending Escrow' && (
                                                                                  <button 
                                                                                      onClick={(e) => { e.stopPropagation(); handleConfirmDirectDeposit(booking._id); }} 
                                                                                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-green-700 transition"
                                                                                  >
                                                                                      💵 Confirm Deposit
                                                                                  </button>
                                                                              )}
                                                                             <button 
                                                                                 onClick={(e) => { e.stopPropagation(); handleEditBookingClick(booking); }} 
                                                                                 className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700 transition"
                                                                             >
                                                                                 ✏️ Correct Details
                                                                             </button>
                                                                             <button 
                                                                                 onClick={(e) => { e.stopPropagation(); handleResendEmail(booking._id); }} 
                                                                                 disabled={isResendingEmail === booking._id}
                                                                                 className="bg-[#000080] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-900 transition disabled:opacity-50"
                                                                             >
                                                                                 ✉️ {isResendingEmail === booking._id ? 'Resending...' : 'Resend Email'}
                                                                             </button>
                                                                            {!['Paid', 'Paid Out', 'Approved for Disbursement', 'Confirmed', 'Completed'].includes(booking.status) ? (
                                                 <button 
                                                     disabled
                                                     onClick={(e) => e.stopPropagation()}
                                                     className="bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 cursor-not-allowed opacity-60 text-center w-full"
                                                 >
                                                     📄 Receipt (Locked)
                                                 </button>
                                             ) : (
                                                 <a 
                                                     href={`${process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com'}/api/bookings/${booking._id}/invoice`} 
                                                     target="_blank" 
                                                     rel="noreferrer"
                                                     onClick={(e) => e.stopPropagation()}
                                                     className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-900 transition text-center animate-fade-in"
                                                 >
                                                     📄 Get Receipt PDF
                                                 </a>
                                             )}
                                                                            {booking.status !== 'Archived' && (
                                                                                <button 
                                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking._id); }} 
                                                                                    className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-red-600 hover:text-white transition"
                                                                                >
                                                                                    ✕ Delete Booking
                                                                                </button>
                                                                            )}
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
                                    
                                    {/* 🔍 PARTNER SEARCH BAR */}
                                    <div className="p-4 border-b border-gray-100 bg-white">
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                placeholder="Search partners by name, business, email, phone..." 
                                                className="w-full md:max-w-md pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#000080] focus:bg-white transition-all"
                                                value={partnerSearchQuery}
                                                onChange={(e) => setPartnerSearchQuery(e.target.value)}
                                            />
                                            <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
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
                                                {partners
                                                    .filter(p => partnerFilter === 'active' ? !p.isDeleted : p.isDeleted)
                                                    .filter(p => {
                                                        if (!partnerSearchQuery) return true;
                                                        const q = partnerSearchQuery.toLowerCase();
                                                        return (
                                                            (p.name && p.name.toLowerCase().includes(q)) ||
                                                            (p.businessName && p.businessName.toLowerCase().includes(q)) ||
                                                            (p.email && p.email.toLowerCase().includes(q)) ||
                                                            (p.phone && p.phone.toLowerCase().includes(q)) ||
                                                            (p.phoneNumber && p.phoneNumber.toLowerCase().includes(q)) ||
                                                            (p.partnerType && p.partnerType.toLowerCase().includes(q))
                                                        );
                                                    }).length === 0 ? (
                                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No partners found matching criteria.</td></tr>
                                                ) : partners
                                                    .filter(p => partnerFilter === 'active' ? !p.isDeleted : p.isDeleted)
                                                    .filter(p => {
                                                        if (!partnerSearchQuery) return true;
                                                        const q = partnerSearchQuery.toLowerCase();
                                                        return (
                                                            (p.name && p.name.toLowerCase().includes(q)) ||
                                                            (p.businessName && p.businessName.toLowerCase().includes(q)) ||
                                                            (p.email && p.email.toLowerCase().includes(q)) ||
                                                            (p.phone && p.phone.toLowerCase().includes(q)) ||
                                                            (p.phoneNumber && p.phoneNumber.toLowerCase().includes(q)) ||
                                                            (p.partnerType && p.partnerType.toLowerCase().includes(q))
                                                        );
                                                    }).map((partner) => (
                                                    <React.Fragment key={partner._id}>
                                                        <tr onClick={() => setExpandedPartnerId(expandedPartnerId === partner._id ? null : partner._id)} className={`transition cursor-pointer ${partner.isActive === false ? 'bg-red-50/50' : 'hover:bg-blue-50'}`}>
                                                            <td className="p-4">
                                                                <p className="font-bold text-gray-900">{partner.name}</p>
                                                                <p className="text-[10px] uppercase font-black text-blue-600">{partner.partnerType === 'car' ? '🚘 Fleet' : (partner.partnerType === 'shuttle' || partner.partnerType === 'airport-shuttle') ? '🚐 Shuttle' : partner.partnerType === 'hotel' ? '🏨 Hotel' : partner.partnerType === 'apartment' ? '🏢 Apartment' : 'Partner'}</p>
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
                                    <div className="px-6 pt-6 pb-2 border-b border-gray-100 bg-white">
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
                                            <input 
                                                type="text" 
                                                placeholder="Search fleet by name, class, location, state, or plate number..." 
                                                className="w-full md:max-w-md pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#000080] focus:bg-white transition-all"
                                                value={fleetSearchQuery}
                                                onChange={(e) => setFleetSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredCars.length === 0 ? (
                                            <p className="col-span-full text-center text-gray-500 py-10">No vehicles found matching search criteria.</p>
                                        ) : filteredCars.map(car => (
                                            <div key={car._id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                                <img src={car.image} alt={car.name} className="w-full h-40 object-cover" />
                                                <div className="p-4">
                                                    <h3 className="font-black text-gray-900">{car.name}</h3>
                                                    <p className="text-sm text-gray-500 mb-2">{car.type}</p>
                                                    <div className="flex justify-between items-center mt-4">
                                                        <p className="font-bold text-[#000080]">₦{car.price?.toLocaleString()}</p>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleEditListingClick(car, 'car')} className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded">Edit</button>
                                                            <button onClick={() => handleDelete('cars', car._id)} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-3 py-1.5 rounded">Delete</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AFFILIATE HUB TAB */}
                            {activeTab === 'affiliates' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <h2 className="text-lg font-black text-gray-900">Affiliate Application Management</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="p-4 font-bold border-b">Affiliate / Contact</th>
                                                    <th className="p-4 font-bold border-b">Website / Channel</th>
                                                    <th className="p-4 font-bold border-b">Strategy</th>
                                                    <th className="p-4 font-bold border-b text-right">Commissions</th>
                                                    <th className="p-4 font-bold border-b">Status</th>
                                                    <th className="p-4 font-bold border-b text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {affiliates.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                                            No affiliate applications found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    affiliates.map((app) => (
                                                        <React.Fragment key={app._id}>
                                                            <tr 
                                                                onClick={() => setExpandedAffiliateId(expandedAffiliateId === app._id ? null : app._id)}
                                                                className={`hover:bg-gray-50 transition cursor-pointer ${app.isActive === false ? 'bg-red-50/50' : ''}`}
                                                            >
                                                                <td className="p-4">
                                                                    <p className="font-bold text-gray-900">{app.name}</p>
                                                                    <p className="text-xs text-gray-500">{app.email}</p>
                                                                    <p className="text-[10px] text-[#000080] font-bold uppercase mt-1">Tap to manage ▼</p>
                                                                </td>
                                                                <td className="p-4 text-sm text-gray-700">{app.websiteOrChannel}</td>
                                                                <td className="p-4 text-xs text-gray-600 max-w-xs truncate" title={app.strategy}>
                                                                    {app.strategy}
                                                                </td>
                                                                <td className="p-4 text-right font-bold text-[#000080]">
                                                                    ₦{app.commissionEarned?.toLocaleString() || 0}
                                                                </td>
                                                                <td className="p-4">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                        app.status === 'Approved'
                                                                            ? (app.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800')
                                                                            : app.status === 'Rejected'
                                                                                ? 'bg-red-100 text-red-800'
                                                                                : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {app.status === 'Approved' && app.isActive === false ? 'Deactivated' : app.status}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                                                                    {app.status === 'Pending' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleUpdateAffiliateStatus(app._id, 'Approved')}
                                                                                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition cursor-pointer"
                                                                            >
                                                                                Approve
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleUpdateAffiliateStatus(app._id, 'Rejected')}
                                                                                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition cursor-pointer"
                                                                            >
                                                                                Reject
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {app.status === 'Approved' && (
                                                                        <div className="flex flex-col gap-1 items-center">
                                                                            <span className="text-xs text-green-700 font-black uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded border border-green-100/50">Approved</span>
                                                                            {app.commissionEarned > 0 && (
                                                                                <button
                                                                                    onClick={() => handleDisburseAffiliateCommission(app._id)}
                                                                                    className="bg-[#000080] text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-900 transition mt-1 cursor-pointer"
                                                                                >
                                                                                    💸 Payout
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {app.status === 'Rejected' && (
                                                                        <span className="text-xs text-red-700 font-black uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-100/50">Rejected</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            {expandedAffiliateId === app._id && (
                                                                <tr className="bg-gray-50 border-b border-gray-200 shadow-inner">
                                                                    <td colSpan={6} className="p-6">
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                                            <div>
                                                                                <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-1">Affiliate Profile Details</h4>
                                                                                <p className="text-sm font-bold text-gray-900">Name: <span className="font-normal">{app.name}</span></p>
                                                                                <p className="text-sm font-bold text-gray-900">Email: <span className="font-normal">{app.email}</span></p>
                                                                                <p className="text-sm font-bold text-gray-900">Phone: <span className="font-normal">{app.phone}</span></p>
                                                                                <p className="text-sm font-bold text-gray-900">Channel: <a href={app.websiteOrChannel} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-normal">{app.websiteOrChannel}</a></p>
                                                                                <p className="text-sm font-bold text-gray-900 mt-2">Marketing Strategy:</p>
                                                                                <p className="text-xs text-gray-700 bg-white p-3 rounded-lg border border-gray-200 mt-1 whitespace-pre-wrap font-medium leading-relaxed">{app.strategy}</p>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-1">Affiliate Account Actions</h4>
                                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                                    {app.status === 'Approved' && (
                                                                                        <button
                                                                                            onClick={() => handleToggleAffiliateActive(app._id, app.isActive !== false)}
                                                                                            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                                                                                                app.isActive !== false
                                                                                                    ? 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-600 hover:text-white'
                                                                                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                                                                                            }`}
                                                                                        >
                                                                                            {app.isActive !== false ? 'Deactivate Affiliate' : 'Reactivate Affiliate'}
                                                                                        </button>
                                                                                    )}
                                                                                    <button
                                                                                        onClick={() => handleDeleteAffiliate(app._id)}
                                                                                        className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition cursor-pointer"
                                                                                    >
                                                                                        Delete Application
                                                                                    </button>
                                                                                </div>
                                                                                <p className="text-[10px] text-gray-400 font-medium mt-3">
                                                                                    Status: <span className="font-bold text-gray-700">{app.status}</span> | 
                                                                                    Account: <span className="font-bold text-gray-700">{app.isActive !== false ? 'Active' : 'Deactivated'}</span>
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Activities: Referred Bookings Ledger */}
                                                                        <div>
                                                                            <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Referred Bookings & Activities</h4>
                                                                            {(() => {
                                                                                const referred = allBookings.filter(b => b.referredBy && b.referredBy.toLowerCase() === app.email.toLowerCase());
                                                                                if (referred.length === 0) {
                                                                                    return <p className="text-xs text-gray-500 bg-white p-4 rounded-xl border border-gray-200/50">No referred bookings logged yet for this affiliate.</p>;
                                                                                }
                                                                                return (
                                                                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                                                        <table className="w-full text-left text-xs border-collapse">
                                                                                            <thead>
                                                                                                <tr className="bg-gray-50 text-gray-400 uppercase text-[9px] tracking-wider font-bold">
                                                                                                    <th className="p-3 border-b">Ref</th>
                                                                                                    <th className="p-3 border-b">Client</th>
                                                                                                    <th className="p-3 border-b">Item</th>
                                                                                                    <th className="p-3 border-b text-right">Value</th>
                                                                                                    <th className="p-3 border-b text-right">Commission</th>
                                                                                                    <th className="p-3 border-b text-center">Status</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                {referred.map(b => {
                                                                                                    const price = typeof b.totalPrice === 'string' ? parseInt(b.totalPrice.replace(/[^0-9]/g, '')) : Number(b.totalPrice) || 0;
                                                                                                    const rate = 0.05;
                                                                                                    const commission = Math.round(price * rate);
                                                                                                    return (
                                                                                                        <tr key={b._id} className="border-t border-gray-100 hover:bg-gray-50">
                                                                                                            <td className="p-3 font-mono font-bold text-gray-400">{b._id.substring(0, 8)}</td>
                                                                                                            <td className="p-3 font-bold text-gray-700">{b.clientName}</td>
                                                                                                            <td className="p-3 font-medium text-gray-600">{b.itemName}</td>
                                                                                                            <td className="p-3 text-right font-bold text-gray-700">₦{price.toLocaleString()}</td>
                                                                                                            <td className="p-3 text-right font-black text-green-700">₦{commission.toLocaleString()}</td>
                                                                                                            <td className="p-3 text-center">
                                                                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                                                                                                    b.status === 'Paid' || b.status === 'Paid Out' || b.status === 'Approved for Disbursement'
                                                                                                                        ? 'bg-green-50 text-green-700'
                                                                                                                        : 'bg-yellow-50 text-yellow-700'
                                                                                                                }`}>{b.status}</span>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    );
                                                                                                })}
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
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
                                    <div className="px-6 pt-6 pb-2 border-b border-gray-100 bg-white">
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
                                            <input 
                                                type="text" 
                                                placeholder="Search rooms by name, hotel, address, or amenities..." 
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 outline-none text-sm text-gray-900 font-medium"
                                                value={roomSearchQuery}
                                                onChange={(e) => setRoomSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredRooms.length === 0 ? (
                                            <p className="col-span-full text-center text-gray-500 py-10">No room allocations found matching search criteria.</p>
                                        ) : filteredRooms.map(room => (
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
                                                            <span className="text-xs bg-blue-50 text-[#000080] font-bold px-2 py-1 rounded">
                                                                Pool: {Math.max(0, (room.totalAllocated || 0) - (room.bookedDates?.find((b: any) => b.date === new Date().toISOString().split('T')[0])?.count || 0))} / {room.totalAllocated}
                                                            </span>
                                                            <button onClick={() => handleEditListingClick(room, 'room')} className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 px-2 py-1 rounded">Edit</button>
                                                            <button onClick={() => handleDelete('rooms', room._id)} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-2 py-1 rounded">Delete</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CHAT MONITOR TAB */}
                            {activeTab === 'chats' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col lg:flex-row h-[75vh]">
                                    {/* Left Pane: Chatrooms List */}
                                    <div className="w-full lg:w-80 border-r border-gray-150 flex flex-col h-full bg-gray-50/50 shrink-0">
                                        <div className="p-4 border-b border-gray-200 shrink-0">
                                            <h3 className="font-black text-gray-900 text-base">Active Chatrooms</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Select booking to monitor</p>
                                        </div>
                                        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                                            {activeChatrooms.length === 0 ? (
                                                <div className="p-8 text-center text-gray-400">
                                                    <span className="text-3xl block mb-2">💬</span>
                                                    <p className="text-xs font-bold">No active conversations found.</p>
                                                </div>
                                            ) : (
                                                activeChatrooms.map((chatroom) => {
                                                    const isSelected = selectedChatroom?.booking?._id === chatroom.booking._id;
                                                    const lastMsgText = chatroom.lastMessage ? chatroom.lastMessage.text : 'No messages yet';
                                                    const lastMsgTime = chatroom.lastMessage ? new Date(chatroom.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                                    
                                                    return (
                                                        <div 
                                                            key={chatroom.booking._id}
                                                            onClick={() => setSelectedChatroom(chatroom)}
                                                            className={`p-4 cursor-pointer transition flex flex-col gap-1.5 ${
                                                                isSelected 
                                                                    ? 'bg-blue-50/80 border-l-4 border-[#000080]' 
                                                                    : 'hover:bg-gray-100/70'
                                                            }`}
                                                        >
                                                            <div className="flex justify-between items-start gap-2">
                                                                <h4 className="font-black text-xs text-gray-900 truncate flex-1">{chatroom.booking.itemName}</h4>
                                                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                                                                    chatroom.booking.itemType === 'hotel' 
                                                                        ? 'bg-amber-100 text-amber-800' 
                                                                        : 'bg-purple-100 text-purple-800'
                                                                }`}>{chatroom.booking.itemType}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-[10px]">
                                                                <span className="text-gray-500 font-bold">Client: {chatroom.booking.clientName}</span>
                                                                <span className="text-gray-400 font-medium shrink-0">{lastMsgTime}</span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-600 line-clamp-1 italic font-medium">
                                                                {chatroom.lastMessage?.senderRole === 'admin' ? '🛡️ Admin: ' : chatroom.lastMessage?.senderRole === 'partner' ? '🚘 Partner: ' : ''}
                                                                {lastMsgText}
                                                            </p>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Pane: Chat History / Inspector */}
                                    <div className="flex-1 flex flex-col h-full bg-white relative">
                                        {!selectedChatroom ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 gap-2 bg-gray-50/30">
                                                <div className="w-16 h-16 bg-[#000080]/5 text-[#000080] rounded-full flex items-center justify-center text-3xl font-black shadow-inner mb-2 animate-bounce">
                                                    💬
                                                </div>
                                                <h4 className="font-black text-gray-700 mt-2 text-lg">Select a Conversation</h4>
                                                <p className="text-xs max-w-sm leading-relaxed font-medium">
                                                    Click on any active chatroom in the left pane to monitor conversations, verify compliance, or interject directly as Superadmin.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Chatroom Header */}
                                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                                                    <div>
                                                        <h3 className="font-black text-sm text-gray-900">{selectedChatroom.booking.itemName}</h3>
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px]">
                                                            <span className="text-gray-500 font-bold">Client: {selectedChatroom.booking.clientName} ({selectedChatroom.booking.clientPhone || 'N/A'})</span>
                                                            <span className="text-gray-300">|</span>
                                                            <span className="text-gray-500 font-bold">Ref: {selectedChatroom.booking._id.substring(0, 10).toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${isChatConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{isChatConnected ? 'Live Connection' : 'Syncing...'}</span>
                                                    </div>
                                                </div>

                                                {/* Messages Area */}
                                                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                                                    {isChatLoading ? (
                                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000080]"></div>
                                                            <span className="text-xs font-bold">Loading conversation logs...</span>
                                                        </div>
                                                    ) : chatroomMessages.length === 0 ? (
                                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                                                            <span className="text-2xl">💤</span>
                                                            <span className="text-xs font-bold">No messages in this chat.</span>
                                                        </div>
                                                    ) : (
                                                        chatroomMessages.map((msg, index) => {
                                                            const isMe = msg.senderRole === 'admin';
                                                            return (
                                                                <div key={msg._id || index} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                                                                    <div className="text-[9px] font-bold text-gray-400 mb-0.5 uppercase tracking-wide px-1">
                                                                        {msg.senderName} ({msg.senderRole})
                                                                    </div>
                                                                    <div className={`p-3 rounded-2xl shadow-sm text-sm font-medium ${
                                                                        isMe 
                                                                            ? 'bg-[#000080] text-white rounded-tr-none' 
                                                                            : msg.senderRole === 'admin'
                                                                                ? 'bg-[#FFB81C] text-[#000080] rounded-tl-none font-bold'
                                                                                : 'bg-white text-gray-800 border border-gray-150 rounded-tl-none'
                                                                    }`}>
                                                                        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                                                                        <p className={`text-[8px] text-right mt-1.5 font-bold ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                    <div ref={chatMessagesEndRef} />
                                                </div>

                                                {/* Chat Input / Interject Panel */}
                                                <form onSubmit={handleSendAdminMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                                                    <input
                                                        type="text"
                                                        placeholder="Interject as Superadmin... (phone numbers blocked)"
                                                        value={chatInputText}
                                                        onChange={(e) => setChatInputText(e.target.value)}
                                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm outline-none focus:border-[#000080] transition text-gray-900 font-medium"
                                                        maxLength={500}
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!chatInputText.trim()}
                                                        className={`px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition ${
                                                            chatInputText.trim() 
                                                                ? 'bg-[#000080] text-white hover:bg-blue-900 shadow-md cursor-pointer' 
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        Send
                                                    </button>
                                                </form>
                                            </>
                                        )}
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
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Vehicle Category</label>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" 
                                        value={newCar.vehicleCategory} 
                                        onChange={e => setNewCar({ ...newCar, vehicleCategory: e.target.value })}
                                    >
                                        <option value="car">Executive Car (Markup Model)</option>
                                        <option value="shuttle">Taxi (Bidding Model)</option>
                                    </select>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Name</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newCar.name} onChange={e => setNewCar({ ...newCar, name: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Type (e.g. SUV, Sedan)</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newCar.type} onChange={e => setNewCar({ ...newCar, type: e.target.value })} /></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">
                                        {newCar.vehicleCategory === 'shuttle' ? 'Recommended Bid Price (₦)' : 'Net Price (Your Take-Home ₦)'}
                                    </label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="0" 
                                        className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" 
                                        value={newCar.vehicleCategory === 'shuttle' ? (newCar.retailPrice || '') : (newCar.netPrice || '')} 
                                        onChange={e => {
                                            if (newCar.vehicleCategory === 'shuttle') {
                                                setNewCar({ ...newCar, retailPrice: e.target.value, netPrice: '' });
                                            } else {
                                                setNewCar({ ...newCar, netPrice: e.target.value, retailPrice: '' });
                                            }
                                        }} 
                                    />
                                    <span className="text-[10px] text-gray-400 font-medium block mt-1">
                                        {newCar.vehicleCategory === 'shuttle' 
                                            ? 'Airgo will automatically deduct a 10% dispatch fee from this retail price.' 
                                            : 'Airgo will automatically apply a 15% platform markup to determine the public retail price.'}
                                    </span>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Capacity</label> <input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.capacity} onChange={e => setNewCar({ ...newCar, capacity: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Plate Number</label><input required type="text" placeholder="e.g. ABJ-888-GW" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.vehicleNumber} onChange={e => setNewCar({ ...newCar, vehicleNumber: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Location (City/Area)</label><input required type="text" placeholder="e.g. Maitama" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.location} onChange={e => setNewCar({ ...newCar, location: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">State</label><input required type="text" placeholder="e.g. Abuja" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.state} onChange={e => setNewCar({ ...newCar, state: e.target.value })} /></div>
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
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Net Price Per Night (Your Take-Home ₦)</label>
                                    <input required type="number" min="0" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newRoom.netPrice} onChange={e => setNewRoom({ ...newRoom, netPrice: e.target.value })} />
                                    <span className="text-[10px] text-gray-400 font-medium block mt-1">Airgo will automatically apply a standard platform markup to determine the final retail price for clients.</span>
                                </div>
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
            {/* EDIT INVENTORY MODAL */}
            {isEditInventoryModalOpen && selectedInventoryForEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <h2 className="text-xl font-black text-[#000080]">Edit Listing Specifications</h2>
                            <button onClick={() => { setIsEditInventoryModalOpen(false); setSelectedInventoryForEdit(null); }} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleSaveEditListing} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {selectedInventoryForEdit.listingType === 'car' && (
                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Vehicle Category</label>
                                        <select 
                                            className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" 
                                            value={editItemData.vehicleCategory} 
                                            onChange={e => setEditItemData({ ...editItemData, vehicleCategory: e.target.value })}
                                        >
                                            <option value="car">Executive Car (Markup Model)</option>
                                            <option value="shuttle">Taxi (Bidding Model)</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Name / Title</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.name} onChange={e => setEditItemData({ ...editItemData, name: e.target.value })} /></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">
                                        {selectedInventoryForEdit.listingType === 'car' && editItemData.vehicleCategory === 'shuttle' ? 'Recommended Bid Price (₦)' : selectedInventoryForEdit.listingType === 'car' ? 'Net Price (Your Take-Home ₦)' : 'Net Price Per Night (₦)'}
                                    </label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="0" 
                                        className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" 
                                        value={selectedInventoryForEdit.listingType === 'car' && editItemData.vehicleCategory === 'shuttle' ? (editItemData.retailPrice || '') : (editItemData.netPrice || '')} 
                                        onChange={e => {
                                            if (selectedInventoryForEdit.listingType === 'car' && editItemData.vehicleCategory === 'shuttle') {
                                                setEditItemData({ ...editItemData, retailPrice: e.target.value, netPrice: '' });
                                            } else {
                                                setEditItemData({ ...editItemData, netPrice: e.target.value, retailPrice: '' });
                                            }
                                        }} 
                                    />
                                    <span className="text-[10px] text-gray-400 font-medium block mt-1">
                                        {selectedInventoryForEdit.listingType === 'car' 
                                            ? (editItemData.vehicleCategory === 'shuttle' 
                                                ? 'Airgo will automatically deduct a 10% dispatch fee from this retail price.' 
                                                : 'Airgo will automatically apply a 15% platform markup to determine the public retail price.') 
                                            : 'Airgo will automatically apply a standard platform markup to determine the final retail price for clients.'}
                                    </span>
                                </div>
                            </div>

                            {selectedInventoryForEdit.listingType === 'car' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Type (e.g. SUV, Sedan)</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.type} onChange={e => setEditItemData({ ...editItemData, type: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Capacity (Seats)</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.capacity} onChange={e => setEditItemData({ ...editItemData, capacity: e.target.value })} /></div>
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Features</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.features} onChange={e => setEditItemData({ ...editItemData, features: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Plate Number</label><input required type="text" placeholder="e.g. ABJ-888-GW" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.vehicleNumber} onChange={e => setEditItemData({ ...editItemData, vehicleNumber: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Location (City/Area)</label><input required type="text" placeholder="e.g. Maitama" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.location} onChange={e => setEditItemData({ ...editItemData, location: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">State</label><input required type="text" placeholder="e.g. Abuja" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.state} onChange={e => setEditItemData({ ...editItemData, state: e.target.value })} /></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Property Address *</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.hotelAddress} onChange={e => setEditItemData({ ...editItemData, hotelAddress: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Units Allocated to Airgo Pool *</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.totalAllocated} onChange={e => setEditItemData({ ...editItemData, totalAllocated: e.target.value })} /></div>
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
                                                        onClick={() => toggleRoomAmenity(amenity, true)}
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
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => { setIsEditInventoryModalOpen(false); setSelectedInventoryForEdit(null); }} className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={isUploading} type="submit" className="px-6 py-2 rounded-xl font-bold text-white bg-[#000080] hover:bg-blue-900 transition">
                                    {isUploading ? 'Saving...' : 'Save Corrections'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT BOOKING DETAILS MODAL */}
            {isEditBookingModalOpen && selectedBookingForEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <h2 className="text-xl font-black text-[#000080]">Correct Reservation Details</h2>
                            <button onClick={() => { setIsEditBookingModalOpen(false); setSelectedBookingForEdit(null); }} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleSaveEditBooking} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Guest Name</label>
                                    <input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editBookingData.clientName} onChange={e => setEditBookingData({ ...editBookingData, clientName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Guest Email</label>
                                    <input required type="email" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editBookingData.clientEmail} onChange={e => setEditBookingData({ ...editBookingData, clientEmail: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Guest Phone</label>
                                    <input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editBookingData.clientPhone} onChange={e => setEditBookingData({ ...editBookingData, clientPhone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Guests Count</label>
                                    <input required type="number" min="1" max="2" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editBookingData.guests} onChange={e => setEditBookingData({ ...editBookingData, guests: Math.min(2, Math.max(1, Number(e.target.value) || 1)) })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Delivery / Hotel Address</label>
                                    <input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editBookingData.deliveryAddress} onChange={e => setEditBookingData({ ...editBookingData, deliveryAddress: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Start Date / Check-In</label>
                                    <input required type="datetime-local" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editBookingData.checkIn} onChange={e => setEditBookingData({ ...editBookingData, checkIn: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">End Date / Check-Out</label>
                                    <input required type="datetime-local" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editBookingData.checkOut} onChange={e => setEditBookingData({ ...editBookingData, checkOut: e.target.value })} />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => { setIsEditBookingModalOpen(false); setSelectedBookingForEdit(null); }} className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={isUploading} type="submit" className="px-6 py-2 rounded-xl font-bold text-white bg-[#000080] hover:bg-blue-900 transition">
                                    {isUploading ? 'Saving...' : 'Apply Modifications'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CONCIERGE BOOKING CREATION MODAL */}
            {isNewBookingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <h2 className="text-xl font-black text-[#000080]">Create New Concierge Booking</h2>
                            <button onClick={() => setIsNewBookingModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleCreateBooking} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Guest Name</label>
                                        <input required type="text" placeholder="e.g. John Doe" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newBookingData.clientName} onChange={e => setNewBookingData({ ...newBookingData, clientName: e.target.value })} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Guest Email (Used to assign account)</label>
                                        <input required type="email" placeholder="e.g. john@example.com" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newBookingData.clientEmail} onChange={e => setNewBookingData({ ...newBookingData, clientEmail: e.target.value })} />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Guest Phone</label>
                                        <input required type="text" placeholder="e.g. +2348012345678" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newBookingData.clientPhone} onChange={e => setNewBookingData({ ...newBookingData, clientPhone: e.target.value })} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Guests Count</label>
                                        <input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newBookingData.guests} onChange={e => setNewBookingData({ ...newBookingData, guests: Math.max(1, Number(e.target.value) || 1) })} />
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-100 pt-2"></div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Asset Category</label>
                                        <select 
                                            className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white"
                                            value={newBookingData.itemType}
                                            onChange={e => {
                                                const type = e.target.value as 'hotel' | 'car';
                                                setNewBookingData({ 
                                                    ...newBookingData, 
                                                    itemType: type,
                                                    itemId: '',
                                                    itemName: '',
                                                    partnerId: '',
                                                    deliveryAddress: ''
                                                });
                                            }}
                                        >
                                            <option value="hotel">🏨 Hotel Stay</option>
                                            <option value="car">🚘 Car Rental</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Select Asset *</label>
                                        <select 
                                            required
                                            className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white"
                                            value={newBookingData.itemId}
                                            onChange={e => handleItemSelection(e.target.value, newBookingData.itemType)}
                                        >
                                            <option value="">-- Choose Asset --</option>
                                            {newBookingData.itemType === 'hotel' ? (
                                                rooms.map(room => (
                                                    <option key={room._id} value={room._id}>{room.hotelName} - {room.name} (₦{(room.pricePerNight || 0).toLocaleString()})</option>
                                                ))
                                            ) : (
                                                cars.map(car => (
                                                    <option key={car._id} value={car._id}>{car.name} (₦{(car.price || 0).toLocaleString()})</option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Start Date / Check-In</label>
                                        <input required type="datetime-local" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newBookingData.checkIn} onChange={e => setNewBookingData({ ...newBookingData, checkIn: e.target.value })} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">End Date / Check-Out</label>
                                        <input required type="datetime-local" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newBookingData.checkOut} onChange={e => setNewBookingData({ ...newBookingData, checkOut: e.target.value })} />
                                    </div>
                                </div>

                                <div className="w-full">
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Delivery / Hotel Location Address</label>
                                    <input required type="text" placeholder="Hotel address or delivery location" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newBookingData.deliveryAddress} onChange={e => setNewBookingData({ ...newBookingData, deliveryAddress: e.target.value })} />
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Total Price (₦) [Optional Override]</label>
                                        <input type="text" placeholder="e.g. 150000 (leaves blank to use default rate)" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newBookingData.totalPrice} onChange={e => setNewBookingData({ ...newBookingData, totalPrice: e.target.value })} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Initial Booking Status</label>
                                        <select 
                                            className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white"
                                            value={newBookingData.status}
                                            onChange={e => setNewBookingData({ ...newBookingData, status: e.target.value })}
                                        >
                                            <option value="Pending Escrow">Pending Escrow</option>
                                            <option value="Paid">Paid (Secured in Escrow)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => setIsNewBookingModalOpen(false)} className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={isUploading} type="submit" className="px-6 py-2 rounded-xl font-bold text-white bg-[#000080] hover:bg-blue-900 transition">
                                    {isUploading ? 'Creating...' : 'Confirm Concierge Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}