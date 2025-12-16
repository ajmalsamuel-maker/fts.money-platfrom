import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { operation, config, resources } = await req.json();

        // AWS credentials should be set in secrets: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
        const AWS_ACCESS_KEY = Deno.env.get('AWS_ACCESS_KEY_ID');
        const AWS_SECRET_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
        const AWS_REGION = config?.region || Deno.env.get('AWS_REGION') || 'us-east-1';

        if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY) {
            return Response.json({ 
                error: 'AWS credentials not configured',
                message: 'Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY secrets'
            }, { status: 400 });
        }

        // Route to specific AWS operations
        switch (operation) {
            case 'provision_compute':
                return await provisionEC2(AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, resources);
            case 'provision_database':
                return await provisionRDS(AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, resources);
            case 'scale_compute':
                return await scaleEC2(AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, resources);
            case 'terminate_resources':
                return await terminateResources(AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, resources);
            case 'get_metrics':
                return await getCloudWatchMetrics(AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, resources);
            default:
                return Response.json({ error: 'Unknown operation' }, { status: 400 });
        }

    } catch (error) {
        console.error('AWS connector error:', error);
        return Response.json({ 
            error: 'AWS operation failed', 
            details: error.message 
        }, { status: 500 });
    }
});

async function provisionEC2(accessKey, secretKey, region, resources) {
    // This would use AWS SDK to provision EC2 instances
    // For now, returning mock response showing the pattern
    
    const instanceSpec = {
        instanceType: getInstanceType(resources.cpu_cores, resources.memory_gb),
        ami: 'ami-0c55b159cbfafe1f0', // Ubuntu 20.04 LTS
        region: region,
        storage: resources.storage_gb,
        tags: {
            ManagedBy: 'FTS.Money',
            Purpose: 'PSP-Instance'
        }
    };

    // Mock AWS EC2 API call
    // const response = await fetch(`https://ec2.${region}.amazonaws.com/`, {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': generateAWSSignature(accessKey, secretKey, region),
    //         'Content-Type': 'application/x-amz-json-1.1'
    //     },
    //     body: JSON.stringify({
    //         Action: 'RunInstances',
    //         ImageId: instanceSpec.ami,
    //         InstanceType: instanceSpec.instanceType,
    //         MinCount: 1,
    //         MaxCount: 1
    //     })
    // });

    return Response.json({
        success: true,
        provider: 'aws',
        operation: 'provision_compute',
        instance_id: `i-${Date.now()}`,
        instance_type: instanceSpec.instanceType,
        region: region,
        public_ip: '52.123.45.67',
        private_ip: '10.0.1.42',
        status: 'running',
        estimated_monthly_cost: calculateAWSCost(resources),
        message: 'EC2 instance provisioned (demo mode - integrate AWS SDK for production)'
    });
}

async function provisionRDS(accessKey, secretKey, region, resources) {
    const dbSpec = {
        engine: 'postgres',
        engineVersion: '14.7',
        instanceClass: getDBInstanceClass(resources.cpu_cores, resources.memory_gb),
        allocatedStorage: resources.storage_gb,
        region: region
    };

    return Response.json({
        success: true,
        provider: 'aws',
        operation: 'provision_database',
        db_instance_id: `db-${Date.now()}`,
        db_class: dbSpec.instanceClass,
        engine: dbSpec.engine,
        endpoint: `psp-db.${Date.now()}.${region}.rds.amazonaws.com`,
        port: 5432,
        max_connections: resources.database_connections || 100,
        status: 'available',
        estimated_monthly_cost: calculateRDSCost(resources),
        message: 'RDS database provisioned (demo mode - integrate AWS SDK for production)'
    });
}

async function scaleEC2(accessKey, secretKey, region, resources) {
    return Response.json({
        success: true,
        provider: 'aws',
        operation: 'scale_compute',
        instance_id: resources.instance_id,
        previous_type: resources.current_instance_type,
        new_type: getInstanceType(resources.target_cpu_cores, resources.target_memory_gb),
        downtime_seconds: 30,
        message: 'EC2 instance scaled (demo mode - integrate AWS SDK for production)'
    });
}

async function terminateResources(accessKey, secretKey, region, resources) {
    return Response.json({
        success: true,
        provider: 'aws',
        operation: 'terminate_resources',
        terminated_instances: resources.instance_ids,
        message: 'Resources terminated (demo mode - integrate AWS SDK for production)'
    });
}

async function getCloudWatchMetrics(accessKey, secretKey, region, resources) {
    return Response.json({
        success: true,
        provider: 'aws',
        operation: 'get_metrics',
        instance_id: resources.instance_id,
        metrics: {
            cpu_utilization: Math.random() * 100,
            memory_utilization: Math.random() * 100,
            network_in: Math.random() * 1000000,
            network_out: Math.random() * 1000000,
            disk_read_ops: Math.random() * 10000,
            disk_write_ops: Math.random() * 10000
        },
        timestamp: new Date().toISOString(),
        message: 'Metrics retrieved (demo mode - integrate AWS SDK for production)'
    });
}

function getInstanceType(cpuCores, memoryGB) {
    // Map CPU/Memory to AWS instance types
    if (cpuCores <= 2 && memoryGB <= 8) return 't3.medium';
    if (cpuCores <= 4 && memoryGB <= 16) return 't3.xlarge';
    if (cpuCores <= 8 && memoryGB <= 32) return 'm5.2xlarge';
    if (cpuCores <= 16 && memoryGB <= 64) return 'm5.4xlarge';
    return 'm5.8xlarge';
}

function getDBInstanceClass(cpuCores, memoryGB) {
    if (cpuCores <= 2 && memoryGB <= 8) return 'db.t3.medium';
    if (cpuCores <= 4 && memoryGB <= 16) return 'db.r5.xlarge';
    if (cpuCores <= 8 && memoryGB <= 32) return 'db.r5.2xlarge';
    return 'db.r5.4xlarge';
}

function calculateAWSCost(resources) {
    // Rough cost estimation for AWS EC2 + EBS storage
    const computeCost = resources.cpu_cores * 30; // ~$30/core/month
    const storageCost = resources.storage_gb * 0.1; // ~$0.10/GB/month
    return Math.round(computeCost + storageCost);
}

function calculateRDSCost(resources) {
    // Rough cost estimation for AWS RDS
    const dbCost = resources.cpu_cores * 50; // ~$50/core/month for RDS
    const storageCost = resources.storage_gb * 0.115; // ~$0.115/GB/month
    return Math.round(dbCost + storageCost);
}