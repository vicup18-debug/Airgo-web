"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    // 🟢 ADDED: T&C State
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🟢 BLOCK if they bypass the UI somehow
        if (!agreed) {
            setError("You must agree to the Terms & Conditions.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Hardcoded Render URL to guarantee connection
            const apiUrl = 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role: 'client' // AUTOMATICALLY SECURES THIS ACCOUNT AS A STANDARD CLIENT
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Registration failed');

            alert("✅ Account created successfully! Please log in.");
            router.push('/login');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/">
                    <h2 className="text-4xl font-black text-[#000080] tracking-tighter">
                        Airgo<span className="text-[#FFB81C]">.ng</span>
                    </h2>
                </Link>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">Create a Client Account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100">
                    <form className="space-y-4" onSubmit={handleRegister}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100">
                                ⚠️ {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                            <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
                            <input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
                            <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
                            <input required type="password" minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </div>

                        {/* 🟢 T&C Checkbox */}
                        <div className="flex items-start mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 mr-3 cursor-pointer w-5 h-5 accent-[#000080]"
                            />
                            <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
                                I agree to Airgo's <span className="text-[#000080] font-bold">Terms of Service</span> and <span className="text-[#000080] font-bold">Privacy Policy</span>. I understand that all vehicle bookings are subject to the Airgo Escrow framework for platform security.
                            </label>
                        </div>

                        {/* 🟢 BUTTON DISABLED IF T&C NOT CHECKED */}
                        <button
                            disabled={isLoading || !agreed}
                            type="submit"
                            className={`w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-lg font-black text-white transition mt-6 ${(isLoading || !agreed) ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-[#000080] hover:bg-blue-900'
                                }`}
                        >
                            {isLoading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                            Already have an account? <Link href="/login" className="font-bold text-[#000080] hover:underline">Sign in</Link>
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            Want to list your fleet? <Link href="/join" className="font-bold text-[#FFB81C] hover:underline">Become a Partner</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}