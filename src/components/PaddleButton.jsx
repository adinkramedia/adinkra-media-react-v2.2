import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaddleButton({
  cartItems = [],
}) {
  const navigate = useNavigate();

  const [
    paddleLoaded,
    setPaddleLoaded,
  ] = useState(false);

  const [
    paddleInitialized,
    setPaddleInitialized,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const clientToken =
    import.meta.env.VITE_PADDLE_CLIENT_TOKEN;

  /*
   * Load and initialize Paddle.
   */
  useEffect(() => {
    let cancelled = false;

    const initializePaddle =
      async () => {
        try {
          if (!clientToken) {
            console.error(
              "VITE_PADDLE_CLIENT_TOKEN is missing."
            );

            return;
          }

          /*
           * Load Paddle SDK if it
           * has not already been loaded.
           */
          if (!window.Paddle) {
            let script =
              document.getElementById(
                "paddle-sdk"
              );

            if (!script) {
              script =
                document.createElement(
                  "script"
                );

              script.id =
                "paddle-sdk";

              script.src =
                "https://cdn.paddle.com/paddle/v2/paddle.js";

              script.async = true;

              document.body.appendChild(
                script
              );
            }

            await new Promise(
              (
                resolve,
                reject
              ) => {
                /*
                 * Paddle may have loaded
                 * while we were waiting.
                 */
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
          }

          /*
           * Make sure Paddle exists.
           */
          if (!window.Paddle) {
            throw new Error(
              "Paddle SDK failed to load."
            );
          }

          /*
           * Use Paddle Sandbox.
           */
          window.Paddle.Environment.set(
            "sandbox"
          );

          /*
           * Initialize Paddle only once.
           */
          if (
            !window
              .__ADINKRA_PADDLE_INITIALIZED__
          ) {
            window.Paddle.Initialize({
              token: clientToken,
            });

            window
              .__ADINKRA_PADDLE_INITIALIZED__ =
              true;

            console.log(
              "Paddle initialized."
            );
          } else {
            console.log(
              "Paddle was already initialized."
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

          if (!cancelled) {
            setPaddleLoaded(false);
            setPaddleInitialized(false);
          }
        }
      };

    initializePaddle();

    return () => {
      cancelled = true;
    };
  }, [clientToken]);

  /*
   * Send the customer to Downloads.
   *
   * The transaction ID is passed in
   * the URL so Downloads.jsx can use it.
   */
  const redirectToDownloads = (
    transactionId
  ) => {
    if (
      typeof transactionId !==
        "string" ||
      !transactionId.trim()
    ) {
      console.error(
        "Cannot redirect to Downloads. Missing transaction ID:",
        transactionId
      );

      setLoading(false);

      alert(
        "Your payment was completed, but the Paddle transaction ID could not be found. Please contact support."
      );

      return;
    }

    const cleanTransactionId =
      transactionId.trim();

    const downloadPath =
      `/downloads?transaction=${encodeURIComponent(
        cleanTransactionId
      )}`;

    console.log(
      "Payment completed successfully."
    );

    console.log(
      "Verified transaction ID for Downloads:",
      cleanTransactionId
    );

    console.log(
      "Redirecting customer to:",
      downloadPath
    );

    /*
     * Stop the loading state
     * before navigation.
     */
    setLoading(false);

    /*
     * Replace the checkout page
     * with the Downloads page.
     */
    navigate(
      downloadPath,
      {
        replace: true,
      }
    );
  };

  /*
   * Handle Paddle Checkout events.
   */
  const handlePaddleEvent = (
    event,
    createdTransactionId
  ) => {
    console.log(
      "Paddle checkout event:",
      event
    );

    /*
     * Always log the event name
     * so we can see exactly what
     * Paddle sends in production.
     */
    console.log(
      "Paddle checkout event name:",
      event?.name
    );

    if (
      !event ||
      !event.name
    ) {
      return;
    }

    /*
     * Checkout completed.
     */
    if (
      event.name ===
      "checkout.completed"
    ) {
      console.log(
        "Paddle checkout completed."
      );

      /*
       * Try to get the transaction ID
       * from the Paddle event first.
       *
       * Fall back to the transaction ID
       * created by create-paddle-transaction.js.
       */
      const completedTransactionId =
        event?.data?.transaction_id ||
        event?.data?.transactionId ||
        event?.transaction_id ||
        event?.transactionId ||
        createdTransactionId;

      console.log(
        "Completed transaction ID:",
        completedTransactionId
      );

      redirectToDownloads(
        completedTransactionId
      );

      return;
    }

    /*
     * Checkout closed.
     */
    if (
      event.name ===
      "checkout.closed"
    ) {
      console.log(
        "Paddle checkout closed by customer."
      );

      setLoading(false);

      return;
    }

    /*
     * Checkout error.
     */
    if (
      event.name ===
      "checkout.error"
    ) {
      console.error(
        "Paddle checkout error:",
        event
      );

      setLoading(false);

      alert(
        "Paddle reported an error while processing your payment."
      );

      return;
    }

    /*
     * Log any other Paddle events
     * without interrupting checkout.
     */
    console.log(
      "Unhandled Paddle checkout event:",
      event.name
    );
  };

  /*
   * Create the Paddle transaction
   * and open Paddle Checkout.
   */
  const handleCheckout =
    async () => {
      try {
        console.log(
          "Buy with Paddle clicked."
        );

        console.log(
          "Cart items:",
          cartItems
        );

        /*
         * Validate cart.
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
         * Validate Paddle token.
         */
        if (!clientToken) {
          throw new Error(
            "Paddle client-side token is missing."
          );
        }

        /*
         * Make sure Paddle is ready.
         */
        if (
          !paddleLoaded ||
          !paddleInitialized ||
          !window.Paddle
        ) {
          throw new Error(
            "Paddle is still loading. Please wait a moment."
          );
        }

        /*
         * Extract product slugs.
         */
        const slugs = [
          ...new Set(
            cartItems
              .map(
                (item) =>
                  item?.slug
              )
              .filter(
                (slug) =>
                  typeof slug ===
                    "string" &&
                  slug.trim().length >
                    0
              )
              .map(
                (slug) =>
                  slug.trim()
              )
          ),
        ];

        /*
         * Validate product slugs.
         */
        if (
          slugs.length === 0
        ) {
          throw new Error(
            "No valid product slugs were found."
          );
        }

        setLoading(true);

        console.log(
          "Creating Paddle transaction for:",
          slugs
        );

        /*
         * Ask Netlify to create
         * the Paddle transaction.
         */
        const response =
          await fetch(
            "/.netlify/functions/create-paddle-transaction",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify({
                slugs,
              }),
            }
          );

        /*
         * Read response as text first
         * so invalid JSON does not crash
         * without useful information.
         */
        const responseText =
          await response.text();

        let data = {};

        try {
          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : {};
        } catch {
          console.error(
            "Invalid JSON from create-paddle-transaction:",
            responseText
          );

          throw new Error(
            `The transaction service returned an invalid response (HTTP ${response.status}).`
          );
        }

        console.log(
          "Create transaction response:",
          {
            status:
              response.status,

            data,
          }
        );

        /*
         * Transaction creation failed.
         */
        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to create Paddle transaction."
          );
        }

        /*
         * Get transaction ID.
         */
        const transactionId =
          data?.transactionId;

        /*
         * Validate transaction ID.
         */
        if (
          typeof transactionId !==
            "string" ||
          !transactionId.trim()
        ) {
          throw new Error(
            "Paddle did not return a valid transaction ID."
          );
        }

        const cleanTransactionId =
          transactionId.trim();

        console.log(
          "Transaction created:",
          cleanTransactionId
        );

        /*
         * Open Paddle Checkout.
         */
        console.log(
          "Opening Paddle Checkout for:",
          cleanTransactionId
        );

        window.Paddle.Checkout.open({
          transactionId:
            cleanTransactionId,

          settings: {
            displayMode:
              "overlay",

            theme: "dark",

            locale: "en",
          },

          eventCallback:
            (event) => {
              handlePaddleEvent(
                event,
                cleanTransactionId
              );
            },
        });

        console.log(
          "Paddle Checkout opened successfully."
        );
      } catch (error) {
        console.error(
          "Paddle checkout error:",
          error
        );

        setLoading(false);

        alert(
          error.message ||
            "Something went wrong while starting checkout."
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