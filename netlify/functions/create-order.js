const PRODUCT_PRICES = {
    1: 1690,
    2: 1690,
    3: 1690,
    4: 1690,
    5: 1690,
    6: 1690,
    7: 1690,
    8: 1499,
    9: 1690
};

exports.handler = async (event) => {
    const headers = {
        "Content-Type": "application/json"
    };

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }

    try {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: "Razorpay credentials are not configured."
                })
            };
        }

        const data = JSON.parse(event.body || "{}");
        const items = data.items;

        if (!Array.isArray(items) || items.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Your cart is empty." })
            };
        }

        let totalRupees = 0;

        for (const item of items) {
            const id = Number(item.id);
            const quantity = Number(item.quantity);

            if (
                !Number.isInteger(id) ||
                !Object.prototype.hasOwnProperty.call(PRODUCT_PRICES, id) ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 20
            ) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: "Invalid product or quantity."
                    })
                };
            }

            totalRupees += PRODUCT_PRICES[id] * quantity;
        }

        const amount = totalRupees * 100;

        if (amount < 100 || amount > 100000000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: "Order amount is outside the allowed range."
                })
            };
        }

        const response = await fetch(
            "https://api.razorpay.com/v1/orders",
            {
                method: "POST",
                headers: {
                    "Authorization": "Basic " +
                        Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: "INR",
                    receipt: "rb_" + Date.now(),
                    partial_payment: false
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error("Razorpay error:", response.status, result);

            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    error: "Razorpay could not create the order. Check your Razorpay account and keys."
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                orderId: result.id,
                amount: result.amount,
                currency: result.currency,
                keyId: keyId
            })
        };

    } catch (error) {
        console.error("Order creation error:", error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: "Server error while creating payment order."
            })
        };
    }
};