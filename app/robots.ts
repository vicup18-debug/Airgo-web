import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/api', '/profile'],
    },
    sitemap: 'https://airgo.ng/sitemap.xml',
  };
}
