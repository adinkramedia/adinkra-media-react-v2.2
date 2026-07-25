import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaddleButton({
  cartItems = [],
  onSuccess,
}) {
  const navigate = useNavigate();

  const [paddleLoaded, setPaddleLoaded] =
    useState(false);

  const [paddleInitialized, setPaddleInitialized] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const clientToken =
    import.meta.env.VITE_PADDLE_CLIENT_TOKEN;

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
         * Paddle SDK is already available.
         */
        if (window.Paddle) {
          console.log(
            "Paddle SDK already loaded."
          );

          /*
           * Configure Sandbox.
           */
          window.Paddle.Environment.set(
            "sandbox"
          );

          /*
           * Initialize Paddle only once.
           */
          if (
            !window.__ADINKRA_PADDLE_INITIALIZED__
          ) {
            window.Paddle.Initialize({
              token: clientToken,
            });

            window.__ADINKRA_PADDLE_INITIALIZED__ =
              true;

            console.log(
              "Paddle initialized."
            );
          }

          if (!cancelled) {
            setPaddleLoaded(true);
            setPaddleInitialized(true);
          }

          return;
        }

        /*
         * Check if the Paddle script is
         * already being loaded.
         */
        let script =
          document.getElementById(
            "paddle-sdk"
          );

        /*
         * Create Paddle SDK script.
         */
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
         * Wait for Paddle SDK to load.
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

        /*
         * Configure Paddle Sandbox.
         */
        window.Paddle.Environment.set(
          "sandbox"
        );

        /*
         * Initialize Paddle only once.
         */
        if (
          !window.__ADINKRA_PADDLE_INITIALIZED__
        ) {
          window.Paddle.Initialize({
            token: clientToken,
          });

          window.__ADINKRA_PADDLE_INITIALIZED__ =
            true;

          console.log(
            "Paddle initialized."
          );
        }

        if (!cancelled) {
          setPaddleLoaded(true);
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
   * Handle Paddle checkout events.
   */
  const handlePaddleEvent = (
    event,
    transactionId,
    products
  ) => {
    console.log(
      "Paddle checkout event:",
      event
    );

    /*
     * Paddle checkout completed.
     */
    if (
      event?.name ===
      "checkout.completed"
    ) {
      console.log(
        "Paddle checkout completed."
      );

      console.log(
        "Completed transaction ID:",
        transactionId
      );

      /*
       * Stop loading state.
       */
      setLoading(false);

      /*
       * Build the purchase data.
       */
      const purchaseData = {
        transactionId,
        products,
      };

      console.log(
        "Sending completed purchase to CartDrawer:",
        purchaseData
      );

      /*
       * Let CartDrawer handle the purchase.
       *
       * CartDrawer will:
       *
       * 1. Clear the cart.
       * 2. Close the drawer.
       * 3. Navigate to:
       *
       * /downloads?transaction=txn_...
       */
      if (onSuccess) {
        onSuccess(
          purchaseData
        );

        return;
      }

      /*
       * Direct fallback.
       *
       * This protects the checkout flow
       * if PaddleButton is ever rendered
       * without an onSuccess callback.
       */
      console.log(
        "No onSuccess callback supplied. Redirecting directly to Downloads."
      );

      navigate(
        `/downloads?transaction=${encodeURIComponent(
          transactionId
        )}`
      );
    }
  };

  /*
   * Start Paddle Checkout.
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
       * Make sure Paddle client token exists.
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
       * Get product slugs from cart.
       */
      const slugs = [
        ...new Set(
          cartItems
            .map(
              (item) =>
                item.slug
            )
            .filter(
              (slug) =>
                typeof slug ===
                  "string" &&
                slug.trim().length >
                  0
            )
        ),
      ];

      console.log(
        "Product slugs:",
        slugs
      );

      /*
       * Make sure valid slugs exist.
       */
      if (
        slugs.length === 0
      ) {
        throw new Error(
          "No valid product slugs were found in the cart."
        );
      }

      /*
       * Start loading state.
       */
      setLoading(true);

      /*
       * Create Paddle transaction
       * through Netlify Function.
       */
      const response =
        await fetch(
          "/.netlify/functions/create-paddle-transaction",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              slugs,
            }),
          }
        );

      /*
       * Read raw response.
       */
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

      /*
       * Parse response.
       */
      let data = {};

      try {
        data = responseText
          ? JSON.parse(
              responseText
            )
          : {};
      } catch {
        throw new Error(
          `Server returned an invalid response (HTTP ${response.status}).`
        );
      }

      /*
       * Check transaction creation.
       */
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

      /*
       * Make sure transaction ID exists.
       */
      if (
        !data.transactionId
      ) {
        console.error(
          "Missing Paddle transaction ID:",
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
       * Store values locally so that
       * the Paddle callback always has
       * access to them.
       */
      const transactionId =
        data.transactionId;

      const products =
        Array.isArray(
          data.products
        )
          ? data.products
          : [];

      /*
       * Open Paddle Checkout.
       */
      console.log(
        "Opening Paddle Checkout:",
        transactionId
      );

      window.Paddle.Checkout.open({
        transactionId,

        settings: {
          displayMode:
            "overlay",

          theme: "dark",

          locale: "en",
        },

        /*
         * Listen for Paddle checkout events.
         */
        eventCallback: (
          event
        ) => {
          handlePaddleEvent(
            event,
            transactionId,
            products
          );
        },
      });

      console.log(
        "Paddle Checkout opened."
      );
    } catch (error) {
      console.error(
        "Paddle checkout error:",
        error
      );

      setLoading(false);

      alert(
        error.message ||
          "Something went wrong while starting Paddle Checkout."
      );
    }
  };

  return (
    <button
      type="button"
      onClick={
        handleCheckout
      }
      disabled={
        loading ||
        !paddleLoaded ||
        !paddleInitialized ||
        cartItems.length === 0
      }
      className="w-full bg-adinkra-gold text-adinkra-bg font-bold py-3 px-4 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading
        ? "Processing payment..."
        : !paddleLoaded ||
          !paddleInitialized
        ? "Loading Paddle..."
        : "Buy with Paddle"}
    </button>
  );
}