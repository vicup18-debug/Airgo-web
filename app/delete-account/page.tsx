'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

// Note: metadata export works in Server Components.
// Since we need 'use client' for state, metadata is defined in a separate layout
// or in the parent. Title is set via <title> tag below for simplicity.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.airgo.ng';

type Step = 'form' | 'loading' | 'success' | 'error';

export default function DeleteAccountPage() {
    const [step, setStep] = useState<Step>('form');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [reason, setReason] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const errors: { email?: string; password?: string } = {};
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = 'Please enter a valid email address.';
        }
        if (!password.trim()) {
            errors.password = 'Password is required to confirm your identity.';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setStep('loading');
        setErrorMsg('');

        try {
            // Step 1: Log in to get userId
            const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
            });
            const loginData = await loginRes.json();

            if (!loginRes.ok) {
                setErrorMsg(loginData.message || 'Invalid email or password. Please check your credentials.');
                setStep('error');
                return;
            }

            const userId = loginData.userId || loginData.id;
            if (!userId) {
                setErrorMsg('Could not verify your account. Please try again or contact support.');
                setStep('error');
                return;
            }

            // Step 2: Delete the account
            const deleteRes = await fetch(`${API_BASE}/api/auth/account`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password }),
            });
            const deleteData = await deleteRes.json();

            if (!deleteRes.ok) {
                setErrorMsg(deleteData.message || 'Account deletion failed. Please try again or contact support.');
                setStep('error');
                return;
            }

            setStep('success');
        } catch {
            setErrorMsg('A network error occurred. Please check your connection and try again.');
            setStep('error');
        }
    };

    return (
        <>
            <title>Delete Your Account | Airgo.ng</title>
            <meta name="description" content="Request permanent deletion of your Airgo account and all associated personal data." />

            <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
                <div className="w-full max-w-lg">

                    {/* Logo / Brand */}
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-block">
                            <span className="text-3xl font-black text-[#004A99] tracking-tight">Airgo</span>
                            <span className="text-3xl font-black text-gray-800">.ng</span>
                        </Link>
                    </div>

                    {/* ── SUCCESS STATE ── */}
                    {step === 'success' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
                            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 mb-3">Account Deleted</h1>
                            <p className="text-gray-500 text-base leading-relaxed mb-6">
                                Your Airgo account and all associated personal data have been permanently deleted.
                                A confirmation email has been sent to your address.
                            </p>
                            <p className="text-sm text-gray-400 mb-8">
                                If you believe this was done in error, please contact{' '}
                                <a href="mailto:support@airgo.ng" className="text-[#004A99] underline">support@airgo.ng</a>{' '}
                                within 30 days.
                            </p>
                            <Link
                                href="/"
                                className="inline-block bg-[#004A99] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#003a7a] transition-colors"
                            >
                                Return to Homepage
                            </Link>
                        </div>
                    )}

                    {/* ── ERROR STATE ── */}
                    {step === 'error' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
                            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 mb-3">Something Went Wrong</h1>
                            <p className="text-gray-500 text-base leading-relaxed mb-8">{errorMsg}</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => { setStep('form'); setErrorMsg(''); }}
                                    className="bg-[#004A99] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#003a7a] transition-colors"
                                >
                                    Try Again
                                </button>
                                <a
                                    href="mailto:support@airgo.ng"
                                    className="border border-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    )}

                    {/* ── FORM STATE ── */}
                    {(step === 'form' || step === 'loading') && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Warning banner */}
                            <div className="bg-red-50 border-b border-red-100 px-8 py-5 flex items-start gap-4">
                                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-red-800 text-sm">This action is permanent and cannot be undone.</p>
                                    <p className="text-red-600 text-sm mt-1 leading-relaxed">
                                        All your bookings, personal data, and account history will be permanently erased from Airgo systems.
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 md:p-10">
                                <h1 className="text-2xl font-black text-gray-900 mb-2">Delete Your Account</h1>
                                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                    Enter your Airgo account credentials below. Your account will be deleted immediately upon submission.
                                </p>

                                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                                    {/* Email */}
                                    <div>
                                        <label htmlFor="delete-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            id="delete-email"
                                            type="email"
                                            autoComplete="email"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: undefined })); }}
                                            placeholder="you@example.com"
                                            disabled={step === 'loading'}
                                            className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004A99] focus:border-transparent transition ${fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} disabled:opacity-50`}
                                        />
                                        {fieldErrors.email && (
                                            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label htmlFor="delete-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Password
                                        </label>
                                        <input
                                            id="delete-password"
                                            type="password"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={e => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); }}
                                            placeholder="Your account password"
                                            disabled={step === 'loading'}
                                            className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004A99] focus:border-transparent transition ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} disabled:opacity-50`}
                                        />
                                        {fieldErrors.password && (
                                            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.password}</p>
                                        )}
                                    </div>

                                    {/* Optional reason */}
                                    <div>
                                        <label htmlFor="delete-reason" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Reason for leaving{' '}
                                            <span className="font-normal text-gray-400">(optional)</span>
                                        </label>
                                        <select
                                            id="delete-reason"
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                            disabled={step === 'loading'}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004A99] focus:border-transparent disabled:opacity-50"
                                        >
                                            <option value="">Select a reason…</option>
                                            <option value="not_using">I no longer use the service</option>
                                            <option value="privacy">Privacy concerns</option>
                                            <option value="alternative">Switching to an alternative</option>
                                            <option value="too_expensive">Service is too expensive</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        id="delete-account-submit"
                                        type="submit"
                                        disabled={step === 'loading'}
                                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
                                    >
                                        {step === 'loading' ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                Deleting account…
                                            </>
                                        ) : (
                                            'Permanently Delete My Account'
                                        )}
                                    </button>
                                </form>

                                <p className="text-center text-sm text-gray-400 mt-6">
                                    Changed your mind?{' '}
                                    <Link href="/" className="text-[#004A99] font-semibold hover:underline">
                                        Go back to Airgo
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer note */}
                    <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
                        Need help? Email{' '}
                        <a href="mailto:support@airgo.ng" className="underline hover:text-gray-600">support@airgo.ng</a>
                        {' '}or call{' '}
                        <a href="tel:+2347078344409" className="underline hover:text-gray-600">+234 707 834 4409</a>
                    </p>
                </div>
            </main>
        </>
    );
}
