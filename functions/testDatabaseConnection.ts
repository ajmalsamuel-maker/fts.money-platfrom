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

        // Test basic connection with simple query
        const versionResult = await client.queryObject('SELECT version()');
        
        // Check if tables exist
        const tablesResult = await client.queryObject(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        await client.end();

        return Response.json({ 
            success: true,
            message: 'PostgreSQL database connection successful',
            version: versionResult.rows[0]?.version,
            tables_count: tablesResult.rows.length,
            tables: tablesResult.rows.map(r => r.table_name)
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