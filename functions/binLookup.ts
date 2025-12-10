import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, bin, bulk_import } = await req.json();

        // Single BIN lookup
        if (action === 'lookup' && bin) {
            try {
                // Check if BIN exists in database
                const existingBins = await base44.asServiceRole.entities.BIN.filter({ bin });
                if (existingBins.length > 0) {
                    return Response.json({ 
                        success: true, 
                        source: 'database',
                        data: existingBins[0] 
                    });
                }

                // Fetch from binlist.net API
                const response = await fetch(`https://lookup.binlist.net/${bin}`);
                
                if (!response.ok) {
                    return Response.json({ 
                        success: false, 
                        error: 'BIN not found' 
                    }, { status: 404 });
                }

                const data = await response.json();

                console.log('BINList API response for', bin, ':', JSON.stringify(data));

                // Store in database
                const binData = {
                    bin: bin,
                    scheme: data.scheme || null,
                    type: data.type || null,
                    brand: data.brand || null,
                    prepaid: data.prepaid || false,
                    country: data.country?.alpha2 || null,
                    country_name: data.country?.name || null,
                    bank_name: data.bank?.name || null,
                    bank_url: data.bank?.url || null,
                    bank_phone: data.bank?.phone || null,
                    bank_city: data.bank?.city || null,
                    status: 'active',
                    metadata: data
                };

                console.log('Storing BIN data:', JSON.stringify(binData));

                const created = await base44.asServiceRole.entities.BIN.create(binData);

                return Response.json({ 
                    success: true, 
                    source: 'api',
                    data: created 
                });

            } catch (error) {
                return Response.json({ 
                    success: false, 
                    error: error.message 
                }, { status: 500 });
            }
        }

        // Bulk import common BINs
        if (action === 'bulk_import') {
            const commonBins = [
                '400000', '411111', '424242', '431111', '444433', '450000',
                '510000', '511111', '515555', '520000', '521111', '530000',
                '340000', '341111', '343434', '371111', '378282', '378734',
                '601100', '622126', '622127', '622128', '601111', '636220',
                '352800', '353000', '354000', '356600', '357266', '358000',
                '300000', '301111', '305555', '360000', '361111', '364000'
            ];

            const results = {
                success: 0,
                failed: 0,
                errors: []
            };

            for (const bin of commonBins) {
                try {
                    // Check if already exists
                    const existing = await base44.asServiceRole.entities.BIN.filter({ bin });
                    if (existing.length > 0) {
                        results.success++;
                        continue;
                    }

                    const response = await fetch(`https://lookup.binlist.net/${bin}`);
                    
                    if (!response.ok) {
                        results.failed++;
                        results.errors.push(`BIN ${bin}: Not found`);
                        continue;
                    }

                    const data = await response.json();

                    await base44.asServiceRole.entities.BIN.create({
                        bin: bin,
                        scheme: data.scheme || null,
                        type: data.type || null,
                        brand: data.brand || null,
                        prepaid: data.prepaid || false,
                        country: data.country?.alpha2 || null,
                        country_name: data.country?.name || null,
                        bank_name: data.bank?.name || null,
                        bank_url: data.bank?.url || null,
                        bank_phone: data.bank?.phone || null,
                        bank_city: data.bank?.city || null,
                        status: 'active',
                        metadata: data
                    });

                    results.success++;

                    // Rate limiting - wait 100ms between requests
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (error) {
                    results.failed++;
                    results.errors.push(`BIN ${bin}: ${error.message}`);
                }
            }

            return Response.json({ 
                success: true, 
                results 
            });
        }

        // List all BINs
        if (action === 'list') {
            try {
                const bins = await base44.asServiceRole.entities.BIN.list('-created_date', 100);
                return Response.json({ 
                    success: true, 
                    data: bins 
                });
            } catch (error) {
                console.error('Error listing BINs:', error);
                return Response.json({ 
                    success: false, 
                    error: error.message,
                    data: []
                });
            }
        }

        // Update BIN routing
        if (action === 'update_routing') {
            const { bin_id, routing_priority, preferred_processor, status } = await req.json();
            
            const updated = await base44.asServiceRole.entities.BIN.update(bin_id, {
                routing_priority,
                preferred_processor,
                status
            });

            return Response.json({ 
                success: true, 
                data: updated 
            });
        }

        return Response.json({ 
            error: 'Invalid action' 
        }, { status: 400 });

    } catch (error) {
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});