"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // 🟢 DYNAMIC VALIDATION: Matches our mobile app!
    const isFormValid = email.includes('@') && password.length >= 6;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        alert("Login successful! Welcome to Airgo.");
    };

    return (
        <div className="min-h-screen flex font-sans bg-white">

            {/* 🟢 LEFT SIDE: FORM */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-20">
                <div className="w-full max-w-md">

                    <Link href="/">
                        <div className="text-3xl font-black tracking-tight cursor-pointer mb-12 text-[#004A99]">
                            Airgo<span className="text-[#FFB81C]">.ng</span>
                        </div>
                    </Link>

                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Sign in</h1>
                    <p className="text-gray-500 mb-8">Welcome back! Please enter your details.</p>

                    <button className="w-full flex items-center justify-center space-x-3 border border-gray-200 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition mb-6">
                        <span className="text-xl">G</span>
                        <span>Continue with Google</span>
                    </button>

                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="px-4 text-sm text-gray-400 font-medium">OR</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004A99] transition"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004A99] transition"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3 text-sm text-gray-500 font-bold hover:text-gray-700"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="rounded text-[#004A99]" />
                                <span className="text-gray-600 font-medium">Remember for 30 days</span>
                            </label>
                            <a href="#" className="text-[#004A99] font-bold hover:underline">Forgot password?</a>
                        </div>

                        {/* 🟢 DYNAMIC BUTTON */}
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={`w-full py-4 rounded-lg font-black text-lg transition-all duration-300 ${isFormValid ? 'bg-[#004A99] text-white shadow-lg hover:bg-blue-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            Sign In
                        </button>
                    </form>

                    <p className="text-center text-gray-600 mt-8 text-sm">
                        Don't have an account? <a href="#" className="text-[#004A99] font-bold hover:underline">Sign up</a>
                    </p>
                </div>
            </div>

            {/* 🟢 RIGHT SIDE: IMAGE */}
            <div className="hidden md:block w-1/2 relative bg-gray-100">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?q=80&w=1500')" }}
                ></div>
                <div className="absolute inset-0 bg-[#004A99] bg-opacity-20 mix-blend-multiply"></div>
            </div>
        </div>
    );
}