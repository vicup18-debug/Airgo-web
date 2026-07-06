"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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

  // Scroll-reactive backdrop blur
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🟢 SAFETY SWITCH: Hide global nav on auth and partner pages
  const hideTopNav = ['/admin', '/partner', '/driver', '/dashboard', '/login', '/register', '/join'].some(route => pathname.startsWith(route));
  const hideBottomNav = ['/admin', '/partner', '/driver', '/login', '/register', '/join'].some(route => pathname.startsWith(route));

  if (hideTopNav && hideBottomNav) return null;

  return (
    <>
      {!hideTopNav && (
        <>
          {/* SMART DESKTOP NAVIGATION */}
          <nav
        className={`hidden md:flex text-white py-4 px-8 justify-between items-center sticky top-0 z-40 border-b border-white/10 transition-all duration-300 ${
          scrolled
            ? 'bg-[#000060]/95 backdrop-blur-md shadow-lg'
            : 'bg-[#000080] shadow-lg'
        }`}
      >
        <div className="flex items-center space-x-12">
          <Link href="/">
            <div className="text-3xl font-black text-white tracking-tight cursor-pointer group">
              Airgo
              <span className="text-[#FFB81C] group-hover:underline decoration-[#FFB81C] underline-offset-4 transition-all">
                .ng
              </span>
            </div>
          </Link>
          <div className="flex space-x-6 font-semibold text-sm items-center">
            <Link
              href="/"
              className={`relative pb-1 transition-colors ${
                pathname === '/'
                  ? 'text-[#FFB81C]'
                  : 'hover:text-[#FFB81C]'
              } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#FFB81C] after:transition-all after:duration-300 ${
                pathname === '/' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
              }`}
            >
              Hotels
            </Link>
            <Link
              href="/taxi"
              className={`relative pb-1 transition-colors ${
                pathname === '/taxi'
                  ? 'text-[#FFB81C]'
                  : 'hover:text-[#FFB81C]'
              } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#FFB81C] after:transition-all after:duration-300 ${
                pathname === '/taxi' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
              }`}
            >
              Taxi
            </Link>
            <Link
              href="/affiliate"
              className={`relative pb-1 transition-colors ${
                pathname === '/affiliate'
                  ? 'text-[#FFB81C]'
                  : 'hover:text-[#FFB81C]'
              } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#FFB81C] after:transition-all after:duration-300 ${
                pathname === '/affiliate' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
              }`}
            >
              Affiliates
            </Link>
            <Link
              href="/support"
              className={`relative pb-1 transition-colors ${
                pathname === '/support'
                  ? 'text-[#FFB81C]'
                  : 'hover:text-[#FFB81C]'
              } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#FFB81C] after:transition-all after:duration-300 ${
                pathname === '/support' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
              }`}
            >
              Support
            </Link>
          </div>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-bold text-sm text-white">
                Hello, {user.name ? user.name.split(' ')[0] : 'Guest'}
              </span>
              <Link href={user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard'}>
                <button className="bg-[#FFB81C] text-[#000080] px-6 py-2 rounded-full font-black text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md">
                  Dashboard
                </button>
              </Link>
            </div>
          ) : (
            <Link href="/login">
              <button className="border border-white/30 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-white/20 transition-all duration-200">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* ── APP-STYLE MOBILE TOP BAR ── */}
      <div className="md:hidden bg-[#000080] text-white py-4 px-5 sticky top-0 z-40 flex justify-between items-center border-b border-white/10">
        <Link href="/">
          <div className="text-2xl font-black tracking-tight cursor-pointer">
            Airgo<span className="text-[#FFB81C]">.ng</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/register" className="text-white font-bold text-sm">
                Register
              </Link>
              <Link href="/login" className="bg-[#FFB81C] text-[#000080] px-4 py-1.5 rounded-full font-black text-sm">
                Sign In
              </Link>
            </>
          ) : (
            <Link href={user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard'}>
              <div className="w-8 h-8 bg-[#FFB81C] rounded-full flex items-center justify-center text-[#000080] font-black shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
          )}
        </div>
      </div>
      </>
      )}

      {/* ── APP-STYLE MOBILE BOTTOM TAB BAR ── */}
      {!hideBottomNav && (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-between items-center px-8 py-3 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center gap-1">
          <svg className={`w-6 h-6 ${pathname === '/' ? 'text-[#000080]' : 'text-gray-400'}`} fill={pathname === '/' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={pathname === '/' ? '0' : '2'} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className={`text-[10px] font-bold ${pathname === '/' ? 'text-[#000080]' : 'text-gray-400'}`}>Home</span>
        </Link>
        
        <Link href="/dashboard" className="flex flex-col items-center gap-1">
          <svg className={`w-6 h-6 ${pathname === '/dashboard' ? 'text-[#000080]' : 'text-gray-400'}`} fill={pathname === '/dashboard' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={pathname === '/dashboard' ? '0' : '2'} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <span className={`text-[10px] font-bold ${pathname === '/dashboard' ? 'text-[#000080]' : 'text-gray-400'}`}>Bookings</span>
        </Link>
        
        <Link href="/profile" className="flex flex-col items-center gap-1">
          <svg className={`w-6 h-6 ${pathname === '/profile' ? 'text-[#000080]' : 'text-gray-400'}`} fill={pathname === '/profile' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={pathname === '/profile' ? '0' : '2'} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className={`text-[10px] font-bold ${pathname === '/profile' ? 'text-[#000080]' : 'text-gray-400'}`}>Profile</span>
        </Link>
      </div>
      )}
    </>
  );
}
