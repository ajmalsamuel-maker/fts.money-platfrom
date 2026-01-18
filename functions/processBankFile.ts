/**
 * Bank File Processor
 * Parses uploaded bank files (CSV, CAMT.053, ISO 20022)
 * Auto-detects format and extracts transaction data
 */
Deno.serve(async (req) => {
    try {
        const body = await req.json();
        const { file_content, file_name, batch_id } = body;

        console.log(`📄 Processing bank file: ${file_name}`);

        // Detect file format
        const format = detectFormat(file_name, file_content);
        console.log(`📋 Format detected: ${format}`);

        let items = [];

        // Parse based on format
        switch (format) {
            case 'csv':
                items = parseCSV(file_content);
                break;
            case 'camt053':
                items = parseCAMT053(file_content);
                break;
            case 'iso20022':
                items = parseISO20022(file_content);
                break;
            default:
                return Response.json({
                    success: false,
                    error: `Unknown file format: ${format}`
                }, { status: 400 });
        }

        console.log(`✓ Parsed ${items.length} items from file`);

        // Validate items
        const validItems = items.filter(item => {
            return item.reference && item.amount && item.date;
        });

        console.log(`✓ Validated ${validItems.length} items`);

        return Response.json({
            success: true,
            file_name,
            file_format: format,
            items_parsed: items.length,
            items_valid: validItems.length,
            batch_id,
            items: validItems,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Bank file processing error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});

function detectFormat(fileName, content) {
    const lower = fileName.toLowerCase();

    if (lower.endsWith('.csv')) return 'csv';
    if (lower.includes('camt053')) return 'camt053';
    if (lower.includes('iso20022')) return 'iso20022';

    // Attempt content-based detection
    if (content.includes('<?xml')) return 'camt053';
    if (content.includes('BkToCstmrStmt')) return 'camt053';
    if (content.includes(',')) return 'csv';

    return 'unknown';
}

function parseCSV(content) {
    const lines = content.split('\n');
    const items = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length < 4) continue;

        items.push({
            reference: parts[0]?.trim(),
            date: parts[1]?.trim(),
            amount: parseFloat(parts[2]),
            description: parts[3]?.trim()
        });
    }

    return items;
}

function parseCAMT053(content) {
    // Simplified CAMT.053 XML parsing
    const items = [];

    // Extract transaction elements
    const txnRegex = /<Ntry>[\s\S]*?<\/Ntry>/g;
    const matches = content.match(txnRegex) || [];

    for (const match of matches) {
        const ref = extractXMLValue(match, 'Ref');
        const date = extractXMLValue(match, 'BookgDt');
        const amount = parseFloat(extractXMLValue(match, 'Amt'));

        if (ref && date && amount) {
            items.push({
                reference: ref,
                date,
                amount
            });
        }
    }

    return items;
}

function parseISO20022(content) {
    // Simplified ISO 20022 parsing (similar to CAMT.053)
    const items = [];

    const txnRegex = /<Stmtln>[\s\S]*?<\/Stmtln>/g;
    const matches = content.match(txnRegex) || [];

    for (const match of matches) {
        const ref = extractXMLValue(match, 'Ref');
        const date = extractXMLValue(match, 'ValDt');
        const amount = parseFloat(extractXMLValue(match, 'Amt'));

        if (ref && date && amount) {
            items.push({
                reference: ref,
                date,
                amount
            });
        }
    }

    return items;
}

function extractXMLValue(xml, tag) {
    const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`);
    const match = xml.match(regex);
    return match ? match[1] : null;
}