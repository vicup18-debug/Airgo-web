import { Metadata, ResolvingMetadata } from 'next';
import HotelDetailClient from './hotel-detail-client';

async function getHotel(id: string) {
  try {
    const res = await fetch(`https://airgo-backend.onrender.com/api/hotels/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

type Props = {
  params: Promise<{ id: string }> | { id: string };
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const hotel = await getHotel(resolvedParams.id);
  
  if (!hotel) {
    return { title: 'Hotel Not Found | Airgo.ng' };
  }
  
  return {
    title: `${hotel.name} | Airgo.ng`,
    description: hotel.description || `Book ${hotel.name} located in ${hotel.location} securely with Airgo Escrow.`,
    openGraph: {
      title: `${hotel.name} | Airgo.ng`,
      description: `Book ${hotel.name} securely with Airgo Escrow.`,
      images: [
        {
          url: hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          width: 800,
          height: 600,
          alt: hotel.name,
        }
      ]
    }
  };
}

export default async function HotelPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const hotel = await getHotel(resolvedParams.id);
  
  if (!hotel) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-[#000080]">Hotel Not Found</div>;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    image: hotel.image,
    description: hotel.description || `Luxury stay at ${hotel.name}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: hotel.location,
      addressCountry: 'NG'
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HotelDetailClient hotel={hotel} />
    </>
  );
}
