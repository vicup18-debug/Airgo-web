import React from 'react';
import Link from 'next/link';

export default function PartnershipAgreementPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                    <Link href="/" className="font-black text-2xl tracking-tight text-[#000080] hover:opacity-85 transition">
                        Airgo<span className="text-[#FFB81C]">.ng</span>
                    </Link>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-[#000080] mb-2">AIRGO PARTNERSHIP AGREEMENT</h1>
                <p className="text-gray-500 font-medium mb-8">Standard Terms and Conditions for Verified Service Partners (Hotels, Host Apartments, Car Rental Fleets, and Taxi Operators)</p>

                <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">1. PARTIES AND PURPOSE</h2>
                        <p className="mb-3">This Partnership Agreement (the "Agreement") is entered into between Airgo Travel & Tour Ltd ("Airgo.ng", "Platform", "we", "our", or "us") and the registering Service Provider ("Partner", "you", or "your"). </p>
                        <p>By registering on the Airgo.ng platform, uploading verification documents, and submitting your partner application, you express your full consent and legal agreement to all terms specified herein. This agreement governs your listing of accommodations, vehicles, and transportation services on our platform.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">2. ELIGIBILITY AND VERIFICATION PROTOCOLS</h2>
                        <p className="mb-3">To maintain the premium nature of the Airgo marketplace, all partners must undergo a rigorous identity and registration review. You agree to provide:</p>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li><strong>Accommodations (Hotels & Apartments):</strong> A valid Corporate Affairs Commission (CAC) certificate, Tax Identification Number (TIN), business registration details, and verifiable ownership or lease documents.</li>
                            <li><strong>Transportation (Car Rentals & Taxis):</strong> A valid Driver's License, vehicle registration papers, proof of comprehensive commercial vehicle insurance, and roadworthiness certifications.</li>
                        </ul>
                        <p>Airgo reserves the absolute right to reject, suspend, or terminate any partner account if registration details are found to be fraudulent, misleading, or expired.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">3. ACCURATE LISTINGS AND PRICING</h2>
                        <p className="mb-3">Partners are solely responsible for keeping their listings updated. You agree to:</p>
                        <ul className="list-disc pl-6 space-y-1 mb-4">
                            <li>Provide accurate descriptions, specifications, rules, policies, and high-quality images of the listed assets.</li>
                            <li>Maintain real-time availability sync. In the event of double bookings or non-availability of a confirmed reservation, you must provide an equivalent or upgraded asset at no extra cost to the client.</li>
                            <li>Honor the pricing published on the platform. Attempting to charge clients additional unapproved fees outside the platform is strictly prohibited.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">4. ESCROW FACILITATION & DISBURSEMENT</h2>
                        <p className="mb-3">All customer payments for bookings made on Airgo.ng are secured via the Airgo Escrow Protection ledger. The payment flow is governed as follows:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Airgo collects and holds customer booking payments on behalf of the transaction.</li>
                            <li>Funds are held securely in escrow and are only authorized for release to the partner after successful check-in (for hotels/apartments) or commencement of services (for car rentals/taxis).</li>
                            <li>Payout disbursements are processed directly via secure bank transfers to the verified bank account provided during registration.</li>
                            <li>Payouts are subject to deduction of Airgo's agreed platform service commission.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">5. COMMISSIONS AND FEES</h2>
                        <p>Airgo charges a flat platform commission fee on all completed reservations. Commission structures vary by asset type and are communicated upon approval. These fees are deducted automatically from customer booking funds before payout disbursement. All payouts will be sent to the disbursement bank account verified during registration.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">6. SERVICE STANDARDS AND VEHICLE/PROPERTY MAINTENANCE</h2>
                        <p className="mb-3">To safeguard our mutual clients, partners must ensure the highest quality of service delivery:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>Accommodations:</strong> Rooms and suites must be thoroughly cleaned, secure, fully air-conditioned, and stocked with functioning utilities (water, electricity, internet) as listed.</li>
                            <li><strong>Vehicles:</strong> Must be mechanically sound, clean, regularly serviced, and driven by polite, licensed, and vetted professional drivers.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">7. CANCELLATION AND REFUND RULES</h2>
                        <p>Cancellations by the Partner must be reported immediately. Repeat cancellations by a partner will lead to platform penalties, demotion in search rankings, or complete account termination. Refunds to clients will be processed in accordance with the platform's cancellation and escrow policies.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">8. INDEMNIFICATION AND LIMITATION OF LIABILITY</h2>
                        <p>Partners agree to indemnify, defend, and hold harmless Airgo Travel & Tour Ltd, its officers, employees, and agents from any claims, liabilities, lawsuits, damages, accidents, property damage, personal injury, or death arising from the partner's assets, vehicles, services, or staff negligence.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">9. GOVERNING LAW</h2>
                        <p>This Partnership Agreement is governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising under this agreement shall be referred to arbitration in Abuja, Nigeria.</p>
                    </section>

                    <section className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mt-8">
                        <h2 className="text-xl font-black text-gray-900 mb-3">CONTACT OPERATIONS & COMPLIANCE</h2>
                        <ul className="space-y-3 font-bold text-[#000080]">
                            <li className="text-gray-900 font-black">Airgo Partner Support Team</li>
                            <li>Website: <a href="https://airgo.ng" className="hover:underline">https://airgo.ng</a></li>
                            <li>Email: <a href="mailto:Partner@airgo.ng" className="hover:underline">Partner@airgo.ng</a></li>
                            <li>Phone: <a href="tel:+2347078344409" className="hover:underline">+234 707 834 4409</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
