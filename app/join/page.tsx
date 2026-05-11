"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PartnerRegisterPage() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', businessName: '', email: '', propertyType: 'Hotel', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const apiUrl = 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    password: formData.password,
                    businessName: formData.businessName, // Saved for partner records
                    role: 'partner' // 🟢 AUTOMATICALLY TAGS AS A PARTNER
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');

            alert("✅ Partner Account Created! Please log in to access your dashboard.");
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-[#004A99] text-white py-4 px-8 flex justify-between items-center shadow-md">
                <Link href="/">
                    <div className="text-2xl font-black tracking-tight cursor-pointer">Airgo<span className="text-[#FFB81C]">.ng</span></div>
                </Link>
            </nav>

            <div className="max-w-4xl mx-auto py-16 px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">List Your Property on Airgo</h1>
                        <p className="text-gray-600 text-lg">Reach thousands of travelers and corporate clients daily. Partner with Nigeria's fastest-growing OTA.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6 max-w-2xl mx-auto">
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100">⚠️ {error}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#004A99]" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#004A99]" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Business / Property Name</label>
                            <input required type="text" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#004A99]" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <input required type="email" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#004A99]" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Account Password</label>
                            <input required type="password" minLength={6} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#004A99]" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        </div>

                        <button disabled={isLoading} type="submit" className={`w-full mt-8 text-white py-4 rounded-lg font-black text-lg transition shadow-lg ${isLoading ? 'bg-gray-400' : 'bg-[#004A99] hover:bg-blue-800'}`}>
                            {isLoading ? 'Creating Account...' : 'Start Registration'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}