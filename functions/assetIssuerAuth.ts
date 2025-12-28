import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const { provider_code, issuer_code, password } = await req.json();

    const issuers = await base44.asServiceRole.entities.AssetIssuer.filter({ 
        provider_code, 
        issuer_code 
    });
    
    if (issuers.length === 0) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const issuer = issuers[0];

    if (issuer.status !== 'active') {
        return Response.json({ error: 'Account not active' }, { status: 403 });
    }

    // In production: verify password hash
    
    return Response.json({
        issuer_id: issuer.id,
        issuer_code: issuer.issuer_code,
        provider_code: issuer.provider_code,
        company_name: issuer.company_name,
        email: issuer.email
    });
});