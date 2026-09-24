import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const url = new URL(req.url);
        const apiKey = url.pathname.split('/').pop(); // Extract API key from URL
        
        // Parse API key and validate
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
        
        // Check monthly limit
        if (customer.current_month_usage >= customer.monthly_message_limit) {
            return Response.json({ 
                error: 'Monthly message limit exceeded',
                limit: customer.monthly_message_limit,
                used: customer.current_month_usage
            }, { status: 429 });
        }
        
        // Parse ISO 8583 message
        const contentType = req.headers.get('content-type');
        let iso8583Message;
        
        if (contentType?.includes('application/octet-stream')) {
            // Binary ISO 8583
            const buffer = await req.arrayBuffer();
            iso8583Message = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        } else {
            // Assume base64 encoded
            const body = await req.json();
            iso8583Message = body.message;
        }
        
        const requestId = crypto.randomUUID();
        const startTime = Date.now();
        
        // Find active connection for this customer
        const connections = await base44.asServiceRole.entities.ISOGatewayConnection.filter({
            customer_id: customerId,
            status: 'active',
            source_standard: 'ISO8583'
        });
        
        if (!connections || connections.length === 0) {
            return Response.json({ 
                error: 'No active connection configured for ISO 8583 input' 
            }, { status: 400 });
        }
        
        const connection = connections[0];
        
        // Create message log entry
        const messageLog = await base44.asServiceRole.entities.ISOMessageLog.create({
            message_id: requestId,
            connection_id: connection.connection_id,
            customer_id: customerId,
            direction: 'inbound',
            source_standard: 'ISO8583',
            target_standard: connection.target_standard,
            source_message: iso8583Message,
            status: 'pending',
            request_id: requestId,
            source_ip: req.headers.get('x-forwarded-for') || 'unknown'
        });
        
        // Queue for translation (async processing)
        // For now, we'll call translateAndRoute synchronously
        const translationResponse = await base44.functions.invoke('translateAndRoute', {
            message_log_id: messageLog.id,
            connection_id: connection.connection_id,
            customer_id: customerId
        });
        
        const processingTime = Date.now() - startTime;
        
        // Update usage metrics
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
        console.error('Error receiving ISO 8583:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error.message 
        }, { status: 500 });
    }
});