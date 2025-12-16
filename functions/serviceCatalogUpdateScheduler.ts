import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Check which services need updates
        const checkResponse = await base44.asServiceRole.functions.invoke('serviceCatalogCache', {
            action: 'check_updates'
        });

        if (!checkResponse.data.success) {
            return Response.json({ 
                success: false, 
                error: 'Failed to check for updates' 
            }, { status: 500 });
        }

        const servicesToUpdate = checkResponse.data.services || [];
        const updateResults = [];

        // Fetch fresh data for services that need updates
        for (const service of servicesToUpdate) {
            try {
                // Fetch from source URL
                if (service.source_url) {
                    const response = await fetch(service.source_url);
                    const freshData = await response.json();

                    // Update cache
                    await base44.asServiceRole.functions.invoke('serviceCatalogCache', {
                        action: 'set',
                        service_id: service.service_id,
                        service_name: service.service_name,
                        data: freshData,
                        source_url: service.source_url
                    });

                    updateResults.push({
                        service_id: service.service_id,
                        status: 'updated'
                    });
                }
            } catch (error) {
                updateResults.push({
                    service_id: service.service_id,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return Response.json({ 
            success: true,
            checked: servicesToUpdate.length,
            updated: updateResults.filter(r => r.status === 'updated').length,
            failed: updateResults.filter(r => r.status === 'failed').length,
            results: updateResults
        });

    } catch (error) {
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});