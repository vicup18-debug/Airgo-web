"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
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
    } else {
      setUser(null);
    }
  }, [pathname]);

// 🟢 SAFETY SWITCH: Hide global nav on dashboards and auth pages
  const hiddenRoutes = ['/admin', '/partner', '/dashboard', '/login', '/register', '/join'];
  if (hiddenRoutes.some(route => pathname.startsWith(route))) return null;

  return (
    <>
      {/* SMART DESKTOP NAVIGATION */}
      <nav className="hidden md:flex bg-[#000080] text-white py-4 px-8 justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center space-x-12">
          <Link href="/"><div className="text-2xl font-black text-white tracking-tight cursor-pointer">Airgo<span className="text-[#FFB81C]">.ng</span></div></Link>
          <div className="flex space-x-6 font-semibold text-sm items-center">
            <Link href="/" className={`${pathname === '/' ? 'text-[#FFB81C] border-b-2 border-[#FFB81C]' : 'hover:text-[#FFB81C] transition'} pb-1`}>Hotels</Link>
            <Link href="/cars" className={`${pathname === '/cars' ? 'text-[#FFB81C] border-b-2 border-[#FFB81C]' : 'hover:text-[#FFB81C] transition'} pb-1`}>Car Rentals</Link>
          </div>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-bold text-sm text-white">Hello, {user.name ? user.name.split(' ')[0] : 'Guest'}</span>
              <Link href={user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard'}>
                <button className="bg-[#FFB81C] text-[#000080] px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition shadow-md">Dashboard</button>
              </Link>
            </div>
          ) : (
            <Link href="/login"><button className="bg-white text-[#000080] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition shadow-md">Sign In</button></Link>
          )}
        </div>
      </nav>

      {/* SMART MOBILE TOP BAR */}
      <div className="md:hidden bg-[#000080] text-white py-4 px-6 sticky top-0 z-40 shadow-md flex justify-between items-center">
        <div className="text-xl font-black tracking-tight">Airgo<span className="text-[#FFB81C]">.ng</span></div>
        <Link href={user ? (user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard') : '/login'}>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#000080] font-bold shadow-sm">
            {user ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>
        </Link>
      </div>
    </>
  );
}
