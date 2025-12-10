import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Simulated ISO version checking
// In production, this would call official ISO registries or maintain version database

const LATEST_VERSIONS = {
    iso20022: '2024.1',
    iso8583: '2003',
    iso4217: '2025-05',
    iso3166: '2025',
    iso9362: '2022',
    iso13616: '2020',
    iso27001: '2022',
    iso23257: '2022',
    iso24165: '2021'
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { standards } = await req.json();

        // Check each standard for updates
        const updates = standards.map(std => {
            const latestVersion = LATEST_VERSIONS[std.id];
            return {
                id: std.id,
                currentVersion: std.version,
                newVersion: latestVersion || std.version,
                updateAvailable: latestVersion && latestVersion !== std.version
            };
        });

        // Log the check
        await base44.asServiceRole.entities.AuditLog.create({
            user_id: user.id,
            action: 'iso_standards_check',
            entity_type: 'ISO_Standards',
            details: {
                standards_checked: standards.length,
                updates_available: updates.filter(u => u.updateAvailable).length
            }
        });

        return Response.json({
            success: true,
            updates,
            checkedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error checking ISO updates:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});