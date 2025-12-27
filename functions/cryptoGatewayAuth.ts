import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ 
                success: false, 
                message: 'Email and password required' 
            }, { status: 400 });
        }

        // Query CryptoGatewayCustomer entity for user
        const customers = await base44.asServiceRole.entities.CryptoGatewayCustomer.filter({
            email: email,
            status: 'active'
        });

        if (!customers || customers.length === 0) {
            return Response.json({ 
                success: false, 
                message: 'Invalid credentials' 
            }, { status: 401 });
        }

        const customer = customers[0];

        // In production, verify password hash
        // For now, simplified check (replace with bcrypt in production)
        if (password !== customer.password) { // TEMP - use bcrypt.compare() in production
            return Response.json({ 
                success: false, 
                message: 'Invalid credentials' 
            }, { status: 401 });
        }

        return Response.json({
            success: true,
            user: {
                id: customer.id,
                email: customer.email,
                company_name: customer.company_name
            },
            customer_id: customer.id,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Crypto Gateway auth error:', error);
        return Response.json({ 
            success: false, 
            message: 'Authentication failed' 
        }, { status: 500 });
    }
});