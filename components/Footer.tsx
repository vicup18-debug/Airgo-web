"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem('airgo_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <>
      {/* UPGRADED: Clean, Institutional Labeled Footer */}
      <footer className="bg-[#000080] text-white py-16 px-6 mt-auto border-t-4 border-[#FFB81C]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-2xl font-black mb-4">Airgo<span className="text-[#FFB81C]">.ng</span></h3>
            <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
              Airgo.ng is Nigeria's premier escrow-protected luxury asset marketplace. We secure your transactions, holding booking funds safely until your stay or rental is completed flawlessly.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#FFB81C] uppercase tracking-wider text-xs">24/7 Support & Dispatch</h4>
            <div className="space-y-3 text-sm text-blue-200 font-medium">
              <p className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Hotel Operations & Lodging</span>
                <a href="tel:+2348066058930" className="hover:text-white transition mt-0.5 text-base font-black">📞 +234 806 605 8930</a>
              </p>
              <p className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">VIP Fleet & Chauffeur Logistics</span>
                <a href="tel:+2348026696170" className="hover:text-white transition mt-0.5 text-base font-black">📞 +234 802 669 6170</a>
              </p>
              <p className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Official Escalations & Corporate Line</span>
                <a href="tel:07078344409" className="hover:text-white transition mt-0.5 text-base font-black">📞 07078344409</a>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#FFB81C] uppercase tracking-wider text-xs">Platform Governance</h4>
            <ul className="text-sm text-blue-200 space-y-3 font-medium">
              <li><Link href="/escrow" className="hover:text-white transition">Escrow Protection Agreement</Link></li>
              <li><Link href="/join" className="hover:text-[#FFB81C] transition">Become a Verified Partner</Link></li>
              <li><a href="mailto:support@airgo.ng" className="hover:text-white transition">Corporate Inquiry: support@airgo.ng</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-blue-900 text-center text-xs text-blue-300 font-medium">
          &copy; {new Date().getFullYear()} Airgo Travel & Tour Ltd (Airgo.ng). All rights reserved. Managed across Abuja and Kaduna regions, Nigeria.
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION RESTORED */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link href="/" className={`flex flex-col items-center ${pathname === '/' ? 'text-[#000080]' : 'text-gray-400 hover:text-[#000080] transition'}`}>
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L4 9v12h5v-7h6v7h5V9z" /></svg>
          <span className="text-[10px] font-bold">Hotels</span>
        </Link>
        <Link href="/cars" className={`flex flex-col items-center ${pathname === '/cars' ? 'text-[#000080]' : 'text-gray-400 hover:text-[#000080] transition'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          <span className="text-[10px] font-bold">Car Rental</span>
        </Link>
        <Link href={user ? (user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard') : '/login'} className={`flex flex-col items-center ${pathname !== '/' && pathname !== '/cars' ? 'text-[#000080]' : 'text-gray-400 hover:text-[#000080] transition'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-bold">Account</span>
        </Link>
      </div>
    </>
  );
}
