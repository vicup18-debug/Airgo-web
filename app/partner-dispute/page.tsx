import React from 'react';

export default function PartnerDisputePage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <main className="flex-grow max-w-4xl mx-auto py-16 px-6 w-full">
                <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Partner Dispute Resolution</h1>

                    <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                        <p>At Airgo.ng, we are committed to maintaining a fair and transparent ecosystem for both our guests and our partners. If a dispute arises between a guest and a partner regarding a booking, our dispute resolution process ensures that issues are handled efficiently and justly.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">1. Escrow Protection</h2>
                        <p>Airgo holds all booking funds in secure escrow. Funds are only released to the partner 24 hours after the guest successfully checks in. This ensures that the guest receives the expected quality of service and the partner is guaranteed payment upon fulfilling their obligations.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">2. Filing a Dispute</h2>
                        <p>If a service is not delivered as described, or if a partner faces an issue with a guest, a dispute must be filed within the 24-hour check-in window. Our dedicated compliance team will review the evidence provided by both parties.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">3. Resolution Process</h2>
                        <p>Once a dispute is raised, the escrow funds are temporarily frozen. Our team investigates the matter thoroughly, aiming for an amicable resolution within 48 hours. Depending on the outcome, funds may be refunded to the guest or released to the partner.</p>

                        <h2 className="text-2xl font-bold text-[#004A99] mt-8 mb-4">4. Contact Information</h2>
                        <p>To file a dispute or request assistance, please contact our support team immediately:<br />
                            Email: info@airgo.ng<br />
                            Phone: +2347078344409</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
