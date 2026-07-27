import { Metadata } from 'next';
import CarsPage from './page-client';

export const metadata: Metadata = {
  title: 'Luxury Taxi & Chauffeur Services | Airgo.ng',
  description: 'Book premium VIP transport, airport shuttles, and luxury sedans across Nigeria with Airgo Escrow Protection.',
  keywords: ['Luxury Taxi Nigeria', 'VIP Chauffeur', 'Airport Shuttle Abuja', 'Escrow Taxi Bookings', 'Premium Transport'],
  openGraph: {
    title: 'Luxury Taxi & Chauffeur Services | Airgo.ng',
    description: 'Book premium VIP transport and airport shuttles securely with Airgo Escrow.',
    url: 'https://airgo.ng/taxi',
    siteName: 'Airgo.ng',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Airgo Luxury Taxi Services',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
};

export default function Page() {
  return <CarsPage />;
}
