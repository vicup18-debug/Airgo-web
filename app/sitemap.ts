import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://airgo.ng';
  
  // Static Routes
  const staticRoutes = [
    '',
    '/hotels',
    '/taxi',
    '/flights',
    '/about',
    '/corporate',
    '/how-we-work',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch dynamic hotels for SEO
  let dynamicHotels: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch('https://airgo-backend.onrender.com/api/hotels', { next: { revalidate: 3600 } });
    if (res.ok) {
      const hotels = await res.json();
      dynamicHotels = hotels.map((hotel: any) => ({
        url: `${baseUrl}/hotels/${hotel._id}`,
        lastModified: new Date(hotel.updatedAt || new Date()).toISOString(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch hotels for sitemap:", error);
  }

  return [...staticRoutes, ...dynamicHotels];
}
