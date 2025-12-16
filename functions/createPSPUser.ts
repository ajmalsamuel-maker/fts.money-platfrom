import pg from 'npm:pg@8.11.3';
import bcrypt from 'npm:bcrypt@5.1.1';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { email, full_name, role, psp_code, password } = await req.json();

        if (!psp_code || !email) {
            return Response.json({
                success: false,
                error: 'PSP code and email are required'
            }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const schemaName = `psp_${psp_code.toLowerCase()}`;
            
            // Drop old table if it has wrong structure
            await client.query(`DROP TABLE IF EXISTS ${schemaName}.app_users CASCADE`);
            
            // Create clean app_users table
            await client.query(`
                CREATE TABLE ${schemaName}.app_users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    full_name VARCHAR(255),
                    role VARCHAR(50) DEFAULT 'user',
                    password_hash TEXT,
                    status VARCHAR(50) DEFAULT 'active',
                    last_login TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);

            // Hash password
            const password_hash = await bcrypt.hash(password || 'Welcome123!', 10);

            // Insert user
            const result = await client.query(`
                INSERT INTO ${schemaName}.app_users (email, full_name, role, password_hash, status)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, email, full_name, role, status, created_at
            `, [email, full_name || 'User', role || 'admin', password_hash, 'active']);

            return Response.json({
                success: true,
                message: 'User created successfully',
                user: result.rows[0]
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