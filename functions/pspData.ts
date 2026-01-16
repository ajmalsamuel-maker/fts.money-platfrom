import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

// Get PSP-isolated database connection pool
const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, psp_code, entity, filters, limit, sort } = await req.json();

        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            // CRITICAL: Verify isolated schema exists (PCI Level 1 & GDPR compliance)
            const schemaName = `psp_${psp_code.toLowerCase().replace(/-/g, '_')}`;
            const schemaCheck = await client.query(`
                SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1
            `, [schemaName]);
            
            if (schemaCheck.rows.length === 0) {
                throw new Error(`Isolated schema ${schemaName} does not exist for PSP ${psp_code}. Contact administrator.`);
            }
            
            // Set schema search path to ISOLATED schema ONLY (no public fallback)
            await client.query(`SET search_path TO "${schemaName}"`);

            switch (action) {
                case 'listTransactions': {
                    const result = await client.query(`
                        SELECT * FROM transactions 
                        ORDER BY created_date DESC 
                        LIMIT $1
                    `, [limit || 10]);
                    
                    return Response.json({ 
                        success: true, 
                        data: result.rows 
                    });
                }

                case 'listMerchants': {
                    const result = await client.query(`
                        SELECT * FROM merchants 
                        WHERE psp_code = $1
                        ORDER BY created_date DESC
                    `, [psp_code]);
                    
                    return Response.json({ 
                        success: true, 
                        data: result.rows 
                    });
                }

                case 'getStats': {
                    const [transactions, merchants, volume] = await Promise.all([
                        client.query('SELECT COUNT(*) as count FROM transactions'),
                        client.query('SELECT COUNT(*) as count FROM merchants'),
                        client.query(`
                            SELECT 
                                SUM(amount) as total_volume,
                                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as successful_volume
                            FROM transactions
                        `)
                    ]);

                    return Response.json({
                        success: true,
                        stats: {
                            total_transactions: parseInt(transactions.rows[0].count),
                            total_merchants: parseInt(merchants.rows[0].count),
                            total_volume: parseFloat(volume.rows[0].total_volume || 0),
                            successful_volume: parseFloat(volume.rows[0].successful_volume || 0)
                        }
                    });
                }

                case 'createMerchant': {
                    const { merchantData } = await req.json();
                    const result = await client.query(`
                        INSERT INTO merchants (
                            psp_code, merchant_code, business_name, trading_name, 
                            contact_email, contact_phone, contact_name, country, 
                            category, website, currency, status, risk_level, created_by
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                        RETURNING *
                    `, [
                        psp_code,
                        merchantData.merchant_code,
                        merchantData.business_name,
                        merchantData.trading_name,
                        merchantData.contact_email,
                        merchantData.contact_phone,
                        merchantData.contact_name,
                        merchantData.country,
                        merchantData.category,
                        merchantData.website,
                        merchantData.currency || 'USD',
                        merchantData.status || 'pending',
                        merchantData.risk_level || 'medium',
                        merchantData.created_by
                    ]);
                    
                    return Response.json({ 
                        success: true, 
                        merchant: result.rows[0] 
                    });
                }

                case 'updateMerchant': {
                    const { merchantId, updates } = await req.json();
                    const setClauses = [];
                    const values = [psp_code, merchantId];
                    let paramIndex = 3;

                    for (const [key, value] of Object.entries(updates)) {
                        setClauses.push(`${key} = $${paramIndex}`);
                        values.push(value);
                        paramIndex++;
                    }

                    setClauses.push('updated_date = NOW()');

                    const result = await client.query(`
                        UPDATE merchants 
                        SET ${setClauses.join(', ')}
                        WHERE psp_code = $1 AND id = $2
                        RETURNING *
                    `, values);
                    
                    return Response.json({ 
                        success: true, 
                        merchant: result.rows[0] 
                    });
                }

                case 'auditLog': {
                    const { user_email, action_type, details, ip_address } = await req.json();
                    
                    await client.query(`
                        INSERT INTO audit_logs (action, user_email, ip_address, details)
                        VALUES ($1, $2, $3, $4)
                    `, [action_type, user_email, ip_address, JSON.stringify(details)]);

                    return Response.json({ success: true });
                }

                default:
                    return Response.json({ error: 'Invalid action' }, { status: 400 });
            }
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('PSP Data error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});