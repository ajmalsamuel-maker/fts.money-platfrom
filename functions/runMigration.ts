import { Pool } from 'npm:pg@8.11.3';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    const pool = new Pool({
        connectionString: Deno.env.get('DATABASE_URL'),
    });

    try {
        const { sql: migrationSql } = await req.json();

        if (!migrationSql) {
            return Response.json({ 
                success: false, 
                error: 'No SQL provided' 
            }, { status: 400 });
        }

        const client = await pool.connect();
        
        try {
            await client.query(migrationSql);
            
            return Response.json({ 
                success: true,
                message: 'Migration executed successfully'
            });
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Migration error:', error);
        return Response.json({ 
            success: false, 
            error: error.message || 'Migration failed'
        }, { status: 200 });
    } finally {
        await pool.end();
    }
});