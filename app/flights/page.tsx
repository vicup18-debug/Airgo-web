import { Metadata } from 'next';
import FlightsPage from './page-client';

export const metadata: Metadata = {
  title: 'Book Private & Commercial Flights | Airgo.ng',
  description: 'Search and book private jets, charter flights, and commercial airlines across Nigeria with Airgo Escrow protection.',
  keywords: ['Private Jet Booking Nigeria', 'Charter Flights Abuja', 'Commercial Flights Lagos', 'Airgo Escrow Flights', 'Book Flights Securely'],
  openGraph: {
    title: 'Book Private & Commercial Flights | Airgo.ng',
    description: 'Search and book private jets and commercial flights securely with Airgo Escrow.',
    url: 'https://airgo.ng/flights',
    siteName: 'Airgo.ng',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Airgo Flights & Aviation',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
};

export default function Page() {
  return <FlightsPage />;
}
