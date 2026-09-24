Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        const {
            amount,
            currency = "CNY",
            payment_method = "alipay",
            merchant_id,
            simulate_delay = 90,
            simulate_success_rate = 97
        } = payload;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, simulate_delay));

        // Simulate success/failure based on rate
        const isSuccess = Math.random() * 100 < simulate_success_rate;

        if (isSuccess) {
            return Response.json({
                status: "success",
                gateway: "alipay",
                transaction_id: `ali_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount,
                currency,
                payment_method,
                merchant_id,
                auth_code: `ALI${Math.floor(Math.random() * 1000000)}`,
                response_code: "10000",
                response_message: "Alipay payment successful",
                timestamp: new Date().toISOString()
            });
        } else {
            const declineCodes = [
                { code: "20000", message: "Service unavailable" },
                { code: "40001", message: "Missing required parameters" },
                { code: "40002", message: "Invalid parameters" },
                { code: "40004", message: "Business processing failed" }
            ];
            const decline = declineCodes[Math.floor(Math.random() * declineCodes.length)];

            return Response.json({
                status: "declined",
                gateway: "alipay",
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