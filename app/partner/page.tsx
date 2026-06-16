"use client";

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Chatroom from '../../components/Chatroom';

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

// Simulated Live GPS tracking component for active car rentals for drivers
function LiveDriverTracker({ booking }: { booking: any }) {
    const [progress, setProgress] = useState(0);
    const [speed, setSpeed] = useState(55);
    const [fuel, setFuel] = useState(85);
    const [eta, setEta] = useState(18);
    const [statusText, setStatusText] = useState('Broadcasting Location...');

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setStatusText('Arrived at Destination');
                    setSpeed(0);
                    setEta(0);
                    return 100;
                }
                const next = prev + 1.5;
                setEta(Math.max(1, Math.ceil(18 * (1 - next / 100))));
                return next;
            });
        }, 3000);

        const telemetryInterval = setInterval(() => {
            setSpeed((prev) => {
                if (progress >= 100) return 0;
                const change = Math.floor(Math.random() * 11) - 5;
                return Math.min(80, Math.max(30, prev + change));
            });
            setFuel((prev) => Math.max(10, prev - (Math.random() > 0.8 ? 1 : 0)));
        }, 2000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(telemetryInterval);
        };
    }, [progress]);

    const getCarCoordinates = (p: number) => {
        const t = p / 100;
        const x = (1-t)**3 * 20 + 3 * (1-t)**2 * t * 100 + 3 * (1-t) * t**2 * 200 + t**3 * 280;
        const y = (1-t)**3 * 90 + 3 * (1-t)**2 * t * 10 + 3 * (1-t) * t**2 * 110 + t**3 * 40;
        return { x, y };
    };

    const carPos = getCarCoordinates(progress);

    // Parse delivery address to get To address
    const routeParts = (booking.deliveryAddress || "").split(" | ");
    const toAddress = routeParts[1]?.replace("To:", "").trim() || booking.deliveryAddress || "Client Destination";

    return (
        <div className="w-full mt-4 bg-gray-900 text-white p-5 rounded-2xl border border-gray-800 shadow-inner flex flex-col gap-4 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-3 gap-2">
                <div>
                    <h4 className="text-sm font-black text-green-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                        📡 Driver Live GPS active
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">Status: <span className="text-gray-200 font-bold">{statusText}</span></p>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500 font-bold">Estimated Arrival</p>
                    <p className="text-lg font-black text-[#FFB81C]">{eta > 0 ? `${eta} mins` : 'Arrived'}</p>
                </div>
            </div>

            <div className="relative w-full h-36 bg-gray-950 rounded-xl overflow-hidden border border-gray-800/80">
                <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                    <defs>
                        <pattern id="driver-grid" width="15" height="15" patternUnits="userSpaceOnUse">
                            <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#driver-grid)" />

                    <text x="15" y="110" className="fill-gray-600 font-bold text-[8px] tracking-wider uppercase font-sans">Airgo Depot</text>
                    <text x="110" y="25" className="fill-gray-600 font-bold text-[8px] tracking-wider uppercase font-sans">Wuse II Toll</text>
                    <text x="225" y="110" className="fill-gray-600 font-bold text-[8px] tracking-wider uppercase font-sans">Destination</text>
                    <text x="215" y="25" className="fill-green-400 font-bold text-[8px] tracking-wider uppercase font-sans font-black">Driver Position</text>

                    <path 
                        d="M 20 90 C 100 10, 200 110, 280 40" 
                        fill="none" 
                        stroke="#1f2937" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                    />
                    <path 
                        d="M 20 90 C 100 10, 200 110, 280 40" 
                        fill="none" 
                        stroke="#004A99" 
                        strokeWidth="2.5" 
                        strokeDasharray="4 2"
                        strokeLinecap="round"
                    />

                    <circle cx="20" cy="90" r="5" className="fill-blue-500 stroke-white stroke-2" />
                    <circle cx="280" cy="40" r="5" className="fill-green-500 stroke-white stroke-2 animate-ping" />
                    <circle cx="280" cy="40" r="5" className="fill-green-500 stroke-white stroke-2" />

                    <g transform={`translate(${carPos.x - 6}, ${carPos.y - 6})`}>
                        <circle cx="6" cy="6" r="8" className="fill-green-500/20 stroke-green-500/40 stroke-1 animate-pulse" />
                        <circle cx="6" cy="6" r="4" className="fill-green-400 stroke-white stroke-1" />
                    </g>
                </svg>
                
                <div className="absolute bottom-2 left-2 flex gap-1.5 flex-wrap">
                    <span className="bg-[#000080]/85 text-blue-200 border border-blue-800 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">{booking.rentalType || 'Chauffeur Driven'}</span>
                    <span className="bg-[#FFB81C]/25 text-yellow-200 border border-yellow-800 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">{booking.fuelPlan || 'Self Fueling'}</span>
                    <span className="bg-green-900/80 text-green-200 border border-green-800 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">{booking.travelScope || 'Intra-City'}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800/80">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Speed</span>
                    <span className="text-sm font-black text-gray-200">{speed} km/h</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Fuel Level</span>
                    <span className="text-sm font-black text-gray-200">{fuel}%</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Passenger</span>
                    <span className="text-sm font-black text-[#FFB81C]">{booking.clientName || 'Valued Guest'}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Destination</span>
                    <span className="text-sm font-black text-gray-200 truncate" title={toAddress}>{toAddress}</span>
                </div>
            </div>
        </div>
    );
}

