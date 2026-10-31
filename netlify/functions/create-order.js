exports.handler = async (event) => {
  // Allow POST requests only
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    // Read Razorpay credentials from Netlify environment variables
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Razorpay credentials are not configured."
        })
      };
    }

    const data = JSON.parse(event.body || "{}");
    const amount = Number(data.amount);

    // Basic validation for testing
    if (
      !Number.isInteger(amount) ||
      amount < 100 ||
      amount > 1000000
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid amount" })
      };
    }

    // Create an order with Razorpay
    const response = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Authorization":
            "Basic " +
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
      console.error("Razorpay order creation failed:", response.status);

      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Unable to create payment order. Please try again."
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orderId: result.id,
        amount: result.amount,
        currency: result.currency,
        keyId: keyId
      })
    };
  } catch (error) {
    console.error("Order creation error:", error.message);

    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Unable to process the order."
      })
    };
  }
};