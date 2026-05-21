import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            

            <main className="flex-grow max-w-4xl mx-auto py-16 px-6 w-full">
                <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Terms of Service</h1>

                    <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">1. Introduction</h2>
                        <p>Welcome to Airgo.ng (“Airgo.ng,” “we,” “our,” or “us”), an Online Travel Agency (OTA) providing services including flight bookings and reservations, hotel bookings, and car rental services. These Terms of Service (“Terms”) govern your access to and use of our website, mobile platforms, and services. By accessing or using Airgo.ng, you agree to be legally bound by these Terms.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">2. Scope of Services</h2>
                        <p>Airgo.ng acts as an intermediary between users and third-party service providers, including Airlines, Hotels, and Car rental providers. We do not own, operate, or control these third-party services. Your booking constitutes a direct agreement between you and the relevant service provider.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">3. Pricing and Payments</h2>
                        <p>Prices displayed include applicable taxes unless stated otherwise. Full payment is required at the time of booking unless otherwise stated. Payments are processed through secure third-party gateways. We reserve the right to cancel bookings suspected of fraud or unauthorized transactions.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">4. Cancellations, Changes, and Refunds</h2>
                        <p>Cancellation and modification policies vary depending on the service provider (airline, hotel, or car rental company). Refunds are processed in accordance with provider policies. Airgo.ng may charge a service fee for processing changes or cancellations.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">5. Contact Information</h2>
                        <p>For inquiries regarding these Terms, please contact Airgo.ng Customer Support:<br />
                            Email: info@airgo.ng<br />
                            Phone: +2347078344409</p>
                    </div>
                </div>
            </main>

            
        </div>
    );
}