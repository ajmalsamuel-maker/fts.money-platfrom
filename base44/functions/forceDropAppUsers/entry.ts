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
            return Response.json({ error: 'psp_code required' }, { status: 400 });
        }
        
        const schemaName = `psp_${psp_code.toLowerCase()}`;
        const client = await pool.connect();
        
        try {
            // Force drop app_users table with CASCADE
            await client.query(`DROP TABLE IF EXISTS ${schemaName}.app_users CASCADE`);
            
            return Response.json({
                success: true,
                message: `Dropped ${schemaName}.app_users`,
                schema: schemaName
            });
        } finally {
            client.release();
        }
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});