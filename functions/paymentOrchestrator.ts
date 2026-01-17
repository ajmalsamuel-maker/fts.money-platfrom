import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Payment Orchestrator - Dynamically selects best connector for transaction
 * Processor-agnostic: works with any provisioned connector
 * Implements failover logic if primary connector fails
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { 
            merchant_id, 
            psp_code, 
            amount, 
            currency, 
            payment_method 
        } = await req.json();

        // 1. Get all active connectors for this PSP
        const connectors = await base44.asServiceRole.entities.ProcessorConnectorConfig.filter({
            psp_code: psp_code,
            status: 'active'
        });

        if (!connectors || connectors.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'No active payment connectors configured' 
            }, { status: 400 });
        }

        console.log(`🎯 Orchestrator: Found ${connectors.length} active connectors for ${psp_code}`);

        // 2. Filter connectors that support this payment method & currency
        const compatibleConnectors = connectors.filter(c => {
            const methodSupported = c.supported_payment_methods?.includes(payment_method) || 
                                   c.supported_payment_methods?.includes('*');
            const currencySupported = c.supported_currencies?.includes(currency) || 
                                     c.supported_currencies?.includes('*');
            const withinLimit = !c.daily_volume_limit || 
                               (c.current_daily_volume + amount) <= c.daily_volume_limit;
            const healthy = c.health_check_status !== 'down';

            return methodSupported && currencySupported && withinLimit && healthy;
        });

        if (compatibleConnectors.length === 0) {
            return Response.json({ 
                success: false, 
                error: `No connectors available for ${payment_method} in ${currency}` 
            }, { status: 400 });
        }

        console.log(`✓ Orchestrator: ${compatibleConnectors.length} compatible connectors`);

        // 3. Sort by priority (highest first), then by success rate, then by response time
        const sorted = compatibleConnectors.sort((a, b) => {
            if (a.priority !== b.priority) return b.priority - a.priority;
            if (a.success_rate_percent !== b.success_rate_percent) {
                return (b.success_rate_percent || 0) - (a.success_rate_percent || 0);
            }
            return (a.avg_response_time_ms || 999) - (b.avg_response_time_ms || 999);
        });

        // 4. Select primary connector
        const primaryConnector = sorted[0];
        const fallbackConnectors = sorted.slice(1);

        console.log(`🚀 Orchestrator: Selected ${primaryConnector.connector_name} (priority: ${primaryConnector.priority})`);

        return Response.json({
            success: true,
            selected_connector: primaryConnector.connector_name,
            connector_id: primaryConnector.id,
            api_endpoint: primaryConnector.api_endpoint,
            mode: primaryConnector.mode,
            supported_methods: primaryConnector.supported_payment_methods,
            fallback_connectors: fallbackConnectors.map(c => ({
                name: c.connector_name,
                id: c.id,
                priority: c.priority
            })),
            routing_metadata: {
                timestamp: new Date().toISOString(),
                merchant_id,
                psp_code,
                amount,
                currency,
                payment_method
            }
        });

    } catch (error) {
        console.error('Orchestration error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});