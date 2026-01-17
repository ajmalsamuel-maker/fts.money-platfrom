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
        const body = await req.json();
        const { action, psp_code, entity, filters, limit, sort } = body;

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
                    const { merchantData } = body;
                    const result = await client.query(`
                        INSERT INTO merchants (
                            psp_code, merchant_code, business_name, trading_name, 
                            contact_email, contact_phone, contact_name, country, 
                            category, website, currency, status, risk_level
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                        RETURNING *
                    `, [
                        psp_code,
                        merchantData.merchant_code,
                        merchantData.business_name,
                        merchantData.trading_name || '',
                        merchantData.contact_email,
                        merchantData.contact_phone || '',
                        merchantData.contact_name || '',
                        merchantData.country || '',
                        merchantData.category || '',
                        merchantData.website || '',
                        merchantData.currency || 'USD',
                        merchantData.status || 'pending',
                        merchantData.risk_level || 'medium'
                    ]);
                    
                    return Response.json({ 
                        success: true, 
                        merchant: result.rows[0] 
                    });
                }

                case 'updateMerchant': {
                    const { merchantId, updates } = body;
                    const setClauses = [];
                    const values = [merchantId];
                    let paramIndex = 2;

                    // Filter out unwanted fields
                    const filteredUpdates = { ...updates };
                    delete filteredUpdates.id;
                    delete filteredUpdates.created_date;
                    delete filteredUpdates.updated_date;

                    for (const [key, value] of Object.entries(filteredUpdates)) {
                        setClauses.push(`${key} = $${paramIndex}`);
                        values.push(value);
                        paramIndex++;
                    }

                    if (setClauses.length === 0) {
                        return Response.json({ 
                            success: true, 
                            merchant: {} 
                        });
                    }

                    setClauses.push('updated_date = NOW()');

                    const result = await client.query(`
                        UPDATE merchants 
                        SET ${setClauses.join(', ')}
                        WHERE id = $1
                        RETURNING *
                    `, values);
                    
                    return Response.json({ 
                        success: true, 
                        merchant: result.rows[0] 
                    });
                }

                case 'auditLog': {
                    const { user_email, action_type, details, ip_address } = body;
                    
                    await client.query(`
                        INSERT INTO audit_logs (action, user_email, ip_address, details)
                        VALUES ($1, $2, $3, $4)
                    `, [action_type, user_email, ip_address, JSON.stringify(details)]);

                    return Response.json({ success: true });
                }

                case 'listMerchantMIDs': {
                    const result = await client.query(`
                        SELECT * FROM merchant_mids 
                        ORDER BY created_at DESC
                    `);
                    
                    return Response.json({ 
                        success: true, 
                        data: result.rows 
                    });
                }

                case 'createMerchantMID': {
                    const { midData } = body;
                    const result = await client.query(`
                        INSERT INTO merchant_mids (
                            merchant_id, merchant_name, mid, provider_name, 
                            account_type, transaction_types, currency, 
                            status, activation_date, notes
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        RETURNING *
                    `, [
                        midData.merchant_id,
                        midData.merchant_name,
                        midData.mid,
                        midData.provider_name,
                        midData.account_type,
                        JSON.stringify(midData.transaction_types || []),
                        midData.currency || 'USD',
                        midData.status || 'pending',
                        midData.activation_date,
                        midData.notes
                    ]);
                    
                    return Response.json({ 
                        success: true, 
                        mid: result.rows[0] 
                    });
                }

                case 'updateMerchantMID': {
                    const { midId, updates } = body;
                    const setClauses = [];
                    const values = [midId];
                    let paramIndex = 2;

                    // Filter out psp_code and provider_id if present
                    const filteredUpdates = { ...updates };
                    delete filteredUpdates.psp_code;
                    delete filteredUpdates.provider_id;
                    delete filteredUpdates.id;

                    for (const [key, value] of Object.entries(filteredUpdates)) {
                        if (key === 'transaction_types') {
                            setClauses.push(`${key} = $${paramIndex}`);
                            values.push(JSON.stringify(value));
                        } else {
                            setClauses.push(`${key} = $${paramIndex}`);
                            values.push(value);
                        }
                        paramIndex++;
                    }

                    if (setClauses.length === 0) {
                        return Response.json({ 
                            success: true, 
                            mid: {} 
                        });
                    }

                    setClauses.push('updated_at = NOW()');

                    const result = await client.query(`
                        UPDATE merchant_mids 
                        SET ${setClauses.join(', ')}
                        WHERE id = $1
                        RETURNING *
                    `, values);
                    
                    return Response.json({ 
                        success: true, 
                        mid: result.rows[0] 
                    });
                }

                case 'deleteMerchantMID': {
                    const { midId } = body;
                    await client.query(`
                        DELETE FROM merchant_mids 
                        WHERE id = $1
                    `, [midId]);
                    
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