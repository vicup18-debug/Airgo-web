"use client";
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const ref = params.get('ref');
            if (ref) {
                localStorage.setItem('airgo_ref', ref.trim().toLowerCase());
                console.log('Saved affiliate referral:', ref.trim().toLowerCase());
            }
        }
    }, []);

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "426051101549-nsa4ivjki5eo0muc1efn7tbp0p1qrpe1.apps.googleusercontent.com"}>
            {children}
            <Toaster position="top-center" toastOptions={{
                duration: 4000,
                style: {
                    background: '#333',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: '12px'
                }
            }} />
        </GoogleOAuthProvider>
    );
}
