import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        // First, ensure columns exist
        await pool.query(`
            DO $$ 
            BEGIN
                BEGIN
                    ALTER TABLE provisioned_psps ADD COLUMN owner_email TEXT;
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
                BEGIN
                    ALTER TABLE provisioned_psps ADD COLUMN is_template BOOLEAN DEFAULT false;
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
                BEGIN
                    ALTER TABLE provisioned_psps ADD COLUMN visibility TEXT DEFAULT 'private';
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
                BEGIN
                    ALTER TABLE provisioned_psps ADD COLUMN template_source TEXT;
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
            END $$;
        `);

        const { action, psp_code, owner_email } = await req.json();

        if (action === 'markAsTemplate') {
            // Mark NETXHUB as a template
            const result = await pool.query(`
                UPDATE provisioned_psps 
                SET is_template = true, 
                    visibility = 'template'
                WHERE UPPER(psp_code) = UPPER($1)
                RETURNING *
            `, [psp_code]);

            return Response.json({
                success: true,
                message: `${psp_code} marked as template`,
                psp: result.rows[0]
            });
        }

        if (action === 'setOwner') {
            // Set owner for a PSP
            const result = await pool.query(`
                UPDATE provisioned_psps 
                SET owner_email = $1,
                    is_template = false,
                    visibility = 'private'
                WHERE UPPER(psp_code) = UPPER($2)
                RETURNING *
            `, [owner_email, psp_code]);

            return Response.json({
                success: true,
                message: `Owner set for ${psp_code}`,
                psp: result.rows[0]
            });
        }

        if (action === 'listAll') {
            // List all PSPs with their ownership status
            const result = await pool.query(`
                SELECT 
                    id,
                    psp_code, 
                    psp_name, 
                    owner_email,
                    is_template,
                    visibility,
                    created_date
                FROM provisioned_psps 
                ORDER BY created_date DESC
            `);

            return Response.json({
                success: true,
                psps: result.rows
            });
        }

        if (action === 'migrateAll') {
            // Automatically migrate existing PSPs:
            // 1. Mark NETXHUB as template
            // 2. Set owner for all other PSPs based on contact_email
            
            await pool.query(`
                UPDATE provisioned_psps 
                SET is_template = true, 
                    visibility = 'template'
                WHERE UPPER(psp_code) = 'NETXHUB'
            `);

            await pool.query(`
                UPDATE provisioned_psps 
                SET owner_email = contact_email,
                    is_template = false,
                    visibility = 'private'
                WHERE UPPER(psp_code) != 'NETXHUB'
                AND owner_email IS NULL
            `);

            const result = await pool.query(`
                SELECT 
                    psp_code, 
                    psp_name, 
                    owner_email,
                    is_template,
                    visibility
                FROM provisioned_psps 
                ORDER BY psp_code
            `);

            return Response.json({
                success: true,
                message: 'Migration completed',
                psps: result.rows
            });
        }

        return Response.json({
            success: false,
            error: 'Invalid action. Use: markAsTemplate, setOwner, listAll, or migrateAll'
        }, { status: 400 });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});