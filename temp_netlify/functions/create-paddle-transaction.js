import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});

export const handler = async (event) => {
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
    const { slugs } = JSON.parse(event.body || "{}");

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

    const uniqueSlugs = [
      ...new Set(
        slugs
          .filter(
            (slug) =>
              typeof slug === "string"
          )
          .map((slug) => slug.trim())
          .filter(Boolean)
      ),
    ];

    if (uniqueSlugs.length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "No valid product slugs provided",
        }),
      };
    }

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

    const foundSlugs = products.map(
      (product) => product.slug
    );

    const missingSlugs =
      uniqueSlugs.filter(
        (slug) =>
          !foundSlugs.includes(slug)
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
          error:
            "One or more products were not found",
          missingSlugs,
        }),
      };
    }

    const invalidProducts =
      products.filter(
        (product) =>
          typeof product.price !==
            "number" ||
          product.price <= 0
      );

    if (invalidProducts.length > 0) {
      console.error(
        "Products with invalid prices:",
        invalidProducts
      );

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error:
            "One or more products do not have a valid price",

          products:
            invalidProducts.map(
              (product) => ({
                id: product._id,
                title: product.title,
                slug: product.slug,
                type: product._type,
                price: product.price,
              })
            ),
        }),
      };
    }

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
          error:
            "PADDLE_API_KEY is missing",
        }),
      };
    }

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
          error:
            "PADDLE_PRODUCT_ID is missing",
        }),
      };
    }

    const paddleItems =
      products.map(
        (product) => ({
          quantity: 1,

          price: {
            product_id:
              paddleProductId,

            description:
              product.title,

            unit_price: {
              amount:
                Math.round(
                  product.price * 100
                ).toString(),

              currency_code:
                "USD",
            },
          },
        })
      );

    const purchaseItems =
      products.map(
        (product) => ({
          id: product._id,
          type: product._type,
          title: product.title,
          slug: product.slug,
          price: product.price,
        })
      );

    console.log(
      "Creating Paddle transaction for products:",
      purchaseItems
    );

    const response = await fetch(
      "https://sandbox-api.paddle.com/transactions",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${paddleApiKey}`,
        },

        body: JSON.stringify({
          items: paddleItems,

          custom_data: {
            source:
              "adinkra_media",

            products:
              purchaseItems,
          },
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        "Paddle transaction error:",
        data
      );

      return {
        statusCode:
          response.status,

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          error:
            "Paddle transaction failed",

          details: data,
        }),
      };
    }

    const transactionId =
      data?.data?.id;

    if (!transactionId) {
      console.error(
        "Paddle returned no transaction ID:",
        data
      );

      return {
        statusCode: 500,

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          error:
            "Paddle did not return a transaction ID",
        }),
      };
    }

    console.log(
      "Paddle transaction created:",
      transactionId
    );

    console.log(
      "Products stored in Paddle custom_data:",
      purchaseItems
    );

    return {
      statusCode: 200,

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        transactionId,

        products:
          purchaseItems,
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
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        error:
          error.message ||
          "Internal server error",
      }),
    };
  }
};