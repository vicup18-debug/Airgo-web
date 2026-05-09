"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SuperadminDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'hotels'>('overview');
    const [cars, setCars] = useState<any[]>([]);
    const [hotels, setHotels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form States for Adding New Items
    const [isCarModalOpen, setIsCarModalOpen] = useState(false);
    const [newCar, setNewCar] = useState({ name: '', type: '', price: '', image: '', capacity: '', features: '' });

    // 🟢 FETCH LIVE DATA FROM RENDER BACKEND
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

    useEffect(() => {
        fetchData();
    }, []);

    // 🟢 POST NEW CAR TO DATABASE
    const handleAddCar = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/cars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCar,
                    price: Number(newCar.price) // Ensure price is saved as a number
                })
            });

            if (response.ok) {
                alert("✅ Vehicle successfully added to live fleet!");
                setIsCarModalOpen(false);
                setNewCar({ name: '', type: '', price: '', image: '', capacity: '', features: '' });
                fetchData(); // Refresh the table
            } else {
                throw new Error("Failed to add vehicle");
            }
        } catch (error) {
            console.error(error);
            alert("❌ Error adding vehicle.");
        }
    };

    // 🟢 DELETE CAR FROM DATABASE
    const handleDeleteCar = async (id: string) => {
        if (!confirm("Are you sure you want to remove this vehicle from the platform?")) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/cars/${id}`, { method: 'DELETE' });
            if (response.ok) fetchData();
        } catch (error) {
            console.error("Error deleting vehicle:", error);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">

            {/* 🟢 NAVY BLUE SIDEBAR */}
            <aside className="w-64 bg-[#000080] text-white hidden md:flex flex-col shadow-xl z-20">
                <div className="p-6 border-b border-blue-800/50">
                    <h2 className="text-2xl font-black tracking-tight cursor-pointer">
                        Airgo<span className="text-[#87CEEB]">.admin</span>
                    </h2>
                    <p className="text-xs text-blue-300 mt-1 uppercase tracking-widest font-semibold">Command Center</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'overview' ? 'bg-[#87CEEB] text-[#000080] shadow-md' : 'hover:bg-blue-800 text-blue-100'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Overview
                    </button>
                    <button onClick={() => setActiveTab('cars')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'cars' ? 'bg-[#87CEEB] text-[#000080] shadow-md' : 'hover:bg-blue-800 text-blue-100'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        Manage Fleet
                    </button>
                    <button onClick={() => setActiveTab('hotels')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'hotels' ? 'bg-[#87CEEB] text-[#000080] shadow-md' : 'hover:bg-blue-800 text-blue-100'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        Manage Hotels
                    </button>
                </nav>
                <div className="p-4">
                    <Link href="/">
                        <button className="w-full bg-blue-900 text-white px-4 py-3 rounded-xl text-sm font-bold border border-blue-700 hover:bg-blue-800 transition">
                            Exit to Live Site
                        </button>
                    </Link>
                </div>
            </aside>

            {/* 🟢 MAIN DASHBOARD CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">

                {/* Header */}
                <header className="bg-white px-8 py-5 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10">
                    <h1 className="text-2xl font-black text-[#000080] capitalize">{activeTab} Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-500">Superadmin Access</span>
                        <div className="w-10 h-10 bg-[#87CEEB] rounded-full flex items-center justify-center text-[#000080] font-black shadow-inner">
                            SA
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#000080]"></div>
                        </div>
                    ) : (
                        <>
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">System Status</p>
                                            <p className="text-xl font-black text-green-600 flex items-center gap-2">
                                                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span> Online
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CARS TAB */}
                            {activeTab === 'cars' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h2 className="text-lg font-bold text-gray-800">Live Vehicle Fleet</h2>
                                        <button onClick={() => setIsCarModalOpen(true)} className="bg-[#000080] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-900 transition flex items-center gap-2">
                                            <span>+</span> Add Vehicle
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                                    <th className="p-4 font-bold">Vehicle</th>
                                                    <th className="p-4 font-bold">Type</th>
                                                    <th className="p-4 font-bold">Price (Day)</th>
                                                    <th className="p-4 font-bold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {cars.length === 0 ? (
                                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-medium">No vehicles found. Add your first vehicle!</td></tr>
                                                ) : cars.map(car => (
                                                    <tr key={car._id} className="hover:bg-gray-50 transition">
                                                        <td className="p-4 flex items-center gap-3">
                                                            <img src={car.image} alt={car.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                                            <span className="font-bold text-[#000080]">{car.name}</span>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-600">{car.type}</td>
                                                        <td className="p-4 font-bold text-gray-900">₦{car.price?.toLocaleString()}</td>
                                                        <td className="p-4 text-right">
                                                            <button onClick={() => handleDeleteCar(car._id)} className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded-md">Delete</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* HOTELS TAB */}
                            {activeTab === 'hotels' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🏗️</div>
                                    <h2 className="text-2xl font-black text-gray-800 mb-2">Hotel Management Protocol</h2>
                                    <p className="text-gray-500 max-w-md mx-auto">The Hotel posting interface is securely structured. Partner APIs for property uploads will be integrated in the next phase.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* 🟢 ADD CAR MODAL */}
            {isCarModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000080]/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-black text-[#000080]">Add New Vehicle</h2>
                            <button onClick={() => setIsCarModalOpen(false)} className="text-gray-400 hover:text-gray-700">✕</button>
                        </div>
                        <form onSubmit={handleAddCar} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle Name</label>
                                    <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none" placeholder="e.g. Lexus LX 570" value={newCar.name} onChange={e => setNewCar({ ...newCar, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle Type</label>
                                    <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none" placeholder="e.g. Premium SUV" value={newCar.type} onChange={e => setNewCar({ ...newCar, type: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Daily Price (₦)</label>
                                    <input required type="number" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none" placeholder="e.g. 250000" value={newCar.price} onChange={e => setNewCar({ ...newCar, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
                                    <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none" placeholder="e.g. 7 Seats" value={newCar.capacity} onChange={e => setNewCar({ ...newCar, capacity: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL (Unsplash/Cloudinary)</label>
                                <input required type="url" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none" placeholder="https://..." value={newCar.image} onChange={e => setNewCar({ ...newCar, image: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Features Summary</label>
                                <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#87CEEB] outline-none" placeholder="e.g. Chauffeur Included • Armored" value={newCar.features} onChange={e => setNewCar({ ...newCar, features: e.target.value })} />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCarModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                                <button type="submit" className="bg-[#000080] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-900 transition">Deploy Vehicle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}