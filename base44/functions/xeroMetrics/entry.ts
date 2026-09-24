import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0';
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';

async function getValidToken(base44, psp_id) {
    const settings = await base44.asServiceRole.entities.PSPSettings.filter({ psp_id });
    if (!settings.length || !settings[0].xero_config) {
        throw new Error('Xero not connected');
    }

    let { access_token, refresh_token, expires_at, tenant_id } = settings[0].xero_config;

    // Refresh if expired
    if (new Date(expires_at) < new Date()) {
        const clientId = Deno.env.get('XERO_CLIENT_ID');
        const clientSecret = Deno.env.get('XERO_CLIENT_SECRET');

        const refreshResponse = await fetch(XERO_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            })
        });

        const tokens = await refreshResponse.json();
        access_token = tokens.access_token;

        // Update stored tokens
        const xeroConfig = settings[0].xero_config;
        xeroConfig.access_token = tokens.access_token;
        xeroConfig.refresh_token = tokens.refresh_token;
        xeroConfig.expires_at = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
        await base44.asServiceRole.entities.PSPSettings.update(settings[0].id, {
            xero_config: xeroConfig
        });
    }

    return { access_token, tenant_id };
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { psp_id, date_from, date_to } = await req.json();
        const { access_token, tenant_id } = await getValidToken(base44, psp_id);

        const headers = {
            'Authorization': `Bearer ${access_token}`,
            'xero-tenant-id': tenant_id,
            'Accept': 'application/json'
        };

        // Fetch invoices
        let invoiceUrl = `${XERO_API_BASE}/Invoices?summaryOnly=false`;
        if (date_from) {
            invoiceUrl += `&where=Date>=DateTime(${date_from})`;
            if (date_to) {
                invoiceUrl += ` AND Date<=DateTime(${date_to})`;
            }
        }

        const invoicesResponse = await fetch(invoiceUrl, { headers });
        const invoicesData = await invoicesResponse.json();
        const invoices = invoicesData.Invoices || [];

        // Calculate metrics
        const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.Total || 0), 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + (inv.AmountPaid || 0), 0);
        const outstandingBalance = invoices.reduce((sum, inv) => sum + (inv.AmountDue || 0), 0);
        const overdueInvoices = invoices.filter(inv => 
            inv.AmountDue > 0 && new Date(inv.DueDate) < new Date()
        ).length;

        // Fetch contacts
        const contactsResponse = await fetch(`${XERO_API_BASE}/Contacts`, { headers });
        const contactsData = await contactsResponse.json();
        const contacts = contactsData.Contacts || [];

        // Fetch bank transactions
        let bankUrl = `${XERO_API_BASE}/BankTransactions`;
        if (date_from) {
            bankUrl += `?where=Date>=DateTime(${date_from})`;
            if (date_to) {
                bankUrl += ` AND Date<=DateTime(${date_to})`;
            }
        }

        const bankResponse = await fetch(bankUrl, { headers });
        const bankData = await bankResponse.json();
        const bankTransactions = bankData.BankTransactions || [];

        // Calculate revenue/expenses
        const revenue = bankTransactions
            .filter(t => t.Type === 'RECEIVE')
            .reduce((sum, t) => sum + (t.Total || 0), 0);
        const expenses = bankTransactions
            .filter(t => t.Type === 'SPEND')
            .reduce((sum, t) => sum + Math.abs(t.Total || 0), 0);

        // Fetch organisation info
        const orgResponse = await fetch(`${XERO_API_BASE}/Organisation`, { headers });
        const orgData = await orgResponse.json();
        const organisation = orgData.Organisations?.[0];

        // Invoice status breakdown
        const invoicesByStatus = {
            draft: invoices.filter(i => i.Status === 'DRAFT').length,
            submitted: invoices.filter(i => i.Status === 'SUBMITTED').length,
            authorised: invoices.filter(i => i.Status === 'AUTHORISED').length,
            paid: invoices.filter(i => i.Status === 'PAID').length,
            voided: invoices.filter(i => i.Status === 'VOIDED').length
        };

        // Recent invoices
        const recentInvoices = invoices
            .sort((a, b) => new Date(b.Date) - new Date(a.Date))
            .slice(0, 10)
            .map(inv => ({
                id: inv.InvoiceID,
                number: inv.InvoiceNumber,
                contact: inv.Contact?.Name,
                date: inv.Date,
                due_date: inv.DueDate,
                total: inv.Total,
                amount_paid: inv.AmountPaid,
                amount_due: inv.AmountDue,
                status: inv.Status
            }));

        return Response.json({
            success: true,
            metrics: {
                total_invoiced: totalInvoiced,
                total_paid: totalPaid,
                outstanding_balance: outstandingBalance,
                overdue_invoices: overdueInvoices,
                total_contacts: contacts.length,
                total_invoices: invoices.length,
                revenue: revenue,
                expenses: expenses,
                net_profit: revenue - expenses
            },
            invoices_by_status: invoicesByStatus,
            recent_invoices: recentInvoices,
            organisation: {
                name: organisation?.Name,
                currency: organisation?.BaseCurrency,
                financial_year_end: organisation?.FinancialYearEndMonth
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});