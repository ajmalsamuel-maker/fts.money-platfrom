import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

Deno.serve(async (req) => {
    let client;
    try {
        const databaseUrl = Deno.env.get('DATABASE_URL');
        
        if (!databaseUrl) {
            return Response.json({ 
                success: false, 
                error: 'DATABASE_URL environment variable not set' 
            });
        }

        // Create PostgreSQL client
        client = new Client(databaseUrl);
        await client.connect();

        // Test query
        const result = await client.queryObject('SELECT COUNT(*) as count FROM "ProvisionedPSP"');
        
        await client.end();

        return Response.json({ 
            success: true,
            message: 'PostgreSQL database connection successful',
            psps: result.rows[0]?.count || 0
        });

    } catch (error) {
        if (client) {
            try { await client.end(); } catch {}
        }
        return Response.json({ 
            success: false, 
            error: `PostgreSQL connection failed: ${error.message}`
        });
    }
});