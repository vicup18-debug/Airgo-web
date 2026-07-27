"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import BookingModal from '../bookings-modal';

export default function HotelDetailClient({ hotel }: { hotel: any }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pt-24 pb-12">
      {/* We render the modal but as an "always open" component for this route. */}
      {/* In a real scenario, we might want to refactor BookingModal to not use "fixed inset-0" when used as a page, 
          but to save time and preserve the complex state, we use it as-is. It will cover the screen, which is acceptable 
          since the user intentionally navigated here. */}
      <BookingModal 
        isOpen={true} 
        onClose={() => router.push('/hotels')} 
        hotel={hotel} 
      />
    </div>
  );
}
