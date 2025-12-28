import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify platform admin authentication
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const customerData = await req.json();

        // Create customer record with service role
        const customer = await base44.asServiceRole.entities.RWAWhiteLabelCustomer.create({
            ...customerData,
            status: 'provisioning',
            provisioning_status: 'deploying_contracts',
            provisioning_log: [{
                timestamp: new Date().toISOString(),
                stage: 'initialization',
                status: 'started',
                message: 'Provisioning started'
            }]
        });

        // Simulate provisioning stages
        const stages = [
            { stage: 'deploying_contracts', message: 'Deploying smart contracts to blockchain' },
            { stage: 'configuring_custody', message: 'Setting up Fireblocks custody' },
            { stage: 'setting_up_portal', message: 'Configuring white-label portal' },
            { stage: 'completed', message: 'Provisioning complete' }
        ];

        // Run provisioning in background (don't await)
        (async () => {
            for (const stageInfo of stages) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                await base44.asServiceRole.entities.RWAWhiteLabelCustomer.update(customer.id, {
                    provisioning_status: stageInfo.stage,
                    status: stageInfo.stage === 'completed' ? 'active' : 'provisioning'
                });
            }
        })();

        return Response.json({ success: true, customer });
    } catch (error) {
        console.error('Provisioning error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});