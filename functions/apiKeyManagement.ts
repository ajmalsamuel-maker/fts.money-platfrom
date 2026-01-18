import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, key_id } = await req.json();

        if (action === 'generateKey') {
            const api_key = `pk_${Math.random().toString(36).slice(2)}`;
            const secret_key = `sk_${Math.random().toString(36).slice(2)}`;
            const key_hash = `hash_${Math.random().toString(36).slice(2)}`;
            
            await execute(
                `INSERT INTO api_key (key_id, merchant_id, psp_code, key_hash, secret_hash, scopes, status, created_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
                [key_id || `KEY-${Date.now()}`, merchant_id, psp_code, key_hash, secret_key, JSON.stringify(req.json().scopes || ['transactions:read', 'transactions:write']), 'active']
            );

            await closeConnection();
            return Response.json({
                success: true,
                api_key,
                secret_key,
                note: 'Save secret securely - cannot be retrieved'
            });
        }

        if (action === 'rotateKey') {
            const old_key = await queryOne(
                `SELECT * FROM api_key WHERE key_id = $1`,
                [key_id]
            );

            await execute(
                `UPDATE api_key SET status = 'deprecated' WHERE key_id = $1`,
                [key_id]
            );

            const new_key = `pk_${Math.random().toString(36).slice(2)}`;
            const new_secret = `sk_${Math.random().toString(36).slice(2)}`;
            
            await execute(
                `INSERT INTO api_key (key_id, merchant_id, psp_code, key_hash, secret_hash, scopes, status, created_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
                [`KEY-${Date.now()}`, old_key.merchant_id, old_key.psp_code, `hash_${Math.random().toString(36).slice(2)}`, new_secret, old_key.scopes, 'active']
            );

            await closeConnection();
            return Response.json({ success: true, new_api_key: new_key });
        }

        if (action === 'revokeKey') {
            await execute(
                `UPDATE api_key SET status = 'revoked', revoked_at = NOW() WHERE key_id = $1`,
                [key_id]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        if (action === 'listKeys') {
            const keys = await query(
                `SELECT key_id, created_date, status, scopes FROM api_key WHERE merchant_id = $1 AND psp_code = $2 ORDER BY created_date DESC`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, keys });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('API key management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});