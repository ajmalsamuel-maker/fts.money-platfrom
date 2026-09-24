// Fetch real-time crypto prices from CoinGecko API (free tier, no API key needed)

Deno.serve(async (req) => {
    try {
        const { symbols } = await req.json();
        
        if (!symbols || !Array.isArray(symbols)) {
            return Response.json({ error: 'symbols array required' }, { status: 400 });
        }

        // CoinGecko API - Free tier
        const symbolsLower = symbols.map(s => s.toLowerCase()).join(',');
        
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${symbolsLower}&vs_currencies=usd,eur,gbp&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            return Response.json({ error: 'Failed to fetch crypto prices' }, { status: response.status });
        }

        const data = await response.json();

        return Response.json({ 
            success: true,
            prices: data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});