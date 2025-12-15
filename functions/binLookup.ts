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

        // Bulk import common BINs from major global issuers
        if (action === 'bulk_import') {
            const commonBins = [
                // US - Chase (Visa)
                '414720', '414709', '476173', '476142', '476197',
                // US - Bank of America (Visa)
                '432652', '485932', '485933', '485934', '485935',
                // US - Wells Fargo (Visa)
                '471617', '471618', '471619', '471620', '471621',
                // US - Citi (Visa)
                '438857', '476198', '476199', '438856', '438855',
                // US - Capital One (Visa)
                '414709', '491062', '491063', '491064', '491065',
                // US - Discover
                '601100', '601109', '601177', '601178', '601186',
                // US - American Express
                '340000', '341111', '343434', '371111', '378282', '378734',
                // UK - HSBC (Visa)
                '454617', '454618', '454619', '454620', '454621',
                // UK - Barclays (Visa)
                '462553', '462554', '462555', '462556', '462557',
                // UK - Lloyds (Visa)
                '445932', '445933', '445934', '445935', '445936',
                // UK - NatWest (Mastercard)
                '513213', '513214', '513215', '513216', '513217',
                // Germany - Deutsche Bank (Visa)
                '453211', '453212', '453213', '453214', '453215',
                // Germany - Commerzbank (Mastercard)
                '522332', '522333', '522334', '522335', '522336',
                // France - BNP Paribas (Visa)
                '497010', '497011', '497012', '497013', '497014',
                // France - Société Générale (Mastercard)
                '537892', '537893', '537894', '537895', '537896',
                // Spain - Santander (Visa)
                '454616', '454617', '454618', '454619', '454620',
                // Netherlands - ING (Mastercard)
                '520324', '520325', '520326', '520327', '520328',
                // China - ICBC (UnionPay)
                '622200', '622202', '622203', '622208', '622226',
                // China - Bank of China (UnionPay)
                '621661', '621662', '621663', '621667', '621668',
                // China - China Construction Bank (UnionPay)
                '436742', '436745', '622280', '622281', '622282',
                // Japan - MUFG (JCB)
                '352800', '352801', '352802', '352803', '352804',
                // Japan - Sumitomo (JCB)
                '356600', '356601', '356602', '356603', '356604',
                // Singapore - DBS (Visa)
                '453982', '453983', '453984', '453985', '453986',
                // Singapore - OCBC (Mastercard)
                '531308', '531309', '531310', '531311', '531312',
                // Hong Kong - HSBC (Visa)
                '491032', '491033', '491034', '491035', '491036',
                // Australia - Commonwealth Bank (Mastercard)
                '512665', '512666', '512667', '512668', '512669',
                // Australia - NAB (Visa)
                '456789', '456790', '456791', '456792', '456793',
                // Canada - RBC (Visa)
                '450875', '450876', '450877', '450878', '450879',
                // Canada - TD Bank (Mastercard)
                '547951', '547952', '547953', '547954', '547955',
                // Fintech - Revolut (Mastercard)
                '533844', '533845', '533846', '533847', '533848',
                // Fintech - N26 (Mastercard)
                '531075', '531076', '531077', '531078', '531079',
                // Fintech - Monzo (Mastercard)
                '531988', '531989', '531990', '531991', '531992',
                // Fintech - Wise (Mastercard)
                '516795', '516796', '516797', '516798', '516799',
                // Global Test Cards
                '400000', '411111', '424242', '520000', '530000'
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

        // Manually create BIN
        if (action === 'create') {
            const { binData } = await req.json();
            
            // Check if BIN already exists
            const existing = await base44.asServiceRole.entities.BIN.filter({ bin: binData.bin });
            if (existing.length > 0) {
                return Response.json({ 
                    success: false, 
                    error: 'BIN already exists' 
                }, { status: 400 });
            }

            const created = await base44.asServiceRole.entities.BIN.create({
                ...binData,
                status: binData.status || 'active'
            });

            return Response.json({ 
                success: true, 
                data: created 
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