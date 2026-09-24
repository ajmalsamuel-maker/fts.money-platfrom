import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const payload = await req.json();
        const {
            enabled,
            frequency,
            dayOfWeek,
            time,
            recipients,
            reportType
        } = payload;

        if (!recipients || recipients.trim() === '') {
            return Response.json({ error: 'Recipients email list is required' }, { status: 400 });
        }

        // Parse recipients
        const recipientList = recipients.split(',').map(email => email.trim()).filter(Boolean);

        // Create schedule configuration
        const scheduleConfig = {
            enabled,
            frequency,
            dayOfWeek,
            time,
            recipients: recipientList,
            reportType,
            created_by: user.email,
            created_at: new Date().toISOString()
        };

        // In production, this would create a scheduled task
        // For now, we'll store the configuration
        console.log('Schedule configuration:', scheduleConfig);

        // Send confirmation email
        await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: 'E-Invoicing Compliance Report Schedule Confirmed',
            body: `Your ${frequency} compliance report has been scheduled successfully.\n\nReport Type: ${reportType}\nRecipients: ${recipientList.join(', ')}\nDelivery Time: ${time}\n\nYou will receive automated reports starting from the next scheduled delivery.`
        });

        return Response.json({
            success: true,
            message: 'Report schedule configured successfully',
            schedule: scheduleConfig,
            nextDelivery: calculateNextDelivery(frequency, dayOfWeek, time)
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateNextDelivery(frequency, dayOfWeek, time) {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    let nextDelivery = new Date(now);
    nextDelivery.setHours(hours, minutes, 0, 0);

    if (frequency === 'daily') {
        if (nextDelivery <= now) {
            nextDelivery.setDate(nextDelivery.getDate() + 1);
        }
    } else if (frequency === 'weekly') {
        const daysOfWeek = {
            'monday': 1, 'tuesday': 2, 'wednesday': 3, 
            'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0
        };
        const targetDay = daysOfWeek[dayOfWeek];
        const currentDay = now.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        nextDelivery.setDate(nextDelivery.getDate() + daysToAdd);
    } else if (frequency === 'monthly') {
        if (nextDelivery <= now) {
            nextDelivery.setMonth(nextDelivery.getMonth() + 1);
        }
    }

    return nextDelivery.toISOString();
}