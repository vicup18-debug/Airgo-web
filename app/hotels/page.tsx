import { Metadata } from 'next';
import HotelsPage from './page-client';

export const metadata: Metadata = {
  title: 'Luxury Hotel & Apartment Bookings | Airgo.ng',
  description: 'Book verified luxury hotels, premium apartments, and executive suites across Nigeria. Secure escrow protection guarantees your satisfaction.',
  keywords: ['Luxury Hotels Abuja', 'Apartments Lagos', 'Escrow Hotel Booking', 'Premium Stays Nigeria', 'Airgo Accommodations'],
  openGraph: {
    title: 'Luxury Hotel & Apartment Bookings | Airgo.ng',
    description: 'Book verified luxury hotels and premium apartments securely with Airgo Escrow.',
    url: 'https://airgo.ng/hotels',
    siteName: 'Airgo.ng',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Airgo Luxury Hotels',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
};

export default function Page() {
  return <HotelsPage />;
}
