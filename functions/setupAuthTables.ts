import pg from 'npm:pg@8.11.3';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action } = await req.json();

        if (action === 'setup') {
            // Create app_users table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS app_users (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT,
                    email TEXT UNIQUE NOT NULL,
                    full_name TEXT,
                    role TEXT DEFAULT 'viewer',
                    department TEXT,
                    status TEXT DEFAULT 'active',
                    password_hash TEXT,
                    must_change_password BOOLEAN DEFAULT false,
                    two_factor_enabled BOOLEAN DEFAULT false,
                    two_factor_method TEXT DEFAULT 'email',
                    last_login TIMESTAMP,
                    last_login_ip TEXT,
                    created_date TIMESTAMP DEFAULT NOW(),
                    updated_date TIMESTAMP DEFAULT NOW()
                )
            `);

            // Create merchant_users table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS merchant_users (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT,
                    merchant_id TEXT NOT NULL,
                    merchant_code TEXT NOT NULL,
                    merchant_name TEXT,
                    email TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    role TEXT DEFAULT 'viewer',
                    status TEXT DEFAULT 'pending',
                    permissions TEXT[],
                    allowed_terminals TEXT[],
                    phone TEXT,
                    last_login TIMESTAMP,
                    last_login_ip TEXT,
                    password_hash TEXT,
                    temp_password TEXT,
                    must_change_password BOOLEAN DEFAULT true,
                    two_factor_enabled BOOLEAN DEFAULT false,
                    created_date TIMESTAMP DEFAULT NOW(),
                    updated_date TIMESTAMP DEFAULT NOW(),
                    UNIQUE(email, merchant_code)
                )
            `);

            // Create psp_settings table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS psp_settings (
                    id SERIAL PRIMARY KEY,
                    company_name TEXT,
                    psp_code TEXT,
                    legal_name TEXT,
                    registration_number TEXT,
                    vat_number TEXT,
                    license_number TEXT,
                    licensing_authority TEXT,
                    address_line1 TEXT,
                    address_line2 TEXT,
                    city TEXT,
                    state TEXT,
                    postal_code TEXT,
                    country TEXT,
                    phone TEXT,
                    email TEXT,
                    website TEXT,
                    support_email TEXT,
                    support_phone TEXT,
                    timezone TEXT DEFAULT 'UTC',
                    base_currency TEXT DEFAULT 'USD',
                    allow_psp_code_login BOOLEAN DEFAULT true,
                    password_reset_enabled BOOLEAN DEFAULT true,
                    created_date TIMESTAMP DEFAULT NOW(),
                    updated_date TIMESTAMP DEFAULT NOW()
                )
            `);

            // Create theme_settings table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS theme_settings (
                    id SERIAL PRIMARY KEY,
                    company_name TEXT,
                    logo_url TEXT,
                    primary_color TEXT DEFAULT '#3b82f6',
                    secondary_color TEXT DEFAULT '#06b6d4',
                    accent_color TEXT DEFAULT '#8b5cf6',
                    sidebar_bg TEXT DEFAULT '#0f172a',
                    sidebar_text TEXT DEFAULT '#94a3b8',
                    created_date TIMESTAMP DEFAULT NOW(),
                    updated_date TIMESTAMP DEFAULT NOW()
                )
            `);

            return Response.json({
                success: true,
                message: 'Database tables created successfully'
            });
        }

        if (action === 'migrate') {
            let migrated = {
                app_users: 0,
                merchant_users: 0,
                psp_settings: 0,
                theme_settings: 0
            };

            // Migrate AppUser entities
            const appUsers = await base44.asServiceRole.entities.AppUser.list();
            for (const user of appUsers) {
                await pool.query(`
                    INSERT INTO app_users (user_id, email, full_name, role, department, status, password_hash, 
                                          must_change_password, two_factor_enabled, two_factor_method, 
                                          last_login, last_login_ip, created_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    ON CONFLICT (email) DO UPDATE SET
                        full_name = EXCLUDED.full_name,
                        role = EXCLUDED.role,
                        department = EXCLUDED.department,
                        status = EXCLUDED.status,
                        updated_date = NOW()
                `, [
                    user.user_id || user.id,
                    user.email,
                    user.full_name,
                    user.role || 'viewer',
                    user.department,
                    user.status || 'active',
                    user.password_hash,
                    user.must_change_password || false,
                    user.two_factor_enabled || false,
                    user.two_factor_method || 'email',
                    user.last_login,
                    user.last_login_ip,
                    user.created_date || new Date().toISOString()
                ]);
                migrated.app_users++;
            }

            // Migrate MerchantUser entities
            const merchantUsers = await base44.asServiceRole.entities.MerchantUser.list();
            for (const user of merchantUsers) {
                await pool.query(`
                    INSERT INTO merchant_users (user_id, merchant_id, merchant_code, merchant_name, email, 
                                               full_name, role, status, permissions, allowed_terminals, phone,
                                               last_login, last_login_ip, password_hash, temp_password,
                                               must_change_password, two_factor_enabled, created_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                    ON CONFLICT (email, merchant_code) DO UPDATE SET
                        full_name = EXCLUDED.full_name,
                        role = EXCLUDED.role,
                        status = EXCLUDED.status,
                        updated_date = NOW()
                `, [
                    user.user_id || user.id,
                    user.merchant_id,
                    user.merchant_code,
                    user.merchant_name,
                    user.email,
                    user.full_name,
                    user.role || 'viewer',
                    user.status || 'pending',
                    user.permissions || [],
                    user.allowed_terminals || [],
                    user.phone,
                    user.last_login,
                    user.last_login_ip,
                    user.password_hash,
                    user.temp_password,
                    user.must_change_password !== false,
                    user.two_factor_enabled || false,
                    user.created_date || new Date().toISOString()
                ]);
                migrated.merchant_users++;
            }

            // Migrate PSPSettings
            const pspSettings = await base44.asServiceRole.entities.PSPSettings.list();
            if (pspSettings && pspSettings.length > 0) {
                const settings = pspSettings[0];
                await pool.query(`
                    INSERT INTO psp_settings (company_name, psp_code, legal_name, registration_number, vat_number,
                                            license_number, licensing_authority, address_line1, address_line2,
                                            city, state, postal_code, country, phone, email, website,
                                            support_email, support_phone, timezone, base_currency,
                                            allow_psp_code_login, password_reset_enabled)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
                    ON CONFLICT DO NOTHING
                `, [
                    settings.company_name, settings.psp_code, settings.legal_name, settings.registration_number,
                    settings.vat_number, settings.license_number, settings.licensing_authority,
                    settings.address_line1, settings.address_line2, settings.city, settings.state,
                    settings.postal_code, settings.country, settings.phone, settings.email, settings.website,
                    settings.support_email, settings.support_phone, settings.timezone || 'UTC',
                    settings.base_currency || 'USD', settings.allow_psp_code_login !== false,
                    settings.password_reset_enabled !== false
                ]);
                migrated.psp_settings = 1;
            }

            // Migrate ThemeSettings
            const themeSettings = await base44.asServiceRole.entities.ThemeSettings.list();
            if (themeSettings && themeSettings.length > 0) {
                const theme = themeSettings[0];
                await pool.query(`
                    INSERT INTO theme_settings (company_name, logo_url, primary_color, secondary_color, accent_color,
                                              sidebar_bg, sidebar_text)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT DO NOTHING
                `, [
                    theme.company_name, theme.logo_url, theme.primary_color || '#3b82f6',
                    theme.secondary_color || '#06b6d4', theme.accent_color || '#8b5cf6',
                    theme.sidebar_bg || '#0f172a', theme.sidebar_text || '#94a3b8'
                ]);
                migrated.theme_settings = 1;
            }

            return Response.json({
                success: true,
                message: 'Data migrated successfully',
                migrated
            });
        }

        return Response.json({
            success: false,
            error: 'Invalid action. Use "setup" or "migrate"'
        }, { status: 400 });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});