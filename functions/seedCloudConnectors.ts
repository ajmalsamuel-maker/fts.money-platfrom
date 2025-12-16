import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const connectors = [
            {
                connector_id: 'AWS',
                provider_name: 'aws',
                display_name: 'Amazon Web Services (AWS)',
                provider_type: 'global',
                region: 'Global',
                supported_regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'],
                connector_function: 'infrastructure/awsConnector',
                required_secrets: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
                supported_operations: ['provision_compute', 'provision_database', 'scale_compute', 'terminate_resources', 'get_metrics'],
                status: 'active',
                priority: 10
            },
            {
                connector_id: 'AZURE',
                provider_name: 'azure',
                display_name: 'Microsoft Azure',
                provider_type: 'global',
                region: 'Global',
                supported_regions: ['eastus', 'westus', 'westeurope', 'southeastasia', 'australiaeast'],
                connector_function: 'infrastructure/azureConnector',
                required_secrets: ['AZURE_SUBSCRIPTION_ID', 'AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET'],
                supported_operations: ['provision_compute', 'provision_database', 'scale_compute', 'terminate_resources', 'get_metrics'],
                status: 'active',
                priority: 20
            },
            {
                connector_id: 'GCP',
                provider_name: 'gcp',
                display_name: 'Google Cloud Platform',
                provider_type: 'global',
                region: 'Global',
                supported_regions: ['us-central1', 'us-east1', 'europe-west1', 'asia-southeast1'],
                connector_function: 'infrastructure/gcpConnector',
                required_secrets: ['GCP_PROJECT_ID', 'GCP_SERVICE_ACCOUNT_KEY'],
                supported_operations: ['provision_compute', 'provision_database', 'scale_compute', 'terminate_resources', 'get_metrics'],
                status: 'active',
                priority: 30
            },
            {
                connector_id: 'ALIBABA',
                provider_name: 'alibaba_cloud',
                display_name: 'Alibaba Cloud',
                provider_type: 'regional',
                region: 'China',
                supported_regions: ['cn-hangzhou', 'cn-beijing', 'cn-shanghai', 'cn-shenzhen'],
                connector_function: 'infrastructure/alibabaConnector',
                required_secrets: ['ALIBABA_CLOUD_ACCESS_KEY', 'ALIBABA_CLOUD_SECRET_KEY'],
                supported_operations: ['provision_compute', 'provision_database'],
                status: 'active',
                priority: 40
            },
            {
                connector_id: 'TENCENT',
                provider_name: 'tencent_cloud',
                display_name: 'Tencent Cloud (腾讯云)',
                provider_type: 'regional',
                region: 'China',
                supported_regions: ['ap-guangzhou', 'ap-beijing', 'ap-shanghai'],
                connector_function: 'infrastructure/localProviderConnector',
                required_secrets: ['TENCENT_CLOUD_SECRET_ID', 'TENCENT_CLOUD_SECRET_KEY'],
                supported_operations: ['provision_compute'],
                status: 'active',
                priority: 50
            },
            {
                connector_id: 'HUAWEI',
                provider_name: 'huawei_cloud',
                display_name: 'Huawei Cloud (华为云)',
                provider_type: 'regional',
                region: 'China',
                supported_regions: ['cn-north-1', 'cn-east-2', 'cn-south-1'],
                connector_function: 'infrastructure/localProviderConnector',
                required_secrets: ['HUAWEI_CLOUD_ACCESS_KEY', 'HUAWEI_CLOUD_SECRET_KEY'],
                supported_operations: ['provision_compute'],
                status: 'active',
                priority: 60
            },
            {
                connector_id: 'DIGITALOCEAN',
                provider_name: 'digitalocean',
                display_name: 'DigitalOcean',
                provider_type: 'global',
                region: 'Global',
                supported_regions: ['nyc3', 'sfo3', 'ams3', 'sgp1', 'lon1'],
                connector_function: 'infrastructure/digitaloceanConnector',
                required_secrets: ['DIGITALOCEAN_API_TOKEN'],
                supported_operations: ['provision_compute', 'provision_database'],
                status: 'active',
                priority: 70
            },
            {
                connector_id: 'ORACLE',
                provider_name: 'oracle_cloud',
                display_name: 'Oracle Cloud Infrastructure',
                provider_type: 'global',
                region: 'Global',
                supported_regions: ['us-ashburn-1', 'us-phoenix-1', 'eu-frankfurt-1', 'ap-tokyo-1'],
                connector_function: 'infrastructure/oracleConnector',
                required_secrets: ['OCI_USER_ID', 'OCI_TENANCY_ID', 'OCI_PRIVATE_KEY'],
                supported_operations: ['provision_compute'],
                status: 'active',
                priority: 80
            },
            {
                connector_id: 'PTCL',
                provider_name: 'ptcl',
                display_name: 'PTCL Cloud (Pakistan)',
                provider_type: 'local',
                region: 'Pakistan',
                supported_regions: ['ISB-DC1'],
                connector_function: 'infrastructure/localProviderConnector',
                required_secrets: ['PTCL_API_KEY'],
                supported_operations: ['provision_compute', 'get_metrics'],
                status: 'active',
                priority: 90
            },
            {
                connector_id: 'ALIPAY',
                provider_name: 'alipay_cloud',
                display_name: 'Alipay Cloud',
                provider_type: 'regional',
                region: 'China',
                supported_regions: ['cn-hangzhou'],
                connector_function: 'infrastructure/localProviderConnector',
                required_secrets: ['ALIPAY_CLOUD_ACCESS_KEY', 'ALIPAY_CLOUD_SECRET_KEY'],
                supported_operations: ['provision_compute', 'provision_database'],
                status: 'active',
                priority: 100
            },
            {
                connector_id: 'NTC',
                provider_name: 'ntc',
                display_name: 'National Telecommunication Corporation (Nepal)',
                provider_type: 'local',
                region: 'Nepal',
                supported_regions: ['KTM-DC1', 'PKR-DC1'],
                connector_function: 'infrastructure/localProviderConnector',
                required_secrets: ['NTC_API_KEY', 'NTC_API_SECRET'],
                supported_operations: ['provision_compute', 'get_metrics'],
                status: 'active',
                priority: 110
            }
        ];

        // Check existing connectors
        const existing = await base44.asServiceRole.entities.CloudConnector.list();
        
        if (existing.length > 0) {
            return Response.json({
                success: false,
                message: 'Cloud connectors already seeded',
                count: existing.length
            });
        }

        // Bulk create
        await base44.asServiceRole.entities.CloudConnector.bulkCreate(connectors);

        return Response.json({
            success: true,
            message: 'Cloud connectors seeded successfully',
            count: connectors.length
        });

    } catch (error) {
        console.error('Seed error:', error);
        return Response.json({ 
            error: 'Failed to seed connectors', 
            details: error.message 
        }, { status: 500 });
    }
});