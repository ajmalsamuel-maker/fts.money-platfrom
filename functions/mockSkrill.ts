Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        const {
            amount,
            currency = "EUR",
            payment_method = "skrill",
            merchant_id,
            simulate_delay = 110,
            simulate_success_rate = 94
        } = payload;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, simulate_delay));

        // Simulate success/failure based on rate
        const isSuccess = Math.random() * 100 < simulate_success_rate;

        if (isSuccess) {
            return Response.json({
                status: "success",
                gateway: "skrill",
                transaction_id: `skr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount,
                currency,
                payment_method,
                merchant_id,
                auth_code: `SKR${Math.floor(Math.random() * 1000000)}`,
                response_code: "2",
                response_message: "Skrill payment processed",
                timestamp: new Date().toISOString()
            });
        } else {
            const declineCodes = [
                { code: "-1", message: "General error" },
                { code: "-2", message: "Transaction declined" },
                { code: "-3", message: "Invalid merchant" },
                { code: "-4", message: "Insufficient funds" }
            ];
            const decline = declineCodes[Math.floor(Math.random() * declineCodes.length)];

            return Response.json({
                status: "declined",
                gateway: "skrill",
                amount,
                currency,
                payment_method,
                merchant_id,
                response_code: decline.code,
                response_message: decline.message,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});