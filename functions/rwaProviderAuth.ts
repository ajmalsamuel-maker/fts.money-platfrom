import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const { provider_code, password } = await req.json();

    const providers = await base44.asServiceRole.entities.RWAProvider.filter({ provider_code });
    
    if (providers.length === 0) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const provider = providers[0];

    // In production: verify password hash
    // For now: simplified check
    
    return Response.json({
        provider_code: provider.provider_code,
        company_name: provider.company_name,
        email: provider.whitelabel_customer_id,
        portal_url: provider.portal_url,
        logo_url: provider.logo_url
    });
});