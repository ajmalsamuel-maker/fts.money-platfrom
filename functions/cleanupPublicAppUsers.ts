import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { action, email } = await req.json();
        
        const client = await pool.connect();
        try {
            if (action === 'delete') {
                // Delete specific user from public.app_users
                await client.query(`
                    DELETE FROM public.app_users WHERE email = $1
                `, [email]);
                
                return Response.json({
                    success: true,
                    message: `Deleted ${email} from public.app_users`
                });
            }
            
            if (action === 'list') {
                // List all users in public.app_users
                const result = await client.query(`
                    SELECT id, email, full_name, psp_code FROM public.app_users ORDER BY id
                `);
                
                return Response.json({
                    success: true,
                    users: result.rows
                });
            }
            
            return Response.json({
                success: false,
                error: 'Invalid action'
            }, { status: 400 });
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