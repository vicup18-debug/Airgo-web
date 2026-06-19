"use client";

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

interface CarBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    car: any;
    initialCheckIn?: string;
    initialCheckOut?: string;
    initialFromAddress?: string;
    initialToAddress?: string;
    initialPickupCoords?: [number, number] | null;
    initialDestCoords?: [number, number] | null;
    initialCity?: string;
}

export default function CarBookingModal({ isOpen, onClose, car, initialCheckIn, initialCheckOut, initialFromAddress, initialToAddress, initialPickupCoords, initialDestCoords, initialCity }: CarBookingModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(2);
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    const [bookingDetails, setBookingDetails] = useState({
        name: '',
        email: '',
        phone: '',
        fromAddress: '',
        toAddress: '',
        checkIn: '',
        checkOut: ''
    });

    const rentalType = 'Self Drive';
    const fuelPlan = 'Self Fueling';
    const [travelScope, setTravelScope] = useState<'Intra-City' | 'Inter-State'>('Intra-City');
    const [isCustomOffer, setIsCustomOffer] = useState(false);
    const [customOfferPrice, setCustomOfferPrice] = useState('');

    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

    // Leaflet map states
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
    const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
    const [pickupCity, setPickupCity] = useState('');
    const [distance, setDistance] = useState<number>(0);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const routeLineRef = useRef<any>(null);

    // Location search states
    const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
    const [toSuggestions, setToSuggestions] = useState<any[]>([]);
    const [isSearchingFrom, setIsSearchingFrom] = useState(false);
    const [isSearchingTo, setIsSearchingTo] = useState(false);

    // Real-time matchmaking states
    const [socket, setSocket] = useState<any>(null);
    const [createdBookingId, setCreatedBookingId] = useState<string>('');
    const [matchingBids, setMatchingBids] = useState<any[]>([]);
    const [radarCountdown, setRadarCountdown] = useState(60);

    // Haversine formula for distance in km
    const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(1));
    };

    // Load Leaflet resources dynamically
    useEffect(() => {
        if (isOpen) {
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }
            if (!window.hasOwnProperty('L')) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => setLeafletLoaded(true);
                document.body.appendChild(script);
            } else {
                setLeafletLoaded(true);
            }
        }
    }, [isOpen]);

    // Setup map routing visualizer
    useEffect(() => {
        if (!leafletLoaded || !isOpen || step !== 2 || typeof window === 'undefined') return;
        const L = (window as any).L;
        if (!L) return;

        const mapContainer = document.getElementById('booking-map');
        if (!mapContainer) return;

        if (!mapRef.current) {
            mapRef.current = L.map('booking-map').setView([9.0820, 8.6753], 6); // default to Nigeria center
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapRef.current);
        }

        const map = mapRef.current;

        // Clean layers
        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];
        if (routeLineRef.current) {
            map.removeLayer(routeLineRef.current);
            routeLineRef.current = null;
        }

        const newMarkers: any[] = [];
        if (pickupCoords) {
            const m = L.marker(pickupCoords, {
                icon: L.divIcon({
                    html: `<div class="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center border-2 border-white shadow-lg text-xs font-black font-sans">A</div>`,
                    className: '',
                    iconSize: [28, 28],
                    iconAnchor: [14, 28]
                })
            }).addTo(map);
            newMarkers.push(m);
        }

        if (destCoords) {
            const m = L.marker(destCoords, {
                icon: L.divIcon({
                    html: `<div class="bg-[#000080] text-white rounded-full w-7 h-7 flex items-center justify-center border-2 border-white shadow-lg text-xs font-black font-sans">B</div>`,
                    className: '',
                    iconSize: [28, 28],
                    iconAnchor: [14, 28]
                })
            }).addTo(map);
            newMarkers.push(m);
        }

        markersRef.current = newMarkers;

        if (pickupCoords && destCoords) {
            const routeLine = L.polyline([pickupCoords, destCoords], {
                color: '#000080',
                weight: 4,
                opacity: 0.85,
                dashArray: '5, 10'
            }).addTo(map);
            routeLineRef.current = routeLine;

            const bounds = L.latLngBounds([pickupCoords, destCoords]);
            map.fitBounds(bounds, { padding: [30, 30] });

            const dist = calculateHaversineDistance(pickupCoords[0], pickupCoords[1], destCoords[0], destCoords[1]);
            setDistance(dist);
        } else if (pickupCoords) {
            map.setView(pickupCoords, 14);
            setDistance(0);
        } else if (destCoords) {
            map.setView(destCoords, 14);
            setDistance(0);
        }
    }, [leafletLoaded, pickupCoords, destCoords, step, isOpen]);

    // Handle WebSocket real-time bid updates
    useEffect(() => {
        if (step !== 3 || !createdBookingId) return;

        const token = localStorage.getItem('airgo_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
        
        const socketInstance = io(apiUrl, {
            transports: ['websocket', 'polling']
        });
        
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            socketInstance.emit('join_booking', { bookingId: createdBookingId });
            console.log(`📡 WebSocket: Client joined live matching room booking_${createdBookingId}`);
        });

        socketInstance.on('new_driver_bid', (data: any) => {
            if (data && data.driverOffers) {
                setMatchingBids(data.driverOffers);
                toast.success("🚗 New driver bid received live!");
            }
        });

        socketInstance.on('booking_updated', (booking: any) => {
            if (booking.offerStatus === 'Accepted') {
                toast.success("🎉 Offer accepted! Redirecting to checkout.");
                handleClose();
                router.push('/dashboard');
            }
        });

        setRadarCountdown(60);
        const timer = setInterval(() => {
            setRadarCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            socketInstance.disconnect();
            clearInterval(timer);
        };
    }, [step, createdBookingId]);

    // Nominatim autocomplete timeouts
    const searchTimeoutFrom = useRef<any>(null);
    const searchTimeoutTo = useRef<any>(null);

    const debouncedSearchFrom = (val: string) => {
        if (searchTimeoutFrom.current) clearTimeout(searchTimeoutFrom.current);
        searchTimeoutFrom.current = setTimeout(() => {
            fetchLocationSuggestions(val, 'from');
        }, 600);
    };

    const debouncedSearchTo = (val: string) => {
        if (searchTimeoutTo.current) clearTimeout(searchTimeoutTo.current);
        searchTimeoutTo.current = setTimeout(() => {
            fetchLocationSuggestions(val, 'to');
        }, 600);
    };

    const fetchLocationSuggestions = async (query: string, field: 'from' | 'to') => {
        if (query.trim().length < 3) {
            if (field === 'from') setFromSuggestions([]);
            else setToSuggestions([]);
            return;
        }
        if (field === 'from') setIsSearchingFrom(true);
        else setIsSearchingTo(true);

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ng&limit=5&addressdetails=1`);
            if (res.ok) {
                const data = await res.json();
                if (field === 'from') setFromSuggestions(data);
                else setToSuggestions(data);
            }
        } catch (err) {
            console.error("Nominatim search error", err);
        } finally {
            if (field === 'from') setIsSearchingFrom(false);
            else setIsSearchingTo(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const storedUser = localStorage.getItem('airgo_user');
            let name = '';
            let email = '';
            let phone = '';
            if (storedUser) {
                const u = JSON.parse(storedUser);
                name = u.name || '';
                email = u.email || '';
                phone = u.phone || '';
            }
            
            let formattedCheckIn = '';
            if (initialCheckIn) {
                formattedCheckIn = initialCheckIn.includes('T') ? initialCheckIn.substring(0, 16) : `${initialCheckIn}T09:00`;
            }
            let formattedCheckOut = '';
            if (initialCheckOut) {
                formattedCheckOut = initialCheckOut.includes('T') ? initialCheckOut.substring(0, 16) : `${initialCheckOut}T11:00`;
            }

            setBookingDetails({
                name,
                email,
                phone,
                fromAddress: initialFromAddress || '',
                toAddress: initialToAddress || '',
                checkIn: formattedCheckIn,
                checkOut: formattedCheckOut
            });
            setTravelScope('Intra-City');
            setIsCustomOffer(false);
            setCustomOfferPrice('');
            setAppliedCoupon(null);
            setPickupCoords(initialPickupCoords || null);
            setDestCoords(initialDestCoords || null);
            setPickupCity(initialCity || '');
            setDistance(0);
            setMatchingBids([]);
            setStep(2);
        }
    }, [isOpen, initialCheckIn, initialCheckOut, initialFromAddress, initialToAddress, initialPickupCoords, initialDestCoords, initialCity]);

    if (!isOpen || !car) return null;

    const handleClose = () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
        setStep(2);
        setBookingDetails({
            name: '',
            email: '',
            phone: '',
            fromAddress: '',
            toAddress: '',
            checkIn: '',
            checkOut: ''
        });
        setPickupCoords(null);
        setDestCoords(null);
        setDistance(0);
        setMatchingBids([]);
        onClose();
    };

    const handleSelectDriver = async (driverId: string, counterFare?: number) => {
        try {
            const token = localStorage.getItem('airgo_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            
            const payload: any = { driverId };
            if (counterFare) {
                payload.counterFare = counterFare;
            }

            const res = await fetch(`${apiUrl}/api/ride-requests/${createdBookingId}/select-driver`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (counterFare) {
                    toast.success(`🎉 Your counter-offer of ₦${counterFare.toLocaleString()} has been sent!`);
                } else {
                    toast.success("🎉 Bid accepted successfully! Redirecting to checkout...");
                }
                handleClose();
                router.push('/dashboard');
            } else {
                toast.error("Failed to accept fare offer.");
            }
        } catch (err) {
            toast.error("Connection error selecting driver.");
        }
    };

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const token = localStorage.getItem('airgo_token');
        if (!token) {
            toast.success("Please sign in to secure this booking.");
            router.push('/login');
            return;
        }

        const storedUser = localStorage.getItem('airgo_user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        if (parsedUser && parsedUser.role === 'partner') {
            toast.error("Partners are not authorized to make bookings.");
            return;
        }

        if (!pickupCoords || !destCoords) {
            toast.error("Please search and select valid addresses from the autocomplete dropdowns.");
            return;
        }

        setIsProcessing(true);

        try {
            const finalUserId = parsedUser ? parsedUser.id || parsedUser.userId || parsedUser._id : '';
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const referredBy = localStorage.getItem('airgo_ref') || '';

            // Inject pickup & Dropoff address details and calculate route distance
            const payload = {
                userId: finalUserId,
                clientName: bookingDetails.name,
                clientEmail: bookingDetails.email,
                clientPhone: bookingDetails.phone,
                fromAddress: bookingDetails.fromAddress,
                toAddress: bookingDetails.toAddress,
                checkIn: bookingDetails.checkIn,
                checkOut: bookingDetails.checkOut || bookingDetails.checkIn,
                distance: distance,
                offeredPrice: Number(customOfferPrice).toLocaleString(),
                travelScope: travelScope,
                city: pickupCity
            };

            const response = await fetch(`${apiUrl}/api/ride-requests`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Ride request creation failed on backend");
            }

            const resData = await response.json();
            setCreatedBookingId(resData.rideRequestId || resData.rideRequest?._id);
            setStep(3); // Go to Pulse Radar Screen

        } catch (error: any) {
            console.error("Booking Error:", error);
            toast.error(`Request failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const sortedOffers = [...matchingBids].sort((a, b) => a.fare - b.fare);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#000080]/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">

                {step === 1 && (
                    <div className="p-8 overflow-y-auto flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">Confirm Vehicle</h2>
                            <button onClick={handleClose} className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition">✕</button>
                        </div>

                        {car.images && car.images.length > 0 ? (
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {car.images.map((img: string, idx: number) => (
                                        <img key={idx} src={img} alt={`${car.name} ${idx}`} className="w-40 h-28 rounded-xl object-cover shadow-sm flex-shrink-0 border border-gray-200" />
                                    ))}
                                </div>
                                <div className="mt-2 text-left">
                                    <h3 className="text-xl font-bold text-[#000080]">{car.name}</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Pricing Model</p>
                                    <p className="text-xl font-black text-[#000080] mt-0.5 italic">
                                        Fare Decided by Driver Bids
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100 text-left">
                                <img src={car.image} alt={car.name} className="w-24 h-24 rounded-xl object-cover shadow-sm" />
                                <div>
                                    <h3 className="text-lg font-bold text-[#000080]">{car.name}</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Pricing Model</p>
                                    <p className="text-xl font-black text-[#000080] mt-0.5 italic">
                                        Fare Decided by Driver Bids
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-6 text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                                <h4 className="text-sm font-black text-[#000080] uppercase tracking-wide">Airgo Escrow Protection</h4>
                            </div>
                            <p className="text-xs text-blue-900 leading-relaxed font-medium">
                                Your funds are held securely. The fleet manager will only receive payment after your vehicle is delivered.
                            </p>
                        </div>

                        <button onClick={() => setStep(2)} className="w-full bg-[#000080] text-white py-4 rounded-xl font-black text-lg hover:bg-blue-900 transition shadow-lg">
                            Accept & Continue
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-8 overflow-y-auto flex-1 text-left">
                        <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
                            <button onClick={handleClose} className="text-[#000080] font-black text-sm mr-4 hover:underline">✕ Close</button>
                            <h2 className="text-xl font-black text-gray-900">Delivery Logistics & Route</h2>
                        </div>

                        <form onSubmit={handleSendRequest} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">FULL NAME</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" value={bookingDetails.name} onChange={e => setBookingDetails({ ...bookingDetails, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">EMAIL</label>
                                    <input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" value={bookingDetails.email} onChange={e => setBookingDetails({ ...bookingDetails, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">PHONE</label>
                                    <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" value={bookingDetails.phone} onChange={e => setBookingDetails({ ...bookingDetails, phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">PICKUP DATE/TIME</label>
                                    <input required type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" value={bookingDetails.checkIn} onChange={e => setBookingDetails({ ...bookingDetails, checkIn: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">RETURN DATE/TIME</label>
                                    <input required type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium" value={bookingDetails.checkOut} onChange={e => setBookingDetails({ ...bookingDetails, checkOut: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                                <div className="relative">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">FROM (Pickup Location)</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="Search pickup address..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium text-xs" 
                                        value={bookingDetails.fromAddress} 
                                        onChange={e => {
                                            setBookingDetails({ ...bookingDetails, fromAddress: e.target.value });
                                            debouncedSearchFrom(e.target.value);
                                        }} 
                                    />
                                    {isSearchingFrom && <div className="absolute right-3 top-9 text-[10px] text-gray-400 animate-pulse">Searching...</div>}
                                    {fromSuggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-150 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                                            {fromSuggestions.map((item: any) => (
                                                <button
                                                    key={item.place_id}
                                                    type="button"
                                                    onClick={() => {
                                                        setBookingDetails(prev => ({ ...prev, fromAddress: item.display_name }));
                                                        setPickupCoords([parseFloat(item.lat), parseFloat(item.lon)]);
                                                        setFromSuggestions([]);
                                                        
                                                        // Extract city from suggestion address details
                                                        if (item.address) {
                                                            const addr = item.address;
                                                            const city = addr.city || addr.town || addr.village || addr.city_district || addr.suburb || addr.state;
                                                            if (city) setPickupCity(city);
                                                        } else {
                                                            const parts = item.display_name.split(',');
                                                            if (parts.length >= 2) {
                                                                const nameLower = item.display_name.toLowerCase();
                                                                let foundCity = parts[parts.length - 2].trim();
                                                                if (nameLower.includes('abuja')) foundCity = 'Abuja';
                                                                else if (nameLower.includes('lagos')) foundCity = 'Lagos';
                                                                else if (nameLower.includes('port harcourt')) foundCity = 'Port Harcourt';
                                                                setPickupCity(foundCity);
                                                            }
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-[10px] text-gray-700 hover:bg-blue-50 border-b border-gray-100 last:border-none font-medium truncate"
                                                >
                                                    📍 {item.display_name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="relative font-sans">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">TO (Destination)</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="Search destination..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-medium text-xs" 
                                        value={bookingDetails.toAddress} 
                                        onChange={e => {
                                            setBookingDetails({ ...bookingDetails, toAddress: e.target.value });
                                            debouncedSearchTo(e.target.value);
                                        }} 
                                    />
                                    {isSearchingTo && <div className="absolute right-3 top-9 text-[10px] text-gray-400 animate-pulse">Searching...</div>}
                                    {toSuggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-150 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                                            {toSuggestions.map((item: any) => (
                                                <button
                                                    key={item.place_id}
                                                    type="button"
                                                    onClick={() => {
                                                        setBookingDetails(prev => ({ ...prev, toAddress: item.display_name }));
                                                        setDestCoords([parseFloat(item.lat), parseFloat(item.lon)]);
                                                        setToSuggestions([]);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-[10px] text-gray-700 hover:bg-blue-50 border-b border-gray-100 last:border-none font-medium truncate"
                                                >
                                                    📍 {item.display_name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Leaflet Routing Map */}
                            <div className="relative z-10">
                                <div id="booking-map" className="w-full h-44 rounded-2xl border border-gray-200 mt-2 relative z-0"></div>
                                {distance > 0 && (
                                    <div className="absolute bottom-2 right-2 bg-[#000080] text-white text-[10px] font-black px-3.5 py-1 rounded-full shadow-md z-10">
                                        Distance: {distance} km
                                    </div>
                                )}
                            </div>

                            {/* Service Configurations */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Travel Scope</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-semibold text-xs cursor-pointer"
                                        value={travelScope}
                                        onChange={(e: any) => setTravelScope(e.target.value)}
                                    >
                                        <option value="Intra-City">Intra-City (₦0)</option>
                                        <option value="Inter-State">Inter-State (+₦35k/day)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">YOUR PRICE BID (₦)</label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="1"
                                        placeholder="Proposed fare e.g. 15000"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#000080] outline-none transition font-semibold text-xs" 
                                        value={customOfferPrice} 
                                        onChange={e => {
                                            setCustomOfferPrice(e.target.value);
                                            setIsCustomOffer(true);
                                        }} 
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={isProcessing} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition shadow-lg mt-4 ${isProcessing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#FFB81C] text-[#000080] hover:bg-yellow-400'}`}>
                                {isProcessing ? 'Creating Escrow...' : 'Send Request to Drivers'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-10 text-center flex flex-col items-center overflow-y-auto flex-1 animate-in fade-in duration-300">
                        {/* Radar Animation */}
                        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                            <div className="absolute inset-0 rounded-full bg-blue-100 border border-blue-200 animate-ping opacity-30" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute inset-4 rounded-full bg-blue-50 border border-blue-100 animate-ping opacity-50" style={{ animationDuration: '2s' }}></div>
                            <div className="w-16 h-16 bg-[#000080] rounded-full flex items-center justify-center text-white shadow-lg relative z-10">
                                <svg className="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.02-1.072L3 9h18l.645 8.678A1.125 1.125 0 0120.625 18.75M9 9h1.5M12 9h1.5M15 9h1.5M2.25 9.75h19.5m-18 0l1.7-5.1a1.125 1.125 0 011.07-1.4h11.96a1.125 1.125 0 011.07 1.4l1.7 5.1" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 mb-1">Searching for Drivers</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            {radarCountdown > 0 ? `Broadcasting Request (${radarCountdown}s)...` : 'Request Timeout'}
                        </p>

                        <p className="text-xs text-gray-500 max-w-sm mt-3 leading-relaxed">
                            Bids from nearby taxi drivers will appear live below. Select the best bid to secure your ride!
                        </p>

                        {/* Live Driver Bids List */}
                        <div className="w-full border-t border-gray-100 pt-6 mt-6 flex-1 flex flex-col gap-4 text-left">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Live Offers ({sortedOffers.length})
                            </h4>

                            {sortedOffers.length === 0 ? (
                                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl text-center flex-1 flex items-center justify-center">
                                    <p className="text-xs text-gray-500 font-semibold animate-pulse">Waiting for drivers to bid...</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                                    {sortedOffers.map((bid: any, idx: number) => (
                                        <div key={bid.driverId} className={`border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${idx === 0 ? 'bg-emerald-50/40 border-emerald-200' : 'bg-blue-50/30 border-blue-100/60'}`}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="font-bold text-sm text-gray-900">{bid.driverName}</h5>
                                                    {idx === 0 && <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Cheapest</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 font-semibold mt-0.5">{bid.vehicleDetails || 'Standard Premium Vehicle'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold mt-1">VIP Partner Driver</p>
                                            </div>
                                            <div className="text-left sm:text-right shrink-0 flex flex-col gap-2 w-full sm:w-auto">
                                                <div>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Fare Bid</p>
                                                    <p className="text-base font-black text-[#000080]">₦{bid.fare.toLocaleString()}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleSelectDriver(bid.driverId)} className="flex-1 sm:flex-initial bg-[#000080] hover:bg-blue-900 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap">
                                                        Accept
                                                    </button>
                                                    <button onClick={() => {
                                                        const counterVal = prompt(`Enter counter price for ${bid.driverName} (₦):`, bid.fare.toString());
                                                        if (counterVal) {
                                                            const numVal = parseInt(counterVal.replace(/[^0-9]/g, ''));
                                                            if (!isNaN(numVal) && numVal > 0) {
                                                                handleSelectDriver(bid.driverId, numVal);
                                                            }
                                                        }
                                                    }} className="flex-1 sm:flex-initial bg-white border border-[#000080] text-[#000080] hover:bg-blue-50 font-bold text-[10px] px-3 py-2 rounded-lg transition cursor-pointer whitespace-nowrap">
                                                        Counter
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {radarCountdown === 0 && sortedOffers.length === 0 && (
                            <button onClick={() => { handleClose(); router.push('/dashboard'); }} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm uppercase mt-6 transition hover:bg-black">
                                Manage Request on Dashboard
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
