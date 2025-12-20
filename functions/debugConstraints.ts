import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { psp_code } = await req.json();
        
        const client = await pool.connect();
        try {
            const schemaName = `psp_${psp_code.toLowerCase()}`;
            
            // Get all constraints
            const constraints = await client.query(`
                SELECT conname, contype, pg_get_constraintdef(oid) as definition
                FROM pg_constraint 
                WHERE conrelid = '${schemaName}.app_users'::regclass
            `);
            
            // Get all indexes
            const indexes = await client.query(`
                SELECT indexname, indexdef
                FROM pg_indexes
                WHERE schemaname = '${schemaName}' 
                AND tablename = 'app_users'
            `);
            
            return Response.json({
                success: true,
                schema: schemaName,
                constraints: constraints.rows,
                indexes: indexes.rows
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