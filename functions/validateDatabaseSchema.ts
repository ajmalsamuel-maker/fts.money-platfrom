import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

Deno.serve(async (req) => {
    try {
        const { psp_code } = await req.json();
        
        const databaseUrl = Deno.env.get('DATABASE_URL');
        if (!databaseUrl) {
            return Response.json({ valid: false, error: 'DATABASE_URL not configured' });
        }

        const url = new URL(databaseUrl);
        const supabaseUrl = `https://${url.hostname}`;
        const supabaseKey = url.searchParams.get('apikey') || Deno.env.get('SUPABASE_KEY');

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Check critical tables
        const criticalTables = [
            'ProvisionedPSP',
            'Merchant',
            'Transaction',
            'ProcessorConnectorConfig',
            'MerchantMID'
        ];

        const tableChecks = [];
        for (const table of criticalTables) {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            tableChecks.push({
                table,
                exists: !error,
                error: error?.message
            });
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
        }, { status: 500 });
    }
});