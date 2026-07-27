import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

const PENDING_CHECKOUT_KEY = "adinkra_pending_checkout";

function savePendingCheckout(transactionId, productSlugs) {
  try {
    sessionStorage.setItem(
      PENDING_CHECKOUT_KEY,
      JSON.stringify({
        transactionId: transactionId || null,
        productSlugs: Array.isArray(productSlugs) ? productSlugs : [],
        savedAt: Date.now(),
      })
    );
  } catch (e) {
    console.warn("[Paddle Debug] Could not write sessionStorage:", e);
  }
}

function loadPendingCheckout() {
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearPendingCheckout() {
  try {
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    // ignore
  }
}

export default function PaddleButton({ cartItems = [] }) {
  const navigate = useNavigate();

  const [paddleReady, setPaddleReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Still keep a ref for quick access, but sessionStorage is the source of truth
  const currentCheckoutRef = useRef({
    transactionId: null,
    productSlugs: [],
  });

  const redirectingRef = useRef(false);

  const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;

  // ---------------------------------------------------------
  // PADDLE EVENT HANDLER
  // ---------------------------------------------------------
  const handlePaddleEvent = (event) => {
    console.group("[Paddle Debug] ===== PADDLE EVENT =====");
    console.log("[Paddle Debug] Event name:", event?.name);
    console.log("[Paddle Debug] Event transaction_id:", event?.data?.transaction_id);
    console.log("[Paddle Debug] Current checkout ref:", currentCheckoutRef.current);
    console.log("[Paddle Debug] sessionStorage pending:", loadPendingCheckout());
    console.groupEnd();

    if (!event?.name) return;

    // -------------------------------------------------------
    // CHECKOUT COMPLETED
    // -------------------------------------------------------
    if (event.name === "checkout.completed") {
      console.log("[Paddle Debug] checkout.completed detected.");

      if (redirectingRef.current) {
        console.warn("[Paddle Debug] Redirect already in progress. Ignoring duplicate.");
        return;
      }

      const eventTransactionId =
        event?.data?.transaction_id ||
        event?.data?.transactionId ||
        null;

      // Prefer sessionStorage (survives late closed events)
      const stored = loadPendingCheckout();
      const storedTransactionId =
        stored?.transactionId || currentCheckoutRef.current.transactionId;
      const productSlugs =
        (Array.isArray(stored?.productSlugs) && stored.productSlugs.length > 0
          ? stored.productSlugs
          : currentCheckoutRef.current.productSlugs) || [];

      const completedTransactionId = eventTransactionId || storedTransactionId;

      console.group("[Paddle Debug] ===== CHECKOUT COMPLETED =====");
      console.log("[Paddle Debug] Event transaction ID:", eventTransactionId);
      console.log("[Paddle Debug] Stored transaction ID:", storedTransactionId);
      console.log("[Paddle Debug] Final transaction ID:", completedTransactionId);
      console.log("[Paddle Debug] Purchased product slugs:", productSlugs);
      console.groupEnd();

      if (
        typeof completedTransactionId !== "string" ||
        !completedTransactionId.trim()
      ) {
        console.error("[Paddle Debug] No transaction ID available.");
        setLoading(false);
        alert(
          "Your payment was completed, but we could not identify your transaction. Please contact support."
        );
        return;
      }

      if (!Array.isArray(productSlugs) || productSlugs.length === 0) {
        console.error("[Paddle Debug] No product slugs were stored.");
        setLoading(false);
        alert(
          "Your payment was completed, but we could not identify the purchased products. Please contact support."
        );
        return;
      }

      redirectingRef.current = true;
      setLoading(false);

      const cleanTransactionId = completedTransactionId.trim();
      const productsQuery = productSlugs
        .map((slug) => encodeURIComponent(slug))
        .join(",");

      const downloadPath = `/downloads?transaction=${encodeURIComponent(
        cleanTransactionId
      )}&products=${productsQuery}`;

      console.log("[Paddle Debug] Final Downloads URL:", downloadPath);

      // Clear only after we have everything we need
      clearPendingCheckout();
      currentCheckoutRef.current = {
        transactionId: null,
        productSlugs: [],
      };

      navigate(downloadPath, { replace: true });
      return;
    }

    // -------------------------------------------------------
    // CHECKOUT CLOSED
    // -------------------------------------------------------
    if (event.name === "checkout.closed") {
      console.log("[Paddle Debug] Checkout closed by customer.");

      const closedTxnId = event?.data?.transaction_id || null;
      const pending = loadPendingCheckout();

      // Only clear if this closed event belongs to the same transaction
      // (prevents a late closed event from a previous purchase wiping a new checkout)
      if (
        !pending ||
        !closedTxnId ||
        pending.transactionId === closedTxnId
      ) {
        // Safe to clear only when it matches (or there is nothing pending)
        if (!redirectingRef.current) {
          clearPendingCheckout();
          currentCheckoutRef.current = {
            transactionId: null,
            productSlugs: [],
          };
        }
      } else {
        console.log(
          "[Paddle Debug] Ignoring late checkout.closed from a different transaction."
        );
      }

      setLoading(false);
      redirectingRef.current = false;
      return;
    }

    // -------------------------------------------------------
    // CHECKOUT ERROR
    // -------------------------------------------------------
    if (event.name === "checkout.error") {
      console.error("[Paddle Debug] Paddle checkout error:", event);
      setLoading(false);
      redirectingRef.current = false;
      clearPendingCheckout();
      currentCheckoutRef.current = {
        transactionId: null,
        productSlugs: [],
      };
      alert("Paddle reported an error while processing your payment.");
      return;
    }

    console.log("[Paddle Debug] Paddle event received:", event.name);
  };

  // ---------------------------------------------------------
  // PADDLE INITIALIZATION
  // ---------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const initializePaddle = async () => {
      try {
        console.log("[Paddle Debug] Starting Paddle initialization.");

        if (!clientToken) {
          console.error("[Paddle Debug] VITE_PADDLE_CLIENT_TOKEN is missing.");
          return;
        }

        if (!window.Paddle) {
          console.log("[Paddle Debug] Paddle SDK not found. Loading SDK...");

          let script = document.getElementById("paddle-sdk");
          if (!script) {
            script = document.createElement("script");
            script.id = "paddle-sdk";
            script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
            script.async = true;
            document.body.appendChild(script);
            console.log("[Paddle Debug] Paddle SDK script added to document.");
          }

          await new Promise((resolve, reject) => {
            if (window.Paddle) {
              resolve();
              return;
            }
            script.addEventListener("load", () => resolve(), { once: true });
            script.addEventListener("error", (e) => reject(e), { once: true });
          });
        }

        if (!window.Paddle) {
          throw new Error("Paddle SDK failed to load.");
        }

        console.log("[Paddle Debug] window.Paddle is available.");
        console.log("[Paddle Debug] Setting Paddle environment to sandbox.");
        window.Paddle.Environment.set("sandbox");

        if (!window.__ADINKRA_PADDLE_INITIALIZED__) {
          console.log(
            "[Paddle Debug] Initializing Paddle with global eventCallback."
          );

          // Store the latest handler so the global callback always uses fresh logic
          window.__ADINKRA_PADDLE_EVENT_HANDLER__ = handlePaddleEvent;

          window.Paddle.Initialize({
            token: clientToken,
            eventCallback: (event) => {
              console.log(
                "[Paddle Debug] ===== GLOBAL EVENT CALLBACK FIRED ====="
              );
              // Always call the latest registered handler
              if (typeof window.__ADINKRA_PADDLE_EVENT_HANDLER__ === "function") {
                window.__ADINKRA_PADDLE_EVENT_HANDLER__(event);
              }
            },
          });

          window.__ADINKRA_PADDLE_INITIALIZED__ = true;
          console.log("[Paddle Debug] Paddle initialized successfully.");
        } else {
          // Update the handler so it always points to the current component instance
          window.__ADINKRA_PADDLE_EVENT_HANDLER__ = handlePaddleEvent;
          console.log("[Paddle Debug] Paddle was already initialized.");
        }

        if (!cancelled) {
          setPaddleReady(true);
          console.log("[Paddle Debug] Paddle is ready for checkout.");
        }
      } catch (error) {
        console.error("[Paddle Debug] Paddle initialization failed:", error);
        if (!cancelled) setPaddleReady(false);
      }
    };

    initializePaddle();

    // Keep the global handler up to date whenever this component is alive
    window.__ADINKRA_PADDLE_EVENT_HANDLER__ = handlePaddleEvent;

    return () => {
      cancelled = true;
    };
  }, [clientToken]);

  // ---------------------------------------------------------
  // CHECKOUT
  // ---------------------------------------------------------
  const handleCheckout = async () => {
    try {
      console.group("[Paddle Debug] ===== STARTING CHECKOUT =====");
      console.log("[Paddle Debug] Cart items:", cartItems);

      if (!cartItems || cartItems.length === 0) {
        throw new Error("Your cart is empty.");
      }
      if (!clientToken) {
        throw new Error("Paddle client-side token is missing.");
      }
      if (!paddleReady || !window.Paddle) {
        throw new Error("Paddle is still loading. Please wait a moment.");
      }

      const slugs = [
        ...new Set(
          cartItems
            .map((item) => item?.slug)
            .filter((slug) => typeof slug === "string" && slug.trim().length > 0)
            .map((slug) => slug.trim())
        ),
      ];

      console.log("[Paddle Debug] Product slugs:", slugs);

      if (slugs.length === 0) {
        throw new Error("No valid product slugs were found.");
      }

      // Reset state for this new checkout
      redirectingRef.current = false;
      currentCheckoutRef.current = {
        transactionId: null,
        productSlugs: slugs,
      };
      // Persist immediately so a late closed event cannot wipe us
      savePendingCheckout(null, slugs);

      setLoading(true);

      console.log("[Paddle Debug] Calling create-paddle-transaction...");

      const response = await fetch(
        "/.netlify/functions/create-paddle-transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ slugs }),
        }
      );

      const responseText = await response.text();
      console.log("[Paddle Debug] Transaction API HTTP status:", response.status);
      console.log("[Paddle Debug] Raw transaction API response:", responseText);

      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("[Paddle Debug] Failed to parse response:", parseError);
        throw new Error(
          `Invalid response from transaction service (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create Paddle transaction.");
      }

      const transactionId = data?.transactionId;
      if (typeof transactionId !== "string" || !transactionId.trim()) {
        throw new Error("Paddle did not return a valid transaction ID.");
      }

      const cleanTransactionId = transactionId.trim();

      // Store both in ref and sessionStorage
      currentCheckoutRef.current = {
        transactionId: cleanTransactionId,
        productSlugs: slugs,
      };
      savePendingCheckout(cleanTransactionId, slugs);

      console.log("[Paddle Debug] Transaction created:", cleanTransactionId);
      console.log("[Paddle Debug] Products attached to checkout:", slugs);

      console.log("[Paddle Debug] Opening Paddle Checkout...");
      window.Paddle.Checkout.open({
        transactionId: cleanTransactionId,
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: "en",
        },
      });

      console.log("[Paddle Debug] Paddle Checkout opened.");
      console.log("[Paddle Debug] Waiting for global Paddle eventCallback...");
      console.groupEnd();
    } catch (error) {
      console.groupEnd();
      console.error("[Paddle Debug] Paddle checkout error:", error);

      setLoading(false);
      redirectingRef.current = false;
      clearPendingCheckout();
      currentCheckoutRef.current = {
        transactionId: null,
        productSlugs: [],
      };

      alert(error.message || "Something went wrong while starting checkout.");
    }
  };

  // ---------------------------------------------------------
  // BUTTON
  // ---------------------------------------------------------
  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading || !paddleReady || cartItems.length === 0}
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