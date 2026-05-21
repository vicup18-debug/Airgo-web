"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

function VerifyEmailContent() {
    const [status, setStatus] = useState('Verifying...');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('Invalid or missing token.');
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
                const res = await fetch(`${apiUrl}/api/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Verification failed');

                setStatus('Email verified successfully!');
                toast.success('Email verified successfully! You can now login.');
                
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } catch (err: any) {
                setStatus(`Verification failed: ${err.message}`);
            }
        };

        verifyToken();
    }, [searchParams, router]);

    return (
        <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">{status}</h3>
            {status.includes('failed') && (
                <p className="mt-4">
                    <Link href="/login" className="text-sm font-bold text-[#000080] hover:underline">
                        Return to sign in
                    </Link>
                </p>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/">
                    <h2 className="text-4xl font-black text-[#000080] tracking-tighter">
                        Airgo<span className="text-[#FFB81C]">.ng</span>
                    </h2>
                </Link>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">Email Verification</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100">
                    <Suspense fallback={<div>Loading...</div>}>
                        <VerifyEmailContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
