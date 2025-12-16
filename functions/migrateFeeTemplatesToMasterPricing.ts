import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all existing fee templates
        const feeTemplates = await base44.asServiceRole.entities.FeeType.list();
        const existingMasterPricing = await base44.asServiceRole.entities.MasterPricing.list();

        // Check which fees are already migrated
        const migratedFeeIds = existingMasterPricing
            .filter(item => item.source_ref === 'fee_template')
            .map(item => item.source_id);

        const feesToMigrate = feeTemplates.filter(fee => !migratedFeeIds.includes(fee.id));

        const migratedItems = [];
        const errors = [];

        for (const fee of feesToMigrate) {
            try {
                const masterPricingItem = {
                    item_id: fee.fee_code || `FEE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    category: 'platform_fee',
                    item_name: fee.fee_name,
                    item_description: fee.description,
                    buy_rate_type: fee.percentage_amount > 0 && fee.fixed_amount > 0 ? 'hybrid' : 
                                   fee.percentage_amount > 0 ? 'percentage' : 'fixed',
                    buy_rate_percentage: fee.percentage_amount || 0,
                    buy_rate_fixed: fee.fixed_amount || 0,
                    sell_rate_type: fee.percentage_amount > 0 && fee.fixed_amount > 0 ? 'hybrid' : 
                                    fee.percentage_amount > 0 ? 'percentage' : 'fixed',
                    sell_rate_percentage: fee.percentage_amount || 0,
                    sell_rate_fixed: fee.fixed_amount || 0,
                    minimum_charge: fee.min_amount,
                    maximum_charge: fee.max_amount,
                    status: fee.status || 'active',
                    currency: fee.currency || 'USD',
                    source_ref: 'fee_template',
                    source_id: fee.id,
                    notes: `Migrated from FeeType: ${fee.fee_name}`,
                    created_date: fee.created_date
                };

                const created = await base44.asServiceRole.entities.MasterPricing.create(masterPricingItem);
                migratedItems.push(created);
            } catch (error) {
                errors.push({ fee: fee.fee_name, error: error.message });
            }
        }

        return Response.json({
            success: true,
            migrated: migratedItems.length,
            total: feeTemplates.length,
            alreadyMigrated: migratedFeeIds.length,
            errors: errors.length > 0 ? errors : undefined,
            message: `Successfully migrated ${migratedItems.length} fee templates to Master Pricing`
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});