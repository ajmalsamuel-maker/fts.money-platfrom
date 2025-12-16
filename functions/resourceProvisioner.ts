import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Orchestration layer that routes provisioning requests to appropriate cloud providers

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { psp_id, allocation_id, action } = await req.json();

        // Fetch allocation details
        const allocations = await base44.asServiceRole.entities.ResourceAllocation.filter({ id: allocation_id });
        if (!allocations || allocations.length === 0) {
            return Response.json({ error: 'Allocation not found' }, { status: 404 });
        }

        const allocation = allocations[0];

        // Fetch pool to determine provider
        const pools = await base44.asServiceRole.entities.ResourcePool.filter({ id: allocation.pool_id });
        if (!pools || pools.length === 0) {
            return Response.json({ error: 'Resource pool not found' }, { status: 404 });
        }

        const pool = pools[0];
        const provider = determineProvider(pool.region);

        // Route to appropriate provider connector
        let provisioningResult;

        switch (provider) {
            case 'aws':
                provisioningResult = await base44.asServiceRole.functions.invoke('infrastructure/awsConnector', {
                    operation: action,
                    config: {
                        region: pool.region,
                        pool_id: pool.pool_id
                    },
                    resources: allocation.allocated_resources
                });
                break;

            case 'azure':
                provisioningResult = await base44.asServiceRole.functions.invoke('infrastructure/azureConnector', {
                    operation: action,
                    config: {
                        region: pool.region,
                        pool_id: pool.pool_id
                    },
                    resources: allocation.allocated_resources
                });
                break;

            case 'local':
                // Determine specific local provider based on region
                const localProvider = getLocalProvider(pool.region);
                provisioningResult = await base44.asServiceRole.functions.invoke('infrastructure/localProviderConnector', {
                    operation: action,
                    provider: localProvider,
                    config: {
                        region: pool.region,
                        datacenter: pool.datacenter,
                        pool_id: pool.pool_id
                    },
                    resources: allocation.allocated_resources
                });
                break;

            default:
                return Response.json({ error: 'Unsupported provider' }, { status: 400 });
        }

        // Update allocation with provisioning details
        await base44.asServiceRole.entities.ResourceAllocation.update(allocation_id, {
            status: 'active',
            cloud_provider: provider,
            cloud_instance_id: provisioningResult.data.instance_id || provisioningResult.data.vm_id,
            cloud_metadata: provisioningResult.data,
            last_provisioned: new Date().toISOString()
        });

        return Response.json({
            success: true,
            allocation_id: allocation_id,
            provider: provider,
            provisioning_details: provisioningResult.data,
            message: `Resources provisioned successfully via ${provider}`
        });

    } catch (error) {
        console.error('Resource provisioning error:', error);
        return Response.json({ 
            error: 'Provisioning failed', 
            details: error.message 
        }, { status: 500 });
    }
});

function determineProvider(region) {
    // Map regions to cloud providers
    if (region.startsWith('us-') || region.startsWith('eu-') || region.startsWith('ap-')) {
        // Standard AWS/Azure regions
        if (region.includes('east') || region.includes('west')) {
            return 'aws';
        }
        return 'azure';
    }

    // Regional/local providers
    if (region.startsWith('pk-') || region === 'pakistan') return 'local';
    if (region.startsWith('cn-') || region === 'china') return 'local';
    
    return 'aws'; // default
}

function getLocalProvider(region) {
    // Map regions to specific local providers
    if (region.startsWith('pk-') || region === 'pakistan') return 'ptcl';
    if (region === 'cn-hangzhou' || region === 'china-east') return 'alipay_cloud';
    if (region === 'cn-beijing' || region === 'cn-guangzhou') return 'tencent_cloud';
    if (region === 'cn-north-1') return 'huawei_cloud';
    
    return 'ptcl'; // default
}