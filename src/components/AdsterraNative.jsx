import { useEffect } from "react";

const loadedScripts = {};

const AdsterraNative = ({ containerId, scriptSrc }) => {
  useEffect(() => {
    // Ensure container exists
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className = "my-6 w-full flex justify-center";
      document.body.appendChild(container);
    }

    // Append script if not loaded
    if (!loadedScripts[scriptSrc]) {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.onload = () => {
        // Re-invoke Adsterra if available
        if (window.AdsterraNativeInvoke) window.AdsterraNativeInvoke();
      };
      document.body.appendChild(script);
      loadedScripts[scriptSrc] = true;
    } else {
      if (window.AdsterraNativeInvoke) window.AdsterraNativeInvoke();
    }
  }, [containerId, scriptSrc]);

  return <div id={containerId} className="my-6 w-full flex justify-center"></div>;
};

export default AdsterraNative;
