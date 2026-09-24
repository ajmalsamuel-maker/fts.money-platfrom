import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, reseller_id, merchant_id } = await req.json();

        if (action === 'registerReseller') {
            const res_id = `RESELL-${Date.now()}`;
            
            await execute(
                `INSERT INTO reseller (reseller_id, psp_code, name, contact_email, commission_rate, status)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [res_id, psp_code, req.json().name, req.json().email, req.json().commission_rate || 0.02, 'active']
            );

            await closeConnection();
            return Response.json({ success: true, reseller_id: res_id });
        }

        if (action === 'linkMerchant') {
            await execute(
                `INSERT INTO reseller_merchant_link (reseller_id, merchant_id, psp_code, created_date)
                 VALUES ($1, $2, $3, NOW())`,
                [reseller_id, merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'calculateCommission') {
            const total_vol = await queryOne(
                `SELECT COALESCE(SUM(amount), 0) as total FROM transaction t
                 JOIN reseller_merchant_link r ON t.merchant_id = r.merchant_id
                 WHERE r.reseller_id = $1 AND t.created_date >= NOW() - INTERVAL '1 month'`,
                [reseller_id]
            );

            const reseller = await queryOne(
                `SELECT commission_rate FROM reseller WHERE reseller_id = $1`,
                [reseller_id]
            );

            const commission = total_vol.total * reseller.commission_rate;

            await closeConnection();
            return Response.json({
                success: true,
                volume: total_vol.total,
                commission_rate: reseller.commission_rate,
                commission_amount: Math.round(commission * 100) / 100
            });
        }

        if (action === 'getMerchants') {
            const merchants = await query(
                `SELECT m.* FROM merchant m
                 JOIN reseller_merchant_link r ON m.id = r.merchant_id
                 WHERE r.reseller_id = $1`,
                [reseller_id]
            );

            await closeConnection();
            return Response.json({ success: true, merchants });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Reseller management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});