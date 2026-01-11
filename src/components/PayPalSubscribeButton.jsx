// PayPalSubscribeButton.jsx
import { useEffect } from "react";

const PayPalSubscribeButton = () => {
  useEffect(() => {
    const addPayPalScript = () => {
      const existingScript = document.getElementById("paypal-sdk");
      if (!existingScript) {
        const script = document.createElement("script");
        script.src =
          "https://www.paypal.com/sdk/js?client-id=AYP2FJ3PFKp0J-8_n9fAAgRsx_pN21pfSF3e2iSLItiJc33B4xPI124AQHeJFZ4KzqjXrqRh4F-Xr_nU&vault=true&intent=subscription";
        script.id = "paypal-sdk";
        script.async = true;
        script.dataset.sdkIntegrationSource = "button-factory";
        script.onload = renderButton;
        document.body.appendChild(script);
      } else {
        renderButton();
      }
    };

    const renderButton = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            shape: "pill",
            color: "gold",
            layout: "vertical",
            label: "subscribe",
          },
          createSubscription: function (data, actions) {
            return actions.subscription.create({
              plan_id: "P-3FN33664HB708745HNDQQH7A",
            });
          },
          onApprove: function (data, actions) {
            alert(
              `🎉 Subscription successful! Your PayPal subscription ID is: ${data.subscriptionID}`
            );
          },
        }).render("#paypal-button-container");
      }
    };

    addPayPalScript();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-lg font-semibold mb-2">
        Become a Supporter
      </h2>
      <div id="paypal-button-container" className="my-4"></div>
      <p className="text-sm text-gray-500 text-center max-w-md">
        Unlock full access to premium Adinkra Media articles, in-depth exclusive reports, and restricted content for just <strong>$2/month</strong>.
      </p>
    </div>
  );
};

export default PayPalSubscribeButton;
