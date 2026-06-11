"use client";
import React, { useEffect, useRef } from 'react';
import { Toaster, useToasterStore } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

const playNotificationSoundAndVibrate = () => {
    // 📳 Haptic Vibration (Vibrates mobile devices on notification)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            navigator.vibrate([100]);
        } catch (e) {
            console.warn("Vibration failed:", e);
        }
    }
    
    // 🔊 Synthesizes a premium double-beep chime using browser Web Audio API
    if (typeof window !== 'undefined') {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const playBeep = (time: number, freq: number, duration: number) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, time);
                    
                    gain.gain.setValueAtTime(0.08, time);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(time);
                    osc.stop(time + duration);
                };
                
                const now = ctx.currentTime;
                playBeep(now, 880, 0.1); // Beep 1 (A5)
                playBeep(now + 0.08, 1046.5, 0.15); // Beep 2 (C6)
            }
        } catch (e) {
            console.warn("Audio Context init failed:", e);
        }
    }
};

function ToastListener() {
    const { toasts } = useToasterStore();
    const lastToastCount = useRef(0);

    useEffect(() => {
        const activeToasts = toasts.filter(t => t.visible);
        if (activeToasts.length > lastToastCount.current) {
            playNotificationSoundAndVibrate();
        }
        lastToastCount.current = activeToasts.length;
    }, [toasts]);

    return null;
}

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
            <ToastListener />
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
