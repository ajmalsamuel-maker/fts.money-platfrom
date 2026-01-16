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
                        ORDER BY created_date DESC
                    `);
                    
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
                        INSERT INTO merchants (data) 
                        VALUES ($1) 
                        RETURNING *
                    `, [JSON.stringify(merchantData)]);
                    
                    return Response.json({ 
                        success: true, 
                        merchant: result.rows[0] 
                    });
                }

                case 'updateMerchant': {
                    const { merchantId, updates } = await req.json();
                    const result = await client.query(`
                        UPDATE merchants 
                        SET data = data || $1::jsonb 
                        WHERE id = $2 
                        RETURNING *
                    `, [JSON.stringify(updates), merchantId]);
                    
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