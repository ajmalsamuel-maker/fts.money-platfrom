import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const url = new URL(req.url);
        const apiKey = url.pathname.split('/').pop();
        
        // Validate API key
        const keys = await base44.asServiceRole.entities.ISOGatewayAPIKey.filter({ 
            api_key: apiKey,
            status: 'active'
        });
        
        if (!keys || keys.length === 0) {
            return Response.json({ error: 'Invalid API key' }, { status: 401 });
        }
        
        const keyRecord = keys[0];
        const customerId = keyRecord.customer_id;
        
        // Get customer and check limits
        const customers = await base44.asServiceRole.entities.ISOGatewayCustomer.filter({ 
            customer_id: customerId,
            status: 'active'
        });
        
        if (!customers || customers.length === 0) {
            return Response.json({ error: 'Customer not active' }, { status: 403 });
        }
        
        const customer = customers[0];
        
        if (customer.current_month_usage >= customer.monthly_message_limit) {
            return Response.json({ 
                error: 'Monthly message limit exceeded',
                limit: customer.monthly_message_limit,
                used: customer.current_month_usage
            }, { status: 429 });
        }
        
        // Parse ISO 20022 XML message
        const body = await req.text();
        const iso20022Message = body;
        
        const requestId = crypto.randomUUID();
        const startTime = Date.now();
        
        // Find active connection
        const connections = await base44.asServiceRole.entities.ISOGatewayConnection.filter({
            customer_id: customerId,
            status: 'active',
            source_standard: 'ISO20022'
        });
        
        if (!connections || connections.length === 0) {
            return Response.json({ 
                error: 'No active connection configured for ISO 20022 input' 
            }, { status: 400 });
        }
        
        const connection = connections[0];
        
        // Create message log
        const messageLog = await base44.asServiceRole.entities.ISOMessageLog.create({
            message_id: requestId,
            connection_id: connection.connection_id,
            customer_id: customerId,
            direction: 'inbound',
            source_standard: 'ISO20022',
            target_standard: connection.target_standard,
            source_message: iso20022Message,
            status: 'pending',
            request_id: requestId,
            source_ip: req.headers.get('x-forwarded-for') || 'unknown'
        });
        
        // Process translation
        const translationResponse = await base44.functions.invoke('translateAndRoute', {
            message_log_id: messageLog.id,
            connection_id: connection.connection_id,
            customer_id: customerId
        });
        
        const processingTime = Date.now() - startTime;
        
        // Update metrics
        await base44.asServiceRole.entities.ISOGatewayCustomer.update(customer.id, {
            current_month_usage: customer.current_month_usage + 1,
            total_messages_processed: (customer.total_messages_processed || 0) + 1
        });
        
        await base44.asServiceRole.entities.ISOGatewayAPIKey.update(keyRecord.id, {
            last_used_at: new Date().toISOString(),
            usage_count: (keyRecord.usage_count || 0) + 1
        });
        
        return Response.json({
            success: true,
            message_id: requestId,
            status: translationResponse.data?.status || 'processed',
            processing_time_ms: processingTime,
            translated_message: translationResponse.data?.translated_message
        });
        
    } catch (error) {
        console.error('Error receiving ISO 20022:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error.message 
        }, { status: 500 });
    }
});