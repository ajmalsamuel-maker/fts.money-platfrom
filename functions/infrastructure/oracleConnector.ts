import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { operation, config, resources } = await req.json();

        const OCI_USER_ID = Deno.env.get('OCI_USER_ID');
        const OCI_TENANCY_ID = Deno.env.get('OCI_TENANCY_ID');
        const OCI_PRIVATE_KEY = Deno.env.get('OCI_PRIVATE_KEY');
        const OCI_REGION = config?.region || 'us-ashburn-1';

        if (!OCI_USER_ID || !OCI_TENANCY_ID || !OCI_PRIVATE_KEY) {
            return Response.json({ 
                error: 'Oracle Cloud credentials not configured',
                message: 'Set OCI_USER_ID, OCI_TENANCY_ID, OCI_PRIVATE_KEY secrets'
            }, { status: 400 });
        }

        switch (operation) {
            case 'provision_compute':
                return Response.json({
                    success: true,
                    provider: 'oracle_cloud',
                    operation: 'provision_compute',
                    instance_id: `ocid1.instance.${Date.now()}`,
                    shape: getOCIShape(resources.cpu_cores, resources.memory_gb),
                    region: OCI_REGION,
                    public_ip: '140.xxx.xxx.xxx',
                    status: 'running',
                    estimated_monthly_cost: calculateOCICost(resources),
                    message: 'Oracle Cloud Compute provisioned (demo mode)'
                });

            default:
                return Response.json({ error: 'Unknown operation' }, { status: 400 });
        }

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function getOCIShape(cpuCores, memoryGB) {
    if (cpuCores <= 2) return 'VM.Standard.E3.Flex';
    if (cpuCores <= 4) return 'VM.Standard.E4.Flex';
    return 'VM.Standard.E5.Flex';
}

function calculateOCICost(resources) {
    return Math.round(resources.cpu_cores * 20 + resources.memory_gb * 2);
}