/**
 * Seed PSP Staff User for Testing
 * Add a test PSP staff user to allow login
 */

import { Client } from 'npm:pg@17.1.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Simple SHA-256 hash
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'fts_salt_2025');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

Deno.serve(async (req) => {
    let client = null;
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const dbUrl = Deno.env.get('DATABASE_URL');
        if (!dbUrl) {
            return Response.json({ error: 'DATABASE_URL not set' }, { status: 500 });
        }

        client = new Client({
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false }
        });
        await client.connect();

        console.log('Seeding PSP staff user...');

        const hashedPassword = await hashPassword('password123');

        // Insert GP-PAY PSP staff user
        const result = await client.query(
            'INSERT INTO psp_staff_users (psp_code, email, full_name, password_hash, role, status) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (psp_code, email) DO UPDATE SET password_hash = $4, status = $6 RETURNING id, psp_code, email, full_name',
            ['GP-PAY', 'ajmalsamuel@me.com', 'Ajmal Samuel', hashedPassword, 'admin', 'active']
        );

        console.log('✅ PSP staff user seeded:', result.rows[0]);

        return Response.json({
            success: true,
            message: 'PSP staff user seeded successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error seeding auth data:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    } finally {
        if (client) {
            await client.end();
        }
    }
});