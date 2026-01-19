import pkg from 'npm:pg@8.11.3';
const { Pool } = pkg;

/**
 * Create load_test_run table for tracking load test executions
 */
Deno.serve(async (req) => {
    const pool = new Pool({
        connectionString: Deno.env.get('DATABASE_URL'),
        ssl: { rejectUnauthorized: false }
    });

    try {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS load_test_run (
                run_id VARCHAR(100) PRIMARY KEY,
                psp_code VARCHAR(50) NOT NULL,
                test_type VARCHAR(50) NOT NULL,
                status VARCHAR(20) NOT NULL,
                started_at TIMESTAMP NOT NULL,
                completed_at TIMESTAMP,
                successful INTEGER DEFAULT 0,
                failed INTEGER DEFAULT 0,
                total_requests INTEGER DEFAULT 0,
                avg_latency NUMERIC(10,2),
                p50_latency NUMERIC(10,2),
                p95_latency NUMERIC(10,2),
                p99_latency NUMERIC(10,2),
                actual_tps NUMERIC(10,2),
                success_rate NUMERIC(5,2),
                scenario_breakdown JSONB,
                created_date TIMESTAMP DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_load_test_run_psp_code ON load_test_run(psp_code);
            CREATE INDEX IF NOT EXISTS idx_load_test_run_status ON load_test_run(status);
            CREATE INDEX IF NOT EXISTS idx_load_test_run_started_at ON load_test_run(started_at);
        `;

        await pool.query(createTableSQL);
        await pool.end();

        return Response.json({
            success: true,
            message: 'load_test_run table created successfully'
        });

    } catch (error) {
        await pool.end();
        console.error('Migration error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});