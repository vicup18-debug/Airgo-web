"use client";
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }: { children: React.ReactNode }) {
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
