import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Purchase carbon offsets via Stripe Climate
 * Docs: https://stripe.com/climate
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { co2InKg, transactionId } = await req.json();

        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

        if (!stripeKey) {
            // Demo mode - log the offset attempt
            return Response.json({
                success: true,
                demo: true,
                offset: {
                    co2Offset: co2InKg,
                    cost: (co2InKg * 10).toFixed(2), // ~$10 per tonne
                    currency: 'USD',
                    projects: ['Demo: Frontier Carbon Removal Portfolio']
                },
                message: 'Demo mode - set STRIPE_SECRET_KEY to enable real offsetting'
            });
        }

        // Stripe Climate integration
        const tonnesOfCO2 = co2InKg / 1000;
        const costInCents = Math.round(tonnesOfCO2 * 1000 * 100); // $10 per tonne = $0.01 per kg

        const response = await fetch('https://api.stripe.com/v1/climate/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'amount': costInCents.toString(),
                'currency': 'usd',
                'metric_tons': tonnesOfCO2.toFixed(6),
                'beneficiary': user.email,
                'metadata[transaction_id]': transactionId || ''
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Stripe Climate error: ${error.error?.message || response.statusText}`);
        }

        const order = await response.json();

        // Log offset to database
        await base44.entities.CarbonOffset.create({
            user_email: user.email,
            transaction_id: transactionId,
            co2_kg: parseFloat(co2InKg),
            cost_usd: costInCents / 100,
            stripe_order_id: order.id,
            projects: order.certificate?.project_ids || [],
            status: order.status
        });

        return Response.json({
            success: true,
            demo: false,
            offset: {
                orderId: order.id,
                co2Offset: co2InKg,
                cost: (costInCents / 100).toFixed(2),
                currency: 'USD',
                status: order.status,
                certificate: order.certificate_url
            }
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});