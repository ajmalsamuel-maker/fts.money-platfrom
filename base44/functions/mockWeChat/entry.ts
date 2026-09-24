Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        const {
            amount,
            currency = "CNY",
            payment_method = "wechat",
            merchant_id,
            simulate_delay = 95,
            simulate_success_rate = 96
        } = payload;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, simulate_delay));

        // Simulate success/failure based on rate
        const isSuccess = Math.random() * 100 < simulate_success_rate;

        if (isSuccess) {
            return Response.json({
                status: "success",
                gateway: "wechat",
                transaction_id: `wx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount,
                currency,
                payment_method,
                merchant_id,
                auth_code: `WX${Math.floor(Math.random() * 1000000)}`,
                response_code: "SUCCESS",
                response_message: "WeChat payment successful",
                timestamp: new Date().toISOString()
            });
        } else {
            const declineCodes = [
                { code: "SYSTEMERROR", message: "System error" },
                { code: "NOTENOUGH", message: "Insufficient balance" },
                { code: "ORDERPAID", message: "Order already paid" },
                { code: "ORDERCLOSED", message: "Order closed" }
            ];
            const decline = declineCodes[Math.floor(Math.random() * declineCodes.length)];

            return Response.json({
                status: "declined",
                gateway: "wechat",
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