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
            
            // Get table definition
            const tableDef = await client.query(`
                SELECT 
                    a.attname as column_name,
                    pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
                    a.attnotnull as not_null,
                    pg_get_expr(d.adbin, d.adrelid) as default_value
                FROM pg_attribute a
                LEFT JOIN pg_attrdef d ON (a.attrelid, a.attnum) = (d.adrelid, d.adnum)
                WHERE a.attrelid = '${schemaName}.app_users'::regclass
                AND a.attnum > 0
                AND NOT a.attisdropped
                ORDER BY a.attnum
            `);
            
            // Get constraints
            const constraints = await client.query(`
                SELECT 
                    conname,
                    contype,
                    pg_get_constraintdef(oid) as definition
                FROM pg_constraint 
                WHERE conrelid = '${schemaName}.app_users'::regclass
            `);
            
            // Get indexes
            const indexes = await client.query(`
                SELECT 
                    indexname,
                    indexdef
                FROM pg_indexes
                WHERE schemaname = '${schemaName}' 
                AND tablename = 'app_users'
                ORDER BY indexname
            `);
            
            return Response.json({
                success: true,
                schema: schemaName,
                table_definition: tableDef.rows,
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