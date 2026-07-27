"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CarBookingModal from '../../components/CarBookingModal';

// 🟢 THE FALLBACK MATRIX: If the database is empty, we inject this premium fleet automatically so the site never looks broken!
const FALLBACK_FLEET = [
    {
        _id: 'airgo_fleet_01',
        name: 'Taxi Chauffeur',
        type: 'Luxury Sedan Taxi',
        price: 350000,
        capacity: '5',
        features: 'Professional Chauffeur, Local & Airport Transfer, Meet & Greet Service',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        partnerId: 'airgo_direct',
        isFallback: true,
        location: 'Maitama',
        state: 'Abuja',
        vehicleNumber: 'ABJ-888-GW',
        totalAllocated: 1,
        vehicleCategory: 'shuttle'
    }
];

export default function CarsPage() {
    const [selectedCar, setSelectedCar] = useState<any>(null);
    const [carFleet, setCarFleet] = useState<any[]>(FALLBACK_FLEET);
    const [isLoading, setIsLoading] = useState(false);

    // SHUTTLE BOOKING STATES
    const [shuttleFrom, setShuttleFrom] = useState('');
    const [shuttleTo, setShuttleTo] = useState('');
    const [shuttleDateTime, setShuttleDateTime] = useState('');

    // Autocomplete search states
    const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
    const [toSuggestions, setToSuggestions] = useState<any[]>([]);
    const [isSearchingFrom, setIsSearchingFrom] = useState(false);
    const [isSearchingTo, setIsSearchingTo] = useState(false);
    const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
    const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
    const [pickupCity, setPickupCity] = useState('');

    const searchTimeoutFrom = React.useRef<any>(null);
    const searchTimeoutTo = React.useRef<any>(null);

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
            const res = await fetch(`/api/location?type=search&q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                if (field === 'from') setFromSuggestions(data);
                else setToSuggestions(data);
            }
        } catch (err) {
            console.error("Location search error", err);
        } finally {
            if (field === 'from') setIsSearchingFrom(false);
            else setIsSearchingTo(false);
        }
    };

    const extractCityFromSuggestion = (item: any) => {
        if (item.address) {
            const addr = item.address;
            const city = addr.city || addr.town || addr.village || addr.city_district || addr.suburb || addr.state;
            if (city) return city;
        }
        const parts = item.display_name.split(',');
        if (parts.length >= 2) {
            const nameLower = item.display_name.toLowerCase();
            if (nameLower.includes('abuja')) return 'Abuja';
            if (nameLower.includes('lagos')) return 'Lagos';
            if (nameLower.includes('port harcourt')) return 'Port Harcourt';
            if (nameLower.includes('kano')) return 'Kano';
            if (nameLower.includes('ibadan')) return 'Ibadan';
            if (nameLower.includes('enugu')) return 'Enugu';
            if (nameLower.includes('benin')) return 'Benin City';
            if (nameLower.includes('kaduna')) return 'Kaduna';
            return parts[parts.length - 2].trim();
        }
        return '';
    };

    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            toast.loading("Finding location...", { id: "location-toast" });
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setPickupCoords([latitude, longitude]);
                    setShuttleFrom("Current Location");
                    try {
                        const res = await fetch(`/api/location?type=reverse&lat=${latitude}&lon=${longitude}`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data.display_name) {
                                setShuttleFrom(data.display_name);
                                setPickupCity(extractCityFromSuggestion(data));
                            }
                        }
                    } catch (err) {
                        console.error("Reverse geocode error", err);
                    }
                    toast.success("Location found!", { id: "location-toast" });
                },
                (error) => {
                    toast.error("Could not get your location. Please allow location access.", { id: "location-toast" });
                }
            );
        } else {
            toast.error("Geolocation is not supported by your browser.");
        }
    };

    const handleBookShuttle = () => {
        if (!shuttleFrom.trim() || !shuttleTo.trim() || !shuttleDateTime) {
            toast.error("Please fill in all route and timing details for your shuttle.");
            return;
        }

        const storedToken = localStorage.getItem('airgo_token');
        if (!storedToken) {
            toast.success("Please sign in to book your shuttle.");
            router.push('/login');
            return;
        }

        // Find a valid shuttle/car object to act as the catalog item
        const shuttleCar = carFleet.find(c => c.vehicleCategory === 'shuttle') || carFleet[0] || FALLBACK_FLEET[0];
        setSelectedCar(shuttleCar);
    };

    useEffect(() => {
        const userData = localStorage.getItem('airgo_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const fetchCars = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
                const res = await fetch(`${apiUrl}/api/cars`);

                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setCarFleet(data);
                    } else {
                        setCarFleet(FALLBACK_FLEET); // 🟢 Inject fallback if DB is empty
                    }
                }
            } catch (error) {
                console.log("Error fetching fleet, using fallback data.");
            }
        };

        fetchCars();
    }, []);



    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-[72px] md:pb-0 flex flex-col">

            

            

            {/* HEADER */}
            <div className="flex-grow">
                <header className="bg-[#000080] pb-32 pt-12 px-6 rounded-b-[2.5rem] md:rounded-none relative text-center">
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Taxi Service</h1>
                        <p className="text-sm md:text-lg text-blue-100 max-w-2xl mx-auto font-medium">
                            Book a premium, hassle-free ride. Enter details below to request bids from nearby verified drivers.
                        </p>
                    </div>
                </header>

                {/* FLOATING SEARCH BAR */}
                <div className="max-w-3xl mx-auto px-4 -mt-24 relative z-20 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-300">
                    <div className="bg-white p-4 md:p-6 rounded-3xl shadow-xl border border-gray-100">
                        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-[1.5] w-full text-left relative z-30">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wide">FROM (Pickup Location)</label>
                                    <button 
                                        type="button" 
                                        onClick={handleUseCurrentLocation}
                                        className="text-[10px] bg-blue-100 text-[#000080] px-2 py-1 rounded font-bold hover:bg-blue-200 transition flex items-center gap-1"
                                    >
                                        📍 Use Current Location
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Nnamdi Azikiwe Airport, Abuja" 
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all font-medium text-sm" 
                                    value={shuttleFrom} 
                                    onChange={(e) => {
                                        setShuttleFrom(e.target.value);
                                        debouncedSearchFrom(e.target.value);
                                    }} 
                                />
                                {isSearchingFrom && <div className="absolute right-3 top-11 text-xs text-gray-400 animate-pulse">Searching...</div>}
                                {fromSuggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-[60]">
                                        {fromSuggestions.map((item: any) => (
                                            <button
                                                key={item.place_id}
                                                type="button"
                                                onClick={() => {
                                                    setShuttleFrom(item.display_name);
                                                    setPickupCoords([parseFloat(item.lat), parseFloat(item.lon)]);
                                                    setPickupCity(extractCityFromSuggestion(item));
                                                    setFromSuggestions([]);
                                                }}
                                                className="w-full px-4 py-3 text-left text-xs text-gray-700 hover:bg-blue-50 border-b border-gray-100 last:border-none font-semibold truncate cursor-pointer"
                                            >
                                                📍 {item.display_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex-[1.5] w-full text-left relative z-20">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-2">TO (Destination)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Hilton Hotel, Maitama, Abuja" 
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all font-medium text-sm" 
                                    value={shuttleTo} 
                                    onChange={(e) => {
                                        setShuttleTo(e.target.value);
                                        debouncedSearchTo(e.target.value);
                                    }} 
                                />
                                {isSearchingTo && <div className="absolute right-3 top-11 text-xs text-gray-400 animate-pulse">Searching...</div>}
                                {toSuggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-[60]">
                                        {toSuggestions.map((item: any) => (
                                            <button
                                                key={item.place_id}
                                                type="button"
                                                onClick={() => {
                                                    setShuttleTo(item.display_name);
                                                    setDestCoords([parseFloat(item.lat), parseFloat(item.lon)]);
                                                    setToSuggestions([]);
                                                }}
                                                className="w-full px-4 py-3 text-left text-xs text-gray-700 hover:bg-blue-50 border-b border-gray-100 last:border-none font-semibold truncate cursor-pointer"
                                            >
                                                📍 {item.display_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 w-full text-left">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-2">Pickup Date & Time</label>
                                <input type="datetime-local" min={new Date().toISOString().substring(0, 16)} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all font-medium text-sm" value={shuttleDateTime} onChange={(e) => setShuttleDateTime(e.target.value)} />
                            </div>
                            <div className="flex-shrink-0 w-full md:w-auto">
                                <button type="button" onClick={handleBookShuttle} className="w-full md:w-auto bg-[#FFB81C] text-[#000080] px-8 py-4.5 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-yellow-400 transition shadow-lg cursor-pointer">
                                    Request Ride
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* 🟢 AIRPORT SHUTTLE "HOW IT WORKS" & BRANDING */}
                <div className="max-w-4xl mx-auto px-6 mb-16 text-center">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-xl max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex items-center justify-center gap-3 mb-6 bg-blue-50 text-[#000080] px-5 py-2.5 rounded-full w-fit mx-auto border border-blue-100/50">
                            <svg className="w-5 h-5 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v9m-8-9v9m-8-6a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3v-8zm2 3h14M8 14h8" />
                            </svg>
                             <span className="text-xs font-black tracking-wider uppercase">VIP Taxi Concierge</span>
                        </div>
                        
                        <h3 className="font-black text-gray-900 text-3xl md:text-4xl mb-4">Request a Ride in Minutes</h3>
                        <p className="text-gray-500 max-w-xl mx-auto mb-10 font-medium text-sm md:text-base leading-relaxed">
                            Enter your pickup location and destination in the card above. Nearby verified chauffeurs will bid for your request, guaranteeing the best possible price under Airgo Escrow protection.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100/70 hover:shadow-md transition">
                                <div className="w-10 h-10 bg-blue-100 text-[#000080] rounded-xl flex items-center justify-center font-black text-base mb-4">1</div>
                                <h4 className="font-bold text-gray-900 text-sm mb-2">Specify Route</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">Enter your pickup point, airport, destination, and timing details.</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100/70 hover:shadow-md transition">
                                <div className="w-10 h-10 bg-blue-100 text-[#000080] rounded-xl flex items-center justify-center font-black text-base mb-4">2</div>
                                <h4 className="font-bold text-gray-900 text-sm mb-2">Get Driver Bids</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">Chauffeurs in the area review your request and submit live bids. Choose the best fare.</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100/70 hover:shadow-md transition">
                                <div className="w-10 h-10 bg-blue-100 text-[#000080] rounded-xl flex items-center justify-center font-black text-base mb-4">3</div>
                                <h4 className="font-bold text-gray-900 text-sm mb-2">Travel Protected</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">Your payment is held in escrow and only disbursed to the driver after you arrive safely.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            

            {/* LIVE CAR BOOKING MODAL */}
            <CarBookingModal
                isOpen={!!selectedCar}
                onClose={() => setSelectedCar(null)}
                car={selectedCar}
                initialCheckIn={shuttleDateTime}
                initialCheckOut={shuttleDateTime}
                initialFromAddress={shuttleFrom}
                initialToAddress={shuttleTo}
                initialPickupCoords={pickupCoords}
                initialDestCoords={destCoords}
                initialCity={pickupCity}
            />

            
        </div>
    );
}

