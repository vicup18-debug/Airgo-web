import React from 'react';
import Link from 'next/link';

export default function CorporatePage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <nav className="bg-[#004A99] text-white py-4 px-8 shadow-md">
                <Link href="/">
                    <div className="text-2xl font-black tracking-tight cursor-pointer">
                        Airgo<span className="text-[#FFB81C]">.ng</span>
                    </div>
                </Link>
            </nav>

            <main className="flex-grow max-w-4xl mx-auto py-16 px-6 w-full">
                <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Corporate Contract Services</h1>

                    <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                        <p>At Airgo.ng, we understand that corporate travel requires efficiency, cost control, flexibility, and reliable support. Our Corporate Contract Service is designed to help businesses streamline their travel operations while enjoying exclusive benefits, negotiated rates, and dedicated account management.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">What is a Corporate Contract?</h2>
                        <p>A corporate contract is a customized travel management agreement between Airgo.ng and your organization. It enables your company to access special travel rates, structured booking processes, and dedicated support for all your travel needs—including flight bookings, hotel reservations, and car rental services.</p>

                        <div className="bg-[#F0F7FF] border border-blue-100 p-8 rounded-2xl mt-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Key Benefits of Partnering with Airgo.ng</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700 font-medium">
                                <li>Cost Optimization through negotiated deals</li>
                                <li>Dedicated Account Management</li>
                                <li>24/7 Priority Support</li>
                                <li>Detailed Reporting & Analytics</li>
                                <li>Flexible Payment Options, including invoicing</li>
                            </ul>
                        </div>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">Get Started Today</h2>
                        <p>Partner with Airgo.ng and transform the way your organization manages travel. Contact our corporate team today to discuss your needs and discover how our tailored corporate contract solutions can support your business growth. Airgo.ng – Simplifying Corporate Travel, Empowering Your Business.</p>
                    </div>
                </div>
            </main>

            <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
                <p>© 2026 Airgo.ng. All rights reserved.</p>
            </footer>
        </div>
    );
}