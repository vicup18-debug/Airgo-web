"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 🟢 ADDED: Show/Hide Password State
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Login failed');

            // 🟢 MATCHES YOUR BACKEND EXACTLY
            localStorage.setItem('airgo_token', data.token);
            localStorage.setItem('airgo_user', JSON.stringify({
                id: data.userId,
                name: data.name,
                email: data.email,
                role: data.role,
                isApproved: data.isApproved // Needed for partner dashboard routing
            }));

            // 🟢 SMART REDIRECT BASED ON ROLE
            if (data.role === 'admin') {
                router.push('/admin');
            } else if (data.role === 'partner') {
                router.push('/partner');
            } else {
                router.push('/dashboard'); // Client Dashboard
            }

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
                <h2 className="mt-6 text-2xl font-bold text-gray-900">Sign in to your account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100">
                                ⚠️ {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
                            <input
                                required
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* 🟢 UPGRADED: Password Field with Show/Hide Toggle */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-[#000080] outline-none transition pr-12"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[28px] text-gray-400 hover:text-[#000080] font-bold text-xs uppercase transition"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className={`w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-lg font-black text-white transition ${isLoading ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-[#000080] hover:bg-blue-900'}`}
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-bold text-[#000080] hover:underline">
                                Create one for free
                            </Link>
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            Business owner?{' '}
                            <Link href="/join" className="font-bold text-[#FFB81C] hover:underline">
                                Partner Signup
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}