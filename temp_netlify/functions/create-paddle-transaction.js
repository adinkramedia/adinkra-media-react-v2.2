import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});

export const handler = async (event) => {
  // Only allow POST requests
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
    // Get product slugs from the frontend
    const { slugs } = JSON.parse(event.body || "{}");

    // Make sure slugs is an array
    if (!Array.isArray(slugs) || slugs.length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Missing product slugs",
        }),
      };
    }

    // Remove duplicate slugs
    const uniqueSlugs = [...new Set(slugs)];

    // Find all products in Sanity.
    // Searches both Albums / Collections and Audio Tracks.
    const products = await sanity.fetch(
      `*[
        (_type == "album" || _type == "audioTrack") &&
        slug.current in $slugs
      ]{
        _id,
        _type,
        title,
        "slug": slug.current,
        price
      }`,
      {
        slugs: uniqueSlugs,
      }
    );

    // Make sure every requested product was found
    const foundSlugs = products.map(
      (product) => product.slug
    );

    const missingSlugs = uniqueSlugs.filter(
      (slug) => !foundSlugs.includes(slug)
    );

    if (missingSlugs.length > 0) {
      console.error(
        "Sanity products not found:",
        missingSlugs
      );

      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "One or more products were not found",
          missingSlugs,
        }),
      };
    }

    // Make sure every product has a valid price
    const invalidProducts = products.filter(
      (product) =>
        typeof product.price !== "number" ||
        product.price <= 0
    );

    if (invalidProducts.length > 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error:
            "One or more products do not have a valid price",
          products: invalidProducts.map((product) => ({
            id: product._id,
            title: product.title,
            slug: product.slug,
            type: product._type,
            price: product.price,
          })),
        }),
      };
    }

    // Paddle Sandbox API key
    const paddleApiKey =
      process.env.PADDLE_API_KEY;

    if (!paddleApiKey) {
      console.error(
        "PADDLE_API_KEY is missing"
      );

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "PADDLE_API_KEY is missing",
        }),
      };
    }

    // Paddle Sandbox Product ID
    // This is the single umbrella product
    // used for all Adinkra Media products.
    const paddleProductId =
      process.env.PADDLE_PRODUCT_ID;

    if (!paddleProductId) {
      console.error(
        "PADDLE_PRODUCT_ID is missing"
      );

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "PADDLE_PRODUCT_ID is missing",
        }),
      };
    }

    // Create one Paddle item for every
    // product in the Sanity cart.
    const paddleItems = products.map(
      (product) => ({
        quantity: 1,

        price: {
          product_id: paddleProductId,

          // This is the actual product title
          // from Sanity.
          description: product.title,

          unit_price: {
            amount: Math.round(
              product.price * 100
            ).toString(),

            currency_code: "USD",
          },
        },
      })
    );

    // Store all purchased Sanity products
    // inside Paddle custom_data.
    // We will use this later when building
    // the Paddle webhook and download access.
    const purchaseItems = products.map(
      (product) => ({
        id: product._id,
        type: product._type,
        title: product.title,
        slug: product.slug,
        price: product.price,
      })
    );

    // Create Paddle transaction
    const response = await fetch(
      "https://sandbox-api.paddle.com/transactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${paddleApiKey}`,
        },

        body: JSON.stringify({
          items: paddleItems,

          custom_data: {
            source: "adinkra_media",

            products: purchaseItems,
          },
        }),
      }
    );

    const data = await response.json();

    // Paddle API error
    if (!response.ok) {
      console.error(
        "Paddle transaction error:",
        data
      );

      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error:
            "Paddle transaction failed",
          details: data,
        }),
      };
    }

    // Return transaction ID
    // and all products to frontend
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactionId: data.data.id,

        products: purchaseItems,
      }),
    };
  } catch (error) {
    console.error(
      "Create Paddle Transaction Error:",
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