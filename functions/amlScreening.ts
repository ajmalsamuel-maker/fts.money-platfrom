import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { ConnectorFactory } from './connectors/index.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            name, 
            entity_type = 'Company',
            country = [],
            birth_incorporation_date = null,
            ongoing_monitoring = true,
            merchant_id,
            client_reference = null
        } = await req.json();

        if (!name) {
            return Response.json({ 
                error: 'Missing required field: name' 
            }, { status: 400 });
        }

        // Get AML connector (handles authentication, retry, circuit breaker)
        const amlConnector = ConnectorFactory.getAMLConnector();

        // Perform AML screening using connector
        const searchData = await amlConnector.screenEntity({
            entity_type: entity_type,
            name: name,
            country: country,
            date_of_birth: birth_incorporation_date,
            additional_info: {
                ongoing_monitoring: ongoing_monitoring,
                client_reference: client_reference || `MER-${merchant_id || Date.now()}`
            }
        });

        // Process results and categorize by check type
        const results = searchData.data || [];
        const checkResults = {
            sanctions: { status: 'clear', matches: [], risk_score: 0 },
            pep: { status: 'clear', matches: [], risk_score: 0 },
            adverse_media: { status: 'clear', matches: [], risk_score: 0 },
            watchlists: { status: 'clear', matches: [], risk_score: 0 },
            country_risk: { status: 'clear', risk_score: 0 }
        };

        let overallRiskScore = 0;
        const alerts = [];

        // Analyze results
        results.forEach(result => {
            const categories = result.category || [];
            const matchScore = result.match_score || 0;
            
            if (categories.includes('Sanctions') || categories.includes('SIP')) {
                checkResults.sanctions.matches.push(result);
                checkResults.sanctions.status = matchScore > 90 ? 'match' : 'potential_match';
                checkResults.sanctions.risk_score = Math.max(checkResults.sanctions.risk_score, matchScore);
                
                alerts.push({
                    check: 'Global Sanctions Lists',
                    type: checkResults.sanctions.status,
                    details: `Potential sanctions match: ${result.name} (Match: ${matchScore}%)`,
                    risk_score: matchScore
                });
            }
            
            if (categories.some(cat => cat.includes('PEP'))) {
                checkResults.pep.matches.push(result);
                checkResults.pep.status = matchScore > 90 ? 'match' : 'potential_match';
                checkResults.pep.risk_score = Math.max(checkResults.pep.risk_score, matchScore);
                
                alerts.push({
                    check: 'PEP Screening',
                    type: checkResults.pep.status,
                    details: `Potential PEP match: ${result.name} (Match: ${matchScore}%)`,
                    risk_score: matchScore
                });
            }
            
            if (categories.includes('Adverse Media')) {
                checkResults.adverse_media.matches.push(result);
                checkResults.adverse_media.status = matchScore > 90 ? 'match' : 'potential_match';
                checkResults.adverse_media.risk_score = Math.max(checkResults.adverse_media.risk_score, matchScore);
                
                alerts.push({
                    check: 'Adverse Media',
                    type: checkResults.adverse_media.status,
                    details: `Adverse media found: ${result.name}`,
                    risk_score: matchScore
                });
            }
            
            if (categories.includes('Watchlist')) {
                checkResults.watchlists.matches.push(result);
                checkResults.watchlists.status = matchScore > 90 ? 'match' : 'potential_match';
                checkResults.watchlists.risk_score = Math.max(checkResults.watchlists.risk_score, matchScore);
                
                alerts.push({
                    check: 'Watchlists',
                    type: checkResults.watchlists.status,
                    details: `Watchlist match: ${result.name}`,
                    risk_score: matchScore
                });
            }
        });

        // Calculate overall risk score
        const riskScores = Object.values(checkResults).map(c => c.risk_score || 0);
        overallRiskScore = riskScores.length > 0 ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length) : 0;

        // Determine overall status
        let overallStatus = 'clear';
        if (Object.values(checkResults).some(c => c.status === 'match')) {
            overallStatus = 'flagged';
        } else if (Object.values(checkResults).some(c => c.status === 'potential_match')) {
            overallStatus = 'monitoring';
        }

        const screeningResult = {
            aml_status: overallStatus,
            aml_reference_id: `AML-${Date.now()}`,
            aml_risk_score: overallRiskScore,
            checks: checkResults,
            alerts: alerts,
            total_matches: results.length,
            raw_results: results
        };

        // Update merchant record if merchant_id provided
        if (merchant_id) {
            await base44.asServiceRole.entities.Merchant.update(merchant_id, {
                aml_status: overallStatus,
                aml_reference_id: screeningResult.aml_reference_id,
                aml_risk_score: overallRiskScore,
                aml_provider: 'amlwatcher',
                aml_last_check: new Date().toISOString()
            });
        }

        return Response.json({
            success: true,
            screening: screeningResult
        });

    } catch (error) {
        console.error('AML Screening Error:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error.message 
        }, { status: 500 });
    }
});