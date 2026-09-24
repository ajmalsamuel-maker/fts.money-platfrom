import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { operation, config, resources } = await req.json();

        const ALIBABA_ACCESS_KEY = Deno.env.get('ALIBABA_CLOUD_ACCESS_KEY');
        const ALIBABA_SECRET_KEY = Deno.env.get('ALIBABA_CLOUD_SECRET_KEY');
        const ALIBABA_REGION = config?.region || 'cn-hangzhou';

        if (!ALIBABA_ACCESS_KEY || !ALIBABA_SECRET_KEY) {
            return Response.json({ 
                error: 'Alibaba Cloud credentials not configured',
                message: 'Set ALIBABA_CLOUD_ACCESS_KEY and ALIBABA_CLOUD_SECRET_KEY secrets'
            }, { status: 400 });
        }

        switch (operation) {
            case 'provision_compute':
                return Response.json({
                    success: true,
                    provider: 'alibaba_cloud',
                    operation: 'provision_compute',
                    instance_id: `i-${Date.now()}`,
                    instance_type: `ecs.c6.${resources.cpu_cores > 4 ? 'xlarge' : 'large'}`,
                    region: ALIBABA_REGION,
                    public_ip: '47.xxx.xxx.xxx',
                    status: 'running',
                    estimated_monthly_cost_cny: resources.cpu_cores * 180,
                    message: 'Alibaba Cloud ECS provisioned (demo mode)'
                });

            case 'provision_database':
                return Response.json({
                    success: true,
                    provider: 'alibaba_cloud',
                    operation: 'provision_database',
                    instance_id: `rm-${Date.now()}`,
                    engine: 'MySQL',
                    connection_string: `rm-${Date.now()}.mysql.rds.aliyuncs.com`,
                    port: 3306,
                    status: 'running',
                    message: 'Alibaba Cloud RDS provisioned (demo mode)'
                });

            default:
                return Response.json({ error: 'Unknown operation' }, { status: 400 });
        }

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});