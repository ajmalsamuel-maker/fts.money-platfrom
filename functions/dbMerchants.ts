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
                const result = await pool.query(
                    'SELECT * FROM merchants ORDER BY created_at DESC'
                );
                return Response.json({ success: true, data: result.rows });
            }

            case 'get': {
                const result = await pool.query(
                    'SELECT * FROM merchants WHERE id = $1',
                    [data.id]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'create': {
                const result = await pool.query(
                    `INSERT INTO merchants 
                     (merchant_id, business_name, trading_name, status, category, mcc_code, country, currency, 
                      contact_name, contact_email, contact_phone, address, website, processing_volume, 
                      fee_rate, settlement_period, risk_level)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                     RETURNING *`,
                    [
                        data.merchant_id || `MER-${Date.now()}`,
                        data.business_name,
                        data.trading_name,
                        data.status || 'pending',
                        data.category,
                        data.mcc_code,
                        data.country,
                        data.currency || 'USD',
                        data.contact_name,
                        data.contact_email,
                        data.contact_phone,
                        data.address,
                        data.website,
                        data.processing_volume,
                        data.fee_rate,
                        data.settlement_period || 'T+1',
                        data.risk_level || 'medium'
                    ]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'update': {
                const result = await pool.query(
                    `UPDATE merchants SET
                     business_name = $1,
                     trading_name = $2,
                     status = $3,
                     category = $4,
                     mcc_code = $5,
                     country = $6,
                     currency = $7,
                     contact_name = $8,
                     contact_email = $9,
                     contact_phone = $10,
                     address = $11,
                     website = $12,
                     processing_volume = $13,
                     fee_rate = $14,
                     settlement_period = $15,
                     risk_level = $16,
                     updated_at = NOW()
                     WHERE id = $17
                     RETURNING *`,
                    [
                        data.business_name,
                        data.trading_name,
                        data.status,
                        data.category,
                        data.mcc_code,
                        data.country,
                        data.currency,
                        data.contact_name,
                        data.contact_email,
                        data.contact_phone,
                        data.address,
                        data.website,
                        data.processing_volume,
                        data.fee_rate,
                        data.settlement_period,
                        data.risk_level,
                        data.id
                    ]
                );
                return Response.json({ success: true, data: result.rows[0] });
            }

            case 'delete': {
                await pool.query('DELETE FROM merchants WHERE id = $1', [data.id]);
                return Response.json({ success: true });
            }

            case 'stats': {
                const result = await pool.query(`
                    SELECT 
                        COUNT(*) as total,
                        COUNT(*) FILTER (WHERE status = 'active') as active,
                        COUNT(*) FILTER (WHERE status = 'pending') as pending,
                        COUNT(*) FILTER (WHERE status = 'suspended') as suspended,
                        COALESCE(SUM(total_volume), 0) as total_volume
                    FROM merchants
                `);
                return Response.json({ success: true, data: result.rows[0] });
            }

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});