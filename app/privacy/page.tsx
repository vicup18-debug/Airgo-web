import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            

            <main className="flex-grow max-w-4xl mx-auto py-16 px-6 w-full">
                <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Privacy Notice</h1>

                    <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">1. Introduction</h2>
                        <p>We are committed to protecting your personal data and ensuring transparency in how we collect, use, store, and share your information. This Privacy Notice is issued in accordance with applicable data protection laws, including the Nigeria Data Protection Act (NDPA) 2023. By accessing or using our Services, you confirm that you have read, understood, and agreed to this Privacy Notice.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">2. Categories of Personal Data We Collect</h2>
                        <p>We collect personal data directly from you, automatically through your use of our Services, and from third parties. This includes your full name, email address, phone number, payment information (processed via secure third-party gateways), booking & travel information, and automatically collected data like your IP address and device type.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">3. How We Use Your Personal Data</h2>
                        <p>We use your data for Service Delivery (processing flights, hotels, and cars), Customer Support, Communication, Payment Processing, Personalization, Marketing (with consent), and Legal Compliance.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">4. Data Security & Retention</h2>
                        <p>We implement robust security measures, including SSL encryption, secure servers, and access control. We retain personal data only as long as necessary to fulfill contractual obligations, comply with legal requirements, and resolve disputes. Once no longer needed, data is securely deleted or anonymized</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">5. Contact Information</h2>
                        <p>For questions, complaints, or requests regarding this Privacy Notice, please contact:<br />
                            Email: info@airgo.ng<br />
                            Phone: +2347078344409</p>
                    </div>
                </div>
            </main>

            
        </div>
    );
}