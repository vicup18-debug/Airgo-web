import React from 'react';
import Link from 'next/link';

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <main className="flex-grow max-w-4xl mx-auto py-12 px-4 sm:px-6 w-full">
                <div className="bg-white p-6 sm:p-12 md:p-16 rounded-3xl shadow-sm border border-gray-100">
                    
                    {/* Document Header */}
                    <div className="border-b border-gray-100 pb-6 mb-8">
                        <span className="bg-[#000080]/10 text-[#000080] font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                            Official Policy
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-2">
                            Refund and Cancellation Policy
                        </h1>
                        <p className="text-gray-500 text-sm font-semibold">
                            Airgo Travel & Tour &bull; Applicable to Clients, Hotels, Apartments and Accommodation Partners
                        </p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">
                            Effective Date: August 2026 &bull; Website: <a href="https://www.airgo.ng" className="text-[#004A99] underline">www.airgo.ng</a>
                        </p>
                    </div>

                    {/* Document Sections */}
                    <div className="prose prose-blue text-gray-600 max-w-none space-y-8 text-sm sm:text-base leading-relaxed">
                        
                        {/* Section 1 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">1. Introduction</h2>
                            <p>
                                This Refund and Cancellation Policy sets out the terms and conditions governing cancellations, refunds and related charges for hotel and apartment bookings made through <strong>Airgo Travel & Tour (&ldquo;Airgo&rdquo;)</strong>.
                            </p>
                            <p className="mt-2">
                                The policy applies to both clients/customers who make accommodation bookings through Airgo and hotel, apartment and accommodation partners (<strong>&ldquo;Partners&rdquo;</strong>) who list or provide accommodation through Airgo.
                            </p>
                            <p className="mt-2">
                                By making, accepting or processing a booking through Airgo, the client and/or partner agrees to be bound by this policy.
                            </p>
                            <p className="mt-2 font-medium text-gray-800 bg-blue-50/60 p-3 rounded-xl border border-blue-100/80">
                                Airgo acts as a booking and travel service platform/agent connecting clients with accommodation providers. Airgo does not independently determine the cancellation or refund terms of every hotel or apartment. The applicable hotel or apartment cancellation and refund policy shall be the primary basis for determining whether a refund is available.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">2. Important Notice to Clients</h2>
                            <p>Before completing a hotel or apartment booking, clients are strongly advised to:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Carefully review the hotel&apos;s or apartment&apos;s cancellation policy.</li>
                                <li>Confirm the check-in and check-out dates.</li>
                                <li>Confirm the number of guests.</li>
                                <li>Verify the room or apartment type.</li>
                                <li>Confirm the location and facilities.</li>
                                <li>Confirm the hotel&apos;s rules and restrictions.</li>
                                <li>Ensure that the selected accommodation meets their requirements before making payment.</li>
                            </ul>
                            <p className="mt-3 font-semibold text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                Clients are advised to verify their stay and all booking details before payment because cancellation may result in partial or no refund. Once a booking has been confirmed, cancellation is subject to the cancellation and refund conditions applicable to that particular hotel or apartment.
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">3. Hotel/Apartment Cancellation Policy Takes Priority</h2>
                            <p>
                                The cancellation policy of the hotel or apartment booked by the client shall determine whether the booking is refundable, partially refundable or non-refundable.
                            </p>
                            <p className="mt-2">Cancellation policies may vary between accommodation providers and may depend on:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>The date of cancellation.</li>
                                <li>The number of days before check-in.</li>
                                <li>The booking rate selected.</li>
                                <li>The room or apartment type.</li>
                                <li>Special promotional rates.</li>
                                <li>Peak-season or holiday periods.</li>
                                <li>No-show status.</li>
                                <li>Early departure.</li>
                                <li>The hotel&apos;s own refund terms.</li>
                                <li>Any minimum-stay requirement.</li>
                                <li>Special terms agreed between Airgo and the accommodation provider.</li>
                            </ul>
                            <p className="mt-3 font-semibold text-gray-900">
                                Therefore, Airgo cannot guarantee a refund simply because a client requests cancellation.
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">4. When a Refund May Be Granted</h2>
                            <p>A refund may only be considered where:</p>
                            <ol className="list-decimal pl-5 space-y-2 mt-2">
                                <li>The hotel or apartment&apos;s cancellation policy permits a refund; or</li>
                                <li>The hotel or apartment owner/management voluntarily agrees to provide a refund; or</li>
                                <li>Airgo determines that a refund is appropriate based on the circumstances and the applicable agreement with the accommodation provider.</li>
                            </ol>
                            <p className="mt-3 text-gray-700">
                                Where the hotel or apartment does <strong>not</strong> accept or authorize a refund, Airgo may be unable to refund the client.
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">5. Airgo&apos;s Suggested Default Refund Percentage</h2>
                            <p>
                                Where a hotel or apartment accepts a refund but does not specify a different refund percentage or where Airgo&apos;s applicable partner agreement permits the use of Airgo&apos;s default refund framework, <strong>Airgo recommends a default refund of 70% of the eligible booking amount</strong>.
                            </p>
                            <p className="mt-2">
                                The remaining <strong>30%</strong> may be retained or applied towards applicable cancellation, administrative, processing, service or other permitted charges.
                            </p>
                            <div className="mt-3 bg-gray-50 border border-gray-200 p-4 rounded-2xl">
                                <span className="font-bold text-gray-900 uppercase text-xs tracking-wider block mb-1">Important:</span>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    The 70% figure is a <em>suggested Airgo default refund framework</em> and is not a guarantee of a 70% refund. The actual amount refundable shall depend on:
                                </p>
                                <ul className="list-disc pl-5 space-y-1 mt-2 text-xs text-gray-600">
                                    <li>The hotel&apos;s cancellation policy;</li>
                                    <li>The apartment owner&apos;s cancellation policy;</li>
                                    <li>The percentage the hotel/apartment provider has agreed to refund;</li>
                                    <li>Applicable cancellation charges;</li>
                                    <li>Airgo service or administrative charges, where applicable;</li>
                                    <li>Payment gateway/transaction charges, where applicable;</li>
                                    <li>Other non-refundable fees or charges; and</li>
                                    <li>The specific terms applicable to the booking.</li>
                                </ul>
                            </div>
                            <p className="mt-3">
                                Where the hotel or apartment has expressly agreed to refund a specific percentage, <strong>the agreed hotel/apartment percentage shall apply</strong> instead of Airgo&apos;s suggested default percentage, subject to applicable fees and charges.
                            </p>
                        </div>

                        {/* Section 6 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">6. Cancellation Percentage Is Determined at the Time of Cancellation</h2>
                            <p>
                                There is no universal cancellation percentage applicable to all Airgo accommodation bookings. The refundable percentage can only be properly determined after a cancellation request has been made and the applicable hotel or apartment cancellation policy has been reviewed.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 mt-2 text-gray-600">
                                <li>A booking may qualify for a full refund under the hotel&apos;s policy.</li>
                                <li>Another booking may qualify for a partial refund.</li>
                                <li>Another booking may qualify for a 70% refund under an applicable Airgo default arrangement.</li>
                                <li>Another booking may be completely non-refundable.</li>
                            </ul>
                            <p className="mt-2">
                                Accordingly, clients should not assume that cancellation automatically results in a fixed percentage refund.
                            </p>
                        </div>

                        {/* Section 7 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">7. Non-Refundable Bookings</h2>
                            <p>
                                Some hotels, apartments or promotional rates may be designated as <strong>non-refundable</strong>. Where a booking is clearly identified as non-refundable and the hotel or apartment does not agree to an exception, Airgo may not be able to provide any refund.
                            </p>
                            <p className="mt-2">Non-refundable bookings may include:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Promotional rates.</li>
                                <li>Discounted rates.</li>
                                <li>Special offers.</li>
                                <li>Last-minute rates.</li>
                                <li>Advance-purchase rates.</li>
                                <li>Certain holiday or peak-season bookings.</li>
                                <li>Special apartment rates.</li>
                                <li>Bookings subject to special partner agreements.</li>
                            </ul>
                        </div>

                        {/* Section 8 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">8. Cancellation Request Procedure for Clients</h2>
                            <p>Clients wishing to cancel a booking should contact Airgo as soon as possible. A cancellation request should contain:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Client&apos;s full name.</li>
                                <li>Booking/reference number.</li>
                                <li>Hotel/apartment name.</li>
                                <li>Check-in date & Check-out date.</li>
                                <li>Reason for cancellation, where applicable.</li>
                                <li>Payment details or other information reasonably required to process the refund.</li>
                            </ul>
                            <p className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                                The date and time Airgo receives the cancellation request may be relevant when determining applicable cancellation terms. A cancellation request is <strong>not automatically a confirmation of refund</strong>. Airgo may need to contact the hotel, apartment owner or management before confirming the applicable refund amount.
                            </p>
                        </div>

                        {/* Section 9 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">9. Refund Processing</h2>
                            <p>
                                Where a refund has been approved, Airgo will initiate the refund process after confirmation of the refundable amount. Refunds may be subject to:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Hotel or apartment approval.</li>
                                <li>Verification of cancellation eligibility.</li>
                                <li>Payment processor timelines.</li>
                                <li>Bank processing timelines.</li>
                                <li>Applicable transaction fees.</li>
                                <li>Currency conversion differences, where applicable.</li>
                                <li>Airgo&apos;s applicable service or administrative charges.</li>
                            </ul>
                            <p className="mt-2 text-xs text-gray-500">
                                Airgo will communicate the approved refund amount to the client where reasonably possible. The time required for a refund to reflect in the client&apos;s account may depend on the payment method, bank or payment processor and is outside Airgo&apos;s direct control.
                            </p>
                        </div>

                        {/* Section 10 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">10. Hotel or Apartment Cancellation by the Partner</h2>
                            <p>
                                Where a hotel or apartment owner/management cancels a confirmed booking due to circumstances within the partner&apos;s control, the partner should immediately notify Airgo. Airgo may attempt to:
                            </p>
                            <ol className="list-decimal pl-5 space-y-1 mt-2">
                                <li>Find alternative accommodation of comparable standard;</li>
                                <li>Transfer the booking to another available property with the client&apos;s consent; or</li>
                                <li>Process a refund where applicable.</li>
                            </ol>
                            <p className="mt-2 text-xs text-gray-500">
                                Where the client chooses an alternative accommodation that costs more, the additional cost may be payable by the responsible party depending on circumstances and the partner agreement. Where the client accepts a less expensive alternative, the difference may be treated in accordance with the applicable refund arrangement.
                            </p>
                        </div>

                        {/* Section 11 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">11. Partner Refund Obligations</h2>
                            <p>
                                Hotels and apartment owners/management partners are required to comply with the cancellation and refund terms submitted to or agreed with Airgo. Partners must <strong>not</strong>:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Misrepresent their cancellation policy.</li>
                                <li>Promise a refund without authorization where Airgo controls the booking/payment process.</li>
                                <li>Refuse a refund that is required under the agreed cancellation policy.</li>
                                <li>Change cancellation terms after a booking has been confirmed without proper authorization.</li>
                                <li>Provide Airgo with inaccurate refund information.</li>
                            </ul>
                            <p className="mt-2 text-xs text-gray-500">
                                Where a partner agrees to refund a client, the partner must communicate the approved refund amount and any applicable conditions to Airgo promptly.
                            </p>
                        </div>

                        {/* Section 12 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">12. Partner-Agreed Refund Percentage</h2>
                            <p>
                                Where a hotel or apartment partner has an agreed refund percentage with Airgo, that percentage may determine the amount available for refund, subject to applicable terms.
                            </p>
                            <p className="mt-2">
                                For example, where the partner confirms that <strong>80%</strong> of the booking value is refundable, Airgo may process the refund based on the agreed 80%, subject to applicable Airgo fees, payment charges and other permitted deductions.
                            </p>
                            <p className="mt-2">
                                Where no specific partner percentage has been agreed and the booking is otherwise refundable, Airgo&apos;s suggested 70% default refund framework may be applied where permitted by the partner agreement.
                            </p>
                        </div>

                        {/* Section 13 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">13. Airgo Fees and Charges</h2>
                            <p>Refunds may be subject to the deduction of applicable:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Airgo service fees;</li>
                                <li>Administrative fees;</li>
                                <li>Booking fees;</li>
                                <li>Payment processing fees;</li>
                                <li>Bank charges;</li>
                                <li>Currency conversion charges;</li>
                                <li>Non-refundable third-party charges;</li>
                                <li>Hotel/apartment cancellation charges; and</li>
                                <li>Other charges expressly disclosed or permitted under applicable booking terms.</li>
                            </ul>
                            <p className="mt-2 font-semibold text-gray-800">
                                Airgo will not represent a booking as fully refundable where applicable non-refundable charges have already been incurred.
                            </p>
                        </div>

                        {/* Section 14 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">14. No-Show Policy</h2>
                            <p>
                                If a client fails to check in on the scheduled arrival date without properly cancelling the booking, the booking may be treated as a <strong>no-show</strong>.
                            </p>
                            <p className="mt-2">A no-show may result in:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Partial refund;</li>
                                <li>No refund; or</li>
                                <li>Other charges,</li>
                            </ul>
                            <p className="mt-2">
                                depending on the hotel&apos;s or apartment&apos;s no-show policy. Clients are therefore encouraged to notify Airgo immediately if they will be unable to check in.
                            </p>
                        </div>

                        {/* Section 15 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">15. Early Check-Out</h2>
                            <p>
                                If a client checks out before the originally booked departure date, the unused portion of the booking is <strong>not automatically refundable</strong>. Any refund for early departure shall depend on the hotel&apos;s or apartment&apos;s policy and whether the accommodation provider agrees to refund the unused nights.
                            </p>
                        </div>

                        {/* Section 16 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">16. Changes to a Booking</h2>
                            <p>
                                A request to change check-in date, check-out date, number of guests, room type, apartment type, or other booking details may be treated as a cancellation and new booking where the accommodation provider does not permit amendments.
                            </p>
                            <p className="mt-2">
                                Any additional cost arising from a change may be payable by the client. Any refund arising from a reduction in booking value shall be subject to the hotel&apos;s or apartment&apos;s applicable policy.
                            </p>
                        </div>

                        {/* Section 17 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">17. Force Majeure and Exceptional Circumstances</h2>
                            <p>
                                Where a cancellation occurs due to events beyond the reasonable control of Airgo, the hotel/apartment or client, including certain natural disasters, government restrictions, civil disturbances or other exceptional circumstances, the applicable refund shall be determined based on the hotel&apos;s policy, partner agreement and the circumstances of the booking.
                            </p>
                            <p className="mt-2 font-medium">
                                Airgo may assist the client in communicating with the accommodation provider but cannot guarantee a refund where the hotel or apartment provider is not contractually required to provide one.
                            </p>
                        </div>

                        {/* Section 18 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">18. Refunds for Double Charges or Payment Errors</h2>
                            <p>
                                Where a client is accidentally charged more than once for the same booking, Airgo will investigate the transaction. Where a duplicate payment is confirmed, the applicable duplicate amount may be refunded after verification, subject to payment processing requirements.
                            </p>
                        </div>

                        {/* Section 19 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">19. Disputes Regarding Refunds</h2>
                            <p>
                                Where a client disagrees with a refund decision, the client may contact Airgo and request a review. Airgo may review the original booking confirmation, cancellation policies, timestamps, client-partner communications, payment records, and partner agreements. Airgo&apos;s refund determination will be based on applicable booking terms and available evidence.
                            </p>
                        </div>

                        {/* Section 20 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">20. Responsibility of Clients</h2>
                            <p>Clients are responsible for carefully reviewing their booking before payment. By proceeding with a booking, the client acknowledges that:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Cancellation terms may differ from one property to another.</li>
                                <li>Some bookings may be non-refundable.</li>
                                <li>A refund is not guaranteed.</li>
                                <li>The hotel/apartment cancellation policy determines refund eligibility.</li>
                                <li>A cancellation request does not automatically mean that money will be returned.</li>
                                <li>Refund percentages may only be determined after the applicable cancellation policy is reviewed.</li>
                                <li>Fees and charges may be deducted from any approved refund.</li>
                            </ul>
                        </div>

                        {/* Section 21 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">21. Responsibility of Hotel and Apartment Partners</h2>
                            <p>Partners are responsible for providing accurate property/availability information, stating cancellation conditions clearly, honouring confirmed bookings and refund agreements, notifying Airgo promptly of changes, and cooperating during investigations.</p>
                            <p className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                                Failure by a partner to honour its agreed cancellation or refund terms may result in partner review, suspension or other action under the applicable partnership agreement.
                            </p>
                        </div>

                        {/* Section 22 */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#004A99] mb-3">22. Important Disclaimer</h2>
                            <p>
                                Airgo Travel & Tour acts as an intermediary/booking platform in relation to accommodation services provided by independent hotels, apartments and accommodation partners.
                            </p>
                            <p className="mt-2 font-bold text-gray-900">
                                Airgo does not guarantee that every hotel or apartment will approve a refund.
                            </p>
                            <p className="mt-2">
                                The final refundable amount is determined by the applicable accommodation provider&apos;s cancellation/refund policy and the specific terms attached to the booking. Where the accommodation provider approves a refund, Airgo will process the refund in accordance with the approved amount, applicable partner agreement and permitted fees or charges.
                            </p>
                        </div>

                        {/* Section 23 */}
                        <div className="bg-[#000080]/5 p-6 rounded-2xl border border-[#000080]/10 mt-10">
                            <h2 className="text-xl sm:text-2xl font-bold text-[#000080] mb-3">23. Policy Acceptance & Contact</h2>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                By completing a booking through Airgo Travel & Tour, the client confirms that they have had the opportunity to review the applicable booking and cancellation terms and agree to this Refund and Cancellation Policy.
                            </p>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mt-2">
                                By listing or providing accommodation through Airgo, a hotel or apartment partner confirms that it accepts and agrees to comply with the applicable Airgo booking, cancellation and refund procedures and its agreed partner terms.
                            </p>
                            <div className="mt-6 pt-4 border-t border-[#000080]/20 flex flex-col sm:flex-row justify-between gap-4 text-xs sm:text-sm text-gray-800">
                                <div>
                                    <p className="font-bold text-[#000080]">Airgo Travel & Tour</p>
                                    <p>Website: <a href="https://www.airgo.ng" className="text-[#004A99] underline">www.airgo.ng</a></p>
                                    <p>Email: <a href="mailto:info@airgo.ng" className="text-[#004A99] underline">info@airgo.ng</a></p>
                                    <p>Phone: <a href="tel:07078344409" className="text-[#004A99] underline">07078344409</a></p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="font-bold text-amber-800">Please verify your stay before booking</p>
                                    <p className="text-gray-500">Cancellation terms and refund eligibility vary by hotel and apartment.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
