import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

Deno.serve(async (req) => {
    try {
        const databaseUrl = Deno.env.get('DATABASE_URL');
        
        if (!databaseUrl) {
            return Response.json({ 
                success: false, 
                error: 'DATABASE_URL not configured' 
            });
        }

        // Parse connection string
        const url = new URL(databaseUrl);
        const supabaseUrl = `https://${url.hostname}`;
        const supabaseKey = url.searchParams.get('apikey') || Deno.env.get('SUPABASE_KEY');
        
        if (!supabaseKey) {
            return Response.json({ 
                success: false, 
                error: 'Database key not found in connection string' 
            });
        }

        // Test connection
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.from('ProvisionedPSP').select('psp_code').limit(1);
        
        if (error) {
            return Response.json({ 
                success: false, 
                error: error.message 
            });
        }

        return Response.json({ 
            success: true,
            message: 'Database connection successful',
            testQuery: 'Queried ProvisionedPSP table'
        });

    } catch (error) {
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});