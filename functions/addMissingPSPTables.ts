// Add Missing PSP Tables - Creates merchant_users and virtual_terminals tables
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await req.json();
        const { psp_code } = body;

        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const client = await pool.connect();
        const results = [];

        try {
            const schemaName = `psp_${psp_code.toLowerCase().replace(/-/g, '_')}`;
            
            // Check if schema exists
            const schemaCheck = await client.query(`
                SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1
            `, [schemaName]);
            
            if (schemaCheck.rows.length === 0) {
                return Response.json({ 
                    error: `Schema ${schemaName} does not exist` 
                }, { status: 400 });
            }

            // Set schema
            await client.query(`SET search_path TO "${schemaName}"`);

            // Create merchant_users table
            await client.query(`
                CREATE TABLE IF NOT EXISTS merchant_users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id VARCHAR(100) NOT NULL,
                    psp_code VARCHAR(50) NOT NULL,
                    merchant_id VARCHAR(100) NOT NULL,
                    merchant_code VARCHAR(100),
                    merchant_name VARCHAR(255),
                    email VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'operator',
                    status VARCHAR(50) DEFAULT 'pending',
                    phone VARCHAR(50),
                    temp_password VARCHAR(255),
                    password_hash VARCHAR(255),
                    must_change_password BOOLEAN DEFAULT true,
                    two_factor_enabled BOOLEAN DEFAULT false,
                    two_factor_secret VARCHAR(255),
                    permissions JSONB DEFAULT '[]',
                    allowed_terminals JSONB DEFAULT '[]',
                    last_login TIMESTAMP WITH TIME ZONE,
                    login_attempts INTEGER DEFAULT 0,
                    locked_until TIMESTAMP WITH TIME ZONE,
                    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(psp_code, email)
                )
            `);
            results.push('✅ merchant_users table created');

            // Create virtual_terminals table
            await client.query(`
                CREATE TABLE IF NOT EXISTS virtual_terminals (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    terminal_id VARCHAR(100) NOT NULL,
                    psp_code VARCHAR(50) NOT NULL,
                    merchant_id VARCHAR(100) NOT NULL,
                    merchant_name VARCHAR(255),
                    name VARCHAR(255) NOT NULL,
                    terminal_type VARCHAR(50) DEFAULT 'web',
                    api_key VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'active',
                    allowed_payment_methods JSONB DEFAULT '["visa", "mastercard"]',
                    allowed_currencies JSONB DEFAULT '["USD"]',
                    daily_limit DECIMAL(15,2) DEFAULT 10000,
                    per_transaction_limit DECIMAL(15,2) DEFAULT 1000,
                    requires_cvv BOOLEAN DEFAULT true,
                    requires_avs BOOLEAN DEFAULT true,
                    enable_3ds BOOLEAN DEFAULT true,
                    total_transactions INTEGER DEFAULT 0,
                    total_volume DECIMAL(15,2) DEFAULT 0,
                    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(psp_code, terminal_id)
                )
            `);
            results.push('✅ virtual_terminals table created');

            // Create virtual_terminal_users table
            await client.query(`
                CREATE TABLE IF NOT EXISTS virtual_terminal_users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    terminal_id VARCHAR(100) NOT NULL,
                    psp_code VARCHAR(50) NOT NULL,
                    merchant_id VARCHAR(100),
                    email VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'operator',
                    status VARCHAR(50) DEFAULT 'active',
                    temp_password VARCHAR(255),
                    password_hash VARCHAR(255),
                    must_change_password BOOLEAN DEFAULT true,
                    permissions JSONB DEFAULT '[]',
                    last_login TIMESTAMP WITH TIME ZONE,
                    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(psp_code, terminal_id, email)
                )
            `);
            results.push('✅ virtual_terminal_users table created');

            // Create psp_staff_users table if not exists
            await client.query(`
                CREATE TABLE IF NOT EXISTS psp_staff_users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id VARCHAR(100) NOT NULL,
                    psp_code VARCHAR(50) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'operator',
                    status VARCHAR(50) DEFAULT 'active',
                    temp_password VARCHAR(255),
                    password_hash VARCHAR(255),
                    must_change_password BOOLEAN DEFAULT false,
                    two_factor_enabled BOOLEAN DEFAULT false,
                    permissions JSONB DEFAULT '[]',
                    last_login TIMESTAMP WITH TIME ZONE,
                    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(psp_code, email)
                )
            `);
            results.push('✅ psp_staff_users table created');

            // List all tables in the schema
            const tables = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = $1
                ORDER BY table_name
            `, [schemaName]);

            return Response.json({
                success: true,
                schema: schemaName,
                results,
                existing_tables: tables.rows.map(r => r.table_name)
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Add missing tables error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});