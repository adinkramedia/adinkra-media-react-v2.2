// src/components/AdsterraEmbed.jsx
import { useEffect, useRef } from "react";

export default function AdsterraEmbed({ htmlCode }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !htmlCode) return;

    // Clear previous content
    containerRef.current.innerHTML = htmlCode;

    // Manually re-run <script> tags since React doesn't execute them
    const scriptTags = containerRef.current.querySelectorAll("script");
    scriptTags.forEach((oldScript) => {
      const newScript = document.createElement("script");
      if (oldScript.src) {
        newScript.src = oldScript.src;
        newScript.async = true;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.replaceWith(newScript);
    });
  }, [htmlCode]);

  return <div ref={containerRef} className="my-8 flex justify-center" />;
}
