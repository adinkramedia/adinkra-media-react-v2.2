import { useEffect, useState } from "react";

export default function PaddleButton({
  cartItems = [],
  onSuccess,
}) {
  const [paddleLoaded, setPaddleLoaded] =
    useState(false);

  const [paddleInitialized, setPaddleInitialized] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const clientToken =
    import.meta.env.VITE_PADDLE_CLIENT_TOKEN;

  /*
   * Load and initialize Paddle.js
   */
  useEffect(() => {
    let cancelled = false;

    const loadPaddle = async () => {
      try {
        if (!clientToken) {
          console.error(
            "Paddle client-side token is missing."
          );

          return;
        }

        /*
         * Paddle is already available.
         */
        if (window.Paddle) {
          console.log(
            "Paddle SDK already loaded."
          );

          if (!cancelled) {
            setPaddleLoaded(true);
          }

          /*
           * Initialize Paddle only once.
           */
          if (
            !window
              .__ADINKRA_PADDLE_INITIALIZED__
          ) {
            window.Paddle.Environment.set(
              "sandbox"
            );

            window.Paddle.Initialize({
              token: clientToken,
            });

            window
              .__ADINKRA_PADDLE_INITIALIZED__ =
              true;

            console.log(
              "Paddle initialized."
            );
          }

          if (!cancelled) {
            setPaddleInitialized(true);
          }

          return;
        }

        /*
         * Check if Paddle.js is already loading.
         */
        let script =
          document.getElementById(
            "paddle-sdk"
          );

        if (!script) {
          script =
            document.createElement(
              "script"
            );

          script.id = "paddle-sdk";

          script.src =
            "https://cdn.paddle.com/paddle/v2/paddle.js";

          script.async = true;

          document.body.appendChild(
            script
          );
        }

        /*
         * Wait for Paddle.js.
         */
        await new Promise(
          (resolve, reject) => {
            if (window.Paddle) {
              resolve();
              return;
            }

            script.addEventListener(
              "load",
              resolve,
              {
                once: true,
              }
            );

            script.addEventListener(
              "error",
              reject,
              {
                once: true,
              }
            );
          }
        );

        if (!window.Paddle) {
          throw new Error(
            "Paddle SDK failed to load."
          );
        }

        if (cancelled) {
          return;
        }

        console.log(
          "Paddle SDK loaded."
        );

        setPaddleLoaded(true);

        /*
         * Initialize Paddle only once.
         */
        if (
          !window
            .__ADINKRA_PADDLE_INITIALIZED__
        ) {
          window.Paddle.Environment.set(
            "sandbox"
          );

          window.Paddle.Initialize({
            token: clientToken,
          });

          window
            .__ADINKRA_PADDLE_INITIALIZED__ =
            true;

          console.log(
            "Paddle initialized."
          );
        }

        if (!cancelled) {
          setPaddleInitialized(true);
        }
      } catch (error) {
        console.error(
          "Failed to initialize Paddle:",
          error
        );
      }
    };

    loadPaddle();

    return () => {
      cancelled = true;
    };
  }, [clientToken]);

  /*
   * Start Paddle checkout.
   */
  const handleCheckout = async () => {
    try {
      console.log(
        "Buy with Paddle clicked."
      );

      console.log(
        "Cart items:",
        cartItems
      );

      /*
       * Make sure cart is not empty.
       */
      if (
        !cartItems ||
        cartItems.length === 0
      ) {
        throw new Error(
          "Your cart is empty."
        );
      }

      /*
       * Make sure Paddle is configured.
       */
      if (!clientToken) {
        throw new Error(
          "Paddle client-side token is missing."
        );
      }

      /*
       * Make sure Paddle SDK is ready.
       */
      if (
        !paddleLoaded ||
        !paddleInitialized ||
        !window.Paddle
      ) {
        throw new Error(
          "Paddle is still loading. Please wait a moment and try again."
        );
      }

      /*
       * Get all cart product slugs.
       */
      const slugs = cartItems
        .map(
          (item) => item.slug
        )
        .filter(
          (slug) =>
            typeof slug === "string" &&
            slug.trim().length > 0
        );

      /*
       * Remove duplicate products.
       */
      const uniqueSlugs = [
        ...new Set(slugs),
      ];

      console.log(
        "Product slugs:",
        uniqueSlugs
      );

      if (
        uniqueSlugs.length === 0
      ) {
        throw new Error(
          "No valid product slugs were found in the cart."
        );
      }

      setLoading(true);

      /*
       * Create Paddle transaction.
       */
      const response = await fetch(
        "/.netlify/functions/create-paddle-transaction",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            slugs: uniqueSlugs,
          }),
        }
      );

      const responseText =
        await response.text();

      console.log(
        "Transaction response status:",
        response.status
      );

      console.log(
        "Transaction response:",
        responseText
      );

      let data = {};

      try {
        data =
          responseText
            ? JSON.parse(
                responseText
              )
            : {};
      } catch (parseError) {
        console.error(
          "Invalid JSON response:",
          responseText
        );

        throw new Error(
          `Server returned an invalid response (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        console.error(
          "Transaction creation failed:",
          data
        );

        throw new Error(
          data.error ||
            `Failed to create Paddle transaction (HTTP ${response.status}).`
        );
      }

      if (
        !data.transactionId
      ) {
        console.error(
          "Missing transaction ID:",
          data
        );

        throw new Error(
          "No Paddle transaction ID was returned."
        );
      }

      console.log(
        "Paddle transaction created:",
        data.transactionId
      );

      /*
       * Open Paddle checkout.
       */
      window.Paddle.Checkout.open({
        transactionId:
          data.transactionId,

        settings: {
          displayMode:
            "overlay",

          theme: "dark",

          locale: "en",
        },

        eventCallback: (event) => {
          console.log(
            "Paddle checkout event:",
            event
          );

          /*
           * Payment completed.
           */
          if (
            event.name ===
            "checkout.completed"
          ) {
            console.log(
              "Paddle checkout completed."
            );

            /*
             * Pass the transaction ID
             * and purchased products
             * back to CartDrawer.
             */
            if (onSuccess) {
              onSuccess({
                ...event,

                transactionId:
                  data.transactionId,

                products:
                  data.products || [],
              });
            }
          }
        },
      });
    } catch (error) {
      console.error(
        "Paddle checkout error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while starting Paddle Checkout."
      );

      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={
        loading ||
        !paddleLoaded ||
        !paddleInitialized ||
        cartItems.length === 0
      }
      className="w-full bg-adinkra-gold text-adinkra-bg font-bold py-3 px-4 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading
        ? "Preparing checkout..."
        : !paddleLoaded ||
          !paddleInitialized
        ? "Loading Paddle..."
        : "Buy with Paddle"}
    </button>
  );
}