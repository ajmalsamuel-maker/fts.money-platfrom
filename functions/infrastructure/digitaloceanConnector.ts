import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { operation, config, resources } = await req.json();

        const DO_API_TOKEN = Deno.env.get('DIGITALOCEAN_API_TOKEN');
        const DO_REGION = config?.region || 'nyc3';

        if (!DO_API_TOKEN) {
            return Response.json({ 
                error: 'DigitalOcean API token not configured',
                message: 'Set DIGITALOCEAN_API_TOKEN secret'
            }, { status: 400 });
        }

        switch (operation) {
            case 'provision_compute':
                return Response.json({
                    success: true,
                    provider: 'digitalocean',
                    operation: 'provision_compute',
                    droplet_id: Date.now(),
                    size: getDropletSize(resources.cpu_cores, resources.memory_gb),
                    region: DO_REGION,
                    image: 'ubuntu-20-04-x64',
                    ip_address: '159.xxx.xxx.xxx',
                    status: 'active',
                    estimated_monthly_cost: calculateDOCost(resources),
                    message: 'DigitalOcean Droplet provisioned (demo mode)'
                });

            case 'provision_database':
                return Response.json({
                    success: true,
                    provider: 'digitalocean',
                    operation: 'provision_database',
                    database_id: `db-${Date.now()}`,
                    engine: 'pg',
                    version: '14',
                    host: `db-${Date.now()}.db.ondigitalocean.com`,
                    port: 25060,
                    status: 'online',
                    message: 'DigitalOcean Managed Database provisioned (demo mode)'
                });

            default:
                return Response.json({ error: 'Unknown operation' }, { status: 400 });
        }

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function getDropletSize(cpuCores, memoryGB) {
    if (cpuCores <= 2 && memoryGB <= 4) return 's-2vcpu-4gb';
    if (cpuCores <= 4 && memoryGB <= 8) return 's-4vcpu-8gb';
    if (cpuCores <= 8 && memoryGB <= 16) return 's-8vcpu-16gb';
    return 's-16vcpu-32gb';
}

function calculateDOCost(resources) {
    return Math.round(resources.cpu_cores * 12 + resources.memory_gb * 1.5);
}