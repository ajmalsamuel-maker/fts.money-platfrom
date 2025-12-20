import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { psp_code } = await req.json();
        
        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }
        
        const client = await pool.connect();
        try {
            const schemaName = `psp_${psp_code.toLowerCase()}`;
            
            // Drop the entire schema
            await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
            
            return Response.json({
                success: true,
                message: `Schema ${schemaName} dropped successfully`
            });
        } finally {
            client.release();
        }
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});