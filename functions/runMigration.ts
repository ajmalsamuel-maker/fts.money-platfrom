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

    let sql;
    try {
        const { sql: migrationSql } = await req.json();

        if (!migrationSql) {
            return Response.json({ 
                success: false, 
                error: 'No SQL provided' 
            }, { status: 400 });
        }

        // Create connection
        sql = postgres(Deno.env.get('DATABASE_URL'));

        // Split into individual statements and execute
        const statements = migrationSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            await sql.unsafe(statement);
        }

        await sql.end();

        return Response.json({ 
            success: true,
            message: 'Migration executed successfully'
        });

    } catch (error) {
        console.error('Migration error:', error);
        if (sql) {
            try { await sql.end(); } catch (e) {}
        }
        return Response.json({ 
            success: false, 
            error: error.message || 'Migration failed'
        }, { status: 200 });
    }
});