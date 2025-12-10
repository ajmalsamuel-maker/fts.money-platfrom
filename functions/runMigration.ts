import postgres from 'npm:postgres@3.4.4';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    try {
        const { sql: migrationSql } = await req.json();

        if (!migrationSql) {
            return Response.json({ 
                success: false, 
                error: 'No SQL provided' 
            }, { status: 400 });
        }

        // Create connection
        const sql = postgres(Deno.env.get('DATABASE_URL'), {
            max: 1,
            ssl: 'require',
            connection: {
                application_name: 'migration'
            }
        });

        try {
            // Execute migration
            await sql.unsafe(migrationSql);
            
            return Response.json({ 
                success: true,
                message: 'Migration executed successfully'
            });
        } finally {
            await sql.end({ timeout: 5 });
        }

    } catch (error) {
        console.error('Migration error:', error);
        return Response.json({ 
            success: false, 
            error: error.message || 'Migration failed'
        }, { status: 200 });
    }
});