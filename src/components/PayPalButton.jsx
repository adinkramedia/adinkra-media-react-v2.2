import { useEffect, useRef } from "react";

export default function PayPalButton({ price, title, onSuccess }) {
  const paypalRef = useRef(null);
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      console.error("PayPal Client ID is missing. Check your .env file.");
      return;
    }

    const loadPayPalScript = () => {
      return new Promise((resolve, reject) => {
        // If SDK already exists, resolve immediately
        if (window.paypal) {
          resolve();
          return;
        }

        const existingScript = document.getElementById("paypal-sdk");
        if (existingScript) {
          existingScript.addEventListener("load", resolve);
          return;
        }

        const script = document.createElement("script");
        script.id = "paypal-sdk";
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const renderButton = async () => {
      try {
        await loadPayPalScript();

        if (!paypalRef.current || !window.paypal) return;

        // Clear previous render
        paypalRef.current.innerHTML = "";

        window.paypal
          .Buttons({
            style: {
              color: "gold",
              shape: "pill",
              label: "pay",
            },

            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: title,
                    amount: {
                      value: Number(price).toFixed(2),
                      currency_code: "USD",
                    },
                  },
                ],
              });
            },

            onApprove: async (data, actions) => {
              const order = await actions.order.capture();
              console.log("✅ Order successful:", order);
              if (onSuccess) onSuccess(order);
            },

            onError: (err) => {
              console.error("❌ PayPal Checkout Error:", err);
            },
          })
          .render(paypalRef.current);
      } catch (err) {
        console.error("Failed to load PayPal SDK:", err);
      }
    };

    renderButton();

    return () => {
      // Clean up buttons if component unmounts
      if (paypalRef.current) {
        paypalRef.current.innerHTML = "";
      }
    };
  }, [price, title, onSuccess, clientId]);

  return <div ref={paypalRef} />;
}