import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Generate domain name suggestions using GoDaddy Domain Suggest API
 * 
 * API Documentation: https://developer.godaddy.com/doc/endpoint/domains#/v1/suggest
 * 
 * Alternative providers with APIs:
 * - Namecheap: https://www.namecheap.com/support/api/
 * - Cloudflare Registrar: https://developers.cloudflare.com/registrar/
 * - Name.com: https://www.name.com/api-docs
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { businessName, count = 5 } = await req.json();
        
        if (!businessName) {
            return Response.json({ error: 'Business name is required' }, { status: 400 });
        }

        const apiKey = Deno.env.get('GODADDY_API_KEY');
        const apiSecret = Deno.env.get('GODADDY_API_SECRET');

        if (!apiKey || !apiSecret) {
            // Fallback: generate simple suggestions for demo
            const cleanName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const tlds = ['.com', '.io', '.co', '.net', '.app'];
            const prefixes = ['', 'get', 'try', 'my', 'app'];
            
            const suggestions = [];
            for (let i = 0; i < Math.min(count, 5); i++) {
                const prefix = prefixes[i] || '';
                const tld = tlds[i % tlds.length];
                suggestions.push({
                    domain: `${prefix}${cleanName}${tld}`,
                    available: true,
                    price: 12.99 + (i * 2),
                    currency: 'USD'
                });
            }

            return Response.json({
                suggestions,
                message: 'GoDaddy API not configured. These are simulated suggestions.'
            });
        }

        // Get domain suggestions from GoDaddy
        const response = await fetch(
            `https://api.godaddy.com/v1/domains/suggest?query=${encodeURIComponent(businessName)}&limit=${count}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `sso-key ${apiKey}:${apiSecret}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`GoDaddy API error: ${response.statusText}`);
        }

        const suggestions = await response.json();

        // Format suggestions
        const formattedSuggestions = suggestions.map(s => ({
            domain: s.domain,
            available: true,
            price: s.price || 12.99,
            currency: s.currency || 'USD'
        }));

        return Response.json({
            suggestions: formattedSuggestions
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            suggestions: []
        }, { status: 500 });
    }
});