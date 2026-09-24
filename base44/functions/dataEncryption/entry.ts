import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, field_name, encrypted_value, decrypted_value } = await req.json();

        if (action === 'encryptField') {
            const encrypted_id = `ENC-${Date.now()}`;
            
            await execute(
                `INSERT INTO encrypted_field (encrypted_id, psp_code, field_name, encrypted_value, algorithm, created_date)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [encrypted_id, psp_code, field_name, encrypted_value, 'AES-256-GCM']
            );

            await closeConnection();
            return Response.json({ success: true, encrypted_id });
        }

        if (action === 'decryptField') {
            const record = await queryOne(
                `SELECT encrypted_value FROM encrypted_field WHERE encrypted_id = $1 AND psp_code = $2`,
                [req.json().encrypted_id, psp_code]
            );

            if (!record) {
                await closeConnection();
                return Response.json({ error: 'Field not found' }, { status: 404 });
            }

            // Mock decryption
            const decrypted = Buffer.from(record.encrypted_value, 'base64').toString('utf-8');

            await closeConnection();
            return Response.json({ success: true, decrypted });
        }

        if (action === 'rotateKeys') {
            const key_id = `KEY-${Date.now()}`;
            
            await execute(
                `INSERT INTO encryption_key (key_id, psp_code, algorithm, status, created_date)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [key_id, psp_code, 'AES-256-GCM', 'active']
            );

            // Mark old keys as deprecated
            await execute(
                `UPDATE encryption_key SET status = 'deprecated' WHERE psp_code = $1 AND key_id != $2`,
                [psp_code, key_id]
            );

            await closeConnection();
            return Response.json({ success: true, new_key_id: key_id });
        }

        if (action === 'enableTDE') {
            await execute(
                `ALTER DATABASE postgres SET encryption = 'ON'`
            );

            await closeConnection();
            return Response.json({ success: true, tde_enabled: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Data encryption error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});