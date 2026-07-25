import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        error: "Method not allowed",
      }),
    };
  }

  try {
    const transactionId =
      event.queryStringParameters
        ?.transaction;

    if (!transactionId) {
      return {
        statusCode: 400,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          error:
            "Missing transaction ID",
        }),
      };
    }

    const {
      data: purchase,
      error,
    } = await supabase
      .from("paddle_purchases")
      .select(
        "transaction_id, status, products, created_at"
      )
      .eq(
        "transaction_id",
        transactionId
      )
      .eq(
        "status",
        "completed"
      )
      .maybeSingle();

    if (error) {
      console.error(
        "Supabase purchase lookup error:",
        error
      );

      return {
        statusCode: 500,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          error:
            "Failed to verify purchase",
        }),
      };
    }

    if (!purchase) {
      return {
        statusCode: 404,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          error:
            "Purchase not found or payment has not been confirmed yet.",
        }),
      };
    }

    return {
      statusCode: 200,

      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },

      body: JSON.stringify({
        success: true,

        transactionId:
          purchase.transaction_id,

        products:
          purchase.products || [],
      }),
    };
  } catch (error) {
    console.error(
      "Get Paddle purchase error:",
      error
    );

    return {
      statusCode: 500,

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        error:
          error.message ||
          "Internal server error",
      }),
    };
  }
};