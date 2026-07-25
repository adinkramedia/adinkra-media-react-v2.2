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
   * --------------------------------------------------
   * PADDLE SDK INITIALIZATION
   * --------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    const initializePaddle =
      async () => {
        try {
          console.log(
            "[Paddle Debug] Starting Paddle initialization."
          );

          if (!clientToken) {
            console.error(
              "[Paddle Debug] VITE_PADDLE_CLIENT_TOKEN is missing."
            );

            return;
          }

          /*
           * Load Paddle SDK if it
           * has not already been loaded.
           */
          if (!window.Paddle) {
            console.log(
              "[Paddle Debug] Paddle SDK not found. Loading SDK..."
            );

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

              console.log(
                "[Paddle Debug] Paddle SDK script added to document."
              );
            } else {
              console.log(
                "[Paddle Debug] Paddle SDK script already exists."
              );
            }

            await new Promise(
              (
                resolve,
                reject
              ) => {
                /*
                 * Paddle may have loaded
                 * while waiting.
                 */
                if (window.Paddle) {
                  console.log(
                    "[Paddle Debug] Paddle became available while waiting."
                  );

                  resolve();

                  return;
                }

                script.addEventListener(
                  "load",
                  () => {
                    console.log(
                      "[Paddle Debug] Paddle SDK script loaded."
                    );

                    resolve();
                  },
                  {
                    once: true,
                  }
                );

                script.addEventListener(
                  "error",
                  (error) => {
                    console.error(
                      "[Paddle Debug] Paddle SDK script failed to load:",
                      error
                    );

                    reject(error);
                  },
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

          console.log(
            "[Paddle Debug] window.Paddle is available."
          );

          /*
           * Use Paddle Sandbox.
           */
          console.log(
            "[Paddle Debug] Setting Paddle environment to sandbox."
          );

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
            console.log(
              "[Paddle Debug] Initializing Paddle."
            );

            window.Paddle.Initialize({
              token: clientToken,
            });

            window
              .__ADINKRA_PADDLE_INITIALIZED__ =
              true;

            console.log(
              "[Paddle Debug] Paddle initialized successfully."
            );
          } else {
            console.log(
              "[Paddle Debug] Paddle was already initialized."
            );
          }

          if (!cancelled) {
            setPaddleLoaded(true);

            setPaddleInitialized(
              true
            );

            console.log(
              "[Paddle Debug] Paddle is ready for checkout."
            );
          }
        } catch (error) {
          console.error(
            "[Paddle Debug] Failed to initialize Paddle:",
            error
          );

          if (!cancelled) {
            setPaddleLoaded(false);

            setPaddleInitialized(
              false
            );
          }
        }
      };

    initializePaddle();

    return () => {
      cancelled = true;
    };
  }, [clientToken]);

  /*
   * --------------------------------------------------
   * DEBUG: GLOBAL PADDLE EVENT LISTENER
   * --------------------------------------------------
   *
   * This is only for debugging.
   *
   * It helps determine whether Paddle is
   * dispatching an event that we are not
   * receiving through eventCallback.
   */

  useEffect(() => {
    const handleGlobalPaddleEvent =
      (event) => {
        console.log(
          "[Paddle Debug] GLOBAL WINDOW EVENT RECEIVED:",
          event
        );
      };

    window.addEventListener(
      "paddle:checkout.completed",
      handleGlobalPaddleEvent
    );

    window.addEventListener(
      "paddle:checkout.closed",
      handleGlobalPaddleEvent
    );

    window.addEventListener(
      "paddle:checkout.error",
      handleGlobalPaddleEvent
    );

    return () => {
      window.removeEventListener(
        "paddle:checkout.completed",
        handleGlobalPaddleEvent
      );

      window.removeEventListener(
        "paddle:checkout.closed",
        handleGlobalPaddleEvent
      );

      window.removeEventListener(
        "paddle:checkout.error",
        handleGlobalPaddleEvent
      );
    };
  }, []);

  /*
   * --------------------------------------------------
   * REDIRECT TO DOWNLOADS
   * --------------------------------------------------
   */

  const redirectToDownloads = (
    transactionId,
    purchasedSlugs
  ) => {
    console.log(
      "[Paddle Debug] redirectToDownloads() called."
    );

    console.log(
      "[Paddle Debug] Transaction ID received:",
      transactionId
    );

    console.log(
      "[Paddle Debug] Purchased slugs received:",
      purchasedSlugs
    );

    /*
     * Validate transaction ID.
     */
    if (
      typeof transactionId !==
        "string" ||
      !transactionId.trim()
    ) {
      console.error(
        "[Paddle Debug] Cannot redirect. Invalid transaction ID:",
        transactionId
      );

      setLoading(false);

      alert(
        "Your payment was completed, but the Paddle transaction ID could not be found. Please contact support."
      );

      return;
    }

    /*
     * Validate purchased product slugs.
     */
    if (
      !Array.isArray(
        purchasedSlugs
      ) ||
      purchasedSlugs.length === 0
    ) {
      console.error(
        "[Paddle Debug] Cannot redirect. Invalid purchased slugs:",
        purchasedSlugs
      );

      setLoading(false);

      alert(
        "Your payment was completed, but the purchased products could not be identified. Please contact support."
      );

      return;
    }

    const cleanTransactionId =
      transactionId.trim();

    const cleanSlugs = [
      ...new Set(
        purchasedSlugs
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

    if (
      cleanSlugs.length === 0
    ) {
      console.error(
        "[Paddle Debug] Cannot redirect. No valid product slugs remain."
      );

      setLoading(false);

      alert(
        "Your payment was completed, but the purchased products could not be identified. Please contact support."
      );

      return;
    }

    /*
     * Build Downloads URL.
     */
    const downloadParams =
      new URLSearchParams();

    downloadParams.set(
      "transaction",
      cleanTransactionId
    );

    downloadParams.set(
      "products",
      cleanSlugs.join(",")
    );

    const downloadPath =
      `/downloads?${downloadParams.toString()}`;

    console.log(
      "[Paddle Debug] Final transaction ID:",
      cleanTransactionId
    );

    console.log(
      "[Paddle Debug] Final purchased slugs:",
      cleanSlugs
    );

    console.log(
      "[Paddle Debug] FINAL DOWNLOAD URL:",
      downloadPath
    );

    console.log(
      "[Paddle Debug] Navigating to Downloads now."
    );

    setLoading(false);

    navigate(
      downloadPath,
      {
        replace: true,
      }
    );
  };

  /*
   * --------------------------------------------------
   * PADDLE CHECKOUT EVENT HANDLER
   * --------------------------------------------------
   */

  const handlePaddleEvent = (
    event,
    createdTransactionId,
    purchasedSlugs
  ) => {
    console.group(
      "[Paddle Debug] Paddle Checkout Event"
    );

    console.log(
      "Full event object:",
      event
    );

    console.log(
      "Event name:",
      event?.name
    );

    console.log(
      "Event data:",
      event?.data
    );

    console.log(
      "Created transaction ID:",
      createdTransactionId
    );

    console.log(
      "Purchased product slugs:",
      purchasedSlugs
    );

    console.groupEnd();

    /*
     * No event received.
     */
    if (
      !event ||
      !event.name
    ) {
      console.warn(
        "[Paddle Debug] Received an empty or invalid Paddle event."
      );

      return;
    }

    /*
     * --------------------------------------------------
     * CHECKOUT COMPLETED
     * --------------------------------------------------
     */

    if (
      event.name ===
      "checkout.completed"
    ) {
      console.log(
        "[Paddle Debug] SUCCESS: checkout.completed received."
      );

      /*
       * Log every possible transaction
       * ID location.
       */
      console.log(
        "[Paddle Debug] event.data.transaction_id:",
        event?.data
          ?.transaction_id
      );

      console.log(
        "[Paddle Debug] event.data.transactionId:",
        event?.data
          ?.transactionId
      );

      console.log(
        "[Paddle Debug] event.transaction_id:",
        event?.transaction_id
      );

      console.log(
        "[Paddle Debug] event.transactionId:",
        event?.transactionId
      );

      console.log(
        "[Paddle Debug] createdTransactionId fallback:",
        createdTransactionId
      );

      /*
       * Find transaction ID.
       */
      const completedTransactionId =
        event?.data
          ?.transaction_id ||
        event?.data
          ?.transactionId ||
        event?.transaction_id ||
        event?.transactionId ||
        createdTransactionId;

      console.log(
        "[Paddle Debug] Resolved completed transaction ID:",
        completedTransactionId
      );

      /*
       * Redirect to Downloads.
       */
      redirectToDownloads(
        completedTransactionId,
        purchasedSlugs
      );

      return;
    }

    /*
     * --------------------------------------------------
     * CHECKOUT CLOSED
     * --------------------------------------------------
     */

    if (
      event.name ===
      "checkout.closed"
    ) {
      console.log(
        "[Paddle Debug] Checkout closed."
      );

      setLoading(false);

      return;
    }

    /*
     * --------------------------------------------------
     * CHECKOUT ERROR
     * --------------------------------------------------
     */

    if (
      event.name ===
      "checkout.error"
    ) {
      console.error(
        "[Paddle Debug] Checkout error event received:",
        event
      );

      setLoading(false);

      alert(
        "Paddle reported an error while processing your payment."
      );

      return;
    }

    /*
     * --------------------------------------------------
     * ALL OTHER EVENTS
     * --------------------------------------------------
     */

    console.log(
      "[Paddle Debug] Unhandled Paddle event:",
      event.name
    );
  };

  /*
   * --------------------------------------------------
   * CREATE CHECKOUT
   * --------------------------------------------------
   */

  const handleCheckout =
    async () => {
      try {
        console.group(
          "[Paddle Debug] Starting Checkout"
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

        console.log(
          "Product slugs:",
          slugs
        );

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

        /*
         * Create Paddle transaction.
         */
        console.log(
          "Calling create-paddle-transaction..."
        );

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

        console.log(
          "Transaction API HTTP status:",
          response.status
        );

        /*
         * Read response as text first.
         */
        const responseText =
          await response.text();

        console.log(
          "Raw transaction API response:",
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
        } catch {
          throw new Error(
            `The transaction service returned invalid JSON (HTTP ${response.status}).`
          );
        }

        console.log(
          "Parsed transaction API response:",
          data
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

        console.log(
          "Products attached to transaction:",
          slugs
        );

        /*
         * Open Paddle Checkout.
         */
        console.log(
          "Calling window.Paddle.Checkout.open()..."
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
              console.log(
                "[Paddle Debug] eventCallback FIRED."
              );

              handlePaddleEvent(
                event,
                cleanTransactionId,
                slugs
              );
            },
        });

        console.log(
          "window.Paddle.Checkout.open() completed."
        );

        console.log(
          "Waiting for Paddle checkout events..."
        );

        console.groupEnd();
      } catch (error) {
        console.error(
          "[Paddle Debug] Paddle checkout error:",
          error
        );

        console.groupEnd();

        setLoading(false);

        alert(
          error.message ||
            "Something went wrong while starting checkout."
        );
      }
    };

  /*
   * --------------------------------------------------
   * BUTTON
   * --------------------------------------------------
   */

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