export default function PartnerDashboard() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'bookings' | 'profile' | 'available-requests'>('overview');
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
    const [hasLoadedBookings, setHasLoadedBookings] = useState(false);
    const prevBookingsRef = useRef<any[]>([]);

    const playNotificationSound = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            
            // First chime (D5)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
            
            gain1.gain.setValueAtTime(0.15, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.4);
            
            // Second chime (A5, delayed by 120ms)
            setTimeout(() => {
                try {
                    const osc2 = ctx.createOscillator();
                    const gain2 = ctx.createGain();
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(880, ctx.currentTime);
                    
                    gain2.gain.setValueAtTime(0.15, ctx.currentTime);
                    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                    
                    osc2.connect(gain2);
                    gain2.connect(ctx.destination);
                    osc2.start();
                    osc2.stop(ctx.currentTime + 0.5);
                } catch (e) {}
            }, 120);
        } catch (error) {
            console.error("Failed to play notification sound", error);
        }
    };

    // Unlock Web Audio API on first user interaction to bypass autoplay restrictions
    useEffect(() => {
        const unlockAudio = () => {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    const ctx = new AudioContextClass();
                    if (ctx.state === 'suspended') {
                        ctx.resume();
                    }
                }
            } catch (e) {}
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
        };
        window.addEventListener('click', unlockAudio);
        window.addEventListener('touchstart', unlockAudio);
        return () => {
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
        };
    }, []);

    useEffect(() => {
        if (!hasLoadedBookings) {
            prevBookingsRef.current = myBookings;
            return;
        }

        let shouldPlaySound = false;
        for (const booking of myBookings) {
            const prevBooking = prevBookingsRef.current.find((b: any) => b._id === booking._id);
            if (!prevBooking) {
                // A new booking has arrived!
                shouldPlaySound = true;
                break;
            } else if (
                prevBooking.status !== booking.status ||
                prevBooking.offerStatus !== booking.offerStatus ||
                prevBooking.counterPrice !== booking.counterPrice ||
                prevBooking.totalPrice !== booking.totalPrice
            ) {
                // A booking status or offer status has changed!
                shouldPlaySound = true;
                break;
            }
        }

        if (shouldPlaySound) {
            playNotificationSound();
        }

        prevBookingsRef.current = myBookings;
    }, [myBookings, hasLoadedBookings]);

    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
    const [isResendingEmail, setIsResendingEmail] = useState<string | null>(null);

    // Chatroom states
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatBookingId, setChatBookingId] = useState('');
    const [chatBookingName, setChatBookingName] = useState('');

    // Plate upload states
    const [plateInputs, setPlateInputs] = useState<Record<string, { vehicleNumber?: string; vehiclePlateUrl?: string }>>({});
    const [uploadingBookingId, setUploadingBookingId] = useState<string | null>(null);
    const [isSavingPlate, setIsSavingPlate] = useState<string | null>(null);

    // Offer custom price state inputs
    const [counterInputs, setCounterInputs] = useState<Record<string, string>>({});
    const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);
    const [startingTripId, setStartingTripId] = useState<string | null>(null);

    const [availableRequests, setAvailableRequests] = useState<any[]>([]);
    const [submittingBidId, setSubmittingBidId] = useState<string | null>(null);
    const [bidFares, setBidFares] = useState<Record<string, string>>({});
    const [bidVehicles, setBidVehicles] = useState<Record<string, string>>({});

    // MODAL STATES
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [carImageFiles, setCarImageFiles] = useState<File[]>([]);

    const [newItem, setNewItem] = useState<any>({
        name: '', netPrice: '', retailPrice: '', totalAllocated: '', amenities: '', type: '', capacity: '', features: '', hotelAddress: '', vehicleNumber: '', location: '', state: '', description: ''
    });

    // EDIT INVENTORY MODAL STATE
    const [selectedInventoryForEdit, setSelectedInventoryForEdit] = useState<any>(null);
    const [isEditInventoryModalOpen, setIsEditInventoryModalOpen] = useState(false);
    const [editItemData, setEditItemData] = useState<any>({
        name: '', netPrice: '', retailPrice: '', totalAllocated: '', amenities: '', type: '', capacity: '', features: '', hotelAddress: '', vehicleNumber: '', location: '', state: '', description: ''
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

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        let parsedUser;
        try {
            parsedUser = JSON.parse(userData);
        } catch (e) {
            console.error("Failed to parse user data from localStorage", e);
            router.push('/login');
            return;
        }

        if (!parsedUser || parsedUser.role !== 'partner') {
            toast.error("Unauthorized Access.");
            router.push('/dashboard');
            return;
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
            if (currentPartnerType.toLowerCase().includes('car') || currentPartnerType === 'shuttle' || currentPartnerType === 'airport-shuttle') {
                const carsRes = await fetch(`${apiUrl}/api/cars`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (carsRes.ok) {
                    const allCars = await carsRes.json();
                    setMyInventory(allCars.filter((c: any) => c.partnerId === secureId));
                }
                fetchAvailableRequests();
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
            setHasLoadedBookings(true);
        }
    };

    const fetchAvailableRequests = async () => {
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings/available-requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setAvailableRequests(data);
            }
        } catch (error) {
            console.error("Error fetching available requests:", error);
        }
    };

    const handleSubmitBid = async (bookingId: string) => {
        const fare = bidFares[bookingId];
        const vehicleDetails = bidVehicles[bookingId] || '';

        if (!fare || isNaN(Number(fare)) || Number(fare) <= 0) {
            toast.error("Please enter a valid fare bid amount.");
            return;
        }

        setSubmittingBidId(bookingId);
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/driver-offers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fare: Number(fare),
                    vehicleDetails
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("🎉 Your fare bid has been submitted to the client!");
                // Clear inputs
                setBidFares(prev => ({ ...prev, [bookingId]: '' }));
                setBidVehicles(prev => ({ ...prev, [bookingId]: '' }));
                fetchAvailableRequests();
            } else {
                toast.error(data.message || "Failed to submit fare bid.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        } finally {
            setSubmittingBidId(null);
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
            const isCar = user.partnerType?.toLowerCase().includes('car') || user.partnerType === 'shuttle' || user.partnerType === 'airport-shuttle';

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
                name: newItem.name, 
                type: newItem.type, 
                netPrice: undefined, 
                retailPrice: Number(newItem.retailPrice),
                vehicleCategory: isShuttlePartner ? 'shuttle' : 'car',
                capacity: newItem.capacity, 
                features: newItem.features, 
                totalAllocated: 1,
                image: finalImageUrl, 
                images: finalImageUrls, 
                previewImage: finalImageUrl, 
                partnerId: secureId, 
                vehicleNumber: newItem.vehicleNumber, 
                location: newItem.location, 
                state: newItem.state
            } : {
                partnerId: secureId, hotelName: user.businessName || user.name, hotelAddress: newItem.hotelAddress, name: newItem.name, netPrice: Number(newItem.netPrice), totalAllocated: Number(newItem.totalAllocated), amenities: newItem.amenities, description: newItem.description, image: finalImageUrl, images: finalImageUrls, previewImage: finalImageUrl
            };

            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success(`${(user.partnerType?.toLowerCase().includes('car') || user.partnerType === 'shuttle' || user.partnerType === 'airport-shuttle') ? 'Vehicle/Trip' : 'Tier'} listed successfully!`);
                setIsModalOpen(false);
                setImageFile(null);
                setCarImageFiles([]);
                setNewItem({ name: '', netPrice: '', retailPrice: '', totalAllocated: '', amenities: '', type: '', capacity: '', features: '', hotelAddress: '', vehicleNumber: '', location: '', state: '', description: '' });
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
        const isShuttleOrCar = user?.partnerType === 'shuttle' || user?.partnerType === 'airport-shuttle' || user?.partnerType === 'car';
        setEditItemData({
            name: item.name || '',
            netPrice: isShuttleOrCar ? '' : String(item.netPrice || item.price || item.pricePerNight || ''),
            retailPrice: isShuttleOrCar ? String(item.retailPrice || item.price || '') : '',
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
            const isCar = user.partnerType?.toLowerCase().includes('car') || user.partnerType === 'shuttle' || user.partnerType === 'airport-shuttle';
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const endpoint = isCar ? `/api/cars/${selectedInventoryForEdit._id}` : `/api/rooms/${selectedInventoryForEdit._id}`;

            const payload = isCar ? {
                name: editItemData.name,
                type: editItemData.type,
                netPrice: undefined,
                retailPrice: Number(editItemData.retailPrice),
                vehicleCategory: isShuttlePartner ? 'shuttle' : 'car',
                capacity: editItemData.capacity,
                features: editItemData.features,
                totalAllocated: 1,
                image: editItemData.image,
                images: editItemData.images,
                previewImage: editItemData.previewImage,
                vehicleNumber: editItemData.vehicleNumber,
                location: editItemData.location,
                state: editItemData.state
            } : {
                hotelAddress: editItemData.hotelAddress,
                name: editItemData.name,
                netPrice: Number(editItemData.netPrice),
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
            const isCar = user.partnerType?.toLowerCase().includes('car') || user.partnerType === 'shuttle' || user.partnerType === 'airport-shuttle';
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
            const isCar = user.partnerType?.toLowerCase().includes('car') || user.partnerType === 'shuttle' || user.partnerType === 'airport-shuttle';
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
        return myBookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Archived').reduce((sum, b) => {
            const num = typeof b.totalPrice === 'string' ? parseInt(b.totalPrice.replace(/[^0-9]/g, '')) : b.totalPrice;
            return sum + (num || 0);
        }, 0).toLocaleString();
    };

    const toggleExpand = (id: string) => {
        setExpandedBookingId(expandedBookingId === id ? null : id);
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

    const handleSavePlateInfo = async (bookingId: string) => {
        setIsSavingPlate(bookingId);
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const inputData = plateInputs[bookingId] || {};
            
            const payload: any = {};
            if (inputData.vehicleNumber !== undefined) payload.vehicleNumber = inputData.vehicleNumber;
            if (inputData.vehiclePlateUrl !== undefined) payload.vehiclePlateUrl = inputData.vehiclePlateUrl;
            
            payload.vehiclePlateStatus = 'Pending';

            const res = await fetch(`${apiUrl}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("License plate details saved! Verification pending.");
                fetchPartnerData(user);
            } else {
                toast.error(data.message || "Failed to save plate details.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        } finally {
            setIsSavingPlate(null);
        }
    };

    const handlePartnerOfferAction = async (bookingId: string, action: 'Accept' | 'Reject' | 'Counter', counterVal?: string) => {
        setUpdatingOfferId(bookingId);
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            
            const payload: any = {};
            if (action === 'Accept') {
                payload.offerStatus = 'Accepted';
            } else if (action === 'Reject') {
                payload.offerStatus = 'Rejected';
            } else if (action === 'Counter') {
                payload.offerStatus = 'Pending Client';
                payload.counterPrice = Number(counterVal).toLocaleString();
            }

            const res = await fetch(`${apiUrl}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                if (action === 'Accept') {
                    toast.success("Offer accepted! Waiting for client payment.");
                } else if (action === 'Reject') {
                    toast.success("Offer declined. Booking cancelled.");
                } else if (action === 'Counter') {
                    toast.success(`Counter offer of ₦${Number(counterVal).toLocaleString()} sent to client!`);
                }
                const userData = localStorage.getItem('airgo_user');
                if (userData) {
                    fetchPartnerData(JSON.parse(userData));
                }
            } else {
                toast.error(data.message || "Failed to update offer status.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        } finally {
            setUpdatingOfferId(null);
        }
    };

    const handleStartTrip = async (bookingId: string) => {
        if (!window.confirm("Are you sure you want to start this trip? Both the client and Airgo will be notified by email.")) {
            return;
        }
        setStartingTripId(bookingId);
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/start-trip`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "Trip started! Notifications sent.");
                const userData = localStorage.getItem('airgo_user');
                if (userData) {
                    fetchPartnerData(JSON.parse(userData));
                }
            } else {
                toast.error(data.message || "Failed to start trip.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        } finally {
            setStartingTripId(null);
        }
    };

    const handleConfirmEndTrip = async (bookingId: string) => {
        if (!window.confirm("Are you sure you want to confirm that the trip has ended?")) {
            return;
        }
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/confirm-end-trip`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Trip completed and booking finalized!");
                const userData = localStorage.getItem('airgo_user');
                if (userData) {
                    fetchPartnerData(JSON.parse(userData));
                }
            } else {
                toast.error(data.message || "Failed to confirm trip end.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        }
    };

    const isCarPartner = user?.partnerType?.toLowerCase().includes('car') || user?.partnerType === 'shuttle' || user?.partnerType === 'airport-shuttle';
    const isShuttlePartner = user?.partnerType === 'shuttle' || user?.partnerType === 'airport-shuttle';
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
    const totalRentalDays = isCarPartner ? myBookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Archived').reduce((sum, b) => {
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
                <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-200 max-w-md w-full flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-50 text-[#004A99] rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-[#004A99] animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
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
                            {isApartmentPartner ? 'Apartment Host' : isShuttlePartner ? 'Shuttle Operator' : isCarPartner ? 'Fleet Manager' : 'Hotelier'}
                        </p>
                    </Link>
                    <button className="md:hidden text-blue-200 text-xl" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${activeTab === 'overview' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800 text-white'}`}>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                        </svg>
                        Dashboard
                    </button>
                    <button onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${activeTab === 'inventory' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800 text-white'}`}>
                        {isCarPartner ? (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.321-5.128a3.375 3.375 0 00-3.37-3.164H5.056m14.238 5.4H4.5m14.512-5.4l-.569-2.28A2.25 2.25 0 0016.26 6H7.74a2.25 2.25 0 00-2.182 1.72l-.569 2.28m11.268 0A3 3 0 1112 9a3 3 0 012.27 1.002z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21h10.5V3.75c0-.621-.504-1.125-1.125-1.125H7.875A1.125 1.125 0 006.75 3.75V21z" />
                            </svg>
                        )}
                        <span>{isShuttlePartner ? 'My Shuttle Trips' : isCarPartner ? 'My Fleet' : isApartmentPartner ? 'My Apartments' : 'Room Categories'}</span>
                    </button>
                    <button onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${activeTab === 'bookings' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800 text-white'}`}>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                        </svg>
                        Reservations
                    </button>
                    {isCarPartner && (
                        <button onClick={() => { setActiveTab('available-requests'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${activeTab === 'available-requests' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800 text-white'}`}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Available Requests</span>
                        </button>
                    )}
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
                    }} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${activeTab === 'profile' ? 'bg-[#FFB81C] text-[#004A99]' : 'hover:bg-blue-800 text-white'}`}>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        My Profile
                    </button>
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
                            ? (isShuttlePartner ? 'Airport Shuttle Panel' : isCarPartner ? 'Fleet Control Panel' : isApartmentPartner ? 'Apartment Host Panel' : 'Property Management Panel') 
                            : activeTab === 'inventory' 
                                ? (isShuttlePartner ? 'Airport Shuttle Routes' : isCarPartner ? 'My Fleet Matrix' : isApartmentPartner ? 'Apartments Catalog' : 'Room Categories') 
                                : activeTab === 'profile' 
                                    ? 'My Profile Settings' 
                                    : activeTab === 'available-requests'
                                        ? 'Available Ride Requests'
                                        : activeTab}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Verified Partner</span>
                        <div className="w-10 h-10 bg-[#004A99] rounded-full flex items-center justify-center text-white font-black shadow-inner">{user?.name?.charAt(0) || 'P'}</div>
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
                                            + Configure {isShuttlePartner ? 'Shuttle Trip' : isCarPartner ? 'Vehicle' : isApartmentPartner ? 'Apartment Unit' : 'Room Tier'}
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
                                                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {item.hotelAddress}
                                                            </p>
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

                                                        {!isCarPartner && (
                                                            <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg mb-3">
                                                                <span className="text-xs font-bold text-gray-600">Airgo Pool Allocation (Available Today)</span>
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
                                                        )}

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
                                                                 <div className="w-16 h-16 bg-blue-50 text-[#004A99] rounded-full flex items-center justify-center mx-auto mb-4">
                                                                     <svg className="w-8 h-8 text-[#004A99]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                                         <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                                     </svg>
                                                                 </div>
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
                                                                             : booking.status === 'Trip Start Pending'
                                                                                 ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                                                                 : booking.status === 'Trip Started'
                                                                                     ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                                     : booking.status === 'Trip End Pending'
                                                                                         ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                                         : booking.status === 'Completed'
                                                                                             ? 'bg-gray-100 text-gray-800 border border-gray-200'
                                                                                             : 'bg-green-100 text-green-800'
                                                                 }`}>
                                                                     {booking.status}
                                                                 </span>
                                                            </td>
                                                        </tr>
                                                        {expandedBookingId === booking._id && (
                                                            <tr className="bg-gray-50 border-b border-gray-200 shadow-inner">
                                                                <td colSpan={4} className="p-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                                                                            {booking.itemType === 'car' && (
                                                                                <>
                                                                                    <p className="text-xs text-gray-500 font-bold mt-1">Phone: {booking.clientPhone || 'N/A'}</p>
                                                                                    <p className="text-xs text-gray-500 font-bold mt-1">Email: {booking.clientEmail || 'N/A'}</p>
                                                                                    {booking.deliveryAddress && (
                                                                                        <div className="mt-2 bg-white p-2.5 rounded-xl border border-gray-200">
                                                                                            <p className="text-[9px] uppercase font-extrabold text-gray-400 mb-1">Route / Address</p>
                                                                                            {booking.deliveryAddress.includes('From:') ? (
                                                                                                (() => {
                                                                                                    const parts = booking.deliveryAddress.split(' | ');
                                                                                                    const fromVal = parts[0]?.replace('From:', '').trim() || 'N/A';
                                                                                                    const toVal = parts[1]?.replace('To:', '').trim() || 'N/A';
                                                                                                    return (
                                                                                                        <>
                                                                                                            <p className="text-xs text-gray-700 font-semibold"><span className="text-green-600 font-bold">From:</span> {fromVal}</p>
                                                                                                            <p className="text-xs text-gray-700 font-semibold mt-1"><span className="text-red-500 font-bold">To:</span> {toVal}</p>
                                                                                                        </>
                                                                                                    );
                                                                                                })()
                                                                                            ) : (
                                                                                                <p className="text-xs text-gray-700 font-semibold">{booking.deliveryAddress}</p>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Exact Timeframe</p>
                                                                            <p className="text-xs font-bold text-green-700">In / Out: {formatDisplayDate(booking.checkIn, booking.itemType)}</p>
                                                                            <p className="text-xs font-bold text-red-700 mt-1">Out / Return: {formatDisplayDate(booking.checkOut, booking.itemType)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Reserved At</p>
                                                                            <p className="text-xs text-gray-700 font-bold">{booking.createdAt ? new Date(booking.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</p>
                                                                        </div>
                                                                        <div>
                                                                             <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Actions</p>
                                                                             <button
                                                                                 onClick={() => handleResendEmail(booking._id)}
                                                                                 disabled={isResendingEmail === booking._id}
                                                                                 className="text-[10px] font-black bg-blue-50 text-[#000080] px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition disabled:opacity-50 mt-1 flex items-center gap-1.5 w-full justify-center"
                                                                             >
                                                                                 <svg className="w-3.5 h-3.5 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                                                     <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                                                 </svg>
                                                                                 {isResendingEmail === booking._id ? 'Resending...' : 'Resend Email'}
                                                                             </button>
                                                                             {booking.status !== 'Cancelled' && booking.status !== 'Archived' && (
                                                                                 <button
                                                                                     onClick={() => {
                                                                                         setChatBookingId(booking._id);
                                                                                         setChatBookingName(booking.itemName);
                                                                                         setIsChatOpen(true);
                                                                                     }}
                                                                                     className="text-[10px] font-black bg-yellow-50 text-[#000080] px-3 py-2 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition mt-1.5 flex items-center gap-1.5 cursor-pointer w-full justify-center"
                                                                                 >
                                                                                     <svg className="w-3.5 h-3.5 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                                                         <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.596.596 0 01-.737-.556 5.996 5.996 0 011.085-3.22C4.167 15.68 3 13.98 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                                                                     </svg>
                                                                                     Chatroom
                                                                                 </button>
                                                                             )}
                                                                             {booking.itemType === 'car' && ['Paid', 'Approved for Disbursement', 'Confirmed', 'Pending Escrow'].includes(booking.status) && (
                                                                                 <button
                                                                                     onClick={() => handleStartTrip(booking._id)}
                                                                                     disabled={startingTripId === booking._id}
                                                                                     className="text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition disabled:opacity-50 mt-1.5 flex items-center gap-1.5 w-full justify-center shadow-sm cursor-pointer"
                                                                                 >
                                                                                     <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                                                                         <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-8.22-.07l-.02-.02a6 6 0 010-8.56L10.05 3V1h1.74v2l2.7 2.72a6 6 0 010 8.65z" />
                                                                                         <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                                                                     </svg>
                                                                                     {startingTripId === booking._id ? 'Starting...' : 'Start Trip'}
                                                                                 </button>
                                                                             )}
                                                                             {booking.itemType === 'car' && booking.status === 'Trip Start Pending' && (
                                                                                 <div className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-3 py-2 rounded-lg mt-1.5 flex items-center gap-1.5 w-full justify-center border border-indigo-200">
                                                                                     <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                                                                     Awaiting Client Start Confirmation
                                                                                 </div>
                                                                             )}
                                                                             {booking.itemType === 'car' && booking.status === 'Trip Started' && (
                                                                                 <div className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-3 py-2 rounded-lg mt-1.5 flex items-center gap-1.5 w-full justify-center border border-emerald-200">
                                                                                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                                     Trip In Progress
                                                                                 </div>
                                                                             )}
                                                                             {booking.itemType === 'car' && booking.status === 'Trip End Pending' && (
                                                                                 <button
                                                                                     onClick={() => handleConfirmEndTrip(booking._id)}
                                                                                     className="text-[10px] font-black bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg transition mt-1.5 flex items-center gap-1.5 w-full justify-center shadow-sm cursor-pointer"
                                                                                 >
                                                                                     <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                                                                         <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                     </svg>
                                                                                     Confirm Trip End
                                                                                 </button>
                                                                             )}
                                                                         </div>
                                                                    </div>

                                                                    {booking.itemType === 'car' && ['Trip Started', 'Trip End Pending'].includes(booking.status) && (
                                                                        <div className="border-t border-gray-200/80 pt-4 mt-4">
                                                                            <LiveDriverTracker booking={booking} />
                                                                        </div>
                                                                    )}

                                                                    {booking.isOffer && (
                                                                        <div className="border-t border-gray-200/80 pt-4 mt-4 bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-sans">
                                                                                        Indrive Bidding Flow
                                                                                    </span>
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                                                                                </div>
                                                                                <div className="space-y-1 text-left">
                                                                                    <p className="text-sm font-medium text-slate-800">
                                                                                        Client Custom Bid: <span className="font-extrabold text-purple-700">₦{Number(booking.offeredPrice?.replace(/[^0-9.-]+/g,"") || 0).toLocaleString()}</span>
                                                                                    </p>
                                                                                    {booking.offerStatus === 'Pending Partner' && (
                                                                                        <p className="text-xs text-slate-500 font-bold">
                                                                                            Action Required: Review the client's price offer. You can accept, decline, or counter.
                                                                                        </p>
                                                                                    )}
                                                                                    {booking.offerStatus === 'Pending Client' && (
                                                                                        <p className="text-xs text-amber-700 font-bold">
                                                                                            Waiting for client response to your counter offer of <span className="font-black">₦{Number(booking.counterPrice?.replace(/[^0-9.-]+/g,"") || 0).toLocaleString()}</span>.
                                                                                        </p>
                                                                                    )}
                                                                                    {booking.offerStatus === 'Accepted' && (
                                                                                        <p className="text-xs text-green-700 font-bold">
                                                                                            Offer accepted at ₦{Number(booking.totalPrice?.replace(/[^0-9.-]+/g,"") || 0).toLocaleString()}! Waiting for payment escrow.
                                                                                        </p>
                                                                                    )}
                                                                                    {booking.offerStatus === 'Rejected' && (
                                                                                        <p className="text-xs text-rose-600 font-bold">
                                                                                            Offer declined and booking cancelled.
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {booking.offerStatus === 'Pending Partner' && (
                                                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                                                                                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
                                                                                        <span className="text-xs font-bold text-gray-500">₦</span>
                                                                                        <input
                                                                                            type="number"
                                                                                            placeholder="Counter price..."
                                                                                            className="w-28 text-xs text-gray-900 focus:outline-none font-bold bg-white"
                                                                                            value={counterInputs[booking._id] || ''}
                                                                                            onChange={(e) => setCounterInputs({
                                                                                                ...counterInputs,
                                                                                                [booking._id]: e.target.value
                                                                                            })}
                                                                                        />
                                                                                    </div>
                                                                                    <button
                                                                                        disabled={updatingOfferId === booking._id}
                                                                                        onClick={() => {
                                                                                            const val = counterInputs[booking._id];
                                                                                            if (!val || Number(val) <= 0) {
                                                                                                toast.error("Please enter a valid counter price.");
                                                                                                return;
                                                                                            }
                                                                                            handlePartnerOfferAction(booking._id, 'Counter', val);
                                                                                        }}
                                                                                        style={{ backgroundColor: '#6b21a8' }}
                                                                                        className="hover:bg-purple-800 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1"
                                                                                    >
                                                                                        Counter Bid
                                                                                    </button>
                                                                                    <button
                                                                                        disabled={updatingOfferId === booking._id}
                                                                                        onClick={() => handlePartnerOfferAction(booking._id, 'Accept')}
                                                                                        className="bg-[#004A99] hover:bg-blue-800 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1"
                                                                                    >
                                                                                        Accept Bid
                                                                                    </button>
                                                                                    <button
                                                                                        disabled={updatingOfferId === booking._id}
                                                                                        onClick={() => handlePartnerOfferAction(booking._id, 'Reject')}
                                                                                        className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs px-4.5 py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center"
                                                                                    >
                                                                                        Reject
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {booking.itemType === 'car' && (
                                                                        <div className="border-t border-gray-200/80 pt-4 mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                                                            {/* Left column: Plate Info & Verification Status */}
                                                                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">License Plate Verification</h4>
                                                                                <div className="space-y-2">
                                                                                    <p className="text-xs font-medium text-slate-600">
                                                                                        <span className="font-bold text-slate-950">Current Plate:</span> {booking.vehicleNumber || 'Not assigned'}
                                                                                    </p>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-xs font-bold text-slate-600">Status:</span>
                                                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                                                            booking.vehiclePlateStatus === 'Verified' ? 'bg-green-100 text-green-800' :
                                                                                            booking.vehiclePlateStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                                                            booking.vehiclePlateUrl ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                                                        }`}>
                                                                                            {booking.vehiclePlateStatus === 'Verified' ? 'Verified' :
                                                                                             booking.vehiclePlateStatus === 'Rejected' ? 'Rejected' :
                                                                                             booking.vehiclePlateUrl ? 'Pending Verification' : 'No Photo Uploaded'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                {booking.vehiclePlateUrl && (
                                                                                    <div className="mt-3">
                                                                                        <a href={booking.vehiclePlateUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#004A99] hover:underline">
                                                                                            <svg className="w-3.5 h-3.5 text-[#004A99]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                                                                            </svg>
                                                                                            View Uploaded Plate Photo
                                                                                        </a>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {/* Right columns: Update/Upload Form */}
                                                                            <div className="md:col-span-2 space-y-4">
                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                                    <div>
                                                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Plate Number</label>
                                                                                        <input 
                                                                                            type="text" 
                                                                                            placeholder="e.g. ABJ-888-GW" 
                                                                                            className="w-full px-3 py-1.5 border rounded-xl text-xs text-gray-900 bg-white" 
                                                                                            value={plateInputs[booking._id]?.vehicleNumber !== undefined ? plateInputs[booking._id].vehicleNumber : (booking.vehicleNumber || '')}
                                                                                            onChange={(e) => setPlateInputs({
                                                                                                ...plateInputs,
                                                                                                [booking._id]: {
                                                                                                    ...plateInputs[booking._id],
                                                                                                    vehicleNumber: e.target.value
                                                                                                }
                                                                                            })}
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Upload Plate Photo</label>
                                                                                        <input 
                                                                                            type="file" 
                                                                                            accept="image/*" 
                                                                                            className="w-full px-3 py-1 border rounded-xl file:mr-2 file:py-0.5 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:bg-blue-50 file:text-[#004A99] text-[10px] text-gray-900 bg-white"
                                                                                            onChange={async (e) => {
                                                                                                const file = e.target.files?.[0];
                                                                                                if (!file) return;
                                                                                                try {
                                                                                                    setUploadingBookingId(booking._id);
                                                                                                    const url = await handleUploadToCloudinary(file);
                                                                                                    setPlateInputs({
                                                                                                        ...plateInputs,
                                                                                                        [booking._id]: {
                                                                                                            ...plateInputs[booking._id],
                                                                                                            vehiclePlateUrl: url
                                                                                                        }
                                                                                                    });
                                                                                                    toast.success("Plate photo uploaded! Remember to click Save.");
                                                                                                } catch (err) {
                                                                                                    toast.error("Failed to upload image. Please try again.");
                                                                                                } finally {
                                                                                                    setUploadingBookingId(null);
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex justify-end gap-2">
                                                                                    <button
                                                                                        type="button"
                                                                                        disabled={uploadingBookingId === booking._id || isSavingPlate === booking._id}
                                                                                        onClick={() => handleSavePlateInfo(booking._id)}
                                                                                        className="bg-[#004A99] hover:bg-blue-800 text-white font-bold text-[11px] py-1.5 px-4 rounded-xl shadow transition disabled:opacity-50"
                                                                                    >
                                                                                        {uploadingBookingId === booking._id ? 'Uploading...' :
                                                                                         isSavingPlate === booking._id ? 'Saving...' : 'Save Plate Info'}
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
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
                            {/* AVAILABLE REQUESTS TAB */}
                            {activeTab === 'available-requests' && isCarPartner && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <h2 className="text-lg font-black text-gray-900">Available Ride Requests</h2>
                                        <button onClick={fetchAvailableRequests} className="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 transition cursor-pointer">
                                            Refresh List
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {availableRequests.length === 0 ? (
                                            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-gray-500 text-sm font-medium">No available ride requests at the moment. You'll receive dispatches here when clients request a ride.</p>
                                            </div>
                                        ) : (
                                            availableRequests.map((req: any) => {
                                                const secureUserId = user.id || user.userId || user._id;
                                                const hasSubmittedBid = req.driverOffers?.some((o: any) => o.driverId === secureUserId);
                                                const myBid = req.driverOffers?.find((o: any) => o.driverId === secureUserId);

                                                return (
                                                    <div key={req._id} className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md transition">
                                                        <div className="space-y-2 flex-1 text-left">
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-[#000080] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Ride Request</span>
                                                                <span className="text-xs text-gray-400 font-medium">Ref: {req._id.toString().substring(0, 8).toUpperCase()}</span>
                                                            </div>
                                                            <h3 className="text-lg font-black text-[#004A99]">{req.itemName}</h3>
                                                            
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 font-medium">
                                                                <p><span className="font-bold text-gray-800">Client:</span> {req.clientName || 'Guest'}</p>
                                                                <p><span className="font-bold text-gray-800">Phone:</span> {req.clientPhone || 'N/A'}</p>
                                                                <p><span className="font-bold text-gray-800">Pickup:</span> {req.checkIn ? formatDisplayDate(req.checkIn, req.itemType) : 'N/A'}</p>
                                                                <p><span className="font-bold text-gray-800">Return:</span> {req.checkOut ? formatDisplayDate(req.checkOut, req.itemType) : 'N/A'}</p>
                                                            </div>
                                                            <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">Route:</span> {req.deliveryAddress?.replace('From: ', '').replace(' | To: ', ' ➔ ')}</p>
                                                        </div>

                                                        <div className="w-full md:w-80 bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm space-y-4 shrink-0 text-left">
                                                            {hasSubmittedBid ? (
                                                                <div className="space-y-3">
                                                                    <div className="bg-green-50 border border-green-200 p-3 rounded-xl text-center">
                                                                        <p className="text-xs font-bold text-green-800">Your Bid is Active</p>
                                                                        <p className="text-2xl font-black text-[#000080] mt-1">₦{myBid.fare.toLocaleString()}</p>
                                                                        {myBid.vehicleDetails && <p className="text-[10px] text-gray-500 mt-0.5">{myBid.vehicleDetails}</p>}
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Update / Resubmit Bid (₦)</label>
                                                                        <div className="flex gap-2">
                                                                            <input
                                                                                type="number"
                                                                                placeholder="New fare"
                                                                                className="flex-1 px-3 py-2 border rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:border-[#004A99] outline-none transition"
                                                                                value={bidFares[req._id] || ''}
                                                                                onChange={(e) => setBidFares(prev => ({ ...prev, [req._id]: e.target.value }))}
                                                                            />
                                                                            <button
                                                                                onClick={() => handleSubmitBid(req._id)}
                                                                                disabled={submittingBidId === req._id}
                                                                                className="bg-[#004A99] hover:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50 cursor-pointer"
                                                                            >
                                                                                {submittingBidId === req._id ? '...' : 'Update'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    <div className="text-left">
                                                                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">Submit Fare Bid</h4>
                                                                        <p className="text-[10px] text-gray-400 font-medium">Negotiate price with the client</p>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <div>
                                                                            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">PROPOSED FARE (₦)</label>
                                                                            <input
                                                                                type="number"
                                                                                placeholder="e.g. 120000"
                                                                                className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:border-[#004A99] outline-none transition font-semibold"
                                                                                value={bidFares[req._id] || ''}
                                                                                onChange={(e) => setBidFares(prev => ({ ...prev, [req._id]: e.target.value }))}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">VEHICLE DETAILS (Optional)</label>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="e.g. Toyota Prado Black"
                                                                                className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:border-[#004A99] outline-none transition font-medium"
                                                                                value={bidVehicles[req._id] || ''}
                                                                                onChange={(e) => setBidVehicles(prev => ({ ...prev, [req._id]: e.target.value }))}
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleSubmitBid(req._id)}
                                                                            disabled={submittingBidId === req._id}
                                                                            className="w-full bg-[#004A99] hover:bg-blue-800 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
                                                                        >
                                                                            {submittingBidId === req._id ? 'Submitting Bid...' : 'Submit Bid Offer'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
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

                                            {(!user.partnerType?.toLowerCase().includes('car') && user.partnerType !== 'shuttle' && user.partnerType !== 'airport-shuttle') && (
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
                            <h2 className="text-xl font-black text-[#004A99]">List New {isShuttlePartner ? 'Shuttle Trip' : isCarPartner ? 'Vehicle' : isApartmentPartner ? 'Apartment' : 'Room Tier'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleAddItem} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Name / Title</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} /></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">
                                        {isShuttlePartner || isCarPartner ? 'Retail Price (What the Customer Pays ₦)' : 'Retail Price per night (₦)'}
                                    </label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="0" 
                                        className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" 
                                        value={isShuttlePartner || isCarPartner ? (newItem.retailPrice || '') : (newItem.netPrice || '')} 
                                        onChange={e => {
                                            if (isShuttlePartner || isCarPartner) {
                                                setNewItem({ ...newItem, retailPrice: e.target.value, netPrice: '' });
                                            } else {
                                                setNewItem({ ...newItem, netPrice: e.target.value, retailPrice: '' });
                                            }
                                        }} 
                                    />
                                    <span className="text-[10px] text-gray-400 font-medium block mt-1">
                                        {isShuttlePartner 
                                            ? 'Airgo will automatically deduct a 10% dispatch fee from this retail price.' 
                                            : isCarPartner 
                                                ? 'Airgo will automatically deduct an 11% platform commission from this retail price.' 
                                                : '0% commission. Your take-home payout is 100% of this amount.'}
                                    </span>
                                </div>
                            </div>

                            {isCarPartner ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Type (e.g. SUV, Sedan)</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Capacity (Seats)</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.capacity} onChange={e => setNewItem({ ...newItem, capacity: e.target.value })} /></div>
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Features</label><input required type="text" placeholder="e.g. Wi-Fi, Bluetooth" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={newItem.features} onChange={e => setNewItem({ ...newItem, features: e.target.value })} /></div>
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
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">
                                        {isShuttlePartner || isCarPartner ? 'Retail Price (What the Customer Pays ₦)' : 'Retail Price per night (₦)'}
                                    </label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="0" 
                                        className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" 
                                        value={isShuttlePartner || isCarPartner ? (editItemData.retailPrice || '') : (editItemData.netPrice || '')} 
                                        onChange={e => {
                                            if (isShuttlePartner || isCarPartner) {
                                                setEditItemData({ ...editItemData, retailPrice: e.target.value, netPrice: '' });
                                            } else {
                                                setEditItemData({ ...editItemData, netPrice: e.target.value, retailPrice: '' });
                                            }
                                        }} 
                                    />
                                    <span className="text-[10px] text-gray-400 font-medium block mt-1">
                                        {isShuttlePartner 
                                            ? 'Airgo will automatically deduct a 10% dispatch fee from this retail price.' 
                                            : isCarPartner 
                                                ? 'Airgo will automatically deduct an 11% platform commission from this retail price.' 
                                                : '0% commission. Your take-home payout is 100% of this amount.'}
                                    </span>
                                </div>
                            </div>

                            {isCarPartner ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Type (e.g. SUV, Sedan)</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.type} onChange={e => setEditItemData({ ...editItemData, type: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Capacity (Seats)</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.capacity} onChange={e => setEditItemData({ ...editItemData, capacity: e.target.value })} /></div>
                                    <div className="col-span-2"><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Features</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900 bg-white" value={editItemData.features} onChange={e => setEditItemData({ ...editItemData, features: e.target.value })} /></div>
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

            {/* CHATROOM MODAL */}
            {isChatOpen && chatBookingId && (
                <Chatroom
                    isOpen={isChatOpen}
                    onClose={() => {
                        setIsChatOpen(false);
                        setChatBookingId('');
                        setChatBookingName('');
                    }}
                    bookingId={chatBookingId}
                    bookingName={chatBookingName}
                    currentUser={user}
                />
            )}
        </div>
    );
}