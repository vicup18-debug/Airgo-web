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
        businessAddress: '',
        cacNumber: '', // Will only be enforced if 'hotel' is selected
        partnerType: 'car'
    });

    // 🟢 DYNAMIC UPLOAD STATE: Holds either the CAC or Driver's License
    const [verificationFile, setVerificationFile] = useState<File | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreed) return setError("You must agree to the Terms & Conditions.");
        if (!verificationFile) return setError("Please upload the required verification document.");
        if (!formData.phone) return setError("Phone number is required.");

        setIsLoading(true);
        setError('');

        try {
            // 1. UPLOAD DOCUMENT TO CLOUDINARY
            let finalFileUrl = "";
            const imgData = new FormData();
            imgData.append('file', verificationFile);
            imgData.append('upload_preset', 'airgo_fleet');

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/drdosbrru/image/upload`, {
                method: 'POST',
                body: imgData
            });
            const cloudData = await cloudRes.json();

            if (cloudData.secure_url) {
                finalFileUrl = cloudData.secure_url;
            } else {
                throw new Error("Failed to upload document. Please try again.");
            }

            // 2. ASSIGN URL BASED ON PARTNER TYPE
            const payload = {
                ...formData,
                role: 'partner',
                cacCertificateUrl: formData.partnerType === 'hotel' ? finalFileUrl : '',
                driversLicenseUrl: formData.partnerType === 'car' ? finalFileUrl : '',
            };

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');

            alert("✅ Application Submitted! Airgo Admin will review your comprehensive business details shortly.");
            router.push('/login');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000080] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/">
                    <h2 className="text-4xl font-black text-white tracking-tighter">Airgo<span className="text-[#FFB81C]">.partner</span></h2>
                </Link>
                <h2 className="mt-6 text-2xl font-bold text-blue-100">Partner with the Elite</h2>
                <p className="mt-2 text-sm text-blue-200">Strict verification required for all car rental and hotel partners.</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl">
                    <form className="space-y-5" onSubmit={handleRegister}>
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100">⚠️ {error}</div>}

                        {/* PARTNER TYPE & BUSINESS NAME */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Partner Type</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none"
                                    value={formData.partnerType}
                                    onChange={(e) => {
                                        setFormData({ ...formData, partnerType: e.target.value, cacNumber: '' });
                                        setVerificationFile(null); // Reset file if they switch types
                                    }}
                                >
                                    {/* 🟢 FIXED: Updated Dropdown Text */}
                                    <option value="car">Car Rental</option>
                                    <option value="hotel">Hotel</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Name</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
                            </div>
                        </div>

                        {/* BUSINESS ADDRESS */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Address *</label>
                            <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.businessAddress} onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })} />
                        </div>

                        {/* 🟢 CONDITIONAL FIELDS: HOTEL vs CAR RENTAL */}
                        {formData.partnerType === 'hotel' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CAC Registration Number *</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.cacNumber} onChange={(e) => setFormData({ ...formData, cacNumber: e.target.value })} />
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Upload CAC Certificate *</label>
                                    <input required type="file" accept="image/*,application/pdf" className="w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#000080] file:text-white hover:file:bg-blue-900 cursor-pointer" onChange={(e) => setVerificationFile(e.target.files?.[0] || null)} />
                                </div>
                            </>
                        )}

                        {formData.partnerType === 'car' && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Upload Driver's License *</label>
                                <input required type="file" accept="image/*,application/pdf" className="w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#000080] file:text-white hover:file:bg-blue-900 cursor-pointer" onChange={(e) => setVerificationFile(e.target.files?.[0] || null)} />
                            </div>
                        )}

                        {/* CONTACT INFO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Name</label><input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number *</label><input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                        </div>

                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Email</label><input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label><input required type="password" minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>

                        {/* TERMS AND CONDITIONS */}
                        <div className="flex items-start mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 mr-3 w-5 h-5 accent-[#000080] cursor-pointer shrink-0" />
                            <label htmlFor="terms" className="text-xs text-blue-900 cursor-pointer leading-relaxed">
                                I agree to the <span className="font-bold underline">Airgo Partnership Agreement</span>. I certify that my business is legally registered, and I consent to a comprehensive review of my submitted identification and business documents.
                            </label>
                        </div>

                        <button disabled={isLoading || !agreed} type="submit" className={`w-full flex justify-center py-4 rounded-xl shadow-lg text-lg font-black text-white transition mt-6 ${(isLoading || !agreed) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#000080] hover:bg-blue-900'}`}>
                            {isLoading ? 'Encrypting & Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}