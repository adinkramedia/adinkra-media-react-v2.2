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
     * Get Supabase environment variables.
     */
    if (
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error(
        "Supabase environment variables are missing."
      );

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error:
            "Supabase environment variables are missing",
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
     * Customer email.
     */
    const customerEmail =
      eventData?.customer?.email ||
      eventData?.details?.customer?.email ||
      null;

    /*
     * Read custom data created by
     * create-paddle-transaction.js.
     *
     * The webhook may not always contain
     * custom_data. We will therefore still
     * record the transaction even if the
     * products array is empty.
     */
    const customData =
      eventData.custom_data || {};

    const purchasedProducts =
      Array.isArray(
        customData.products
      )
        ? customData.products
        : [];

    /*
     * Log product information.
     */
    if (
      purchasedProducts.length === 0
    ) {
      console.warn(
        "No purchased products found in Paddle custom_data. The transaction will still be recorded.",
        {
          transactionId,
          customData,
        }
      );
    } else {
      console.log(
        "Purchased products:",
        purchasedProducts
      );
    }

    console.log(
      "Completed Paddle transaction:",
      transactionId
    );

    console.log(
      "Customer email:",
      customerEmail
    );

    /*
     * Save purchase to Supabase.
     *
     * transaction_id is UNIQUE,
     * so Paddle webhook retries will
     * update the existing purchase
     * instead of creating duplicates.
     */
    const { data: purchase, error } =
      await supabase
        .from("paddle_purchases")
        .upsert(
          {
            transaction_id:
              transactionId,

            customer_email:
              customerEmail,

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
     *
     * Downloads can later be granted
     * using the verified transaction ID.
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