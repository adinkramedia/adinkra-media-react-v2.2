import crypto from "crypto";
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
  /*
   * Paddle webhooks must use POST.
   */
  if (event.httpMethod !== "POST") {
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
    /*
     * Get Paddle webhook signature.
     */
    const signature =
      event.headers?.["paddle-signature"] ||
      event.headers?.["Paddle-Signature"];

    if (!signature) {
      console.error(
        "Missing Paddle webhook signature."
      );

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error:
            "Missing Paddle webhook signature",
        }),
      };
    }

    /*
     * Get Paddle webhook secret.
     */
    const webhookSecret =
      process.env.PADDLE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "PADDLE_WEBHOOK_SECRET is missing."
      );

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error:
            "PADDLE_WEBHOOK_SECRET is missing",
        }),
      };
    }

    /*
     * Get raw request body.
     *
     * Paddle signature verification requires
     * the exact raw request body.
     */
    const rawBody = event.isBase64Encoded
      ? Buffer.from(
          event.body || "",
          "base64"
        ).toString("utf8")
      : event.body || "";

    /*
     * Paddle signature format:
     *
     * ts=1234567890;h1=abcdef...
     */
    const signatureParts = {};

    signature
      .split(";")
      .forEach((part) => {
        const separatorIndex =
          part.indexOf("=");

        if (separatorIndex === -1) {
          return;
        }

        const key =
          part.slice(0, separatorIndex);

        const value =
          part.slice(separatorIndex + 1);

        if (key && value) {
          signatureParts[key] = value;
        }
      });

    const timestamp =
      signatureParts.ts;

    const receivedSignature =
      signatureParts.h1;

    if (
      !timestamp ||
      !receivedSignature
    ) {
      console.error(
        "Invalid Paddle webhook signature format."
      );

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error:
            "Invalid Paddle webhook signature",
        }),
      };
    }

    /*
     * Build the signed payload.
     *
     * Paddle signs:
     *
     * timestamp:rawBody
     */
    const signedPayload =
      `${timestamp}:${rawBody}`;

    /*
     * Generate expected HMAC signature.
     */
    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          webhookSecret
        )
        .update(signedPayload)
        .digest("hex");

    /*
     * Compare signatures securely.
     */
    const receivedBuffer =
      Buffer.from(
        receivedSignature,
        "hex"
      );

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "hex"
      );

    if (
      receivedBuffer.length !==
      expectedBuffer.length
    ) {
      console.error(
        "Invalid Paddle webhook signature."
      );

      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error:
            "Invalid webhook signature",
        }),
      };
    }

    if (
      !crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      )
    ) {
      console.error(
        "Invalid Paddle webhook signature."
      );

      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error:
            "Invalid webhook signature",
        }),
      };
    }

    /*
     * Parse verified Paddle webhook.
     */
    const payload =
      JSON.parse(rawBody);

    console.log(
      "Verified Paddle webhook:",
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    /*
     * Get event information.
     */
    const eventType =
      payload.event_type;

    const eventData =
      payload.data || {};

    /*
     * We only record completed transactions.
     */
    if (
      eventType !==
      "transaction.completed"
    ) {
      console.log(
        "Paddle event acknowledged:",
        eventType
      );

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: true,
          message:
            "Webhook received.",
          eventType,
        }),
      };
    }

    /*
     * Paddle transaction ID.
     */
    const transactionId =
      eventData.id;

    if (!transactionId) {
      console.error(
        "Completed transaction has no transaction ID."
      );

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

    /*
     * Read custom data created by
     * create-paddle-transaction.js.
     */
    const customData =
      eventData.custom_data || {};

    /*
     * First try to use the exact product
     * information attached to the transaction
     * when the transaction was created.
     */
    let purchasedProducts =
      Array.isArray(
        customData.products
      )
        ? customData.products
        : [];

    /*
     * If custom_data.products is missing,
     * build the product list from Paddle's
     * transaction line items.
     *
     * This prevents completed purchases
     * from being saved with an empty
     * products array.
     */
    if (
      purchasedProducts.length === 0
    ) {
      const lineItems =
        Array.isArray(
          eventData?.details?.line_items
        )
          ? eventData.details.line_items
          : [];

      purchasedProducts =
        lineItems.map(
          (item) => ({
            paddle_product_id:
              item?.product?.id ||
              null,

            paddle_price_id:
              item?.price_id ||
              null,

            title:
              item?.product?.name ||
              item?.product?.description ||
              item?.price?.description ||
              "Purchased product",

            quantity:
              Number(
                item?.quantity || 1
              ),

            price:
              item?.unit_totals?.subtotal
                ? Number(
                    item.unit_totals.subtotal
                  ) / 100
                : null,

            currency:
              eventData?.currency_code ||
              eventData?.details?.totals
                ?.currency_code ||
              null,
          })
        );
    }

    /*
     * Log the final products that will
     * be stored in Supabase.
     */
    console.log(
      "Purchased products to save:",
      JSON.stringify(
        purchasedProducts,
        null,
        2
      )
    );

    /*
     * A completed transaction must have
     * at least one product.
     */
    if (
      purchasedProducts.length === 0
    ) {
      console.error(
        "Completed transaction contains no products.",
        {
          transactionId,
        }
      );

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error:
            "Completed transaction contains no products",
          transactionId,
        }),
      };
    }

    console.log(
      "Completed Paddle transaction:",
      transactionId
    );

    /*
     * Save purchase to Supabase.
     *
     * No customer email is collected
     * or stored.
     *
     * transaction_id is UNIQUE,
     * so Paddle webhook retries update
     * the existing purchase instead of
     * creating duplicate records.
     */
    const { data: purchase, error } =
      await supabase
        .from("paddle_purchases")
        .upsert(
          {
            transaction_id:
              transactionId,

            status:
              "completed",

            products:
              purchasedProducts,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "transaction_id",
          }
        )
        .select()
        .single();

    /*
     * Supabase write failed.
     */
    if (error) {
      console.error(
        "Failed to save Paddle purchase to Supabase:",
        error
      );

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error:
            "Failed to save purchase",

          details:
            error.message ||
            "Unknown Supabase error",
        }),
      };
    }

    /*
     * Supabase write succeeded.
     */
    console.log(
      "Paddle purchase saved successfully:",
      purchase.id
    );

    console.log(
      "Saved purchase record:",
      JSON.stringify(
        purchase,
        null,
        2
      )
    );

    /*
     * Payment is now recorded.
     */
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,

        message:
          "Paddle payment verified and purchase saved.",

        transactionId,

        purchaseId:
          purchase.id,

        productsRecorded:
          purchasedProducts.length,
      }),
    };
  } catch (error) {
    console.error(
      "Paddle webhook error:",
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