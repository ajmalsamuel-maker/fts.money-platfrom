import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { psp_code, step_id } = await req.json();
        
        const client = await pool.connect();
        try {
            const schemaName = `psp_${psp_code.toLowerCase()}`;
            
            // Validate different steps
            if (step_id === 'database') {
                // Check if schema exists
                const schemaCheck = await client.query(`
                    SELECT schema_name 
                    FROM information_schema.schemata 
                    WHERE schema_name = $1
                `, [schemaName]);
                
                if (schemaCheck.rows.length === 0) {
                    return Response.json({
                        success: false,
                        error: 'Database schema not created',
                        action: 'Create schema using provisionPSPSchema function'
                    });
                }
                
                // Check if app_users table exists
                const tableCheck = await client.query(`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = $1 AND table_name = 'app_users'
                `, [schemaName]);
                
                if (tableCheck.rows.length === 0) {
                    return Response.json({
                        success: false,
                        error: 'app_users table not found in schema',
                        action: 'Schema exists but tables not created properly'
                    });
                }
                
                return Response.json({
                    success: true,
                    message: 'Database schema and tables created successfully'
                });
            }
            
            if (step_id === 'api_keys') {
                // Check if PSP has API keys in technical_config
                const pspCheck = await client.query(`
                    SELECT data->'technical_config' as config
                    FROM public.app_entity_data
                    WHERE entity_name = 'ProvisionedPSP'
                    AND data->>'psp_code' = $1
                `, [psp_code]);
                
                if (pspCheck.rows.length === 0) {
                    return Response.json({
                        success: false,
                        error: 'PSP record not found in database',
                        action: 'Ensure PSP exists in database'
                    });
                }
                
                const config = pspCheck.rows[0]?.config;
                console.log('API Keys check - technical_config:', config);
                
                if (!config || !config.api_key || !config.webhook_secret) {
                    return Response.json({
                        success: false,
                        error: 'API keys not yet generated. Click Execute to generate.',
                        action: 'Generate API keys and webhook secrets'
                    });
                }
                
                return Response.json({
                    success: true,
                    message: `API keys exist: ${config.api_key.substring(0, 20)}...`
                });
            }
            
            if (step_id === 'domain') {
                const pspCheck = await client.query(`
                    SELECT data->>'subdomain' as subdomain, data->>'domain' as domain
                    FROM public.app_entity_data
                    WHERE entity_name = 'ProvisionedPSP'
                    AND data->>'psp_code' = $1
                `, [psp_code]);
                
                if (pspCheck.rows.length === 0) {
                    return Response.json({
                        success: false,
                        error: 'PSP record not found',
                        action: 'Ensure PSP exists in database'
                    });
                }
                
                const { subdomain } = pspCheck.rows[0];
                if (!subdomain) {
                    return Response.json({
                        success: false,
                        error: 'Domain/subdomain not configured',
                        action: 'Configure subdomain for PSP'
                    });
                }
                
                return Response.json({
                    success: true,
                    message: 'Domain configured successfully'
                });
            }
            
            if (step_id === 'security') {
                // Check if admin user exists in PSP schema
                const userCheck = await client.query(`
                    SELECT email 
                    FROM ${schemaName}.app_users 
                    WHERE role = 'admin'
                    LIMIT 1
                `);
                
                if (userCheck.rows.length === 0) {
                    return Response.json({
                        success: false,
                        error: 'No admin user created',
                        action: 'Create admin user for PSP'
                    });
                }
                
                return Response.json({
                    success: true,
                    message: 'Security configured successfully'
                });
            }
            
            if (step_id === 'initialization') {
                // Check overall PSP configuration
                const pspCheck = await client.query(`
                    SELECT data
                    FROM public.app_entity_data
                    WHERE entity_name = 'ProvisionedPSP'
                    AND data->>'psp_code' = $1
                `, [psp_code]);
                
                if (pspCheck.rows.length === 0) {
                    return Response.json({
                        success: false,
                        error: 'PSP record not found'
                    });
                }
                
                const psp = pspCheck.rows[0].data;
                const hasBasicConfig = psp.psp_name && psp.contact_email && psp.tier;
                
                if (!hasBasicConfig) {
                    return Response.json({
                        success: false,
                        error: 'Basic PSP configuration incomplete',
                        action: 'Complete PSP basic information'
                    });
                }
                
                return Response.json({
                    success: true,
                    message: 'Platform initialization complete'
                });
            }
            
            return Response.json({
                success: false,
                error: 'Unknown step ID'
            });
            
        } finally {
            client.release();
        }
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});