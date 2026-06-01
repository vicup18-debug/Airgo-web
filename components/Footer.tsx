"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('airgo_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleSubscribeNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
      const res = await fetch(`${apiUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterEmail('');
        alert(data.message || "Thank you for subscribing to Airgo VIP updates!");
      } else {
        alert(data.message || "Subscription failed.");
      }
    } catch (err) {
      alert("Error connecting to subscription service.");
    } finally {
      setSubscribing(false);
    }
  };

  // 🟢 SAFETY SWITCH: Hides the footer on admin panels, dashboards, and auth screens so layouts don't break!
  const hiddenRoutes = ['/admin', '/partner', '/dashboard', '/login', '/register', '/join'];
  if (hiddenRoutes.some(route => pathname.startsWith(route))) return null;

  return (
    <>
      {/* UPGRADED: Clean, Institutional Labeled Footer */}
      <footer className="bg-[#000080] text-white pt-16 pb-28 md:pb-16 px-6 mt-auto border-t-4 border-[#FFB81C]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/">
              <h3 className="text-2xl font-black mb-4 cursor-pointer">Airgo<span className="text-[#FFB81C]">.ng</span></h3>
            </Link>
            <p className="text-blue-200 text-xs leading-relaxed max-w-sm">
              Airgo.ng is Nigeria's premier escrow-protected luxury asset marketplace. We secure your transactions, holding booking funds safely until your stay or rental is completed flawlessly.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#FFB81C] uppercase tracking-wider text-xs">24/7 Support & Dispatch</h4>
            <div className="space-y-4 text-xs text-blue-200 font-medium">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Hotel & Fleet Support Logistics</span>
                <div className="flex items-center gap-2 mt-1">
                  <a href="tel:+2348026696170" title="Call Hotel & Fleet Support" className="w-8 h-8 rounded-full bg-blue-900/50 hover:bg-[#FFB81C] hover:text-[#000080] flex items-center justify-center text-white transition-all duration-300 shadow-md border border-blue-800">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.27c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.27 1.11z"/>
                    </svg>
                  </a>
                  <a href="https://wa.me/2348026696170" target="_blank" rel="noopener noreferrer" title="WhatsApp Support" className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#20ba5a] flex items-center justify-center text-white transition-all duration-300 shadow-md">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.975L2 22l5.204-1.362a9.902 9.902 0 0 0 4.805 1.232h.003c5.505 0 9.99-4.478 9.99-9.985a9.965 9.965 0 0 0-9.99-9.885zm0 17.15c-1.579 0-3.125-.424-4.479-1.229l-.321-.19-3.326.872.887-3.245-.208-.332a8.21 8.21 0 0 1-1.258-4.387c.002-4.545 3.7-8.239 8.247-8.239 2.203.001 4.274.86 5.83 2.418a8.2 8.2 0 0 1 2.413 5.823c-.002 4.547-3.701 8.24-8.243 8.24zm4.52-6.177c-.247-.124-1.464-.722-1.692-.805-.226-.083-.393-.124-.559.124-.166.248-.64.805-.785.97-.145.166-.29.187-.538.063a6.786 6.786 0 0 1-1.998-1.232c-.777-.692-1.302-1.547-1.455-1.81-.153-.263-.016-.405.12-.541.123-.123.248-.29.373-.434.124-.145.165-.248.248-.413.083-.166.042-.31-.02-.434-.063-.124-.559-1.348-.765-1.848-.2-.486-.403-.42-.559-.428-.145-.008-.31-.01-.476-.01a.916.916 0 0 0-.662.31c-.227.248-.868.847-.868 2.066 0 1.218.887 2.395.986 2.529.1.135 1.745 2.665 4.228 3.733.59.254 1.052.406 1.41.52.593.189 1.133.162 1.56.098.477-.072 1.464-.598 1.67-.176.207-.423.207-.785.146-.847-.061-.062-.228-.103-.475-.227z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Official Corporate Concierge</span>
                <div className="flex items-center gap-2 mt-1">
                  <a href="tel:+2347078344409" title="Call Corporate Escalations Line" className="w-8 h-8 rounded-full bg-blue-900/50 hover:bg-[#FFB81C] hover:text-[#000080] flex items-center justify-center text-white transition-all duration-300 shadow-md border border-blue-800">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.27c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.27 1.11z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#FFB81C] uppercase tracking-wider text-xs">Platform Governance</h4>
            <ul className="text-xs text-blue-200 space-y-3 font-medium">
              <li><Link href="/about" className="hover:text-white transition">About Airgo</Link></li>
              <li><Link href="/corporate" className="hover:text-white transition">Corporate Solutions</Link></li>
              <li><Link href="/escrow" className="hover:text-white transition">Escrow Protection Agreement</Link></li>
              <li><Link href="/join" className="hover:text-[#FFB81C] transition">Become a Verified Partner</Link></li>
              <li><Link href="/affiliate" className="hover:text-[#FFB81C] transition">Affiliate Program</Link></li>
              <li><a href="mailto:Info@airgo.ng" className="hover:text-white transition">General Inquiry: Info@airgo.ng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#FFB81C] uppercase tracking-wider text-xs">Newsletter VIP Updates</h4>
            <p className="text-xs text-blue-200 mb-3 leading-relaxed">Subscribe to get private rates, luxury travel updates, and concierge details.</p>
            <form onSubmit={handleSubscribeNewsletter} className="space-y-2">
              <input 
                required 
                type="email" 
                placeholder="Enter email address" 
                className="w-full px-3 py-2 text-xs rounded-xl bg-blue-900 border border-blue-800 text-white placeholder-blue-300 outline-none focus:border-[#FFB81C] transition-all"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button 
                disabled={subscribing}
                type="submit" 
                className="w-full bg-[#FFB81C] hover:bg-yellow-400 text-[#000080] py-2 rounded-xl text-xs font-black transition shadow-md"
              >
                {subscribing ? 'Subscribing...' : 'Secure VIP Rates'}
              </button>
            </form>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-blue-900 text-center text-xs text-blue-300 font-medium">
          &copy; {new Date().getFullYear()} Airgo Travel & Tour Ltd (Airgo.ng). All rights reserved. Servicing the Nigerian market.
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