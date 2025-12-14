import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, psp_code, owner_email, visibility, template_source } = await req.json();

        switch (action) {
            case 'markAsTemplate':
                await base44.asServiceRole.entities.ProvisionedPSP.update(psp_code, {
                    is_template: true,
                    visibility: 'template',
                    owner_email: 'tech@fts.money'
                });
                return Response.json({ success: true, message: 'PSP marked as template' });

            case 'setOwner':
                await base44.asServiceRole.entities.ProvisionedPSP.update(psp_code, {
                    owner_email,
                    visibility: visibility || 'private',
                    template_source: template_source || null
                });
                return Response.json({ success: true, message: 'Ownership updated' });

            case 'listAll':
                const psps = await base44.asServiceRole.entities.ProvisionedPSP.list();
                return Response.json({ 
                    success: true, 
                    psps: psps.map(p => ({
                        psp_code: p.psp_code,
                        psp_name: p.psp_name,
                        owner_email: p.owner_email || 'Not set',
                        is_template: p.is_template || false,
                        visibility: p.visibility || 'private',
                        template_source: p.template_source || null
                    }))
                });

            case 'migrateAll':
                // Get all PSPs
                const allPsps = await base44.asServiceRole.entities.ProvisionedPSP.list();
                
                // Mark NETXHUB as template
                const netxhub = allPsps.find(p => p.psp_code === 'NETXHUB');
                if (netxhub) {
                    await base44.asServiceRole.entities.ProvisionedPSP.update(netxhub.id, {
                        is_template: true,
                        visibility: 'template',
                        owner_email: 'tech@fts.money'
                    });
                }

                // Update all other PSPs
                for (const psp of allPsps) {
                    if (psp.psp_code !== 'NETXHUB') {
                        await base44.asServiceRole.entities.ProvisionedPSP.update(psp.id, {
                            is_template: false,
                            visibility: 'private',
                            owner_email: psp.contact_email || 'unknown@fts.money',
                            template_source: 'NETXHUB'
                        });
                    }
                }

                return Response.json({ 
                    success: true, 
                    message: `Migrated ${allPsps.length} PSPs`,
                    details: {
                        total: allPsps.length,
                        template: 1,
                        instances: allPsps.length - 1
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