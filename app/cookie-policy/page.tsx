import React from 'react';

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <main className="flex-grow max-w-4xl mx-auto py-16 px-6 w-full">
                <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Cookie Policy</h1>

                    <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                        <p>Airgo.ng uses cookies and similar tracking technologies to enhance your experience on our platform, analyze site usage, and assist in our marketing efforts. This policy outlines how and why we use cookies.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">1. What Are Cookies?</h2>
                        <p>Cookies are small text files placed on your device by websites that you visit. They are widely used to make websites work, or work more efficiently, as well as to provide reporting information and personalize content.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">2. How We Use Cookies</h2>
                        <p>We use cookies to ensure that our app and website function correctly. This includes authenticating your secure login, retaining your booking preferences, and measuring performance metrics to help us deliver a premium, seamless travel experience.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">3. Your Choices</h2>
                        <p>You can instruct your browser or device to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">4. Contact Information</h2>
                        <p>For questions regarding this Cookie Policy, please contact:<br />
                            Email: info@airgo.ng<br />
                            Phone: +2347078344409</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
