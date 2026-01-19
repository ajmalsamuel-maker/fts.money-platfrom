/**
 * Authentication Utilities for PostgreSQL
 * Centralized auth functions for all platforms
 */

import { Client } from 'npm:pg@17.1.0';

let sqlPool = null;

function getPool() {
    if (!sqlPool) {
        const dbUrl = Deno.env.get('DATABASE_URL');
        if (!dbUrl) throw new Error('DATABASE_URL not set');
        
        sqlPool = new Client({
            connectionString: dbUrl,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }
    return sqlPool;
}

/**
 * Hash password with SHA-256
 */
export async function hashPassword(password, salt = 'fts_salt_2025') {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password, hash, salt = 'fts_salt_2025') {
    const computed = await hashPassword(password, salt);
    return computed === hash;
}

/**
 * Query user from auth_users table
 */
export async function queryAuthUser(email, accountType = null) {
    const client = new Client({
        connectionString: Deno.env.get('DATABASE_URL'),
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const query = accountType
            ? await client.query('SELECT * FROM auth_users WHERE email = $1 AND account_type = $2 ORDER BY created_date DESC LIMIT 1', [email, accountType])
            : await client.query('SELECT * FROM auth_users WHERE email = $1 ORDER BY created_date DESC LIMIT 1', [email]);
        return query.rows.length > 0 ? query.rows[0] : null;
    } catch (error) {
        console.error('Query auth user error:', error);
        throw error;
    } finally {
        await client.end();
    }
}

/**
 * Query PSP staff user
 */
export async function queryPSPStaffUser(email, pspCode) {
    const client = new Client({
        connectionString: Deno.env.get('DATABASE_URL'),
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const query = await client.query(
            'SELECT * FROM psp_staff_users WHERE email = $1 AND psp_code = $2 AND status = $3 LIMIT 1',
            [email, pspCode, 'active']
        );
        return query.rows.length > 0 ? query.rows[0] : null;
    } catch (error) {
        console.error('Query PSP staff user error:', error);
        throw error;
    } finally {
        await client.end();
    }
}

/**
 * Query merchant user
 */
export async function queryMerchantUser(email, merchantCode) {
    const client = new Client({
        connectionString: Deno.env.get('DATABASE_URL'),
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const query = await client.query(
            'SELECT * FROM merchant_users WHERE email = $1 AND merchant_code = $2 AND status = $3 LIMIT 1',
            [email, merchantCode, 'active']
        );
        return query.rows.length > 0 ? query.rows[0] : null;
    } catch (error) {
        console.error('Query merchant user error:', error);
        throw error;
    } finally {
        await client.end();
    }
}

/**
 * Create auth user
 */
export async function createAuthUser(data) {
    const sql = getPool();
    try {
        const result = await sql`
            INSERT INTO auth_users (
                email, full_name, password_hash, account_type, 
                platform_role, community_role, status, created_date
            ) VALUES (
                ${data.email}, ${data.full_name}, ${data.password_hash}, 
                ${data.account_type}, ${data.platform_role || null}, 
                ${data.community_role || null}, 'active', CURRENT_TIMESTAMP
            )
            RETURNING id, email, full_name, account_type, platform_role, community_role
        `;
        return result[0];
    } catch (error) {
        console.error('Create auth user error:', error);
        throw error;
    }
}

/**
 * Update auth user
 */
export async function updateAuthUser(userId, data) {
    const sql = getPool();
    try {
        const setClauses = Object.keys(data)
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(', ');
        
        const values = Object.values(data);
        values.push(userId);

        const result = await sql`
            UPDATE auth_users 
            SET ${sql(Object.keys(data).map(k => `${k} = ${data[k]}`))}
            WHERE id = ${userId}
            RETURNING *
        `;
        return result[0];
    } catch (error) {
        console.error('Update auth user error:', error);
        throw error;
    }
}

/**
 * Update PSP staff user last login
 */
export async function updatePSPStaffLastLogin(userId, ipAddress = null) {
    const sql = getPool();
    try {
        const query = await sql`
            UPDATE psp_staff_users 
            SET last_login = CURRENT_TIMESTAMP, last_login_ip = ${ipAddress}
            WHERE id = ${userId}
        `;
        return query.count || 0;
    } catch (error) {
        console.error('Update PSP staff last login error:', error);
        throw error;
    }
}

/**
 * Update merchant user last login
 */
export async function updateMerchantUserLastLogin(userId, ipAddress = null) {
    const sql = getPool();
    try {
        const query = await sql`
            UPDATE merchant_users 
            SET last_login = CURRENT_TIMESTAMP, last_login_ip = ${ipAddress}
            WHERE id = ${userId}
        `;
        return query.count || 0;
    } catch (error) {
        console.error('Update merchant user last login error:', error);
        throw error;
    }
}

/**
 * Get IP address from request
 */
export function getClientIP(req) {
    return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
           req.headers.get('x-real-ip') || 
           'unknown';
}

/**
 * Create audit log
 */
export async function createAuditLog(data) {
    const sql = getPool();
    try {
        await sql`
            INSERT INTO audit_logs (
                event_type, category, severity, user_email, user_id, user_role,
                action, description, status, error_message, ip_address, user_agent,
                target_entity, target_id, old_value, new_value, retention_period,
                created_date
            ) VALUES (
                ${data.event_type}, ${data.category}, ${data.severity}, 
                ${data.user_email}, ${data.user_id || null}, ${data.user_role || null},
                ${data.action}, ${data.description}, ${data.status || null}, 
                ${data.error_message || null}, ${data.ip_address}, ${data.user_agent || null},
                ${data.target_entity || null}, ${data.target_id || null},
                ${data.old_value || null}, ${data.new_value || null}, 
                ${data.retention_period || '3_years'}, CURRENT_TIMESTAMP
            )
        `;
    } catch (error) {
        console.error('Create audit log error:', error);
        // Don't throw - audit logging should not break auth flow
    }
}

export { postgres, getPool };