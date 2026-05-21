import React from 'react';
import Link from 'next/link';

export default function EscrowAgreementPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
                <Link href="/" className="inline-flex items-center text-[#000080] font-bold hover:underline mb-8">
                    ← Back to Homepage
                </Link>

                <h1 className="text-3xl md:text-4xl font-black text-[#000080] mb-2">AIRGO ESCROW PROTECTION AGREEMENT</h1>
                <p className="text-gray-500 font-medium mb-8">For Hotel Bookings, Car Hire, Tour & Travel Reservations on Airgo.ng</p>

                <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">1. PURPOSE OF ESCROW PROTECTION</h2>
                        <p className="mb-3">Airgo provides a limited escrow payment facilitation system designed to temporarily hold customer payments for eligible travel-related bookings pending confirmation from the relevant third-party service provider. </p>
                        <p className="mb-2 font-bold text-gray-900">The purpose of this escrow arrangement is solely to:</p>
                        <ul className="list-disc pl-6 space-y-1 mb-4">
                            <li>Reduce booking fraud risks;</li>
                            <li>Improve transaction confidence between users and third-party providers;</li>
                            <li>Facilitate conditional release of funds;</li>
                            <li>Assist in dispute review processes where applicable.</li>
                        </ul>
                        <p className="mb-2 font-bold text-gray-900">Airgo DOES NOT:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Own, operate, manage, or control hotels, airlines, transport companies, tour operators, or rental providers; </li>
                            <li>Guarantee the quality, legality, safety, availability, or performance of any service listed on the platform;</li>
                            <li>Act as a travel operator, travel insurer, transportation carrier, hotel owner, or rental company;</li>
                            <li>Guarantee refunds in all situations;</li>
                            <li>Assume liability for acts, omissions, cancellations, negligence, misconduct, insolvency, accidents, or contractual breaches by third-party providers.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">2. NATURE OF AIRGO'S ROLE </h2>
                        <p className="mb-2 font-bold text-gray-900">Airgo acts strictly as:</p>
                        <ul className="list-disc pl-6 space-y-1 mb-4">
                            <li>A digital intermediary marketplace;</li>
                            <li>A booking facilitation platform;</li>
                            <li>A payment coordination and escrow facilitation service.</li>
                        </ul>
                        <p className="mb-2 font-bold text-gray-900">Airgo is NOT:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>A party to the final contract between customers and service providers;</li>
                            <li>A guarantor of service delivery;</li>
                            <li>An insurer or underwriter;</li>
                            <li>A fiduciary trustee;</li>
                            <li>A banking institution or licensed deposit-taking entity.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">3. ELIGIBILITY FOR ESCROW PROTECTION </h2>
                        <p className="mb-2 font-bold text-gray-900">Escrow protection may apply only to bookings that:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Are processed directly through Airgo-approved payment channels;</li>
                            <li>Are marked as "Escrow Protected" on the platform;</li>
                            <li>Comply with Airgo verification and fraud screening procedures; Are not excluded under Section 14 of this Agreement.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">4. PAYMENT HOLD PROCESS </h2>
                        <p className="mb-2">Customer payment may be temporarily held by Airgo or its authorized payment partners until booking confirmation, service commencement, or expiration of complaint periods. </p>
                        <p>Airgo reserves sole discretion regarding payment release timing, verification requirements, and transaction review procedures. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">5. CUSTOMER RESPONSIBILITIES </h2>
                        <p>Customers agree to provide accurate booking information, independently verify provider credentials where necessary, maintain lawful conduct during bookings, and keep transaction records. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">6. SERVICE PROVIDER RESPONSIBILITIES </h2>
                        <p>Third-party providers are solely responsible for listing accuracy, legal compliance, licenses, insurance requirements, service quality, and operational standards. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">7. DISPUTE PROCESS </h2>
                        <p>Customers may submit disputes concerning non-delivery of booked services, material misrepresentation, duplicate charges, or unauthorized transactions within the stated complaint period. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">8. REFUND POLICY </h2>
                        <p>Refund eligibility depends on provider cancellation policies, timing of cancellation, processing fees, payment gateway limitations, and fraud review outcomes. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">9. CAR HIRE LIABILITY DISCLAIMER </h2>
                        <p>Airgo does not own rental vehicles and shall not be liable for accidents, traffic violations, mechanical failures, theft, injuries, or transportation delays. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">10. HOTEL BOOKING DISCLAIMER </h2>
                        <p>Airgo shall not be liable for hotel overbooking, room condition disputes, security incidents, staff misconduct, or utility failures. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">11. FLIGHT & TRAVEL DISCLAIMER </h2>
                        <p>Airgo acts only as a booking facilitation platform and is not responsible for flight delays, airline cancellations, immigration restrictions, weather disruptions, or baggage loss. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">12. LIMITATION OF LIABILITY </h2>
                        <p>To the maximum extent permitted by law, Airgo shall not be liable for indirect damages, consequential losses, personal injury, death, or third-party misconduct. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">13. FORCE MAJEURE </h2>
                        <p>Airgo shall not be responsible for failures caused by natural disasters, pandemics, civil unrest, internet outages, or government restrictions. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">14. EXCLUDED TRANSACTIONS </h2>
                        <p>Escrow protection does not apply to off-platform payments, fraudulent bookings, illegal activities, or transactions violating Airgo policies. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">15. FRAUD PREVENTION & VERIFICATION </h2>
                        <p>Airgo reserves the right to request identification documents, conduct KYC verification, suspend suspicious accounts, and report fraudulent activities. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">16. INTELLECTUAL PROPERTY </h2>
                        <p>All platform content including logos, branding, website design, graphics, and software remain the exclusive property of Airgo.ng or its licensors. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">17. PRIVACY & DATA USE    </h2>
                        <p>Users consent to collection of transaction information, fraud prevention screening, and sharing of booking details with service providers where necessary. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">18. INDEMNIFICATION </h2>
                        <p>Users and service providers agree to indemnify and hold harmless Airgo from claims, lawsuits, liabilities, damages, and legal expenses arising from their conduct or service failures. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">19. GOVERNING LAW </h2>
                        <p>This Agreement shall be governed by the laws of the Federal Republic of Nigeria, with jurisdiction in Abuja, Federal Capital Territory. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">20. MODIFICATION OF TERMS </h2>
                        <p>Airgo reserves the right to amend this Agreement and modify escrow procedures at any time. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">21. SEVERABILITY </h2>
                        <p>If any provision is found unenforceable, the remaining provisions shall remain valid and enforceable. </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 mb-3">22. ENTIRE AGREEMENT </h2>
                        <p>This Agreement constitutes the complete understanding between Airgo, customers, and service providers regarding escrow protection services. </p>
                    </section>

                    {/* 🟢 UPGRADED: Professional Institutional Signature */}
                    <section className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mt-8">
                        <h2 className="text-xl font-black text-gray-900 mb-3">23. CONTACT & COMPLIANCE CHANNELS</h2>
                        <ul className="space-y-3 font-bold text-[#000080]">
                            <li className="text-gray-900 font-black">Airgo Travel & Tour Ltd.</li>
                            <li>Corporate Portal: <a href="https://airgo.ng" className="hover:underline">https://airgo.ng</a></li>
                            {/* Removed Gmail, substituted domain email */}
                            <li>Official Support: <a href="mailto:support@airgo.ng" className="hover:underline">support@airgo.ng</a></li>
                            <li>Compliance & Grievances: <a href="mailto:legal@airgo.ng" className="hover:underline">legal@airgo.ng</a></li>
                            <li className="text-gray-500 font-medium text-xs mt-2">
                                For immediate assistance regarding active escrow holds, please utilize our dedicated support lines or open a dispute case within your security dashboard.
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}