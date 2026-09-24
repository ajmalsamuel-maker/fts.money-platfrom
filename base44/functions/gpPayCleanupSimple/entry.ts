import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const psp_code = 'GP-PAY';

        // Delete from Base44
        console.log('🗑️ Deleting merchants from Base44 for PSP:', psp_code);
        let base44DeleteCount = 0;
        try {
            const merchants = await base44.asServiceRole.entities.Merchant.filter({ psp_code });
            console.log(`Found ${merchants.length} merchants to delete`);
            for (const merchant of merchants) {
                await base44.asServiceRole.entities.Merchant.delete(merchant.id);
                base44DeleteCount++;
            }
            console.log(`✅ Deleted ${base44DeleteCount} merchants from Base44`);
        } catch (e) {
            console.error('Base44 error:', e.message);
            return Response.json({ 
                error: 'Failed to delete from Base44', 
                details: e.message 
            }, { status: 500 });
        }

        return Response.json({
            success: true,
            message: `Cleanup complete for PSP: ${psp_code}`,
            deletedFromBase44: base44DeleteCount,
            note: 'PostgreSQL deletion skipped - use a separate tool for database operations'
        });

    } catch (error) {
        console.error('💥 Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});