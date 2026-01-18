import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Check critical entities
        const criticalEntities = [
            'ProvisionedPSP',
            'Merchant',
            'Transaction',
            'ProcessorConnectorConfig',
            'MerchantMID'
        ];

        const tableChecks = [];
        for (const entity of criticalEntities) {
            try {
                await base44.asServiceRole.entities[entity].list();
                tableChecks.push({ table: entity, exists: true });
            } catch (error) {
                tableChecks.push({ table: entity, exists: false, error: error.message });
            }
        }

        const allValid = tableChecks.every(check => check.exists);

        return Response.json({
            valid: allValid,
            tables: tableChecks.filter(c => c.exists).map(c => c.table),
            issues: tableChecks.filter(c => !c.exists),
            message: allValid ? 'All critical tables validated' : 'Some tables are missing or inaccessible'
        });

    } catch (error) {
        return Response.json({ 
            valid: false, 
            error: error.message 
        });
    }
});