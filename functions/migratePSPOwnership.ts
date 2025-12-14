import { Pool } from 'npm:pg@8.11.3';

const pool = new Pool({
    connectionString: Deno.env.get('DATABASE_URL'),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { action, psp_code, owner_email, visibility, template_source } = await req.json();

        const client = await pool.connect();
        
        try {
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
                await sql`
                    UPDATE psp_settings 
                    SET is_template = true, visibility = 'template', owner_email = 'tech@fts.money'
                    WHERE psp_code = ${psp_code}
                `;
                return Response.json({ success: true, message: 'PSP marked as template' });

            case 'setOwner':
                await sql`
                    UPDATE psp_settings 
                    SET owner_email = ${owner_email}, 
                        visibility = ${visibility || 'private'},
                        template_source = ${template_source}
                    WHERE psp_code = ${psp_code}
                `;
                return Response.json({ success: true, message: 'Ownership updated' });

            case 'listAll':
                const psps = await sql`
                    SELECT psp_code, company_name, owner_email, is_template, visibility, template_source 
                    FROM psp_settings
                `;
                return Response.json({ 
                    success: true, 
                    psps: psps.map(p => ({
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
                await sql`
                    UPDATE psp_settings 
                    SET is_template = true, visibility = 'template', owner_email = 'tech@fts.money'
                    WHERE psp_code = 'NETXHUB'
                `;

                // Get contact emails from psp_settings
                const allPsps = await sql`SELECT psp_code, company_name FROM psp_settings WHERE psp_code != 'NETXHUB'`;
                
                // Get corresponding emails from app_users table
                for (const psp of allPsps) {
                    const users = await sql`SELECT email FROM app_users WHERE psp_code = ${psp.psp_code} LIMIT 1`;
                    const ownerEmail = users.length > 0 ? users[0].email : 'unknown@fts.money';
                    
                    await sql`
                        UPDATE psp_settings 
                        SET is_template = false, 
                            visibility = 'private', 
                            owner_email = ${ownerEmail},
                            template_source = 'NETXHUB'
                        WHERE psp_code = ${psp.psp_code}
                    `;
                }

                return Response.json({ 
                    success: true, 
                    message: `Migrated ${allPsps.length + 1} PSPs`,
                    details: {
                        total: allPsps.length + 1,
                        template: 1,
                        instances: allPsps.length
                    }
                });

            default:
                return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Migration error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});