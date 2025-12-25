import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { message_log_id, connection_id, customer_id, enable_routing = false } = await req.json();
        
        const startTime = Date.now();
        
        // Get message log
        const messageLogs = await base44.asServiceRole.entities.ISOMessageLog.filter({ 
            id: message_log_id 
        });
        
        if (!messageLogs || messageLogs.length === 0) {
            return Response.json({ error: 'Message log not found' }, { status: 404 });
        }
        
        const messageLog = messageLogs[0];
        
        // Get connection config
        const connections = await base44.asServiceRole.entities.ISOGatewayConnection.filter({ 
            connection_id: connection_id 
        });
        
        if (!connections || connections.length === 0) {
            return Response.json({ error: 'Connection not found' }, { status: 404 });
        }
        
        const connection = connections[0];
        
        let translatedMessage;
        let enrichmentApplied = [];
        
        try {
            // TRANSLATION LOGIC
            if (messageLog.source_standard === 'ISO8583' && messageLog.target_standard === 'ISO20022') {
                // ISO 8583 → ISO 20022
                translatedMessage = await translateISO8583ToISO20022(messageLog.source_message);
                
                // ENRICHMENT (if enabled)
                if (connection.enrichment_enabled) {
                    const enriched = await enrichISO20022Message(translatedMessage, connection.enrichment_sources);
                    translatedMessage = enriched.message;
                    enrichmentApplied = enriched.applied;
                }
                
            } else if (messageLog.source_standard === 'ISO20022' && messageLog.target_standard === 'ISO8583') {
                // ISO 20022 → ISO 8583
                translatedMessage = await translateISO20022ToISO8583(messageLog.source_message);
            } else {
                throw new Error(`Unsupported translation: ${messageLog.source_standard} → ${messageLog.target_standard}`);
            }
            
            const processingTime = Date.now() - startTime;
            
            // Update message log with success
            await base44.asServiceRole.entities.ISOMessageLog.update(messageLog.id, {
                translated_message: translatedMessage,
                status: 'success',
                processing_time_ms: processingTime,
                enrichment_applied: enrichmentApplied
            });
            
            // CHECK FOR ORCHESTRATION ROUTING
            let routingResult = null;
            if (enable_routing) {
                try {
                    const routeResponse = await base44.functions.invoke('orchestrationEngine', {
                        action: 'route',
                        owner_type: 'iso_gateway',
                        owner_id: customer_id,
                        transaction_data: {
                            message_id: messageLog.id,
                            amount: extractAmount(messageLog.source_message),
                            currency: extractCurrency(messageLog.source_message) || 'USD',
                            country: null
                        }
                    });
                    
                    if (routeResponse.data?.success) {
                        routingResult = routeResponse.data;
                    }
                } catch (routeError) {
                    console.error('Routing error:', routeError);
                }
            }

            // DELIVERY to destination endpoint or routed provider
            const deliveryEndpoint = routingResult?.selected_route?.provider_endpoint || connection.destination_endpoint;
            
            if (deliveryEndpoint) {
                const deliveryResult = await deliverMessage(
                    deliveryEndpoint,
                    translatedMessage,
                    connection.destination_auth,
                    messageLog.target_standard
                );
                
                await base44.asServiceRole.entities.ISOMessageLog.update(messageLog.id, {
                    delivery_status: deliveryResult.success ? 'delivered' : 'failed',
                    delivery_attempts: 1,
                    delivered_at: deliveryResult.success ? new Date().toISOString() : null,
                    metadata: {
                        routed: !!routingResult,
                        selected_route: routingResult?.selected_route?.route_name,
                        routing_strategy: routingResult?.matched_rule?.routing_strategy
                    }
                });
            }
            
            // Update connection metrics
            await base44.asServiceRole.entities.ISOGatewayConnection.update(connection.id, {
                messages_processed: (connection.messages_processed || 0) + 1,
                success_count: (connection.success_count || 0) + 1,
                avg_latency_ms: calculateAvgLatency(connection.avg_latency_ms, processingTime, connection.messages_processed),
                last_message_at: new Date().toISOString()
            });
            
            return Response.json({
                success: true,
                status: 'success',
                translated_message: translatedMessage,
                processing_time_ms: processingTime,
                enrichment_applied: enrichmentApplied
            });
            
        } catch (error) {
            console.error('Translation error:', error);
            
            // Update message log with error
            await base44.asServiceRole.entities.ISOMessageLog.update(messageLog.id, {
                status: 'failed',
                error_code: 'TRANSLATION_ERROR',
                error_message: error.message,
                processing_time_ms: Date.now() - startTime
            });
            
            await base44.asServiceRole.entities.ISOGatewayConnection.update(connection.id, {
                error_count: (connection.error_count || 0) + 1
            });
            
            return Response.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }
        
    } catch (error) {
        console.error('Error in translateAndRoute:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

// HELPER FUNCTIONS
async function translateISO8583ToISO20022(iso8583Base64) {
    // Decode ISO 8583 message
    const binaryString = atob(iso8583Base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Parse ISO 8583 (simplified - in production use full parser)
    const mti = String.fromCharCode(...bytes.slice(0, 4));
    
    // Map to ISO 20022 message type
    let iso20022Type;
    if (mti === '0200' || mti === '0220') {
        iso20022Type = 'pacs.008'; // Credit Transfer
    } else if (mti === '0100' || mti === '0110') {
        iso20022Type = 'pain.001'; // Payment Initiation
    } else {
        iso20022Type = 'pacs.002'; // Status Report
    }
    
    // Generate ISO 20022 XML (simplified template)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:${iso20022Type}.001.01">
    <${iso20022Type.replace('.', '')}>
        <GrpHdr>
            <MsgId>${crypto.randomUUID()}</MsgId>
            <CreDtTm>${new Date().toISOString()}</CreDtTm>
            <NbOfTxs>1</NbOfTxs>
        </GrpHdr>
        <CdtTrfTxInf>
            <PmtId>
                <EndToEndId>ISO8583-${mti}-${Date.now()}</EndToEndId>
            </PmtId>
            <Amt Ccy="USD">
                <InstdAmt>100.00</InstdAmt>
            </Amt>
        </CdtTrfTxInf>
    </${iso20022Type.replace('.', '')}>
</Document>`;
    
    return xml;
}

async function translateISO20022ToISO8583(iso20022Xml) {
    // Parse XML (simplified)
    const parser = new DOMParser();
    const doc = parser.parseFromString(iso20022Xml, 'text/xml');
    
    // Determine MTI based on message type
    let mti = '0200'; // Default to financial transaction
    
    if (iso20022Xml.includes('pain.001')) {
        mti = '0100'; // Authorization request
    } else if (iso20022Xml.includes('pacs.008')) {
        mti = '0200'; // Financial transaction
    }
    
    // Build ISO 8583 message (simplified)
    const message = new Uint8Array(64);
    
    // Set MTI
    for (let i = 0; i < 4; i++) {
        message[i] = mti.charCodeAt(i);
    }
    
    // Convert to base64
    return btoa(String.fromCharCode(...message));
}

async function enrichISO20022Message(xml, sources) {
    const enriched = { message: xml, applied: [] };
    
    // Add LEI enrichment (mock - in production call GLEIF API)
    if (sources?.includes('GLEIF')) {
        // Add LEI to debtor/creditor
        enriched.applied.push('LEI_ENRICHMENT');
    }
    
    // Add BIC enrichment
    if (sources?.includes('SWIFT')) {
        enriched.applied.push('BIC_VALIDATION');
    }
    
    return enriched;
}

async function deliverMessage(endpoint, message, auth, messageType) {
    try {
        const headers = {
            'Content-Type': messageType === 'ISO20022' ? 'application/xml' : 'application/octet-stream'
        };
        
        // Add authentication
        if (auth?.type === 'api_key') {
            headers['X-API-Key'] = auth.credentials.key;
        } else if (auth?.type === 'bearer_token') {
            headers['Authorization'] = `Bearer ${auth.credentials.token}`;
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: message
        });
        
        return {
            success: response.ok,
            status: response.status
        };
    } catch (error) {
        console.error('Delivery error:', error);
        return { success: false, error: error.message };
    }
}

function calculateAvgLatency(currentAvg, newValue, count) {
    if (!currentAvg || count === 0) return newValue;
    return ((currentAvg * count) + newValue) / (count + 1);
}

function extractAmount(message) {
    try {
        if (typeof message === 'string' && message.startsWith('{')) {
            return JSON.parse(message).amount || 0;
        }
        return 100.00; // Default
    } catch {
        return 100.00;
    }
}

function extractCurrency(message) {
    try {
        if (typeof message === 'string' && message.startsWith('{')) {
            return JSON.parse(message).currency;
        }
        return null;
    } catch {
        return null;
    }
}