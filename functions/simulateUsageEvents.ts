import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { psp_id, count = 100 } = await req.json();

        if (!psp_id) {
            return Response.json({ error: 'PSP ID required' }, { status: 400 });
        }

        // Get PSP details
        const psp = await base44.asServiceRole.entities.ProvisionedPSP.filter({ id: psp_id });
        if (!psp || psp.length === 0) {
            return Response.json({ error: 'PSP not found' }, { status: 404 });
        }

        const pspData = psp[0];

        // Get all meters for this PSP
        const meters = await base44.asServiceRole.entities.MerchantUsageMeter.filter({ 
            psp_id: psp_id,
            status: 'active'
        });

        if (meters.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'No active meters found for this PSP' 
            }, { status: 400 });
        }

        // Create random events
        const events = [];
        const metricTypes = ['transaction_count', 'api_calls', 'webhook_deliveries', 'storage_gb'];
        
        for (let i = 0; i < count; i++) {
            const randomMeter = meters[Math.floor(Math.random() * meters.length)];
            const metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)];
            
            const event = {
                event_id: `EVENT-${Date.now()}-${i}`,
                psp_id: psp_id,
                psp_code: pspData.psp_code,
                merchant_id: randomMeter.merchant_id,
                meter_id: randomMeter.id,
                metric_type: metricType,
                event_timestamp: new Date().toISOString(),
                count_increment: Math.floor(Math.random() * 10) + 1,
                volume_increment: metricType === 'transaction_count' ? Math.random() * 1000 : 0,
                processed: false
            };

            const createdEvent = await base44.asServiceRole.entities.UsageEvent.create(event);
            events.push(createdEvent);

            // Update meter
            await base44.asServiceRole.entities.MerchantUsageMeter.update(randomMeter.id, {
                current_count: randomMeter.current_count + event.count_increment,
                current_volume: randomMeter.current_volume + event.volume_increment,
                last_event_timestamp: event.event_timestamp
            });
        }

        return Response.json({ 
            success: true, 
            events_created: events.length,
            message: `Created ${events.length} usage events`
        });
    } catch (error) {
        console.error('Error simulating usage events:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});