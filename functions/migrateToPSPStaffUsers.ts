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
            return Response.json({
                success: false,
                error: 'PSP code is required'
            }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const schemaName = `psp_${psp_code.toLowerCase()}`;
            
            // 1. Create new psp_staff_users table (isolated from Base44 entity system)
            await client.query(`
                DROP TABLE IF EXISTS ${schemaName}.psp_staff_users CASCADE;
                CREATE TABLE ${schemaName}.psp_staff_users (
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
                );
            `);
            
            // 2. Copy existing users from app_users (if it exists)
            try {
                await client.query(`
                    INSERT INTO ${schemaName}.psp_staff_users 
                    (email, full_name, role, status, password_hash, last_login, created_date, updated_date, created_by)
                    SELECT 
                        email, full_name, role, status, password_hash, last_login, 
                        created_date, updated_date, created_by
                    FROM ${schemaName}.app_users;
                `);
            } catch (err) {
                // app_users might not exist, that's OK
            }
            
            // 3. Drop old app_users table (Base44 will stop syncing it)
            await client.query(`DROP TABLE IF EXISTS ${schemaName}.app_users CASCADE;`);
            
            // 4. Create index
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_psp_staff_users_email 
                ON ${schemaName}.psp_staff_users(email);
            `);
            
            return Response.json({
                success: true,
                message: `Migrated PSP ${psp_code} to psp_staff_users table - isolated from Base44 entity sync`,
                schema: schemaName
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