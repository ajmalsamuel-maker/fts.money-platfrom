import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUrl = Deno.env.get('DATABASE_URL');
        
        return Response.json({
            success: true,
            hasDatabaseUrl: !!dbUrl,
            databaseUrlLength: dbUrl ? dbUrl.length : 0,
            message: dbUrl ? 'DATABASE_URL is accessible' : 'DATABASE_URL not found'
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});