import { useEffect } from "react";

const PayPalArticleButton = () => {
  useEffect(() => {
    // Dynamically load PayPal script and render button after load
    const scriptId = "paypal-sdk";

    const initPayPalButton = () => {
      if (window.paypal && window.paypal.HostedButtons) {
        window.paypal
          .HostedButtons({ hostedButtonId: "7L2Q2ULYP4XV4" })
          .render("#paypal-container-7L2Q2ULYP4XV4");
      }
    };

    // Load PayPal SDK if not already loaded
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://www.paypal.com/sdk/js?client-id=BAAlhg9grU8PDioZG3Gc19529WoT1qSTS8SqDTWlIRNhUO4q1HUZMnLcVkD2TPN9IjvMrBikbk99AQ8LUU&components=hosted-buttons&disable-funding=venmo&currency=USD";
      script.async = true;
      script.onload = initPayPalButton;
      document.body.appendChild(script);
    } else {
      initPayPalButton();
    }
  }, []);

  return (
    <div className="text-center mt-8">
      <h3 className="text-lg font-semibold mb-3">Support this Article (R5)</h3>
      <div id="paypal-container-7L2Q2ULYP4XV4"></div>
    </div>
  );
};

export default PayPalArticleButton;
