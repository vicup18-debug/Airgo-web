"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SuperadminDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'hotels'>('overview');
    const [cars, setCars] = useState<any[]>([]);
    const [hotels, setHotels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 🟢 Mobile Menu State

    // Form States
    const [isCarModalOpen, setIsCarModalOpen] = useState(false);
    const [newCar, setNewCar] = useState({ name: '', type: '', price: '', image: '', capacity: '', features: '', previewImage: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const [carsRes, hotelsRes] = await Promise.all([
                fetch(`${apiUrl}/api/cars`),
                fetch(`${apiUrl}/api/hotels`)
            ]);
            if (carsRes.ok) setCars(await carsRes.json());
            if (hotelsRes.ok) setHotels(await hotelsRes.json());
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAddCar = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let finalImageUrl = newCar.image;
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('upload_preset', 'airgo_fleet');

                const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/drdosbrru/image/upload`, {
                    method: 'POST',
                    body: formData
                });
                const cloudData = await cloudinaryRes.json();
                if (cloudData.secure_url) finalImageUrl = cloudData.secure_url;
                else throw new Error("Failed to upload image");
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/cars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newCar, image: finalImageUrl, price: Number(newCar.price) })
            });

            if (response.ok) {
                alert("✅ Vehicle successfully added to live fleet!");
                setIsCarModalOpen(false);
                setNewCar({ name: '', type: '', price: '', image: '', capacity: '', features: '', previewImage: '' });
                setImageFile(null);
                fetchData();
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

    const handleDeleteCar = async (id: string) => {
        if (!confirm("Are you sure you want to remove this vehicle?")) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/cars/${id}`, { method: 'DELETE' });
            if (response.ok) fetchData();
        } catch (error) {
            console.error("Error deleting vehicle:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans">

            {/* 🟢 MOBILE HEADER */}
            <div className="md:hidden bg-[#000080] text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                <h2 className="text-xl font-black tracking-tight">Airgo<span className="text-[#87CEEB]">.admin</span></h2>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            {/* 🟢 OVERLAY FOR MOBILE MENU */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* 🟢 NAVY BLUE SIDEBAR (Responsive) */}
            <aside className={`fixed md:relative top-0 left-0 h-full w-64 bg-[#000080] text-white flex-col shadow-xl z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex`}>
                <div className="p-6 border-b border-blue-800/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight cursor-pointer">Airgo<span className="text-[#87CEEB]">.admin</span></h2>
                        <p className="text-xs text-blue-300 mt-1 uppercase tracking-widest font-semibold">Command Center</p>
                    </div>
                    <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'overview' ? 'bg-[#87CEEB] text-[#000080] shadow-md' : 'hover:bg-blue-800 text-blue-100'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> Overview
                    </button>
                    <button onClick={() => { setActiveTab('cars'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'cars' ? 'bg-[#87CEEB] text-[#000080] shadow-md' : 'hover:bg-blue-800 text-blue-100'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> Manage Fleet
                    </button>
                    <button onClick={() => { setActiveTab('hotels'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'hotels' ? 'bg-[#87CEEB] text-[#000080] shadow-md' : 'hover:bg-blue-800 text-blue-100'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> Manage Hotels
                    </button>
                </nav>
            </aside>

            {/* 🟢 MAIN DASHBOARD CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative w-full">
                <header className="bg-white px-6 md:px-8 py-5 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10 hidden md:flex">
                    <h1 className="text-2xl font-black text-[#000080] capitalize">{activeTab} Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-500">Superadmin Access</span>
                        <div className="w-10 h-10 bg-[#87CEEB] rounded-full flex items-center justify-center text-[#000080] font-black shadow-inner">SA</div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#000080]"></div></div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Vehicles</p>
                                            <p className="text-4xl font-black text-[#000080]">{cars.length}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#000080]">🚘</div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Hotels</p>
                                            <p className="text-4xl font-black text-[#000080]">{hotels.length}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#000080]">🏨</div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'cars' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-4">
                                        <h2 className="text-lg font-bold text-gray-800 self-start md:self-auto">Live Vehicle Fleet</h2>
                                        <button onClick={() => setIsCarModalOpen(true)} className="w-full md:w-auto bg-[#000080] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-900 transition flex justify-center items-center gap-2">
                                            <span>+</span> Add Vehicle
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
                                            <thead>
                                                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                                    <th className="p-4 font-bold">Vehicle</th>
                                                    <th className="p-4 font-bold hidden md:table-cell">Type</th>
                                                    <th className="p-4 font-bold">Price (Day)</th>
                                                    <th className="p-4 font-bold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {cars.length === 0 ? (
                                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-medium">No vehicles found.</td></tr>
                                                ) : cars.map(car => (
                                                    <tr key={car._id} className="hover:bg-gray-50 transition">
                                                        <td className="p-4 flex items-center gap-3">
                                                            <img src={car.image} alt={car.name} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover bg-gray-100" />
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-[#000080] text-sm md:text-base">{car.name}</span>
                                                                <span className="text-xs text-gray-500 md:hidden">{car.type}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-600 hidden md:table-cell">{car.type}</td>
                                                        <td className="p-4 font-bold text-gray-900 text-sm md:text-base">₦{car.price?.toLocaleString()}</td>
                                                        <td className="p-4 text-right">
                                                            <button onClick={() => handleDeleteCar(car._id)} className="text-red-500 hover:text-red-700 font-bold text-xs md:text-sm bg-red-50 px-2 md:px-3 py-1 rounded-md">Delete</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'hotels' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl md:text-3xl">🏗️</div>
                                    <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-2">Hotel Protocol</h2>
                                    <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto">Partner APIs for property uploads will be integrated in the next phase.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* 🟢 ADD CAR MODAL */}
            {isCarModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000080]/40 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg md:text-xl font-black text-[#000080]">Add New Vehicle</h2>
                            <button onClick={() => setIsCarModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleAddCar} className="p-4 md:p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle Name</label>
                                    <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none" value={newCar.name} onChange={e => setNewCar({ ...newCar, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle Type</label>
                                    <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none" value={newCar.type} onChange={e => setNewCar({ ...newCar, type: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Daily Price (₦)</label>
                                    <input required type="number" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none" value={newCar.price} onChange={e => setNewCar({ ...newCar, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
                                    <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none" value={newCar.capacity} onChange={e => setNewCar({ ...newCar, capacity: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Upload Vehicle Photo</label>
                                <input required type="file" accept="image/png, image/jpeg, image/webp" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#87CEEB] file:text-[#000080]" onChange={(e) => handleImageSelection(e)} />
                            </div>
                            {newCar.previewImage && (
                                <div className="flex items-center gap-3">
                                    <img src={newCar.previewImage} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                                    <span className="text-sm text-gray-500">Image selected</span>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Features Summary</label>
                                <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none" value={newCar.features} onChange={e => setNewCar({ ...newCar, features: e.target.value })} />
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-end gap-3">
                                <button type="button" onClick={() => setIsCarModalOpen(false)} className="w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={isUploading} type="submit" className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold shadow-md transition ${isUploading ? 'bg-gray-400 text-white' : 'bg-[#000080] text-white hover:bg-blue-900'}`}>
                                    {isUploading ? 'Deploying...' : 'Deploy Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}