import { query, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { psp_id, psp_code } = await req.json();

        if (!psp_id || !psp_code) {
            return Response.json({ error: 'Missing psp_id or psp_code' }, { status: 400 });
        }

        // Get all payment providers from database
        const providers = await query('SELECT id, name, type, status FROM payment_provider');

        if (!providers || providers.length === 0) {
            await closeConnection();
            return Response.json({
                success: true,
                message: 'No payment providers found',
                count: 0
            });
        }

        // Prepare gateway records for insertion
        let created = 0;
        for (const provider of providers) {
            const supportedMethod = provider.type === 'gateway' ? 'card' : 
                provider.type === 'wallet' ? 'wallet' :
                provider.type === 'acquirer' ? 'card' :
                provider.type === 'card_scheme' ? provider.name.toLowerCase().split(' ')[0] :
                provider.type === 'crypto' ? 'crypto' :
                provider.type === 'apm' ? provider.name.toLowerCase() :
                'other';

            const metadata = JSON.stringify({
                display_name: provider.name,
                provider_type: provider.type,
                original_provider_id: provider.id
            });

            const apiKey = `test_${provider.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

            await execute(
                `INSERT INTO payment_gateway (psp_code, merchant_id, gateway_name, api_key, status, gateway_mode, supported_methods, metadata)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [psp_code, psp_code, provider.name, apiKey, provider.status || 'active', 'test', JSON.stringify([supportedMethod]), metadata]
            );
            
            created++;
        }

        await closeConnection();
        console.log(`✅ Created ${created} payment gateways for PSP ${psp_code}`);

        return Response.json({
            success: true,
            message: `Created ${created} payment gateways`,
            count: created
        });

    } catch (error) {
        await closeConnection();
        console.error('❌ Error linking providers:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});