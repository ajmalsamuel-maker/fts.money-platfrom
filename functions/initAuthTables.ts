/**
 * Initialize Auth Tables in PostgreSQL
 * Creates all required tables for authentication
 */

import postgres from 'npm:postgres@3.4.4';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

        const sql = postgres(dbUrl, { ssl: 'require' });

        console.log('Creating auth tables...');

        // Auth Users table
        await sql`
            CREATE TABLE IF NOT EXISTS auth_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                full_name VARCHAR(255),
                password_hash VARCHAR(255) NOT NULL,
                account_type VARCHAR(50) NOT NULL,
                platform_role VARCHAR(100),
                community_role VARCHAR(100),
                status VARCHAR(50) DEFAULT 'active',
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // PSP Staff Users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS psp_staff_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                psp_code VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(100),
                status VARCHAR(50) DEFAULT 'active',
                last_login TIMESTAMP,
                last_login_ip VARCHAR(50),
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(psp_code, email)
            )
        `);

        // Merchant Users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS merchant_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                merchant_id VARCHAR(100),
                merchant_code VARCHAR(100) NOT NULL,
                merchant_name VARCHAR(255),
                email VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(100),
                permissions JSONB,
                must_change_password BOOLEAN DEFAULT false,
                status VARCHAR(50) DEFAULT 'active',
                last_login TIMESTAMP,
                last_login_ip VARCHAR(50),
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(merchant_code, email)
            )
        `);

        // Audit Logs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_type VARCHAR(100),
                category VARCHAR(100),
                severity VARCHAR(50),
                user_email VARCHAR(255),
                user_id UUID,
                user_role VARCHAR(100),
                action VARCHAR(100),
                description TEXT,
                status VARCHAR(50),
                error_message TEXT,
                ip_address VARCHAR(50),
                user_agent TEXT,
                target_entity VARCHAR(100),
                target_id VARCHAR(255),
                old_value JSONB,
                new_value JSONB,
                retention_period VARCHAR(50),
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_auth_users_account_type ON auth_users(account_type)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_psp_staff_users_psp_code ON psp_staff_users(psp_code)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_psp_staff_users_email ON psp_staff_users(email)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_merchant_users_merchant_code ON merchant_users(merchant_code)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_merchant_users_email ON merchant_users(email)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_date ON audit_logs(created_date)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email)`);

        console.log('✅ Auth tables created successfully');

        return Response.json({
            success: true,
            message: 'Auth tables initialized successfully'
        });

    } catch (error) {
        console.error('Error initializing auth tables:', error);
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