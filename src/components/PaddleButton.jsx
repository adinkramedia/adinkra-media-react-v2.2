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

        if (window.Paddle) {
          console.log(
            "Paddle SDK already loaded."
          );

          if (
            !window.__ADINKRA_PADDLE_INITIALIZED__
          ) {
            window.Paddle.Environment.set(
              "sandbox"
            );

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

        window.Paddle.Environment.set(
          "sandbox"
        );

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

  const handleCheckout = async () => {
    try {
      console.log(
        "Buy with Paddle clicked."
      );

      console.log(
        "Cart items:",
        cartItems
      );

      if (
        !cartItems ||
        cartItems.length === 0
      ) {
        throw new Error(
          "Your cart is empty."
        );
      }

      if (!clientToken) {
        throw new Error(
          "Paddle client-side token is missing."
        );
      }

      if (
        !paddleLoaded ||
        !paddleInitialized ||
        !window.Paddle
      ) {
        throw new Error(
          "Paddle is still loading. Please wait a moment and try again."
        );
      }

      const slugs = [
        ...new Set(
          cartItems
            .map(
              (item) => item.slug
            )
            .filter(
              (slug) =>
                typeof slug === "string" &&
                slug.trim().length > 0
            )
        ),
      ];

      console.log(
        "Product slugs:",
        slugs
      );

      if (slugs.length === 0) {
        throw new Error(
          "No valid product slugs were found in the cart."
        );
      }

      setLoading(true);

      const response = await fetch(
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

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to create Paddle transaction (HTTP ${response.status}).`
        );
      }

      if (
        !data.transactionId
      ) {
        throw new Error(
          "No Paddle transaction ID was returned."
        );
      }

      console.log(
        "Paddle transaction created:",
        data.transactionId
      );

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

          if (
            event.name ===
            "checkout.completed"
          ) {
            console.log(
              "Paddle checkout completed."
            );

            setLoading(false);

            if (onSuccess) {
              onSuccess({
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
        ? "Processing payment..."
        : !paddleLoaded ||
          !paddleInitialized
        ? "Loading Paddle..."
        : "Buy with Paddle"}
    </button>
  );
}