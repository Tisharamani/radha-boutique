const crypto = require("crypto");

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
                    verified: false,
                    error: "Razorpay credentials are not configured."
                })
            };
        }

        const data = JSON.parse(event.body || "{}");

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = data;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    verified: false,
                    error: "Missing payment details."
                })
            };
        }

        // Verify payment signature.
        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest();

        if (!/^[a-f0-9]{64}$/i.test(razorpay_signature)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    verified: false,
                    error: "Invalid payment signature."
                })
            };
        }

        const receivedSignature = Buffer.from(
            razorpay_signature,
            "hex"
        );

        if (
            receivedSignature.length !== expectedSignature.length ||
            !crypto.timingSafeEqual(
                expectedSignature,
                receivedSignature
            )
        ) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    verified: false,
                    error: "Payment signature does not match."
                })
            };
        }

        // Fetch payment details from Razorpay.
        const response = await fetch(
            `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`,
            {
                method: "GET",
                headers: {
                    Authorization:
                        "Basic " +
                        Buffer.from(`${keyId}:${keySecret}`).toString("base64")
                }
            }
        );

        const payment = await response.json();

        if (!response.ok) {
            console.error("Razorpay payment lookup failed:", response.status);

            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    verified: false,
                    error: "Unable to confirm payment with Razorpay."
                })
            };
        }

        // Check order ID and captured status.
        if (
            payment.order_id !== razorpay_order_id ||
            payment.status !== "captured"
        ) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    verified: false,
                    error: "Payment is not captured or order does not match."
                })
            };
        }

        // Return verified payment details.
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                verified: true,
                paymentId: payment.id,
                orderId: payment.order_id,
                amount: payment.amount,
                currency: payment.currency,
                message: "Payment verified successfully."
            })
        };

    } catch (error) {
        console.error("Payment verification error:", error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                verified: false,
                error: "Server error while verifying payment."
            })
        };
    }
};