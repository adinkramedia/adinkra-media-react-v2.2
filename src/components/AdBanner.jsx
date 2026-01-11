// components/AdBanner.jsx
import { useEffect } from "react";

export default function AdBanner({ slot, style = {}, keyProp }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, [slot]);

  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
      <ins
        key={keyProp || slot} // ensure React key to help remount
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-2302585712980431"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
