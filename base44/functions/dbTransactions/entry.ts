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
            case 'initSchema': {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS transactions (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        transaction_id VARCHAR(100) UNIQUE,
                        merchant_id VARCHAR(255),
                        merchant_name VARCHAR(255),
                        mid_id VARCHAR(255),
                        type VARCHAR(50) NOT NULL,
                        status VARCHAR(50) DEFAULT 'pending',
                        amount DECIMAL(15,2) NOT NULL,
                        currency VARCHAR(3) DEFAULT 'USD',
                        fee DECIMAL(15,4),
                        net_amount DECIMAL(15,2),
                        payment_method VARCHAR(50),
                        card_last_four VARCHAR(4),
                        card_brand VARCHAR(50),
                        customer_email VARCHAR(255),
                        customer_name VARCHAR(255),
                        customer_country VARCHAR(100),
                        ip_address VARCHAR(45),
                        description TEXT,
                        auth_code VARCHAR(50),
                        response_code VARCHAR(10),
                        response_message TEXT,
                        risk_score DECIMAL(5,2),
                        is_3ds BOOLEAN DEFAULT false,
                        terminal_id VARCHAR(100),
                        batch_id VARCHAR(100),
                        settlement_date DATE,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );

                    CREATE INDEX IF NOT EXISTS idx_txn_merchant ON transactions(merchant_id);
                    CREATE INDEX IF NOT EXISTS idx_txn_status ON transactions(status);
                    CREATE INDEX IF NOT EXISTS idx_txn_type ON transactions(type);
                    CREATE INDEX IF NOT EXISTS idx_txn_created ON transactions(created_at);
                    CREATE INDEX IF NOT EXISTS idx_txn_mid ON transactions(mid_id);
                `);
                return Response.json({ success: true, message: 'Transaction schema initialized' });
            }

            case 'list': {
                const limit = data?.limit || 100;
                const offset = data?.offset || 0;
                const result = await pool.query(
                    `SELECT * FROM transactions 
                     ORDER BY created_at DESC 
                     LIMIT $1 OFFSET $2`,
                    [limit, offset]
                );
                return Response.json({ success: true, data: result.rows });
            }

            case 'get': {
                const result = await pool.query(
                    'SELECT * FROM transactions WHERE id = $1 OR transaction_id = $1',
                    [data.id]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'create': {
                const txnId = data.transaction_id || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                const fee = data.fee || (data.amount * 0.029 + 0.30); // Default 2.9% + $0.30
                const netAmount = data.amount - fee;

                const result = await pool.query(
                    `INSERT INTO transactions 
                     (transaction_id, merchant_id, merchant_name, mid_id, type, status, amount, currency, 
                      fee, net_amount, payment_method, card_last_four, card_brand, customer_email, 
                      customer_name, customer_country, ip_address, description, auth_code, 
                      response_code, response_message, risk_score, is_3ds, terminal_id)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
                     RETURNING *`,
                    [
                        txnId,
                        data.merchant_id,
                        data.merchant_name,
                        data.mid_id,
                        data.type || 'sale',
                        data.status || 'pending',
                        data.amount,
                        data.currency || 'USD',
                        fee,
                        netAmount,
                        data.payment_method,
                        data.card_last_four,
                        data.card_brand,
                        data.customer_email,
                        data.customer_name,
                        data.customer_country,
                        data.ip_address,
                        data.description,
                        data.auth_code,
                        data.response_code,
                        data.response_message,
                        data.risk_score,
                        data.is_3ds || false,
                        data.terminal_id
                    ]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'updateStatus': {
                const result = await pool.query(
                    `UPDATE transactions SET status = $1, updated_at = NOW() 
                     WHERE id = $2 OR transaction_id = $2
                     RETURNING *`,
                    [data.status, data.id]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'stats': {
                const result = await pool.query(`
                    SELECT 
                        COUNT(*) as total_count,
                        COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
                        COUNT(*) FILTER (WHERE status = 'declined') as declined_count,
                        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                        COALESCE(SUM(amount), 0) as total_volume,
                        COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) as approved_volume,
                        COALESCE(SUM(fee) FILTER (WHERE status = 'approved'), 0) as total_fees,
                        COALESCE(AVG(amount), 0) as avg_transaction,
                        ROUND(COUNT(*) FILTER (WHERE status = 'approved')::numeric / NULLIF(COUNT(*), 0) * 100, 2) as success_rate
                    FROM transactions
                    WHERE created_at >= NOW() - INTERVAL '30 days'
                `);
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'byMerchant': {
                const result = await pool.query(
                    `SELECT * FROM transactions 
                     WHERE merchant_id = $1 
                     ORDER BY created_at DESC 
                     LIMIT $2`,
                    [data.merchant_id, data.limit || 100]
                );
                return Response.json({ success: true, data: result.rows });
            }

            case 'byMid': {
                const result = await pool.query(
                    `SELECT * FROM transactions 
                     WHERE mid_id = $1 
                     ORDER BY created_at DESC 
                     LIMIT $2`,
                    [data.mid_id, data.limit || 100]
                );
                return Response.json({ success: true, data: result.rows });
            }

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});