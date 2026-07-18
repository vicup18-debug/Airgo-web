import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        let url = '';
        if (type === 'search') {
            const q = searchParams.get('q');
            url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q || '')}&countrycodes=ng&limit=5&addressdetails=1`;
        } else if (type === 'reverse') {
            const lat = searchParams.get('lat');
            const lon = searchParams.get('lon');
            url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'AirgoBookingApp/1.0 (support@airgo.com)',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        
        if (res.ok) {
            const data = await res.json();
            return NextResponse.json(data);
        } else {
            const errText = await res.text();
            console.error('Nominatim API error:', errText);
            return NextResponse.json({ error: 'Nominatim API error' }, { status: res.status });
        }
    } catch (error) {
        console.error('Failed to fetch location data:', error);
        return NextResponse.json({ error: 'Failed to fetch location data' }, { status: 500 });
    }
}
