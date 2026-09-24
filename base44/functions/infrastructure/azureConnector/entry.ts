import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { operation, config, resources } = await req.json();

        // Azure credentials should be set in secrets
        const AZURE_SUBSCRIPTION_ID = Deno.env.get('AZURE_SUBSCRIPTION_ID');
        const AZURE_TENANT_ID = Deno.env.get('AZURE_TENANT_ID');
        const AZURE_CLIENT_ID = Deno.env.get('AZURE_CLIENT_ID');
        const AZURE_CLIENT_SECRET = Deno.env.get('AZURE_CLIENT_SECRET');
        const AZURE_REGION = config?.region || 'eastus';

        if (!AZURE_SUBSCRIPTION_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET) {
            return Response.json({ 
                error: 'Azure credentials not configured',
                message: 'Set AZURE_SUBSCRIPTION_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET secrets'
            }, { status: 400 });
        }

        // Route to specific Azure operations
        switch (operation) {
            case 'provision_compute':
                return await provisionVM(config, resources, AZURE_REGION);
            case 'provision_database':
                return await provisionAzureSQL(config, resources, AZURE_REGION);
            case 'scale_compute':
                return await scaleVM(config, resources, AZURE_REGION);
            case 'terminate_resources':
                return await terminateResources(config, resources, AZURE_REGION);
            case 'get_metrics':
                return await getAzureMonitorMetrics(config, resources, AZURE_REGION);
            default:
                return Response.json({ error: 'Unknown operation' }, { status: 400 });
        }

    } catch (error) {
        console.error('Azure connector error:', error);
        return Response.json({ 
            error: 'Azure operation failed', 
            details: error.message 
        }, { status: 500 });
    }
});

async function provisionVM(config, resources, region) {
    const vmSpec = {
        vmSize: getVMSize(resources.cpu_cores, resources.memory_gb),
        imageReference: {
            publisher: 'Canonical',
            offer: 'UbuntuServer',
            sku: '20.04-LTS',
            version: 'latest'
        },
        region: region,
        storage: resources.storage_gb,
        tags: {
            ManagedBy: 'FTS.Money',
            Purpose: 'PSP-Instance'
        }
    };

    // Mock Azure VM creation
    // const response = await fetch(`https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.Compute/virtualMachines/${vmName}`, {
    //     method: 'PUT',
    //     headers: {
    //         'Authorization': `Bearer ${accessToken}`,
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ properties: vmSpec })
    // });

    return Response.json({
        success: true,
        provider: 'azure',
        operation: 'provision_compute',
        vm_id: `/subscriptions/xxx/resourceGroups/fts-psps/providers/Microsoft.Compute/virtualMachines/psp-vm-${Date.now()}`,
        vm_size: vmSpec.vmSize,
        region: region,
        public_ip: '20.123.45.67',
        private_ip: '10.1.0.42',
        status: 'running',
        estimated_monthly_cost: calculateAzureVMCost(resources),
        message: 'Azure VM provisioned (demo mode - integrate Azure SDK for production)'
    });
}

async function provisionAzureSQL(config, resources, region) {
    const dbSpec = {
        edition: 'GeneralPurpose',
        serviceObjective: getAzureSQLTier(resources.cpu_cores, resources.memory_gb),
        maxSizeBytes: resources.storage_gb * 1024 * 1024 * 1024,
        region: region
    };

    return Response.json({
        success: true,
        provider: 'azure',
        operation: 'provision_database',
        server_name: `psp-sql-${Date.now()}.database.windows.net`,
        database_name: 'psp_database',
        tier: dbSpec.serviceObjective,
        max_size_gb: resources.storage_gb,
        max_connections: resources.database_connections || 100,
        status: 'online',
        estimated_monthly_cost: calculateAzureSQLCost(resources),
        message: 'Azure SQL Database provisioned (demo mode - integrate Azure SDK for production)'
    });
}

async function scaleVM(config, resources, region) {
    return Response.json({
        success: true,
        provider: 'azure',
        operation: 'scale_compute',
        vm_id: resources.vm_id,
        previous_size: resources.current_vm_size,
        new_size: getVMSize(resources.target_cpu_cores, resources.target_memory_gb),
        downtime_seconds: 45,
        message: 'Azure VM scaled (demo mode - integrate Azure SDK for production)'
    });
}

async function terminateResources(config, resources, region) {
    return Response.json({
        success: true,
        provider: 'azure',
        operation: 'terminate_resources',
        terminated_vms: resources.vm_ids,
        message: 'Resources terminated (demo mode - integrate Azure SDK for production)'
    });
}

async function getAzureMonitorMetrics(config, resources, region) {
    return Response.json({
        success: true,
        provider: 'azure',
        operation: 'get_metrics',
        vm_id: resources.vm_id,
        metrics: {
            cpu_utilization: Math.random() * 100,
            memory_utilization: Math.random() * 100,
            network_in: Math.random() * 1000000,
            network_out: Math.random() * 1000000,
            disk_read_ops: Math.random() * 10000,
            disk_write_ops: Math.random() * 10000
        },
        timestamp: new Date().toISOString(),
        message: 'Metrics retrieved (demo mode - integrate Azure SDK for production)'
    });
}

function getVMSize(cpuCores, memoryGB) {
    // Map CPU/Memory to Azure VM sizes
    if (cpuCores <= 2 && memoryGB <= 8) return 'Standard_B2s';
    if (cpuCores <= 4 && memoryGB <= 16) return 'Standard_D4s_v3';
    if (cpuCores <= 8 && memoryGB <= 32) return 'Standard_D8s_v3';
    if (cpuCores <= 16 && memoryGB <= 64) return 'Standard_D16s_v3';
    return 'Standard_D32s_v3';
}

function getAzureSQLTier(cpuCores, memoryGB) {
    if (cpuCores <= 2 && memoryGB <= 8) return 'GP_Gen5_2';
    if (cpuCores <= 4 && memoryGB <= 16) return 'GP_Gen5_4';
    if (cpuCores <= 8 && memoryGB <= 32) return 'GP_Gen5_8';
    return 'GP_Gen5_16';
}

function calculateAzureVMCost(resources) {
    // Rough cost estimation for Azure VMs + Storage
    const computeCost = resources.cpu_cores * 35; // ~$35/core/month
    const storageCost = resources.storage_gb * 0.12; // ~$0.12/GB/month
    return Math.round(computeCost + storageCost);
}

function calculateAzureSQLCost(resources) {
    // Rough cost estimation for Azure SQL Database
    const dbCost = resources.cpu_cores * 55; // ~$55/core/month
    const storageCost = resources.storage_gb * 0.12; // ~$0.12/GB/month
    return Math.round(dbCost + storageCost);
}