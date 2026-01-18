import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Test database by querying entities
        const psps = await base44.asServiceRole.entities.ProvisionedPSP.list();
        
        return Response.json({ 
            success: true,
            message: 'Database connection successful',
            psps: psps.length
        });

    } catch (error) {
        return Response.json({ 
            success: false, 
            error: error.message,
            details: error.toString()
        });
    }
});