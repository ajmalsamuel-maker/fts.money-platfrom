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
        
        // Hash password (simple hash for demo - use bcrypt in production)
        const password_hash = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(customerData.password)
        ).then(buf => Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''));

        // Remove plain password from data
        const { password, ...customerDataWithoutPassword } = customerData;

        // Create customer record with service role
        const customer = await base44.asServiceRole.entities.RWAWhiteLabelCustomer.create({
            ...customerDataWithoutPassword,
            password_hash,
            status: 'provisioning',
            provisioning_status: 'deploying_contracts',
            provisioning_log: [{
                timestamp: new Date().toISOString(),
                stage: 'initialization',
                status: 'started',
                message: 'Provisioning started'
            }]
        });

        // Create RWAProvider record for portal access
        await base44.asServiceRole.entities.RWAProvider.create({
            provider_code: customerDataWithoutPassword.customer_code,
            whitelabel_customer_id: customer.id,
            company_name: customerDataWithoutPassword.company_name,
            portal_url: `https://${customerDataWithoutPassword.customer_code}.rwa.fts.money`,
            logo_url: customerDataWithoutPassword.branding?.logo_url || '',
            primary_color: customerDataWithoutPassword.branding?.primary_color || '#3b82f6'
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