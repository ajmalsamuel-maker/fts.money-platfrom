import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GLEIF_API_BASE = 'https://api.gleif.org/api/v1';
const GRACE_PERIOD_DAYS = 90;

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, lei, entity_type, entity_id, company_name, jurisdiction } = await req.json();

        switch (action) {
            case 'verify_lei':
                return await verifyLEI(lei);
            
            case 'start_grace_period':
                return await startGracePeriod(base44, entity_type, entity_id);
            
            case 'check_grace_period':
                return await checkGracePeriod(base44, entity_type, entity_id);
            
            case 'search_lei':
                return await searchLEI(company_name);
            
            case 'get_lei_status':
                return await getLEIStatus(base44, entity_type, entity_id);
            
            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('GLEIF Integration Error:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to process LEI request'
        }, { status: 500 });
    }
});

async function verifyLEI(lei) {
    if (!lei || lei.length !== 20) {
        return Response.json({ 
            valid: false, 
            error: 'LEI must be exactly 20 characters' 
        });
    }

    try {
        // Call GLEIF API to verify LEI
        const response = await fetch(`${GLEIF_API_BASE}/lei-records/${lei}`, {
            headers: {
                'Accept': 'application/vnd.api+json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return Response.json({ 
                    valid: false, 
                    error: 'LEI not found in GLEIF registry',
                    suggestion: 'Apply for LEI or enter grace period'
                });
            }
            throw new Error(`GLEIF API error: ${response.status}`);
        }

        const data = await response.json();
        const leiData = data.data;
        
        // Check LEI status
        const registration = leiData.attributes.registration;
        const isActive = registration.status === 'ISSUED' && 
                        registration.managementStatus === 'ACTIVE';

        return Response.json({
            valid: isActive,
            lei: leiData.id,
            legal_name: leiData.attributes.entity.legalName.name,
            jurisdiction: leiData.attributes.entity.legalAddress.country,
            status: registration.status,
            registration_date: registration.initialRegistrationDate,
            last_updated: registration.lastUpdateDate,
            next_renewal: registration.nextRenewalDate,
            managing_lou: registration.managingLou
        });
    } catch (error) {
        console.error('LEI Verification Error:', error);
        return Response.json({ 
            valid: false, 
            error: 'Failed to verify LEI with GLEIF',
            details: error.message 
        });
    }
}

async function startGracePeriod(base44, entity_type, entity_id) {
    const now = new Date();
    const grace_period_end = new Date(now.getTime() + (GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000));

    const updateData = {
        lei_status: 'grace_period',
        grace_period_start: now.toISOString(),
        grace_period_end: grace_period_end.toISOString()
    };

    try {
        await base44.asServiceRole.entities[entity_type].update(entity_id, updateData);

        return Response.json({
            success: true,
            message: `Grace period started for ${entity_type}`,
            grace_period_days: GRACE_PERIOD_DAYS,
            grace_period_end: grace_period_end.toISOString(),
            action_required: 'Obtain LEI before grace period expires'
        });
    } catch (error) {
        throw new Error(`Failed to start grace period: ${error.message}`);
    }
}

async function checkGracePeriod(base44, entity_type, entity_id) {
    try {
        const entity = await base44.asServiceRole.entities[entity_type].list({
            filter: { id: entity_id }
        });

        if (!entity || entity.length === 0) {
            return Response.json({ error: 'Entity not found' }, { status: 404 });
        }

        const record = entity[0];
        const now = new Date();
        
        if (!record.grace_period_end) {
            return Response.json({
                in_grace_period: false,
                lei_status: record.lei_status || 'pending'
            });
        }

        const grace_end = new Date(record.grace_period_end);
        const days_remaining = Math.ceil((grace_end - now) / (1000 * 60 * 60 * 24));
        const expired = now > grace_end;

        return Response.json({
            in_grace_period: !expired && record.lei_status === 'grace_period',
            lei_status: record.lei_status,
            grace_period_start: record.grace_period_start,
            grace_period_end: record.grace_period_end,
            days_remaining: expired ? 0 : days_remaining,
            expired: expired,
            warning: days_remaining <= 30 ? 'Grace period expiring soon' : null
        });
    } catch (error) {
        throw new Error(`Failed to check grace period: ${error.message}`);
    }
}

async function searchLEI(company_name) {
    if (!company_name || company_name.length < 3) {
        return Response.json({ 
            results: [],
            error: 'Company name must be at least 3 characters' 
        });
    }

    try {
        const encodedName = encodeURIComponent(company_name);
        const response = await fetch(
            `${GLEIF_API_BASE}/lei-records?filter[entity.legalName]=${encodedName}&page[size]=10`,
            {
                headers: {
                    'Accept': 'application/vnd.api+json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`GLEIF API error: ${response.status}`);
        }

        const data = await response.json();
        
        const results = data.data.map(record => ({
            lei: record.id,
            legal_name: record.attributes.entity.legalName.name,
            jurisdiction: record.attributes.entity.legalAddress.country,
            status: record.attributes.registration.status,
            registration_date: record.attributes.registration.initialRegistrationDate
        }));

        return Response.json({
            results: results,
            count: results.length,
            query: company_name
        });
    } catch (error) {
        console.error('LEI Search Error:', error);
        return Response.json({ 
            results: [],
            error: 'Failed to search LEI registry',
            details: error.message 
        });
    }
}

async function getLEIStatus(base44, entity_type, entity_id) {
    try {
        const entity = await base44.asServiceRole.entities[entity_type].list({
            filter: { id: entity_id }
        });

        if (!entity || entity.length === 0) {
            return Response.json({ error: 'Entity not found' }, { status: 404 });
        }

        const record = entity[0];
        
        return Response.json({
            has_lei: !!record.lei,
            lei: record.lei || null,
            lei_status: record.lei_status || 'pending',
            lei_verified_date: record.lei_verified_date || null,
            in_grace_period: record.lei_status === 'grace_period',
            grace_period_end: record.grace_period_end || null,
            vlei_issued: !!record.vlei_credential,
            vlei_issued_date: record.vlei_issued_date || null
        });
    } catch (error) {
        throw new Error(`Failed to get LEI status: ${error.message}`);
    }
}