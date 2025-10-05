import { useEffect, useRef } from "react";

export default function PayPalButton({ price, title, onSuccess }) {
  const paypalRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    const renderPayPalButton = () => {
      if (!window.paypal || !paypalRef.current) return;

      // Clear old buttons to prevent stacking
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
                    value: price,
                    currency_code: "EUR",
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
    };

    const addPayPalScript = () => {
      if (document.getElementById("paypal-sdk")) {
        renderPayPalButton();
        return;
      }

      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
      script.async = true;
      script.onload = renderPayPalButton;
      document.body.appendChild(script);
    };

    addPayPalScript();
  }, [price, title, onSuccess]);

  return <div ref={paypalRef}></div>;
}
