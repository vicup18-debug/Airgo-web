import React from 'react';
import Link from 'next/link';

export default function HowWeWorkPage() {
    const steps = [
        { num: "01", title: "Smart Search & Discovery", desc: "Airgo.ng scans multiple global travel providers in real-time. Compare airlines, browse accommodations, and find reliable vehicles suited for your travel needs." },
        { num: "02", title: "Transparent Comparison", desc: "We display clear pricing with no hidden charges, detailed service descriptions, and clear cancellation policies so you always know what you're paying for." },
        { num: "03", title: "Seamless & Secure Booking", desc: "Confirm your reservation in just a few steps. Airgo.ng uses trusted and encrypted payment gateways to protect your personal and financial information." },
        { num: "04", title: "24/7 Dedicated Support", desc: "Our relationship doesn’t end after booking. We provide round-the-clock customer support to assist with changes, cancellations, and travel advice." }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            

            <main className="flex-grow max-w-4xl mx-auto py-16 px-6 w-full">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">How We Work</h1>
                    <p className="text-lg text-gray-600">
                        From the moment you start searching to the time you complete your journey, our system is designed to guide you every step of the way.
                    </p>
                </div>

                {/* 🟢 INTERACTIVE LIST CARDS */}
                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="group flex flex-col md:flex-row items-start md:items-center gap-6 bg-white border border-gray-200 p-8 rounded-2xl hover:border-[#004A99] hover:shadow-sm transition-all duration-300"
                        >
                            <div className="text-5xl font-black text-gray-100 group-hover:text-[#FFB81C] transition-colors duration-300">
                                {step.num}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#004A99] transition-colors">
                                    {step.title}
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            
        </div>
    );
}