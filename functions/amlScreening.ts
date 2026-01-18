import { execute, closeConnection } from './db/postgresClient.js';
import { ConnectorFactory } from './connectors/index.js';

Deno.serve(async (req) => {
    try {
        const { name, entity_type = 'Company', country = [], merchant_id } = await req.json();

        if (!name) {
            await closeConnection();
            return Response.json({ error: 'Missing required field: name' }, { status: 400 });
        }

        const amlConnector = ConnectorFactory.getAMLConnector();
        const searchData = await amlConnector.screenEntity({ entity_type, name, country, client_reference: `MER-${merchant_id || Date.now()}` });

        const results = searchData.data || [];
        const checkResults = {
            sanctions: { status: 'clear', risk_score: 0 },
            pep: { status: 'clear', risk_score: 0 },
            adverse_media: { status: 'clear', risk_score: 0 },
            watchlists: { status: 'clear', risk_score: 0 }
        };

        const alerts = [];
        results.forEach(result => {
            const categories = result.category || [];
            const matchScore = result.match_score || 0;
            
            if (categories.includes('Sanctions')) {
                checkResults.sanctions.status = matchScore > 90 ? 'match' : 'potential_match';
                checkResults.sanctions.risk_score = Math.max(checkResults.sanctions.risk_score, matchScore);
                alerts.push({ check: 'Sanctions', type: checkResults.sanctions.status, risk_score: matchScore });
            }
            if (categories.some(cat => cat.includes('PEP'))) {
                checkResults.pep.status = matchScore > 90 ? 'match' : 'potential_match';
                checkResults.pep.risk_score = Math.max(checkResults.pep.risk_score, matchScore);
                alerts.push({ check: 'PEP', type: checkResults.pep.status, risk_score: matchScore });
            }
        });

        const riskScores = Object.values(checkResults).map(c => c.risk_score || 0);
        const overallRiskScore = riskScores.reduce((a, b) => a + b, 0) / riskScores.length || 0;
        
        let overallStatus = 'clear';
        if (Object.values(checkResults).some(c => c.status === 'match')) overallStatus = 'flagged';
        else if (Object.values(checkResults).some(c => c.status === 'potential_match')) overallStatus = 'monitoring';

        if (merchant_id) {
            await execute(
                `UPDATE merchant SET aml_status = $1, aml_reference_id = $2, aml_risk_score = $3, aml_provider = 'amlwatcher', aml_last_check = NOW() WHERE id = $4`,
                [overallStatus, `AML-${Date.now()}`, Math.round(overallRiskScore), merchant_id]
            );
        }

        await closeConnection();
        return Response.json({
            success: true,
            screening: { aml_status: overallStatus, aml_risk_score: Math.round(overallRiskScore), checks: checkResults, alerts }
        });

    } catch (error) {
        await closeConnection();
        console.error('AML error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});