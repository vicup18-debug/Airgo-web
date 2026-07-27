import { Metadata } from 'next';
import HotelHomepage from './page-client';

export const metadata: Metadata = {
  title: 'Airgo.ng | Secure Luxury Escrow Bookings for Hotels & Transport',
  description: 'Book verified luxury hotels, apartments, and executive transport across Nigeria. Your payment is held safely in escrow until your stay or ride is confirmed.',
  keywords: ['Luxury Hotels Nigeria', 'Escrow Bookings', 'VIP Transport', 'Airgo Escrow', 'Apartment Rentals Abuja', 'Lagos Hotels'],
  openGraph: {
    title: 'Airgo.ng | Secure Escrow Bookings',
    description: 'Book verified luxury hotels and transport across Nigeria securely.',
    url: 'https://airgo.ng',
    siteName: 'Airgo.ng',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582719478250-c89cae4db85b?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Airgo Luxury Escrow Bookings',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
};

export default function Page() {
  return <HotelHomepage />;
}
