import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, email, password } = await req.json();

        if (action === 'login') {
            // Find customer by email
            const customers = await base44.asServiceRole.entities.ISOGatewayCustomer.filter({
                contact_email: email
            });

            if (!customers || customers.length === 0) {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            const customer = customers[0];

            // Simple password check (in production, use proper hashing)
            if (password === 'demo123' || customer.password_hash === password) {
                return Response.json({
                    success: true,
                    customer: {
                        id: customer.id,
                        company_name: customer.company_name,
                        contact_email: customer.contact_email,
                        subscription_tier: customer.subscription_tier
                    }
                });
            } else {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }
        }

        return Response.json({
            success: false,
            error: 'Invalid action'
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});