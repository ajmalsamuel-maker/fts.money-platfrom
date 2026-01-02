import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { providerName, domain } = await req.json();

        if (!providerName && !domain) {
            return Response.json({ error: 'Provider name or domain required' }, { status: 400 });
        }

        // Try multiple logo sources in order
        const logoSources = [
            // 1. Clearbit (free, works with domain)
            async () => {
                if (domain) {
                    const url = `https://logo.clearbit.com/${domain}`;
                    const response = await fetch(url, { method: 'HEAD' });
                    if (response.ok) return url;
                }
                return null;
            },

            // 2. Logo.dev (free tier)
            async () => {
                if (domain) {
                    const url = `https://img.logo.dev/${domain}?format=png&size=200`;
                    const response = await fetch(url, { method: 'HEAD' });
                    if (response.ok) return url;
                }
                return null;
            },

            // 3. VectorLogoZone (SVG, public)
            async () => {
                if (providerName) {
                    const normalized = providerName.toLowerCase().replace(/\s+/g, '');
                    const url = `https://www.vectorlogo.zone/logos/${normalized}/${normalized}-icon.svg`;
                    const response = await fetch(url, { method: 'HEAD' });
                    if (response.ok) return url;
                }
                return null;
            },

            // 4. Google favicon (always works as fallback)
            async () => {
                if (domain) {
                    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                }
                return null;
            },

            // 5. DuckDuckGo icon (good fallback)
            async () => {
                if (domain) {
                    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
                }
                return null;
            }
        ];

        // Try each source
        for (const source of logoSources) {
            try {
                const logoUrl = await source();
                if (logoUrl) {
                    return Response.json({
                        success: true,
                        logo_url: logoUrl,
                        provider: providerName,
                        domain: domain
                    });
                }
            } catch (error) {
                console.log(`Source failed: ${error.message}`);
                continue;
            }
        }

        // No logo found
        return Response.json({
            success: false,
            error: 'No logo found from any source',
            provider: providerName,
            domain: domain
        }, { status: 404 });

    } catch (error) {
        console.error('Logo fetch error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});