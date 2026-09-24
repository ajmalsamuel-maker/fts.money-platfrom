import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { providerName } = await req.json();
        
        if (!providerName) {
            return Response.json({ error: 'Provider name required' }, { status: 400 });
        }

        // Search for provider logo using web search
        const searchQuery = `${providerName} payment provider logo png transparent`;
        const searchResponse = await fetch(
            `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        // Try common logo sources
        const possibleLogos = [
            `https://logo.clearbit.com/${providerName.toLowerCase().replace(/\s+/g, '')}.com`,
            `https://cdn.brandfetch.io/${providerName.toLowerCase().replace(/\s+/g, '')}.com`,
        ];

        // Test first available logo
        for (const logoUrl of possibleLogos) {
            try {
                const testResponse = await fetch(logoUrl, { method: 'HEAD' });
                if (testResponse.ok) {
                    return Response.json({ logo_url: logoUrl });
                }
            } catch {
                continue;
            }
        }

        return Response.json({ error: 'Logo not found' }, { status: 404 });
        
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});