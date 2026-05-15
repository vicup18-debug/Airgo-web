"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    // 🟢 ADDED: idNumber to formData
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', idNumber: '' });

    // 🟢 ADDED: State to hold the uploaded ID file
    const [idFile, setIdFile] = useState<File | null>(null);

    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🟢 STRICT VALIDATION
        if (!agreed) return setError("You must agree to the Terms & Conditions.");
        if (!idFile) return setError("Please upload a valid ID document.");
        if (!formData.phone) return setError("Phone number is required.");

        setIsLoading(true);
        setError('');

        try {
            // 🟢 1. UPLOAD ID DOCUMENT TO CLOUDINARY FIRST
            let finalIdUrl = "";
            const imgData = new FormData();
            imgData.append('file', idFile);
            imgData.append('upload_preset', 'airgo_fleet');

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/drdosbrru/image/upload`, {
                method: 'POST', body: imgData
            });
            const cloudData = await cloudRes.json();

            if (cloudData.secure_url) {
                finalIdUrl = cloudData.secure_url;
            } else {
                throw new Error("Failed to upload ID document. Please try again.");
            }

            // 🟢 2. SEND DATA TO BACKEND
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    idDocumentUrl: finalIdUrl, // Attach the secure Cloudinary link
                    role: 'client'
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
                                <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                {/* 🟢 NEW: ID NUMBER FIELD */}
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">ID Number (NIN/DL)</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} />
                            </div>
                        </div>

                        {/* 🟢 NEW: ID UPLOAD FIELD */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Upload Valid ID (Driver's License / NIN / Passport) *</label>
                            <input required type="file" accept="image/*,application/pdf" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#000080] file:text-white hover:file:bg-blue-900 cursor-pointer" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
                            <input required type="password" minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </div>

                        <div className="flex items-start mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 mr-3 cursor-pointer w-5 h-5 accent-[#000080] shrink-0"
                            />
                            <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
                                I agree to Airgo's <span className="text-[#000080] font-bold">Terms of Service</span> and <span className="text-[#000080] font-bold">Privacy Policy</span>. I consent to identity verification to access secure escrows.
                            </label>
                        </div>

                        <button
                            disabled={isLoading || !agreed}
                            type="submit"
                            className={`w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-lg font-black text-white transition mt-6 ${(isLoading || !agreed) ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-[#000080] hover:bg-blue-900'
                                }`}
                        >
                            {isLoading ? 'Encrypting & Submitting...' : 'Create Account'}
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