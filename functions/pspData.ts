import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

// Get PSP-isolated database connection
const getPSPPool = (pspCode) => {
    return new Pool({
        connectionString: Deno.env.get("DATABASE_URL"),
        ssl: { rejectUnauthorized: false },
        options: `-c search_path=psp_${pspCode.toLowerCase()},public`
    });
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, psp_code, entity, filters, limit, sort } = await req.json();

        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const pool = getPSPPool(psp_code);
        const client = await pool.connect();

        try {
            // Set schema search path for complete isolation
            await client.query(`SET search_path TO psp_${psp_code.toLowerCase()}, public`);

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
            await pool.end();
        }

    } catch (error) {
        console.error('PSP Data error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});