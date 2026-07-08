"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getApiUrl } from '@/components/api';

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
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      
      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Failed to parse JSON response:", jsonErr);
      }

      if (res.ok) {
        setNewsletterEmail('');
        alert(data.message || "Thank you for subscribing to Airgo VIP updates!");
      } else {
        alert(data.message || "Subscription failed. Please check your email or try again later.");
      }
    } catch (err) {
      console.error("Subscription connection error:", err);
      alert("Error connecting to subscription service. Please check your internet connection.");
    } finally {
      setSubscribing(false);
    }
  };

  // 🟢 SAFETY SWITCH: Hides the footer on admin panels, dashboards, and auth screens so layouts don't break!
  const hiddenRoutes = ['/admin', '/partner', '/driver', '/dashboard', '/login', '/register', '/join'];
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
            <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
              Airgo.ng is Nigeria's premier escrow-protected luxury asset marketplace. We secure your transactions, holding booking funds safely until your stay or rental is completed flawlessly.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#FFB81C] uppercase tracking-wider text-sm md:text-base">24/7 Support & Dispatch</h4>
            <div className="space-y-4 text-sm text-blue-200 font-medium">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Hotel & Fleet Support Logistics</span>
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
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Official Corporate Concierge</span>
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
            <h4 className="font-bold mb-4 text-[#FFB81C] uppercase tracking-wider text-sm md:text-base">Platform Governance</h4>
            <ul className="text-sm text-blue-200 space-y-3 font-medium">
              <li><Link href="/support" className="hover:text-[#FFB81C] font-bold transition">💬 Support & AI Help Center</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About Airgo</Link></li>
              <li><Link href="/corporate" className="hover:text-white transition">Corporate Solutions</Link></li>
              <li><Link href="/escrow" className="hover:text-white transition">Escrow Protection Agreement</Link></li>
              <li><Link href="/join" className="hover:text-[#FFB81C] transition">Become a Verified Partner</Link></li>
              <li><Link href="/affiliate" className="hover:text-[#FFB81C] transition">Affiliate Program</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link href="/partner-dispute" className="hover:text-white transition">Partner Dispute</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition">Cookie Policy</Link></li>
              <li><a href="mailto:Info@airgo.ng" className="hover:text-white transition">General Inquiry: Info@airgo.ng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#FFB81C] uppercase tracking-wider text-sm md:text-base">Newsletter VIP Updates</h4>
            <p className="text-sm text-blue-200 mb-3 leading-relaxed">Subscribe to get private rates, luxury travel updates, and concierge details.</p>
            <form onSubmit={handleSubscribeNewsletter} className="space-y-2">
              <input 
                required 
                type="email" 
                placeholder="Enter email address" 
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-blue-900 border border-blue-800 text-white placeholder-blue-300 outline-none focus:border-[#FFB81C] transition-all"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button 
                disabled={subscribing}
                type="submit" 
                className="w-full bg-[#FFB81C] hover:bg-yellow-400 text-[#000080] py-2.5 rounded-xl text-sm font-black transition shadow-md"
              >
                {subscribing ? 'Subscribing...' : 'Secure VIP Rates'}
              </button>
            </form>
            <div className="mt-8">
              <h4 className="font-bold mb-4 text-[#FFB81C] uppercase tracking-wider text-sm md:text-base">Connect With Us</h4>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/share/1Bb8EbXtSJ/" target="_blank" rel="noreferrer" className="text-blue-200 hover:text-white transition" title="Facebook">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/></svg>
                </a>
                <a href="https://www.instagram.com/airgo_travel_n_tour?igsh=d2duY3RreDhxeXQ4" target="_blank" rel="noreferrer" className="text-blue-200 hover:text-white transition" title="Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/></svg>
                </a>
                <a href="https://www.tiktok.com/@airgotravel?_r=1&_d=f3djf61f7l0h67&sec_uid=MS4wLjABAAAAZERZKS_X2KU-jv-XfnjNlcovfjtzH8WDrp9xOEtMgfYipmw6mmka2KpTiZ6mOq-d&share_author_id=7453224023695623173&sharer_language=en&source=h5_m&u_code=ei2883c16fe42e&timestamp=1783417610&user_id=7453224023695623173&sec_user_id=MS4wLjABAAAAZERZKS_X2KU-jv-XfnjNlcovfjtzH8WDrp9xOEtMgfYipmw6mmka2KpTiZ6mOq-d&item_author_type=1&utm_source=whatsapp&utm_campaign=client_share&utm_medium=android&share_iid=7651878860740740885&share_link_id=dc56af33-be42-474b-ac08-a622ced916e0&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b8727%2Cb7360&social_share_type=5&enable_checksum=1" target="_blank" rel="noreferrer" className="text-blue-200 hover:text-white transition" title="TikTok">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-blue-900 text-center text-sm text-blue-300 font-medium">
          &copy; {new Date().getFullYear()} Airgo Travel & Tour Ltd (Airgo.ng). All rights reserved. Servicing the Nigerian market.
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION RESTORED */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link href="/" className={`flex flex-col items-center ${pathname === '/' ? 'text-[#000080]' : 'text-gray-400 hover:text-[#000080] transition'}`}>
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L4 9v12h5v-7h6v7h5V9z" /></svg>
          <span className="text-[10px] font-bold">Hotels</span>
        </Link>
        <Link href="/taxi" className={`flex flex-col items-center ${pathname === '/taxi' ? 'text-[#000080]' : 'text-gray-400 hover:text-[#000080] transition'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          <span className="text-[10px] font-bold">Taxi</span>
        </Link>
        <Link href="/support" className={`flex flex-col items-center ${pathname === '/support' ? 'text-[#000080]' : 'text-gray-400 hover:text-[#000080] transition'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <span className="text-[10px] font-bold">Support</span>
        </Link>
        <Link href={user ? (user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard') : '/login'} className={`flex flex-col items-center ${pathname !== '/' && pathname !== '/taxi' && pathname !== '/support' ? 'text-[#000080]' : 'text-gray-400 hover:text-[#000080] transition'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-bold">Account</span>
        </Link>
      </div>
    </>
  );
}