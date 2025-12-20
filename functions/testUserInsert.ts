import pg from 'npm:pg@8.11.3';
import bcrypt from 'npm:bcrypt@5.1.1';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { psp_code, email } = await req.json();
        
        const client = await pool.connect();
        try {
            const schemaName = `psp_${psp_code.toLowerCase()}`;
            
            // Check existing users
            const existingCheck = await client.query(`
                SELECT * FROM ${schemaName}.app_users WHERE email = $1
            `, [email]);
            
            if (existingCheck.rows.length > 0) {
                return Response.json({
                    success: false,
                    message: 'User already exists',
                    user: existingCheck.rows[0]
                });
            }
            
            // Try to insert
            const password_hash = await bcrypt.hash('Welcome123!', 10);
            
            const result = await client.query(`
                INSERT INTO ${schemaName}.app_users (email, full_name, role, password_hash, status)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [email, 'Test Admin', 'admin', password_hash, 'active']);
            
            return Response.json({
                success: true,
                user: result.rows[0]
            });
        } finally {
            client.release();
        }
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message,
            detail: error.detail,
            code: error.code
        }, { status: 500 });
    }
});