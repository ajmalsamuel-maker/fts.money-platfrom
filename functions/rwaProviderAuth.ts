import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const { provider_code, password } = await req.json();

    const providers = await base44.asServiceRole.entities.RWAProvider.filter({ provider_code });
    
    if (providers.length === 0) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const provider = providers[0];

    // Get associated customer to verify password
    const customers = await base44.asServiceRole.entities.RWAWhiteLabelCustomer.filter({ 
        customer_code: provider_code 
    });

    if (customers.length === 0) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const customer = customers[0];

    // Verify password hash
    const password_hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password)
    ).then(buf => Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));

    if (password_hash !== customer.password_hash) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    return Response.json({
        provider_code: provider.provider_code,
        company_name: provider.company_name,
        email: customer.admin_email,
        portal_url: provider.portal_url,
        logo_url: provider.logo_url
    });
});