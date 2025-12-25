import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ 
                success: false, 
                error: 'Email and password required' 
            }, { status: 400 });
        }

        // Find customer by email
        const customers = await base44.asServiceRole.entities.OrchestrationCustomer.filter({ 
            contact_email: email 
        });

        if (!customers || customers.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'Invalid credentials' 
            }, { status: 401 });
        }

        const customer = customers[0];

        // Check password (in production, use proper hashing)
        if (customer.password_hash !== password) {
            return Response.json({ 
                success: false, 
                error: 'Invalid credentials' 
            }, { status: 401 });
        }

        // Check if account is active
        if (customer.status === 'suspended' || customer.status === 'cancelled') {
            return Response.json({ 
                success: false, 
                error: 'Account suspended or cancelled' 
            }, { status: 403 });
        }

        // Return session data
        return Response.json({
            success: true,
            customer: {
                id: customer.id,
                customer_id: customer.customer_id,
                company_name: customer.company_name,
                contact_email: customer.contact_email,
                subscription_tier: customer.subscription_tier,
                status: customer.status,
                enabled_features: customer.enabled_features || []
            }
        });

    } catch (error) {
        console.error('Orchestration auth error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});