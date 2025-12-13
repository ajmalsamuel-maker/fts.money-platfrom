import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { action, email, full_name, role, psp_code, password, user_id, status } = await req.json();

        // Check existing table structure
        const checkTable = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'app_users'
        `);
        
        const hasTable = checkTable.rows.length > 0;
        const columnNames = checkTable.rows.map(r => r.column_name);
        
        // If table doesn't have our expected columns, add them
        if (hasTable) {
            if (!columnNames.includes('psp_code')) {
                await pool.query('ALTER TABLE app_users ADD COLUMN IF NOT EXISTS psp_code VARCHAR(50)');
            }
            if (!columnNames.includes('created_at')) {
                await pool.query('ALTER TABLE app_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()');
            }
            if (!columnNames.includes('updated_at')) {
                await pool.query('ALTER TABLE app_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()');
            }
        } else {
            // Create table if it doesn't exist
            await pool.query(`
                CREATE TABLE app_users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    full_name VARCHAR(255),
                    role VARCHAR(50) DEFAULT 'user',
                    psp_code VARCHAR(50),
                    password_hash TEXT,
                    status VARCHAR(50) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
        }

        if (action === 'create') {
            const result = await pool.query(`
                INSERT INTO app_users (email, full_name, role, psp_code, password_hash, status)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `, [email, full_name, role || 'user', psp_code, password || 'temp123', status || 'active']);

            return Response.json({
                success: true,
                user: result.rows[0]
            });
        }

        if (action === 'list') {
            const query = psp_code 
                ? 'SELECT * FROM app_users WHERE UPPER(COALESCE(psp_code, \'\')) = UPPER($1) ORDER BY id DESC'
                : 'SELECT * FROM app_users ORDER BY id DESC';
            
            const result = psp_code 
                ? await pool.query(query, [psp_code])
                : await pool.query(query);

            return Response.json({
                success: true,
                users: result.rows
            });
        }

        if (action === 'update') {
            const result = await pool.query(`
                UPDATE app_users 
                SET full_name = COALESCE($1, full_name),
                    role = COALESCE($2, role),
                    status = COALESCE($3, status),
                    psp_code = COALESCE($4, psp_code),
                    updated_at = NOW()
                WHERE id = $5
                RETURNING *
            `, [full_name, role, status, psp_code, user_id]);

            return Response.json({
                success: true,
                user: result.rows[0]
            });
        }

        if (action === 'delete') {
            await pool.query('DELETE FROM app_users WHERE id = $1', [user_id]);
            return Response.json({ success: true });
        }

        if (action === 'listPSPs') {
            const result = await pool.query('SELECT psp_code, psp_name FROM psp_settings ORDER BY psp_name');
            return Response.json({
                success: true,
                psps: result.rows
            });
        }

        return Response.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});