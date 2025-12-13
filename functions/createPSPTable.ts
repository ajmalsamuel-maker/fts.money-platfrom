import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        // Create psp_settings table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS psp_settings (
                id SERIAL PRIMARY KEY,
                psp_code VARCHAR(50) UNIQUE NOT NULL,
                psp_name VARCHAR(255) NOT NULL,
                branding JSONB,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        return Response.json({
            success: true,
            message: 'psp_settings table created successfully'
        });
        
    } catch (error) {
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});