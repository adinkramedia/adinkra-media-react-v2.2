export const handler = async (event) => {
  /*
   * This function verifies a Paddle transaction
   * directly with Paddle.
   *
   * Supabase is NOT used here.
   *
   * The transaction ID comes from the URL:
   *
   * /downloads?transaction=txn_xxxxx
   *
   * Paddle is the source of truth for the purchase.
   */

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,

      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },

      body: JSON.stringify({
        error: "Method not allowed",
      }),
    };
  }

  try {
    /*
     * Get Paddle transaction ID
     * from the query string.
     */
    const transactionId =
      event.queryStringParameters?.transaction;

    if (
      typeof transactionId !== "string" ||
      !transactionId.trim()
    ) {
      return {
        statusCode: 400,

        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },

        body: JSON.stringify({
          error: "Missing transaction ID",
        }),
      };
    }

    const cleanTransactionId =
      transactionId.trim();

    /*
     * Paddle API key.
     *
     * This must be the same Paddle API key
     * used by create-paddle-transaction.js.
     */
    const paddleApiKey =
      process.env.PADDLE_API_KEY;

    if (
      typeof paddleApiKey !== "string" ||
      !paddleApiKey.trim()
    ) {
      console.error(
        "PADDLE_API_KEY is missing."
      );

      return {
        statusCode: 500,

        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },

        body: JSON.stringify({
          error:
            "Paddle API key is not configured.",
        }),
      };
    }

    /*
     * Retrieve the transaction directly
     * from Paddle.
     *
     * IMPORTANT:
     *
     * Your current create-paddle-transaction.js
     * uses the Paddle Sandbox API.
     *
     * Therefore this function also uses:
     *
     * https://sandbox-api.paddle.com
     */
    const paddleResponse =
      await fetch(
        `https://sandbox-api.paddle.com/transactions/${encodeURIComponent(
          cleanTransactionId
        )}`,

        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${paddleApiKey}`,

            Accept:
              "application/json",
          },
        }
      );

    /*
     * Read Paddle response.
     */
    const paddleData =
      await paddleResponse.json();

    console.log(
      "Paddle transaction lookup status:",
      paddleResponse.status
    );

    /*
     * Paddle transaction lookup failed.
     */
    if (!paddleResponse.ok) {
      console.error(
        "Paddle transaction lookup failed:",
        paddleData
      );

      return {
        statusCode:
          paddleResponse.status === 404
            ? 404
            : 500,

        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },

        body: JSON.stringify({
          error:
            paddleResponse.status === 404
              ? "Paddle transaction not found."
              : "Unable to verify Paddle transaction.",

          transactionId:
            cleanTransactionId,
        }),
      };
    }

    /*
     * Paddle returns the transaction
     * inside data.
     */
    const transaction =
      paddleData?.data;

    if (!transaction) {
      console.error(
        "Paddle returned no transaction data:",
        paddleData
      );

      return {
        statusCode: 500,

        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },

        body: JSON.stringify({
          error:
            "Paddle returned an invalid transaction response.",

          transactionId:
            cleanTransactionId,
        }),
      };
    }

    console.log(
      "Paddle transaction retrieved:",
      transaction.id
    );

    console.log(
      "Paddle transaction status:",
      transaction.status
    );

    /*
     * Only completed transactions
     * are allowed to access downloads.
     *
     * This is the critical payment check.
     */
    if (
      transaction.status !==
      "completed"
    ) {
      console.warn(
        "Transaction is not completed:",
        {
          transactionId:
            transaction.id,

          status:
            transaction.status,
        }
      );

      return {
        statusCode: 403,

        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },

        body: JSON.stringify({
          error:
            "This payment has not been completed yet.",

          transactionId:
            transaction.id,

          status:
            transaction.status,
        }),
      };
    }

    /*
     * Read the custom data that was attached
     * when create-paddle-transaction.js
     * created the Paddle transaction.
     *
     * Your transaction creation function
     * stores:
     *
     * custom_data: {
     *   source: "adinkra_media",
     *   products: [...]
     * }
     */
    const customData =
      transaction.custom_data || {};

    /*
     * Make sure this transaction belongs
     * to Adinkra Media.
     */
    if (
      customData.source !==
      "adinkra_media"
    ) {
      console.error(
        "Transaction does not belong to Adinkra Media:",
        {
          transactionId:
            transaction.id,

          source:
            customData.source,
        }
      );

      return {
        statusCode: 403,

        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },

        body: JSON.stringify({
          error:
            "This transaction is not a valid Adinkra Media purchase.",

          transactionId:
            transaction.id,
        }),
      };
    }

    /*
     * Get products stored in Paddle custom_data.
     */
    const products =
      Array.isArray(
        customData.products
      )
        ? customData.products
        : [];

    /*
     * A completed Adinkra Media transaction
     * must contain product information.
     */
    if (
      products.length === 0
    ) {
      console.error(
        "Completed Paddle transaction contains no products:",
        {
          transactionId:
            transaction.id,

          customData,
        }
      );

      return {
        statusCode: 500,

        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },

        body: JSON.stringify({
          error:
            "Payment was completed, but no purchased products were found for this transaction.",

          transactionId:
            transaction.id,
        }),
      };
    }

    /*
     * Validate that the products contain
     * usable Sanity slugs.
     *
     * Downloads.jsx uses these slugs
     * to retrieve the actual files from Sanity.
     */
    const validProducts =
      products.filter(
        (product) =>
          product &&
          typeof product.slug ===
            "string" &&
          product.slug.trim()
      );

    if (
      validProducts.length === 0
    ) {
      console.error(
        "Completed transaction contains products but no valid Sanity slugs:",
        {
          transactionId:
            transaction.id,

          products,
        }
      );

      return {
        statusCode: 500,

        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },

        body: JSON.stringify({
          error:
            "The completed transaction does not contain valid product information.",

          transactionId:
            transaction.id,
        }),
      };
    }

    /*
     * Clean product data before returning it.
     *
     * This keeps the response predictable
     * for Downloads.jsx.
     */
    const cleanProducts =
      validProducts.map(
        (product) => ({
          id:
            product.id ||
            null,

          type:
            product.type ||
            null,

          title:
            product.title ||
            null,

          slug:
            product.slug.trim(),

          price:
            typeof product.price ===
            "number"
              ? product.price
              : null,
        })
      );

    console.log(
      "Verified Adinkra Media purchase:",
      {
        transactionId:
          transaction.id,

        products:
          cleanProducts,
      }
    );

    /*
     * Return verified purchase information.
     *
     * Downloads.jsx receives:
     *
     * {
     *   success: true,
     *   transactionId: "...",
     *   status: "completed",
     *   products: [...]
     * }
     */
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
          transaction.id,

        status:
          transaction.status,

        products:
          cleanProducts,
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

        "Cache-Control":
          "no-store",
      },

      body: JSON.stringify({
        error:
          error.message ||
          "Internal server error",
      }),
    };
  }
};