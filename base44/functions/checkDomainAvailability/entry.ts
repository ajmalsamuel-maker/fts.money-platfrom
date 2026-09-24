import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Check domain availability using GoDaddy API
 * 
 * GoDaddy API Documentation: https://developer.godaddy.com/doc/endpoint/domains
 * 
 * Required Environment Variables:
 * - GODADDY_API_KEY: Your GoDaddy API key
 * - GODADDY_API_SECRET: Your GoDaddy API secret
 * 
 * To get API credentials:
 * 1. Go to https://developer.godaddy.com/keys
 * 2. Create a new API key (use Production for live, OTE for testing)
 * 3. Store the key and secret as environment variables
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { domain } = await req.json();
        
        if (!domain) {
            return Response.json({ error: 'Domain is required' }, { status: 400 });
        }

        const apiKey = Deno.env.get('GODADDY_API_KEY');
        const apiSecret = Deno.env.get('GODADDY_API_SECRET');

        if (!apiKey || !apiSecret) {
            // Fallback: simulate response for demo
            return Response.json({
                available: true,
                domain: domain,
                price: 12.99,
                currency: 'USD',
                period: 1,
                message: 'GoDaddy API not configured. This is a simulated response.'
            });
        }

        // Check domain availability via GoDaddy API
        const response = await fetch(
            `https://api.godaddy.com/v1/domains/available?domain=${encodeURIComponent(domain)}`,
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

        const data = await response.json();

        return Response.json({
            available: data.available,
            domain: domain,
            price: data.price || 12.99,
            currency: data.currency || 'USD',
            period: data.period || 1
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            available: false 
        }, { status: 500 });
    }
});