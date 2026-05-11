"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PartnerDashboard() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'bookings'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data States
    const [cars, setCars] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form States
    const [isCarModalOpen, setIsCarModalOpen] = useState(false);
    const [newCar, setNewCar] = useState({ name: '', type: '', price: '', image: '', capacity: '', features: '', previewImage: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const router = useRouter();

    useEffect(() => {
        // 🟢 SECURITY CHECK: Ensure user is a Partner
        const token = localStorage.getItem('airgo_token');
        const userData = localStorage.getItem('airgo_user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'client') {
            router.push('/dashboard'); // Kick regular users out
            return;
        }

        setUser(parsedUser);
        fetchPartnerData(parsedUser.id);
    }, [router]);

    // 🟢 FETCH ONLY THIS PARTNER'S DATA
    const fetchPartnerData = async (partnerId: string) => {
        setIsLoading(true);
        try {
            const apiUrl = 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/cars`);

            if (res.ok) {
                const allCars = await res.json();
                // Filter cars to show only those uploaded by this specific partner
                const partnerCars = allCars.filter((car: any) => car.partnerId === partnerId);
                setCars(partnerCars);
            }
        } catch (error) {
            console.error("Error fetching partner data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 🟢 ADD NEW VEHICLE (WITH CLOUDINARY)
    const handleAddCar = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let finalImageUrl = newCar.image;

            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('upload_preset', 'airgo_fleet');

                // ⚠️ REPLACE 'YOUR_CLOUD_NAME' WITH YOUR ACTUAL CLOUDINARY NAME
                const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/drdosbrru/image/upload`, {
                    method: 'POST',
                    body: formData
                });
                const cloudData = await cloudinaryRes.json();
                if (cloudData.secure_url) finalImageUrl = cloudData.secure_url;
                else throw new Error("Failed to upload image");
            }

            const apiUrl = 'https://airgo-backend.onrender.com';
            const response = await fetch(`${apiUrl}/api/cars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCar,
                    image: finalImageUrl,
                    price: Number(newCar.price),
                    partnerId: user.id // Tag this car as belonging to this partner
                })
            });

            if (response.ok) {
                alert("✅ Vehicle submitted to live fleet!");
                setIsCarModalOpen(false);
                setNewCar({ name: '', type: '', price: '', image: '', capacity: '', features: '', previewImage: '' });
                setImageFile(null);
                fetchPartnerData(user.id);
            } else throw new Error("Failed to add vehicle");
        } catch (error) {
            alert("❌ Error adding vehicle. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setNewCar((prev) => ({ ...prev, previewImage: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans">

            {/* 🟢 MOBILE HEADER */}
            <div className="md:hidden bg-[#000080] text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                <h2 className="text-xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.partner</span></h2>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

            {/* 🟢 SIDEBAR */}
            <aside className={`fixed md:relative top-0 left-0 h-full w-64 bg-[#000080] text-white flex-col shadow-xl z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex`}>
                <div className="p-6 border-b border-blue-800/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.partner</span></h2>
                        <p className="text-xs text-blue-300 mt-1 uppercase tracking-widest font-semibold">Fleet Manager</p>
                    </div>
                    <button className="md:hidden text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'overview' ? 'bg-[#FFB81C] text-[#000080] shadow-md' : 'hover:bg-blue-800 text-blue-100'}`}>
                        Overview
                    </button>
                    <button onClick={() => { setActiveTab('fleet'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'fleet' ? 'bg-[#FFB81C] text-[#000080] shadow-md' : 'hover:bg-blue-800 text-blue-100'}`}>
                        My Fleet
                    </button>
                    <button onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'bookings' ? 'bg-[#FFB81C] text-[#000080] shadow-md' : 'hover:bg-blue-800 text-blue-100'}`}>
                        Bookings & Earnings
                    </button>
                </nav>
                <div className="p-4 border-t border-blue-800/50">
                    <button onClick={() => { localStorage.removeItem('airgo_token'); localStorage.removeItem('airgo_user'); router.push('/login'); }} className="w-full bg-blue-900 text-white px-4 py-3 rounded-xl text-sm font-bold border border-blue-700 hover:bg-blue-800 transition">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* 🟢 MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative w-full">
                <header className="bg-white px-6 md:px-8 py-5 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10 hidden md:flex">
                    <h1 className="text-2xl font-black text-[#000080] capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-700">{user.name}</span>
                        <div className="w-10 h-10 bg-[#000080] rounded-full flex items-center justify-center text-white font-black shadow-inner">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#000080]"></div></div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">My Active Vehicles</p>
                                            <p className="text-4xl font-black text-[#000080]">{cars.length}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#000080] text-2xl">🚘</div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Earnings</p>
                                            <p className="text-4xl font-black text-green-600">₦0</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 text-2xl">💰</div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'fleet' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h2 className="text-lg font-bold text-gray-800">My Uploaded Vehicles</h2>
                                        <button onClick={() => setIsCarModalOpen(true)} className="bg-[#000080] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-900 transition flex items-center gap-2">
                                            + Add Vehicle
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        {cars.length === 0 ? (
                                            <div className="text-center py-12">
                                                <p className="text-gray-500 font-medium">You haven't added any vehicles yet. Click "Add Vehicle" to list your fleet.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {cars.map(car => (
                                                    <div key={car._id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                                        <img src={car.image} alt={car.name} className="w-full h-40 object-cover" />
                                                        <div className="p-4">
                                                            <h3 className="font-black text-gray-900">{car.name}</h3>
                                                            <p className="text-sm text-gray-500 mb-2">{car.type}</p>
                                                            <p className="font-bold text-[#000080]">₦{car.price?.toLocaleString()} / day</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'bookings' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                                    <div className="text-4xl mb-4">📅</div>
                                    <h2 className="text-xl font-black text-gray-800 mb-2">No Active Bookings Yet</h2>
                                    <p className="text-gray-500 max-w-md mx-auto">When clients book your vehicles, the reservation details and escrow payment status will appear here.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* 🟢 ADD CAR MODAL (SAME AS ADMIN WITH CLOUDINARY) */}
            {isCarModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000080]/40 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-black text-[#000080]">List New Vehicle</h2>
                            <button onClick={() => setIsCarModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleAddCar} className="p-4 md:p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle Name</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.name} onChange={e => setNewCar({ ...newCar, name: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type (e.g. SUV)</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.type} onChange={e => setNewCar({ ...newCar, type: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Daily Price (₦)</label><input required type="number" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.price} onChange={e => setNewCar({ ...newCar, price: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.capacity} onChange={e => setNewCar({ ...newCar, capacity: e.target.value })} /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Upload Photo</label>
                                <input required type="file" accept="image/*" className="w-full px-4 py-2 border rounded-xl text-gray-900 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700" onChange={handleImageSelection} />
                            </div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Features Summary</label><input required type="text" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newCar.features} onChange={e => setNewCar({ ...newCar, features: e.target.value })} /></div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCarModalOpen(false)} className="px-5 py-2 rounded-xl font-bold text-gray-600">Cancel</button>
                                <button disabled={isUploading} type="submit" className={`px-6 py-2 rounded-xl font-bold text-white ${isUploading ? 'bg-gray-400' : 'bg-[#000080]'}`}>{isUploading ? 'Uploading...' : 'Submit Vehicle'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}