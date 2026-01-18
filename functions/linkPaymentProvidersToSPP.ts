import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { psp_id, psp_code } = await req.json();

        if (!psp_id || !psp_code) {
            return Response.json({ error: 'Missing psp_id or psp_code' }, { status: 400 });
        }

        // Get all payment providers
        const providers = await base44.entities.PaymentProvider.list();

        // Create PaymentGateway records for each provider
        const gateways = providers.map(provider => ({
            psp_id: psp_id,
            psp_code: psp_code,
            merchant_id: psp_code, // Link to the PSP
            gateway_name: provider.name,
            status: provider.status || 'active',
            gateway_mode: 'test', // Default to test mode
            supported_methods: [
                provider.type === 'gateway' ? 'card' : 
                provider.type === 'wallet' ? 'wallet' :
                provider.type === 'acquirer' ? 'card' :
                provider.type === 'card_scheme' ? provider.name.toLowerCase().split(' ')[0] :
                provider.type === 'crypto' ? 'crypto' :
                provider.type === 'apm' ? provider.name.toLowerCase() :
                'other'
            ],
            metadata: {
                display_name: provider.name,
                provider_type: provider.type,
                original_provider_id: provider.id
            }
        }));

        // Bulk create gateways
        const created = await base44.entities.PaymentGateway.bulkCreate(gateways);

        console.log(`✅ Created ${created.length} payment gateways for PSP ${psp_code}`);

        return Response.json({
            success: true,
            message: `Created ${created.length} payment gateways`,
            count: created.length
        });

    } catch (error) {
        console.error('❌ Error linking providers:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});