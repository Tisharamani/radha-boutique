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
          error: "Payment verification is not configured."
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

    // Verify Razorpay's signature.
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest();

    let receivedSignature;

    try {
      receivedSignature = Buffer.from(
        razorpay_signature,
        "hex"
      );
    } catch {
      receivedSignature = Buffer.alloc(0);
    }

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
          error: "Invalid payment signature."
        })
      };
    }

    // Retrieve payment details directly from Razorpay.
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(
        razorpay_payment_id
      )}`,
      {
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
          error: "Could not confirm payment status."
        })
      };
    }

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured"
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          verified: false,
          error: "Payment has not been confirmed as captured."
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        verified: true,
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        message: "Payment verified and captured."
      })
    };
  } catch (error) {
    console.error("Payment verification error:", error.message);

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        verified: false,
        error: "Unable to verify payment."
      })
    };
  }
};
