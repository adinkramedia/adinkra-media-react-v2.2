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
   * ---------------------------------------------------------
   * PADDLE INITIALIZATION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    const initializePaddle = async () => {
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
         * Load Paddle SDK if it is not already loaded.
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

                  reject(
                    error
                  );
                },
                {
                  once: true,
                }
              );
            }
          );
        }

        /*
         * Verify Paddle exists.
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
         * Set Sandbox environment.
         */
        console.log(
          "[Paddle Debug] Setting Paddle environment to sandbox."
        );

        window.Paddle.Environment.set(
          "sandbox"
        );

        /*
         * Initialize Paddle once.
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
          "[Paddle Debug] Paddle initialization failed:",
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
   * ---------------------------------------------------------
   * REDIRECT TO DOWNLOADS
   * ---------------------------------------------------------
   */

  const redirectToDownloads = (
    transactionId,
    source = "unknown"
  ) => {
    console.log(
      "[Paddle Debug] redirectToDownloads() called."
    );

    console.log(
      "[Paddle Debug] Transaction ID source:",
      source
    );

    console.log(
      "[Paddle Debug] Transaction ID received:",
      transactionId
    );

    if (
      typeof transactionId !==
        "string" ||
      !transactionId.trim()
    ) {
      console.error(
        "[Paddle Debug] Cannot redirect. Transaction ID is missing or invalid."
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
      "[Paddle Debug] Payment completed."
    );

    console.log(
      "[Paddle Debug] Final transaction ID:",
      cleanTransactionId
    );

    console.log(
      "[Paddle Debug] Download URL:",
      downloadPath
    );

    console.log(
      "[Paddle Debug] Navigating to Downloads..."
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
   * ---------------------------------------------------------
   * PADDLE EVENT CALLBACK
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   * This function is intentionally extremely verbose.
   *
   * We need to determine whether Paddle is actually
   * calling eventCallback after checkout.
   */

  const handlePaddleEvent = (
    event,
    createdTransactionId
  ) => {
    console.group(
      "[Paddle Debug] ===== EVENT CALLBACK FIRED ====="
    );

    console.log(
      "[Paddle Debug] Full Paddle event:",
      event
    );

    console.log(
      "[Paddle Debug] Event type:",
      typeof event
    );

    console.log(
      "[Paddle Debug] Event name:",
      event?.name
    );

    console.log(
      "[Paddle Debug] Event data:",
      event?.data
    );

    console.log(
      "[Paddle Debug] Event transaction_id:",
      event?.data?.transaction_id
    );

    console.log(
      "[Paddle Debug] Event transactionId:",
      event?.data?.transactionId
    );

    console.log(
      "[Paddle Debug] Top-level transaction_id:",
      event?.transaction_id
    );

    console.log(
      "[Paddle Debug] Top-level transactionId:",
      event?.transactionId
    );

    console.log(
      "[Paddle Debug] Created transaction ID:",
      createdTransactionId
    );

    console.groupEnd();

    /*
     * -------------------------------------------------------
     * Validate event
     * -------------------------------------------------------
     */

    if (
      !event ||
      !event.name
    ) {
      console.warn(
        "[Paddle Debug] Event callback fired, but event.name is missing."
      );

      return;
    }

    /*
     * -------------------------------------------------------
     * CHECKOUT COMPLETED
     * -------------------------------------------------------
     */

    if (
      event.name ===
      "checkout.completed"
    ) {
      console.log(
        "[Paddle Debug] checkout.completed detected."
      );

      /*
       * Try every known location we are currently
       * testing for the transaction ID.
       */
      const completedTransactionId =
        event?.data?.transaction_id ||
        event?.data?.transactionId ||
        event?.transaction_id ||
        event?.transactionId ||
        createdTransactionId;

      console.log(
        "[Paddle Debug] Resolved completed transaction ID:",
        completedTransactionId
      );

      if (
        completedTransactionId ===
        createdTransactionId
      ) {
        console.log(
          "[Paddle Debug] Using transaction ID returned by create-paddle-transaction."
        );
      } else {
        console.log(
          "[Paddle Debug] Using transaction ID received from Paddle event."
        );
      }

      redirectToDownloads(
        completedTransactionId,
        "checkout.completed"
      );

      return;
    }

    /*
     * -------------------------------------------------------
     * CHECKOUT CLOSED
     * -------------------------------------------------------
     */

    if (
      event.name ===
      "checkout.closed"
    ) {
      console.log(
        "[Paddle Debug] Paddle Checkout was closed."
      );

      setLoading(false);

      return;
    }

    /*
     * -------------------------------------------------------
     * CHECKOUT ERROR
     * -------------------------------------------------------
     */

    if (
      event.name ===
      "checkout.error"
    ) {
      console.error(
        "[Paddle Debug] Paddle Checkout reported an error."
      );

      console.error(
        "[Paddle Debug] Full checkout error event:",
        event
      );

      setLoading(false);

      alert(
        "Paddle reported an error while processing your payment."
      );

      return;
    }

    /*
     * -------------------------------------------------------
     * OTHER EVENTS
     * -------------------------------------------------------
     */

    console.log(
      "[Paddle Debug] Paddle event received but not handled:",
      event.name
    );
  };

  /*
   * ---------------------------------------------------------
   * CHECKOUT
   * ---------------------------------------------------------
   */

  const handleCheckout =
    async () => {
      try {
        console.group(
          "[Paddle Debug] ===== STARTING CHECKOUT ====="
        );

        console.log(
          "[Paddle Debug] Cart items:",
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
         * Validate client token.
         */
        if (!clientToken) {
          throw new Error(
            "Paddle client-side token is missing."
          );
        }

        /*
         * Validate Paddle.
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
         * Extract unique product slugs.
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
          "[Paddle Debug] Product slugs:",
          slugs
        );

        /*
         * Validate slugs.
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
         * Create transaction.
         */
        console.log(
          "[Paddle Debug] Calling create-paddle-transaction..."
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
          "[Paddle Debug] Transaction API HTTP status:",
          response.status
        );

        /*
         * Read response as text first.
         */
        const responseText =
          await response.text();

        console.log(
          "[Paddle Debug] Raw transaction API response:",
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
        } catch (error) {
          console.error(
            "[Paddle Debug] Failed to parse transaction API response:",
            error
          );

          throw new Error(
            `The transaction service returned an invalid response (HTTP ${response.status}).`
          );
        }

        console.log(
          "[Paddle Debug] Parsed transaction API response:",
          data
        );

        /*
         * Check API response.
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
          "[Paddle Debug] Transaction created:",
          cleanTransactionId
        );

        console.log(
          "[Paddle Debug] Products attached to transaction:",
          data?.products
        );

        /*
         * ---------------------------------------------------
         * IMPORTANT DEBUGGING SECTION
         * ---------------------------------------------------
         */

        console.log(
          "[Paddle Debug] Preparing Paddle Checkout configuration."
        );

        const checkoutConfig = {
          transactionId:
            cleanTransactionId,

          settings: {
            displayMode:
              "overlay",

            theme: "dark",

            locale: "en",
          },

          /*
           * This is the callback we are specifically
           * debugging.
           */
          eventCallback:
            (event) => {
              console.group(
                "[Paddle Debug] CALLBACK INVOCATION"
              );

              console.log(
                "[Paddle Debug] eventCallback was called!"
              );

              console.log(
                "[Paddle Debug] Event:",
                event
              );

              console.log(
                "[Paddle Debug] Event name:",
                event?.name
              );

              console.log(
                "[Paddle Debug] Event data:",
                event?.data
              );

              console.groupEnd();

              handlePaddleEvent(
                event,
                cleanTransactionId
              );
            },
        };

        console.log(
          "[Paddle Debug] Checkout configuration:",
          checkoutConfig
        );

        console.log(
          "[Paddle Debug] Calling window.Paddle.Checkout.open()..."
        );

        /*
         * Open Paddle Checkout.
         */
        window.Paddle.Checkout.open(
          checkoutConfig
        );

        console.log(
          "[Paddle Debug] window.Paddle.Checkout.open() completed."
        );

        console.log(
          "[Paddle Debug] Waiting for Paddle checkout events..."
        );

        console.groupEnd();
      } catch (error) {
        console.groupEnd();

        console.error(
          "[Paddle Debug] Paddle checkout error:",
          error
        );

        setLoading(false);

        alert(
          error.message ||
            "Something went wrong while starting checkout."
        );
      }
    };

  /*
   * ---------------------------------------------------------
   * BUTTON
   * ---------------------------------------------------------
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