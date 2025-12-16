import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, service_id, service_name, data, source_url } = await req.json();

        if (action === 'get') {
            // Get cached data
            const cached = await base44.asServiceRole.entities.ServiceCatalogCache.filter({ 
                service_id 
            });

            if (cached.length > 0) {
                const cache = cached[0];
                return Response.json({ 
                    success: true, 
                    cached: true,
                    data: cache.cached_data,
                    last_fetched: cache.last_fetched
                });
            }

            return Response.json({ 
                success: true, 
                cached: false 
            });
        }

        if (action === 'set') {
            // Calculate next check date (1 month from now)
            const nextCheckDate = new Date();
            nextCheckDate.setMonth(nextCheckDate.getMonth() + 1);

            // Create hash of data
            const dataHash = await crypto.subtle.digest(
                'SHA-256',
                new TextEncoder().encode(JSON.stringify(data))
            );
            const hashHex = Array.from(new Uint8Array(dataHash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            // Check if cache exists
            const existing = await base44.asServiceRole.entities.ServiceCatalogCache.filter({ 
                service_id 
            });

            if (existing.length > 0) {
                // Update existing cache
                await base44.asServiceRole.entities.ServiceCatalogCache.update(
                    existing[0].id,
                    {
                        cached_data: data,
                        source_url,
                        last_fetched: new Date().toISOString(),
                        next_check_date: nextCheckDate.toISOString().split('T')[0],
                        data_hash: hashHex
                    }
                );
            } else {
                // Create new cache
                await base44.asServiceRole.entities.ServiceCatalogCache.create({
                    service_id,
                    service_name,
                    cached_data: data,
                    source_url,
                    last_fetched: new Date().toISOString(),
                    next_check_date: nextCheckDate.toISOString().split('T')[0],
                    data_hash: hashHex
                });
            }

            return Response.json({ 
                success: true, 
                message: 'Cache updated' 
            });
        }

        if (action === 'check_updates') {
            // Check which services need updates
            const today = new Date().toISOString().split('T')[0];
            const cachesToUpdate = await base44.asServiceRole.entities.ServiceCatalogCache.filter({});
            
            const needsUpdate = cachesToUpdate.filter(cache => 
                cache.next_check_date && cache.next_check_date <= today
            );

            return Response.json({ 
                success: true, 
                count: needsUpdate.length,
                services: needsUpdate.map(c => ({ 
                    service_id: c.service_id, 
                    service_name: c.service_name,
                    source_url: c.source_url 
                }))
            });
        }

        return Response.json({ 
            success: false, 
            error: 'Invalid action' 
        }, { status: 400 });

    } catch (error) {
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});