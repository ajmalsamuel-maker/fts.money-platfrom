import { Pool } from 'npm:pg@8.11.3';

const pool = new Pool({
    connectionString: Deno.env.get('DATABASE_URL'),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    let client;
    
    try {
        const { action, psp_code, owner_email, visibility, template_source } = await req.json();

        client = await pool.connect();
        
        // Ensure columns exist
        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='psp_settings' AND column_name='owner_email') THEN
                    ALTER TABLE psp_settings ADD COLUMN owner_email TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='psp_settings' AND column_name='is_template') THEN
                    ALTER TABLE psp_settings ADD COLUMN is_template BOOLEAN DEFAULT false;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='psp_settings' AND column_name='visibility') THEN
                    ALTER TABLE psp_settings ADD COLUMN visibility TEXT DEFAULT 'private';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='psp_settings' AND column_name='template_source') THEN
                    ALTER TABLE psp_settings ADD COLUMN template_source TEXT;
                END IF;
            END $$;
        `);

        switch (action) {
            case 'markAsTemplate':
                await client.query(
                    'UPDATE psp_settings SET is_template = true, visibility = $1, owner_email = $2 WHERE psp_code = $3',
                    ['template', 'tech@fts.money', psp_code]
                );
                return Response.json({ success: true, message: 'PSP marked as template' });

            case 'setOwner':
                await client.query(
                    'UPDATE psp_settings SET owner_email = $1, visibility = $2, template_source = $3 WHERE psp_code = $4',
                    [owner_email, visibility || 'private', template_source, psp_code]
                );
                return Response.json({ success: true, message: 'Ownership updated' });

            case 'listAll':
                const pspsResult = await client.query(
                    'SELECT psp_code, company_name, owner_email, is_template, visibility, template_source FROM psp_settings'
                );
                return Response.json({ 
                    success: true, 
                    psps: pspsResult.rows.map(p => ({
                        psp_code: p.psp_code,
                        psp_name: p.company_name,
                        owner_email: p.owner_email || 'Not set',
                        is_template: p.is_template || false,
                        visibility: p.visibility || 'private',
                        template_source: p.template_source || null
                    }))
                });

            case 'migrateAll':
                // Mark NETXHUB as template
                await client.query(
                    'UPDATE psp_settings SET is_template = true, visibility = $1, owner_email = $2 WHERE psp_code = $3',
                    ['template', 'tech@fts.money', 'NETXHUB']
                );

                // Get all PSPs except NETXHUB
                const allPspsResult = await client.query(
                    'SELECT psp_code, company_name FROM psp_settings WHERE psp_code != $1',
                    ['NETXHUB']
                );
                
                // Get corresponding emails from app_users table
                for (const psp of allPspsResult.rows) {
                    const usersResult = await client.query(
                        'SELECT email FROM app_users WHERE psp_code = $1 LIMIT 1',
                        [psp.psp_code]
                    );
                    const ownerEmail = usersResult.rows.length > 0 ? usersResult.rows[0].email : 'unknown@fts.money';
                    
                    await client.query(
                        'UPDATE psp_settings SET is_template = false, visibility = $1, owner_email = $2, template_source = $3 WHERE psp_code = $4',
                        ['private', ownerEmail, 'NETXHUB', psp.psp_code]
                    );
                }

                return Response.json({ 
                    success: true, 
                    message: `Migrated ${allPspsResult.rows.length + 1} PSPs`,
                    details: {
                        total: allPspsResult.rows.length + 1,
                        template: 1,
                        instances: allPspsResult.rows.length
                    }
                });

            default:
                return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
        
    } catch (error) {
        console.error('Migration error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
});