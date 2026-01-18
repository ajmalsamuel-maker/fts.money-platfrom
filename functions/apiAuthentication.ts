import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, api_key_name, permissions } = await req.json();

        if (action === 'generateKey') {
            const keyId = `key_${Date.now()}`;
            const keySecret = `secret_${Math.random().toString(36).substr(2)}`;

            await execute(
                `INSERT INTO api_key (api_key_id, merchant_id, psp_code, key_name, secret_hash, permissions, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [keyId, merchant_id, psp_code, api_key_name, hashSecret(keySecret), JSON.stringify(permissions), 'active']
            );

            await closeConnection();
            return Response.json({
                success: true,
                api_key: keyId,
                secret: keySecret,
                note: 'Save this secret securely - it cannot be recovered'
            });
        }

        if (action === 'validateKey') {
            const { api_key, secret } = await req.json();

            const key = await queryOne(
                `SELECT * FROM api_key WHERE api_key_id = $1 AND status = 'active'`,
                [api_key]
            );

            if (!key || key.secret_hash !== hashSecret(secret)) {
                await closeConnection();
                return Response.json({ success: false, valid: false }, { status: 401 });
            }

            // Log API access
            await execute(
                `INSERT INTO api_request_log (api_key_id, merchant_id, psp_code, status)
                 VALUES ($1, $2, $3, $4)`,
                [api_key, key.merchant_id, key.psp_code, 'authenticated']
            );

            await closeConnection();
            return Response.json({
                success: true,
                valid: true,
                merchant_id: key.merchant_id,
                permissions: key.permissions
            });
        }

        if (action === 'listKeys') {
            const keys = await query(
                `SELECT api_key_id, key_name, status, created_date FROM api_key WHERE merchant_id = $1 AND psp_code = $2`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, keys });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('API auth error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function hashSecret(secret) {
    const encoder = new TextEncoder();
    return crypto.subtle.digest('SHA-256', encoder.encode(secret)).then(hash => {
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    });
}