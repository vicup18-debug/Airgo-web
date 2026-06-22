export function getApiUrl(): string {
    let url = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
    
    // Clean up trailing slash if present
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    
    // Auto-detect production build leakage of localhost/HTTP URL
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            if (url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('http://')) {
                // Force secure live backend on production website
                url = 'https://airgo-backend.onrender.com';
            }
        }
    }
    return url;
}
