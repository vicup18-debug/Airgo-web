"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinPartnerPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        businessName: '',
        partnerType: 'car' // 🟢 Default to car
    });
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) return setError("You must agree to the Terms & Conditions.");

        setIsLoading(true);
        setError('');

        try {
            const apiUrl = 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role: 'partner'
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');

            alert("✅ Application Submitted! Airgo Admin will review your business details shortly.");
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000080] flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/">
                    <h2 className="text-4xl font-black text-white tracking-tighter">Airgo<span className="text-[#FFB81C]">.partner</span></h2>
                </Link>
                <h2 className="mt-6 text-2xl font-bold text-blue-100">Partner with the Elite</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl">
                    <form className="space-y-4" onSubmit={handleRegister}>
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100">⚠️ {error}</div>}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Partner Type</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#000080] outline-none"
                                    value={formData.partnerType}
                                    onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                                >
                                    <option value="car">Fleet Manager</option>
                                    <option value="hotel">Hotelier</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Name</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
                            </div>
                        </div>

                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Name</label><input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Email</label><input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label><input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label><input required type="password" minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>

                        <div className="flex items-start mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 mr-3 w-5 h-5 accent-[#000080] cursor-pointer" />
                            <label htmlFor="terms" className="text-xs text-blue-900 cursor-pointer leading-relaxed">
                                I agree to the <span className="font-bold underline">Airgo Partnership Agreement</span>. I certify that my business is registered and all assets provided will be verified for quality assurance.
                            </label>
                        </div>

                        <button disabled={isLoading || !agreed} type="submit" className={`w-full flex justify-center py-4 rounded-xl shadow-lg text-lg font-black text-white transition mt-6 ${(isLoading || !agreed) ? 'bg-gray-400' : 'bg-[#000080] hover:bg-blue-900'}`}>
                            {isLoading ? 'Processing...' : 'Start Registration'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}