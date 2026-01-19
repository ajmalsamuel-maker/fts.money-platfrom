/**
 * Authentication Utilities for PostgreSQL
 * Centralized auth functions for all platforms
 */

import postgres from 'npm:postgres@3.4.4';

let sqlPool = null;

function getPool() {
    if (!sqlPool) {
        const dbUrl = Deno.env.get('DATABASE_URL');
        if (!dbUrl) throw new Error('DATABASE_URL not set');
        
        sqlPool = postgres(dbUrl, {
            max: 10,
            timeout: 30,
            idle_timeout: 60,
            max_lifetime: 3600,
            ssl: 'require'
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
    const sql = getPool();
    try {
        let query;
        if (accountType) {
            query = await sql`
                SELECT * FROM auth_users 
                WHERE email = ${email} AND account_type = ${accountType}
                ORDER BY created_date DESC
                LIMIT 1
            `;
        } else {
            query = await sql`
                SELECT * FROM auth_users 
                WHERE email = ${email}
                ORDER BY created_date DESC
                LIMIT 1
            `;
        }
        return query.length > 0 ? query[0] : null;
    } catch (error) {
        console.error('Query auth user error:', error);
        throw error;
    }
}

/**
 * Query PSP staff user
 */
export async function queryPSPStaffUser(email, pspCode) {
    const sql = getPool();
    try {
        const query = await sql`
            SELECT * FROM psp_staff_users 
            WHERE email = ${email} AND psp_code = ${pspCode} AND status = 'active'
            LIMIT 1
        `;
        return query.length > 0 ? query[0] : null;
    } catch (error) {
        console.error('Query PSP staff user error:', error);
        throw error;
    }
}

/**
 * Query merchant user
 */
export async function queryMerchantUser(email, merchantCode) {
    const sql = getPool();
    try {
        const query = await sql`
            SELECT * FROM merchant_users 
            WHERE email = ${email} AND merchant_code = ${merchantCode} AND status = 'active'
            LIMIT 1
        `;
        return query.length > 0 ? query[0] : null;
    } catch (error) {
        console.error('Query merchant user error:', error);
        throw error;
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