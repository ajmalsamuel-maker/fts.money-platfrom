import postgres from 'npm:postgres@3.4.4';

const sql = postgres(Deno.env.get('DATABASE_URL'));

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

        // Execute the migration SQL
        await sql.unsafe(migrationSql);

        return Response.json({ 
            success: true,
            message: 'Migration executed successfully'
        });

    } catch (error) {
        console.error('Migration error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});