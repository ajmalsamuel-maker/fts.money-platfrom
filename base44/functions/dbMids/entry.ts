import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, data } = await req.json();

        switch (action) {
            case 'list': {
                const query = `
                    SELECT m.*, 
                           mer.business_name as merchant_name,
                           p.name as provider_name
                    FROM merchant_mids m
                    LEFT JOIN merchants mer ON m.merchant_id = mer.id::text
                    LEFT JOIN payment_providers p ON m.provider_id = p.id::text
                    ORDER BY m.created_at DESC
                `;
                const result = await pool.query(query);
                return Response.json({ success: true, data: result.rows });
            }

            case 'get': {
                const result = await pool.query(
                    'SELECT * FROM merchant_mids WHERE id = $1',
                    [data.id]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'create': {
                const result = await pool.query(
                    `INSERT INTO merchant_mids 
                     (merchant_id, merchant_name, mid, provider_id, provider_name, terminal_type, transaction_types, currency, status, activation_date, notes)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                     RETURNING *`,
                    [
                        data.merchant_id,
                        data.merchant_name,
                        data.mid,
                        data.provider_id,
                        data.provider_name,
                        data.terminal_type,
                        data.transaction_types,
                        data.currency || 'USD',
                        data.status || 'pending',
                        data.activation_date,
                        data.notes
                    ]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'update': {
                const result = await pool.query(
                    `UPDATE merchant_mids SET
                     merchant_id = $1,
                     merchant_name = $2,
                     mid = $3,
                     provider_id = $4,
                     provider_name = $5,
                     terminal_type = $6,
                     transaction_types = $7,
                     currency = $8,
                     status = $9,
                     activation_date = $10,
                     notes = $11,
                     updated_at = NOW()
                     WHERE id = $12
                     RETURNING *`,
                    [
                        data.merchant_id,
                        data.merchant_name,
                        data.mid,
                        data.provider_id,
                        data.provider_name,
                        data.terminal_type,
                        data.transaction_types,
                        data.currency,
                        data.status,
                        data.activation_date,
                        data.notes,
                        data.id
                    ]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'delete': {
                await pool.query('DELETE FROM merchant_mids WHERE id = $1', [data.id]);
                return Response.json({ success: true });
            }

            case 'search': {
                const result = await pool.query(
                    `SELECT m.*, 
                            mer.business_name as merchant_name,
                            p.name as provider_name
                     FROM merchant_mids m
                     LEFT JOIN merchants mer ON m.merchant_id = mer.id::text
                     LEFT JOIN payment_providers p ON m.provider_id = p.id::text
                     WHERE m.mid ILIKE $1 
                        OR m.merchant_name ILIKE $1 
                        OR m.provider_name ILIKE $1
                     ORDER BY m.created_at DESC`,
                    [`%${data.query}%`]
                );
                return Response.json({ success: true, data: result.rows });
            }

            case 'initSchema': {
                // Initialize the database schema
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS merchants (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        merchant_id VARCHAR(50),
                        business_name VARCHAR(255) NOT NULL,
                        trading_name VARCHAR(255),
                        status VARCHAR(50) DEFAULT 'pending',
                        category VARCHAR(100),
                        mcc_code VARCHAR(10),
                        country VARCHAR(100),
                        currency VARCHAR(3) DEFAULT 'USD',
                        contact_name VARCHAR(255),
                        contact_email VARCHAR(255),
                        contact_phone VARCHAR(50),
                        address TEXT,
                        website VARCHAR(255),
                        processing_volume DECIMAL(15,2),
                        fee_rate DECIMAL(5,4),
                        settlement_period VARCHAR(10) DEFAULT 'T+1',
                        risk_level VARCHAR(20) DEFAULT 'medium',
                        total_transactions BIGINT DEFAULT 0,
                        total_volume DECIMAL(15,2) DEFAULT 0,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    CREATE TABLE IF NOT EXISTS payment_providers (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        name VARCHAR(255) NOT NULL,
                        type VARCHAR(50),
                        supported_currencies TEXT[],
                        supported_regions TEXT[],
                        status VARCHAR(20) DEFAULT 'active',
                        logo_url TEXT,
                        notes TEXT,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    CREATE TABLE IF NOT EXISTS merchant_mids (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        merchant_id VARCHAR(255),
                        merchant_name VARCHAR(255),
                        mid VARCHAR(100) NOT NULL,
                        provider_id VARCHAR(255),
                        provider_name VARCHAR(255),
                        terminal_type VARCHAR(50),
                        transaction_types TEXT[],
                        currency VARCHAR(3) DEFAULT 'USD',
                        status VARCHAR(20) DEFAULT 'pending',
                        activation_date DATE,
                        notes TEXT,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    CREATE INDEX IF NOT EXISTS idx_mids_merchant ON merchant_mids(merchant_id);
                    CREATE INDEX IF NOT EXISTS idx_mids_provider ON merchant_mids(provider_id);
                    CREATE INDEX IF NOT EXISTS idx_mids_status ON merchant_mids(status);
                    CREATE INDEX IF NOT EXISTS idx_mids_mid ON merchant_mids(mid);
                `);
                return Response.json({ success: true, message: 'Schema initialized' });
            }

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});