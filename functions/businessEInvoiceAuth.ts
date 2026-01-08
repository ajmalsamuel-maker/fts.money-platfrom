import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, email, password, company_name } = await req.json();

        if (action === 'register') {
            // Create new business account
            const business = {
                email,
                company_name,
                password_hash: await hashPassword(password),
                onboarding_status: 'incomplete',
                created_date: new Date().toISOString()
            };

            // In production: Store in database
            // await base44.entities.BusinessEInvoice.create(business);

            return Response.json({
                success: true,
                business: { ...business, password_hash: undefined }
            });
        }

        if (action === 'login') {
            // Mock login - in production, verify against database
            // const businesses = await base44.entities.BusinessEInvoice.filter({ email });
            
            // Mock response
            if (email && password) {
                return Response.json({
                    success: true,
                    business: {
                        id: 'BUS' + Date.now(),
                        email,
                        company_name: 'Demo Company Ltd',
                        onboarding_status: 'incomplete',
                        lei_number: null
                    }
                });
            }

            return Response.json({
                success: false,
                error: 'Invalid credentials'
            }, { status: 401 });
        }

        return Response.json({
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('Business auth error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}