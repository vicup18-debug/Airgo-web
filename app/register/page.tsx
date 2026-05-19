"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // 🟢 NEW: Green Banner State

    // 🟢 NEW: Password Visibility States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🟢 STRICT VALIDATION
        if (!agreed) return setError("You must agree to the Terms & Conditions.");
        if (!formData.phone) return setError("Phone number is required.");
        if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
        if (formData.password.length < 6) return setError("Password must be at least 6 characters.");

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    role: 'client'
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Registration failed');

            // 🟢 SHOW GREEN BANNER & REDIRECT
            setSuccessMessage("✅ Account created successfully! Redirecting to login...");

            setTimeout(() => {
                router.push('/login');
            }, 2000); // Waits 2 seconds so they can read the success message

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false); // Only stop loading if there's an error, otherwise let it redirect
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

                        {/* 🔴 ERROR BANNER */}
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* 🟢 SUCCESS BANNER */}
                        {successMessage && (
                            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-bold border border-green-100 flex items-center gap-2">
                                <span className="animate-pulse">⏳</span> {successMessage}
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

                        {/* 🟢 PASSWORD FIELD WITH EYE ICON */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
                            <input required type={showPassword ? "text" : "password"} minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition pr-12" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[28px] text-gray-400 hover:text-[#000080] font-bold text-xs uppercase transition">
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {/* 🟢 CONFIRM PASSWORD FIELD WITH EYE ICON */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Confirm Password</label>
                            <input required type={showConfirmPassword ? "text" : "password"} minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition pr-12" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-[28px] text-gray-400 hover:text-[#000080] font-bold text-xs uppercase transition">
                                {showConfirmPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {/* LEGAL CHECKBOX (For app/register/page.tsx and app/join/page.tsx) */}
                        <div className="flex items-start mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 mr-3 cursor-pointer w-5 h-5 accent-[#000080] shrink-0"
                            />
                            <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
                                I agree to Airgo's <Link href="/terms" className="text-[#000080] font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#000080] font-bold hover:underline">Privacy Policy</Link>. I also accept the <Link href="/escrow" className="text-[#FFB81C] font-black hover:underline">Airgo Escrow Protection Agreement</Link>.
                            </label>
                        </div>

                        <button disabled={isLoading || !agreed} type="submit" className={`w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-lg font-black text-white transition mt-6 ${(isLoading || !agreed) ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-[#000080] hover:bg-blue-900'}`}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-600">Already have an account? <Link href="/login" className="font-bold text-[#000080] hover:underline">Sign in</Link></p>
                        <p className="text-sm text-gray-600 mt-2">Want to list your fleet? <Link href="/join" className="font-bold text-[#FFB81C] hover:underline">Become a Partner</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}