import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

// Drops the old app_users table from public schema that's causing constraint conflicts
Deno.serve(async (req) => {
    const client = await pool.connect();
    try {
        // Drop old public app_users table if it exists
        await client.query(`DROP TABLE IF EXISTS public.app_users CASCADE`);
        
        return Response.json({
            success: true,
            message: 'Dropped public.app_users table - PSP staff users are now only in isolated psp_staff_users tables'
        });
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    } finally {
        client.release();
    }
});