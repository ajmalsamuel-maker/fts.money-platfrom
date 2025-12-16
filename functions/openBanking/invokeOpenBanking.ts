import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { provider_name, operation, payload } = await req.json();

        if (!provider_name || !operation) {
            return Response.json({ error: 'Missing provider_name or operation' }, { status: 400 });
        }

        // Fetch provider configuration
        const configs = await base44.asServiceRole.entities.OpenBankingProviderConfiguration.filter({
            provider_name: provider_name,
            is_enabled: true,
            status: 'active'
        });

        if (!configs || configs.length === 0) {
            return Response.json({ error: `Provider ${provider_name} not configured or not active` }, { status: 404 });
        }

        const providerConfig = configs[0];

        // Route to appropriate connector
        let connectorResponse;
        
        switch (provider_name) {
            case 'TrueLayer':
                connectorResponse = await base44.asServiceRole.functions.invoke('trueLayerConnector', {
                    operation,
                    payload,
                    config: providerConfig
                });
                break;
            
            case 'Tink':
                connectorResponse = await base44.asServiceRole.functions.invoke('tinkConnector', {
                    operation,
                    payload,
                    config: providerConfig
                });
                break;
            
            case 'Brankas':
                connectorResponse = await base44.asServiceRole.functions.invoke('brankasConnector', {
                    operation,
                    payload,
                    config: providerConfig
                });
                break;
            
            default:
                return Response.json({ 
                    error: `Provider ${provider_name} not yet implemented. Available: TrueLayer, Tink, Brankas` 
                }, { status: 400 });
        }

        // Log the operation for audit purposes
        await base44.asServiceRole.entities.PSPAuditTrail.create({
            event_type: 'open_banking_operation',
            entity_type: 'OpenBanking',
            action: operation,
            user_email: user.email,
            details: {
                provider: provider_name,
                operation: operation,
                success: connectorResponse.data?.success || false
            }
        });

        return Response.json(connectorResponse.data);

    } catch (error) {
        console.error('Open Banking Hub Error:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});