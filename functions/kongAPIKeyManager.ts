import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const KONG_ADMIN_URL = 'http://188.166.207.82:8001';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Only platform admins can manage Kong API keys
        if (!user || user.role !== 'platform_admin') {
            return Response.json({ error: 'Unauthorized - Platform admin required' }, { status: 403 });
        }

        const { action, service_type, customer_id, customer_code, consumer_id } = await req.json();

        switch (action) {
            case 'create':
                return await createAPIKey(service_type, customer_id, customer_code);
            
            case 'list_all':
                return await listAllAPIKeys();
            
            case 'delete':
                return await deleteAPIKey(consumer_id);
            
            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('Kong API Key Manager Error:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});

async function createAPIKey(serviceType, customerId, customerCode) {
    // Step 1: Get customer details for proper naming
    const consumerUsername = `${serviceType}_${customerCode}_${Date.now()}`;
    
    // Step 2: Create Kong consumer with metadata
    const consumerResponse = await fetch(`${KONG_ADMIN_URL}/consumers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: consumerUsername,
            custom_id: customerId,
            tags: [
                `service:${serviceType}`,
                `customer:${customerCode}`,
                `tenant:${customerCode}` // For multi-tenant isolation
            ]
        })
    });

    if (!consumerResponse.ok) {
        const error = await consumerResponse.text();
        throw new Error(`Failed to create Kong consumer: ${error}`);
    }

    const consumer = await consumerResponse.json();

    // Step 3: Generate API key for consumer
    const keyResponse = await fetch(`${KONG_ADMIN_URL}/consumers/${consumer.id}/key-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!keyResponse.ok) {
        // Cleanup consumer if key creation fails
        await fetch(`${KONG_ADMIN_URL}/consumers/${consumer.id}`, { method: 'DELETE' });
        throw new Error('Failed to generate API key');
    }

    const keyData = await keyResponse.json();

    // Step 4: Apply consumer to appropriate Kong service(s)
    const serviceMap = {
        'iso_gateway': 'iso-gateway-service',
        'orchestration': 'orchestration-service',
        'crypto_banking': 'crypto-banking-service',
        'rwa_platform': 'rwa-platform-service',
        'psp': 'psp-service'
    };

    const kongService = serviceMap[serviceType];
    
    // Optional: Add consumer to ACL for service-level isolation
    await fetch(`${KONG_ADMIN_URL}/consumers/${consumer.id}/acls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            group: `${serviceType}_customers`
        })
    });

    return Response.json({
        success: true,
        consumer_id: consumer.id,
        api_key: keyData.key,
        customer_code: customerCode,
        service_type: serviceType,
        created_at: consumer.created_at
    });
}

async function listAllAPIKeys() {
    // Fetch all consumers from Kong
    const response = await fetch(`${KONG_ADMIN_URL}/consumers`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch consumers from Kong');
    }

    const { data: consumers } = await response.json();

    // For each consumer, get their API key
    const keys = await Promise.all(
        consumers.map(async (consumer) => {
            try {
                const keyResponse = await fetch(`${KONG_ADMIN_URL}/consumers/${consumer.id}/key-auth`);
                const keyData = await keyResponse.json();
                
                // Parse metadata from tags
                const serviceTag = consumer.tags?.find(t => t.startsWith('service:'));
                const customerTag = consumer.tags?.find(t => t.startsWith('customer:'));
                
                return {
                    id: consumer.id,
                    consumer_id: consumer.id,
                    customer_code: customerTag?.replace('customer:', '') || 'unknown',
                    customer_name: consumer.username,
                    service_type: serviceTag?.replace('service:', '') || 'unknown',
                    api_key: keyData.data?.[0]?.key || 'N/A',
                    created_at: consumer.created_at
                };
            } catch (error) {
                console.error(`Error fetching key for consumer ${consumer.id}:`, error);
                return null;
            }
        })
    );

    return Response.json({
        success: true,
        keys: keys.filter(k => k !== null)
    });
}

async function deleteAPIKey(consumerId) {
    const response = await fetch(`${KONG_ADMIN_URL}/consumers/${consumerId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error('Failed to delete consumer from Kong');
    }

    return Response.json({
        success: true,
        message: 'API key deleted successfully'
    });
}