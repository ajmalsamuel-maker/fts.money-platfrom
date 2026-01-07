import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { provider_code, password } = await req.json();

        // Get associated customer to verify password (case-insensitive)
        const allCustomers = await base44.asServiceRole.entities.RWAWhiteLabelCustomer.list();
        const customer = allCustomers.find(c => 
            c.customer_code?.toLowerCase() === provider_code?.toLowerCase()
        );

        if (!customer) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

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

        // Get provider details
        const allProviders = await base44.asServiceRole.entities.RWAProvider.list();
        const provider = allProviders.find(p => 
            p.provider_code?.toLowerCase() === provider_code?.toLowerCase()
        );
        
        return Response.json({
            provider_code: customer.customer_code,
            company_name: customer.company_name,
            email: customer.admin_email,
            portal_url: customer.portal_url,
            logo_url: provider?.logo_url
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});