import pg from 'npm:pg@8.11.3';

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
            
            // Use bcrypt for password hashing
            const bcrypt = await import('npm:bcrypt@5.1.1');
            const password_hash = await bcrypt.hash(password || 'Welcome123!', 10);

            // Check if table exists, create if not
            await client.query(`
                CREATE TABLE IF NOT EXISTS ${schemaName}.psp_staff_users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255),
                    role VARCHAR(50) DEFAULT 'user',
                    status VARCHAR(50) DEFAULT 'active',
                    password_hash TEXT,
                    last_login TIMESTAMP,
                    two_factor_enabled BOOLEAN DEFAULT false,
                    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by VARCHAR(255)
                )
            `);

            // Insert user
            const result = await client.query(`
                INSERT INTO ${schemaName}.psp_staff_users (email, full_name, role, password_hash, status)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, email, full_name, role, status, created_date
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