import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

export default function PaddleButton({
  cartItems = [],
}) {
  const navigate = useNavigate();

  const [
    paddleReady,
    setPaddleReady,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /*
   * Stores information about the
   * checkout currently in progress.
   *
   * This is used by Paddle's global
   * Initialize eventCallback.
   */
  const currentCheckoutRef =
    useRef({
      transactionId: null,
      productSlugs: [],
    });

  /*
   * Prevents duplicate redirects if
   * Paddle fires checkout.completed
   * more than once.
   */
  const redirectingRef =
    useRef(false);

  const clientToken =
    import.meta.env
      .VITE_PADDLE_CLIENT_TOKEN;

  /*
   * ---------------------------------------------------------
   * PADDLE EVENT HANDLER
   * ---------------------------------------------------------
   *
   * This function is called by the
   * global Paddle.Initialize eventCallback.
   */
  const handlePaddleEvent = (
    event
  ) => {
    console.group(
      "[Paddle Debug] ===== PADDLE EVENT ====="
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

    console.log(
      "[Paddle Debug] Event transaction_id:",
      event?.data
        ?.transaction_id
    );

    console.log(
      "[Paddle Debug] Current checkout ref:",
      currentCheckoutRef.current
    );

    console.groupEnd();

    if (
      !event ||
      !event.name
    ) {
      console.warn(
        "[Paddle Debug] Event received without a name."
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
       * Prevent duplicate redirects.
       */
      if (
        redirectingRef.current
      ) {
        console.warn(
          "[Paddle Debug] Redirect already in progress. Ignoring duplicate checkout.completed event."
        );

        return;
      }

      /*
       * Try every known location
       * where Paddle may expose the
       * transaction ID.
       */
      const eventTransactionId =
        event?.data
          ?.transaction_id ||
        event?.data
          ?.transactionId ||
        event?.transaction_id ||
        event?.transactionId ||
        null;

      /*
       * Fall back to the transaction
       * created by our Netlify function.
       */
      const storedTransactionId =
        currentCheckoutRef.current
          .transactionId;

      const completedTransactionId =
        eventTransactionId ||
        storedTransactionId;

      /*
       * Retrieve the product slugs
       * stored before checkout opened.
       */
      const productSlugs =
        currentCheckoutRef.current
          .productSlugs || [];

      console.group(
        "[Paddle Debug] ===== CHECKOUT COMPLETED ====="
      );

      console.log(
        "[Paddle Debug] Event transaction ID:",
        eventTransactionId
      );

      console.log(
        "[Paddle Debug] Stored transaction ID:",
        storedTransactionId
      );

      console.log(
        "[Paddle Debug] Final transaction ID:",
        completedTransactionId
      );

      console.log(
        "[Paddle Debug] Purchased product slugs:",
        productSlugs
      );

      console.groupEnd();

      /*
       * Validate transaction ID.
       */
      if (
        typeof completedTransactionId !==
          "string" ||
        !completedTransactionId.trim()
      ) {
        console.error(
          "[Paddle Debug] checkout.completed fired, but no transaction ID was available."
        );

        setLoading(false);

        alert(
          "Your payment was completed, but we could not identify your transaction. Please contact support."
        );

        return;
      }

      /*
       * Validate purchased products.
       *
       * Downloads.jsx requires these
       * product slugs to find the files
       * in Sanity.
       */
      if (
        !Array.isArray(
          productSlugs
        ) ||
        productSlugs.length === 0
      ) {
        console.error(
          "[Paddle Debug] checkout.completed fired, but no product slugs were stored."
        );

        setLoading(false);

        alert(
          "Your payment was completed, but we could not identify the purchased products. Please contact support."
        );

        return;
      }

      /*
       * Prevent duplicate navigation.
       */
      redirectingRef.current =
        true;

      const cleanTransactionId =
        completedTransactionId.trim();

      /*
       * Build the products query.
       *
       * Example:
       *
       * /downloads
       *   ?transaction=txn_123
       *   &products=rise-sound-effect,abstract-by-design-stems
       */
      const productsQuery =
        productSlugs
          .map(
            (slug) =>
              encodeURIComponent(
                slug
              )
          )
          .join(",");

      const downloadPath =
        `/downloads?transaction=${encodeURIComponent(
          cleanTransactionId
        )}&products=${productsQuery}`;

      console.log(
        "[Paddle Debug] Final Downloads URL:",
        downloadPath
      );

      /*
       * Stop checkout loading state.
       */
      setLoading(false);

      /*
       * Clear checkout state
       * before navigating.
       */
      currentCheckoutRef.current =
        {
          transactionId: null,
          productSlugs: [],
        };

      /*
       * Navigate to Downloads.
       */
      navigate(
        downloadPath,
        {
          replace: true,
        }
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
        "[Paddle Debug] Checkout closed by customer."
      );

      setLoading(false);

      redirectingRef.current =
        false;

      currentCheckoutRef.current =
        {
          transactionId: null,
          productSlugs: [],
        };

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
        "[Paddle Debug] Paddle checkout error:",
        event
      );

      setLoading(false);

      redirectingRef.current =
        false;

      currentCheckoutRef.current =
        {
          transactionId: null,
          productSlugs: [],
        };

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
      "[Paddle Debug] Paddle event received:",
      event.name
    );
  };

  /*
   * ---------------------------------------------------------
   * PADDLE INITIALIZATION
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    const initializePaddle =
      async () => {
        try {
          console.log(
            "[Paddle Debug] Starting Paddle initialization."
          );

          /*
           * Validate client token.
           */
          if (!clientToken) {
            console.error(
              "[Paddle Debug] VITE_PADDLE_CLIENT_TOKEN is missing."
            );

            return;
          }

          /*
           * Load Paddle SDK if necessary.
           */
          if (
            !window.Paddle
          ) {
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
                if (
                  window.Paddle
                ) {
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
                      "[Paddle Debug] Paddle SDK failed to load:",
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
           * Confirm Paddle exists.
           */
          if (
            !window.Paddle
          ) {
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
           *
           * IMPORTANT:
           *
           * eventCallback is registered
           * HERE, not inside Checkout.open().
           */
          if (
            !window
              .__ADINKRA_PADDLE_INITIALIZED__
          ) {
            console.log(
              "[Paddle Debug] Initializing Paddle with global eventCallback."
            );

            window.Paddle.Initialize(
              {
                token:
                  clientToken,

                eventCallback:
                  (
                    event
                  ) => {
                    console.log(
                      "[Paddle Debug] ===== GLOBAL EVENT CALLBACK FIRED ====="
                    );

                    handlePaddleEvent(
                      event
                    );
                  },
              }
            );

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

          /*
           * Mark Paddle ready.
           */
          if (
            !cancelled
          ) {
            setPaddleReady(
              true
            );

            console.log(
              "[Paddle Debug] Paddle is ready for checkout."
            );
          }
        } catch (
          error
        ) {
          console.error(
            "[Paddle Debug] Paddle initialization failed:",
            error
          );

          if (
            !cancelled
          ) {
            setPaddleReady(
              false
            );
          }
        }
      };

    initializePaddle();

    return () => {
      cancelled = true;
    };
  }, [
    clientToken,
  ]);

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
         * Validate Paddle token.
         */
        if (
          !clientToken
        ) {
          throw new Error(
            "Paddle client-side token is missing."
          );
        }

        /*
         * Validate Paddle readiness.
         */
        if (
          !paddleReady ||
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
                (
                  item
                ) =>
                  item?.slug
              )
              .filter(
                (
                  slug
                ) =>
                  typeof slug ===
                    "string" &&
                  slug.trim()
                    .length >
                    0
              )
              .map(
                (
                  slug
                ) =>
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
          slugs.length ===
          0
        ) {
          throw new Error(
            "No valid product slugs were found."
          );
        }

        /*
         * Reset checkout state.
         */
        redirectingRef.current =
          false;

        currentCheckoutRef.current =
          {
            transactionId: null,
            productSlugs: slugs,
          };

        setLoading(
          true
        );

        /*
         * Create transaction
         * through Netlify.
         */
        console.log(
          "[Paddle Debug] Calling create-paddle-transaction..."
        );

        const response =
          await fetch(
            "/.netlify/functions/create-paddle-transaction",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
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
          "[Paddle Debug] Transaction API HTTP status:",
          response.status
        );

        console.log(
          "[Paddle Debug] Raw transaction API response:",
          responseText
        );

        /*
         * Parse JSON.
         */
        let data = {};

        try {
          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : {};
        } catch (
          parseError
        ) {
          console.error(
            "[Paddle Debug] Failed to parse transaction API response:",
            parseError
          );

          throw new Error(
            `Invalid response from transaction service (HTTP ${response.status}).`
          );
        }

        console.log(
          "[Paddle Debug] Parsed transaction API response:",
          data
        );

        /*
         * Handle failed transaction
         * creation.
         */
        if (
          !response.ok
        ) {
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

        /*
         * Store transaction ID and
         * purchased product slugs.
         */
        currentCheckoutRef.current =
          {
            transactionId:
              cleanTransactionId,

            productSlugs:
              slugs,
          };

        console.log(
          "[Paddle Debug] Transaction created:",
          cleanTransactionId
        );

        console.log(
          "[Paddle Debug] Products attached to checkout:",
          slugs
        );

        /*
         * Open Paddle Checkout.
         *
         * IMPORTANT:
         *
         * There is intentionally NO
         * eventCallback here.
         *
         * The global callback registered
         * in Paddle.Initialize() handles
         * all Paddle events.
         */
        console.log(
          "[Paddle Debug] Opening Paddle Checkout..."
        );

        window.Paddle.Checkout.open(
          {
            transactionId:
              cleanTransactionId,

            settings: {
              displayMode:
                "overlay",

              theme:
                "dark",

              locale:
                "en",
            },
          }
        );

        console.log(
          "[Paddle Debug] Paddle Checkout opened."
        );

        console.log(
          "[Paddle Debug] Waiting for global Paddle eventCallback..."
        );

        console.groupEnd();
      } catch (
        error
      ) {
        console.groupEnd();

        console.error(
          "[Paddle Debug] Paddle checkout error:",
          error
        );

        setLoading(
          false
        );

        redirectingRef.current =
          false;

        currentCheckoutRef.current =
          {
            transactionId:
              null,

            productSlugs:
              [],
          };

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
        !paddleReady ||
        cartItems.length ===
          0
      }
      className="w-full bg-adinkra-gold text-adinkra-bg font-bold py-3 px-4 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading
        ? "Processing payment..."
        : !paddleReady
        ? "Loading Paddle..."
        : "Buy with Paddle"}
    </button>
  );
}