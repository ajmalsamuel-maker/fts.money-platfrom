Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        const {
            amount,
            currency = "USD",
            payment_method = "paypal",
            merchant_id,
            simulate_delay = 120,
            simulate_success_rate = 96
        } = payload;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, simulate_delay));

        // Simulate success/failure based on rate
        const isSuccess = Math.random() * 100 < simulate_success_rate;

        if (isSuccess) {
            return Response.json({
                status: "success",
                gateway: "paypal",
                transaction_id: `pp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount,
                currency,
                payment_method,
                merchant_id,
                auth_code: `PP${Math.floor(Math.random() * 1000000)}`,
                response_code: "00",
                response_message: "PayPal payment approved",
                timestamp: new Date().toISOString()
            });
        } else {
            const declineCodes = [
                { code: "01", message: "Insufficient funds" },
                { code: "05", message: "Do not honor" },
                { code: "51", message: "Account restricted" },
                { code: "61", message: "Exceeds withdrawal limit" }
            ];
            const decline = declineCodes[Math.floor(Math.random() * declineCodes.length)];

            return Response.json({
                status: "declined",
                gateway: "paypal",
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