import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { method } = req;

        if (method === 'GET') {
            // Get PSP and theme settings
            const [pspSettings, themeSettings] = await Promise.all([
                base44.asServiceRole.entities.PSPSettings.list(),
                base44.asServiceRole.entities.ThemeSettings.list()
            ]);

            return Response.json({
                pspSettings: pspSettings && pspSettings.length > 0 ? pspSettings[0] : null,
                themeSettings: themeSettings && themeSettings.length > 0 ? themeSettings[0] : null
            });
        }

        if (method === 'POST') {
            // Create support ticket
            const body = await req.json();
            
            const newTicketId = `TKT-${Date.now()}`;
            const ticket = await base44.asServiceRole.entities.SupportTicket.create({
                ...body,
                ticket_id: newTicketId,
                status: 'open'
            });

            return Response.json({ success: true, ticketId: newTicketId });
        }

        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    } catch (error) {
        console.error('Public support error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});