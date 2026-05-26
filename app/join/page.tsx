"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinPartnerPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '', // 🟢 ADDED: Confirm Password State
        phone: '',
        businessName: '',
        businessAddress: '',
        cacNumber: '',
        partnerType: 'car'
    });

    const [verificationFile, setVerificationFile] = useState<File | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    // 🟢 ADDED: UI States for Premium Experience
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🟢 STRICT VALIDATION
        if (!agreed) return setError("You must agree to the Terms & Conditions.");
        if (!verificationFile) return setError("Please upload the required verification document.");
        if (!formData.phone) return setError("Phone number is required.");
        if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
        if (formData.password.length < 6) return setError("Password must be at least 6 characters.");

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

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
                email: formData.email.toLowerCase(), // 🟢 SMART UPGRADE: Force email to lowercase for DB consistency
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

            // 🟢 SHOW GREEN BANNER & REDIRECT
            setSuccessMessage("✅ Application Submitted! Please check your email for a verification link to activate your account. Redirecting...");

            setTimeout(() => {
                router.push('/login?verifyEmail=true');
            }, 5000); // Waits 5 seconds so they can read the success message

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false); // Only stop loading if there's an error, otherwise let it redirect
        }
    };

    return (
        <div className="min-h-screen bg-[#000080] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/">
                    <h2 className="text-4xl font-black text-white tracking-tighter">Airgo<span className="text-[#FFB81C]">.ng</span></h2>
                </Link>
                <h2 className="mt-6 text-2xl font-bold text-blue-100">Partner with the Elite</h2>
                <p className="mt-2 text-sm text-blue-200">Strict verification required for all car rental and hotel partners.</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl">
                    <form className="space-y-5" onSubmit={handleRegister}>

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

                        {step === 1 && (
                            <>
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
                                    <option value="car">Car Rental</option>
                                    <option value="hotel">Hotel</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Name</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
                            </div>
                        </div>

                                {/* CONTACT INFO */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Name</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number *</label>
                                {/* 🟢 SMART FIELD: Restricts to valid phone number lengths */}
                                <input required type="tel" pattern="^\+?[0-9]{10,14}$" placeholder="e.g. 08012345678" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Email</label>
                            {/* 🟢 SMART FIELD: Instantly converts to lowercase as they type */}
                            <input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })} />
                        </div>

                        {/* PASSWORD & CONFIRM PASSWORD WITH SHOW/HIDE */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                <input required type={showPassword ? "text" : "password"} minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none pr-12" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[28px] text-gray-400 hover:text-[#000080] font-bold text-xs uppercase transition">
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
                                <input required type={showConfirmPassword ? "text" : "password"} minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none pr-12" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-[28px] text-gray-400 hover:text-[#000080] font-bold text-xs uppercase transition">
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* TERMS AND CONDITIONS */}
                        <div className="flex items-start mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 mr-3 w-5 h-5 accent-[#000080] cursor-pointer shrink-0" />
                            <label htmlFor="terms" className="text-xs text-blue-900 cursor-pointer leading-relaxed">
                                I agree to the <span className="font-bold underline">Airgo Partnership Agreement</span> and <Link href="/escrow" className="font-black text-[#FFB81C] hover:underline">Escrow Policy</Link>. I certify that my business is legally registered, and I consent to a comprehensive review of my submitted identification and business documents.
                            </label>
                        </div>

                        <button type="button" onClick={() => setStep(2)} disabled={!agreed} className={`w-full flex justify-center py-4 rounded-xl shadow-lg text-lg font-black text-white transition mt-6 ${(!agreed) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#000080] hover:bg-blue-900'}`}>
                            Continue
                        </button>
                        </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="flex items-center mb-4">
                                    <button type="button" onClick={() => setStep(1)} className="text-[#000080] font-black text-sm mr-4 hover:underline">← Back</button>
                                    <h3 className="text-lg font-bold text-gray-900">Verification Details</h3>
                                </div>
                                {/* BUSINESS ADDRESS */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Address *</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none" value={formData.businessAddress} onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })} />
                                </div>

                                {/* CONDITIONAL FIELDS: HOTEL vs CAR RENTAL */}
                                {formData.partnerType === 'hotel' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CAC Registration Number *</label>
                                            <input required type="text" pattern="^(RC|BN|rc|bn)?\d{4,8}$" title="Enter a valid CAC number (e.g. RC123456)" placeholder="e.g. RC123456 or BN123456" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none uppercase" value={formData.cacNumber} onChange={(e) => setFormData({ ...formData, cacNumber: e.target.value })} />
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

                                <button disabled={isLoading} type="submit" className={`w-full flex justify-center py-4 rounded-xl shadow-lg text-lg font-black text-white transition mt-6 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#000080] hover:bg-blue-900'}`}>
                                    {isLoading ? 'Encrypting & Submitting...' : 'Submit Application'}
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}