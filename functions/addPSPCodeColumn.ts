import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const client = await pool.connect();

        try {
            // Add psp_code column to existing tables if not exists
            await client.query(`
                ALTER TABLE public.app_users 
                ADD COLUMN IF NOT EXISTS psp_code VARCHAR(50)
            `);

            await client.query(`
                ALTER TABLE public.merchants 
                ADD COLUMN IF NOT EXISTS psp_code VARCHAR(50)
            `);

            await client.query(`
                ALTER TABLE public.transactions 
                ADD COLUMN IF NOT EXISTS psp_code VARCHAR(50)
            `);

            // Create indexes
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_app_users_psp_code 
                ON public.app_users(psp_code)
            `);

            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_merchants_psp_code 
                ON public.merchants(psp_code)
            `);

            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_transactions_psp_code 
                ON public.transactions(psp_code)
            `);

            return Response.json({
                success: true,
                message: 'PSP code columns added to all tables'
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Column addition error:', error);
        return Response.json({ 
            success: false, 
            error: error.message
        }, { status: 500 });
    }
});