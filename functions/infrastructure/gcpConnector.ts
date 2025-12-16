import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { operation, config, resources } = await req.json();

        const GCP_PROJECT_ID = Deno.env.get('GCP_PROJECT_ID');
        const GCP_SERVICE_ACCOUNT_KEY = Deno.env.get('GCP_SERVICE_ACCOUNT_KEY');
        const GCP_REGION = config?.region || Deno.env.get('GCP_REGION') || 'us-central1';

        if (!GCP_PROJECT_ID || !GCP_SERVICE_ACCOUNT_KEY) {
            return Response.json({ 
                error: 'GCP credentials not configured',
                message: 'Set GCP_PROJECT_ID and GCP_SERVICE_ACCOUNT_KEY secrets'
            }, { status: 400 });
        }

        switch (operation) {
            case 'provision_compute':
                return await provisionComputeEngine(config, resources, GCP_REGION);
            case 'provision_database':
                return await provisionCloudSQL(config, resources, GCP_REGION);
            case 'scale_compute':
                return await scaleComputeEngine(config, resources, GCP_REGION);
            case 'terminate_resources':
                return await terminateResources(config, resources, GCP_REGION);
            case 'get_metrics':
                return await getCloudMonitoringMetrics(config, resources, GCP_REGION);
            default:
                return Response.json({ error: 'Unknown operation' }, { status: 400 });
        }

    } catch (error) {
        console.error('GCP connector error:', error);
        return Response.json({ 
            error: 'GCP operation failed', 
            details: error.message 
        }, { status: 500 });
    }
});

async function provisionComputeEngine(config, resources, region) {
    const instanceSpec = {
        machineType: getMachineType(resources.cpu_cores, resources.memory_gb),
        image: 'projects/ubuntu-os-cloud/global/images/ubuntu-2004-lts',
        region: region,
        diskSizeGb: resources.storage_gb,
        tags: ['fts-money', 'psp-instance']
    };

    return Response.json({
        success: true,
        provider: 'gcp',
        operation: 'provision_compute',
        instance_id: `gce-instance-${Date.now()}`,
        machine_type: instanceSpec.machineType,
        region: region,
        zone: `${region}-a`,
        external_ip: '34.123.45.67',
        internal_ip: '10.128.0.42',
        status: 'running',
        estimated_monthly_cost: calculateGCPComputeCost(resources),
        message: 'GCP Compute Engine provisioned (demo mode - integrate GCP SDK for production)'
    });
}

async function provisionCloudSQL(config, resources, region) {
    return Response.json({
        success: true,
        provider: 'gcp',
        operation: 'provision_database',
        instance_id: `cloudsql-${Date.now()}`,
        database_version: 'POSTGRES_14',
        tier: getCloudSQLTier(resources.cpu_cores, resources.memory_gb),
        region: region,
        connection_name: `project:${region}:psp-db-${Date.now()}`,
        ip_address: '35.123.45.67',
        port: 5432,
        status: 'runnable',
        estimated_monthly_cost: calculateGCPSQLCost(resources),
        message: 'Cloud SQL provisioned (demo mode)'
    });
}

async function scaleComputeEngine(config, resources, region) {
    return Response.json({
        success: true,
        provider: 'gcp',
        operation: 'scale_compute',
        instance_id: resources.instance_id,
        previous_type: resources.current_machine_type,
        new_type: getMachineType(resources.target_cpu_cores, resources.target_memory_gb),
        message: 'Compute Engine scaled (demo mode)'
    });
}

async function terminateResources(config, resources, region) {
    return Response.json({
        success: true,
        provider: 'gcp',
        operation: 'terminate_resources',
        terminated_instances: resources.instance_ids,
        message: 'Resources terminated (demo mode)'
    });
}

async function getCloudMonitoringMetrics(config, resources, region) {
    return Response.json({
        success: true,
        provider: 'gcp',
        operation: 'get_metrics',
        instance_id: resources.instance_id,
        metrics: {
            cpu_utilization: Math.random() * 100,
            memory_utilization: Math.random() * 100,
            network_in: Math.random() * 1000000,
            network_out: Math.random() * 1000000
        },
        timestamp: new Date().toISOString(),
        message: 'Metrics retrieved (demo mode)'
    });
}

function getMachineType(cpuCores, memoryGB) {
    if (cpuCores <= 2 && memoryGB <= 8) return 'n1-standard-2';
    if (cpuCores <= 4 && memoryGB <= 16) return 'n1-standard-4';
    if (cpuCores <= 8 && memoryGB <= 32) return 'n1-standard-8';
    if (cpuCores <= 16 && memoryGB <= 64) return 'n1-standard-16';
    return 'n1-standard-32';
}

function getCloudSQLTier(cpuCores, memoryGB) {
    if (cpuCores <= 2) return 'db-n1-standard-2';
    if (cpuCores <= 4) return 'db-n1-standard-4';
    if (cpuCores <= 8) return 'db-n1-standard-8';
    return 'db-n1-standard-16';
}

function calculateGCPComputeCost(resources) {
    return Math.round(resources.cpu_cores * 25 + resources.memory_gb * 3);
}

function calculateGCPSQLCost(resources) {
    return Math.round(resources.cpu_cores * 45 + resources.storage_gb * 0.17);
}