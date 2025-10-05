import { useState, useEffect } from "react";

// Affiliate ads grouped by device type
const adsByDevice = {
  mobile: [
    // Social Catfish (mobile banner)
    {
      html: `<a href="https://www.anrdoezrs.net/click-101502333-15351955" target="_top">
               <img src="https://www.tqlkg.com/image-101502333-15351955" width="468" height="60" alt="Social Catfish" border="0" loading="lazy"/>
             </a>`,
    },
    // EconomyBookings (mobile small)
    {
      html: `<a href="https://www.kqzyfj.com/click-101502333-17126293" target="_top">
               <img src="https://www.ftjcfx.com/image-101502333-17126293" width="216" height="36" alt="EconomyBookings Mobile" border="0" loading="lazy"/>
             </a>`,
    },
    // Address Hotels (mobile version)
    {
      html: `<a href="https://www.tkqlhce.com/click-101502333-16945125" target="_top">
               <img src="https://www.tqlkg.com/image-101502333-16945125" width="300" height="50" alt="Address Hotels Mobile" border="0" loading="lazy"/>
             </a>`,
    },
    // EaseUS (small banner for mobile)
    {
      html: `<a href="https://www.kqzyfj.com/click-101502333-15398505" target="_top">
               <img src="https://www.tqlkg.com/image-101502333-15398505" width="120" height="60" alt="EaseUS Mobile" border="0" loading="lazy"/>
             </a>`,
    },
    // Proton VPN (text ad for mobile)
    {
      html: `
        <div class="p-4 bg-adinkra-highlight/20 rounded-lg text-center">
          <p class="text-sm font-semibold mb-2">Proton Partners Program:</p>
          <p class="text-xs mb-3">High-speed Swiss VPN that safeguards your privacy.</p>
          <a href="https://www.jdoqocy.com/click-101502333-15834536" target="_blank" class="inline-block bg-adinkra-highlight text-black px-4 py-2 rounded-full font-bold hover:bg-yellow-400 transition">
            Respect your Privacy. Get Proton VPN now
          </a>
        </div>
      `,
    },
    // Safeshell VPN (text ad for mobile)
    {
      html: `
        <div class="p-4 bg-adinkra-highlight/20 rounded-lg text-center">
          <p class="text-sm font-semibold mb-2">Safeshell VPN:</p>
          <p class="text-xs mb-3">Watch Netflix without limits — fast, secure and stable VPN!</p>
          <a href="https://www.kqzyfj.com/click-101502333-17077457" target="_blank" class="inline-block bg-adinkra-highlight text-black px-4 py-2 rounded-full font-bold hover:bg-yellow-400 transition">
            Get the Best VPN of 2025
          </a>
        </div>
      `,
    },
    // Adsterra Banner (mobile 320x50)
    {
      html: `<div id="adsterra-slot" style="width:320px; height:50px; margin:0 auto; background:#f9f9f9; display:flex; align-items:center; justify-content:center; font-size:12px; color:#777;">Loading Ad...</div>`,
      script: () => {
        window.atOptions = {
          key: "f58bb7dacd9d77f1bcea231e9e2052b5",
          format: "iframe",
          height: 50,
          width: 320,
          params: {},
        };
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "//www.highperformanceformat.com/f58bb7dacd9d77f1bcea231e9e2052b5/invoke.js";
        const slot = document.getElementById("adsterra-slot");
        if (slot) {
          slot.innerHTML = ""; // clear fallback
          slot.appendChild(script);
        }
      },
    },
  ],
  desktop: [
    // EconomyBookings (desktop big)
    {
      html: `<a href="https://www.anrdoezrs.net/click-101502333-17126205" target="_top">
               <img src="https://www.tqlkg.com/image-101502333-17126205" width="401" height="210" alt="EconomyBookings Desktop" border="0" loading="lazy"/>
             </a>`,
    },
    // Address Hotels (desktop banner)
    {
      html: `<a href="https://www.kqzyfj.com/click-101502333-16945253" target="_top">
               <img src="https://www.tqlkg.com/image-101502333-16945253" width="468" height="60" alt="Address Hotels" border="0" loading="lazy"/>
             </a>`,
    },
    // EaseUS (desktop small option)
    {
      html: `<a href="https://www.kqzyfj.com/click-101502333-15398505" target="_top">
               <img src="https://www.tqlkg.com/image-101502333-15398505" width="120" height="60" alt="EaseUS Desktop" border="0" loading="lazy"/>
             </a>`,
    },
    // Proton VPN (text ad for desktop)
    {
      html: `
        <div class="p-6 bg-adinkra-highlight/20 rounded-lg text-center">
          <p class="text-base font-semibold mb-2">Proton Partners Program:</p>
          <p class="text-sm mb-3">High-speed Swiss VPN that safeguards your privacy.</p>
          <a href="https://www.jdoqocy.com/click-101502333-15834536" target="_blank" class="inline-block bg-adinkra-highlight text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition">
            Respect your Privacy. Get Proton VPN now
          </a>
        </div>
      `,
    },
    // Safeshell VPN (text ad for desktop)
    {
      html: `
        <div class="p-6 bg-adinkra-highlight/20 rounded-lg text-center">
          <p class="text-base font-semibold mb-2">Safeshell VPN:</p>
          <p class="text-sm mb-3">Watch Netflix without limits — fast, secure and stable VPN!</p>
          <a href="https://www.kqzyfj.com/click-101502333-17077457" target="_blank" class="inline-block bg-adinkra-highlight text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition">
            Get the Best VPN of 2025
          </a>
        </div>
      `,
    },
  ],
};

export default function SponsorCard({ rotationInterval = 10000 }) {
  const [index, setIndex] = useState(0);
  const [deviceType, setDeviceType] = useState("desktop");

  useEffect(() => {
    const checkDevice = () => {
      if (window.innerWidth < 768) {
        setDeviceType("mobile");
      } else {
        setDeviceType("desktop");
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const ads = adsByDevice[deviceType] || [];

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, rotationInterval);
    return () => clearInterval(interval);
  }, [ads, rotationInterval]);

  // Inject extra scripts (Adsterra) when active
  useEffect(() => {
    const currentAd = ads[index];
    if (currentAd?.script) {
      currentAd.script();
    }
  }, [index, ads]);

  if (ads.length === 0) return null;

  return (
    <section
      aria-label="Advertisement"
      className="bg-adinkra-highlight/10 border border-adinkra-highlight rounded-lg max-w-5xl mx-auto px-6 py-10 text-center shadow-md"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-adinkra-highlight mb-4">
        Partner Message
      </h2>
      <p className="text-adinkra-gold/90 mb-6 text-sm md:text-base max-w-3xl mx-auto">
        Showcase your brand here — reach thousands of engaged readers daily.
      </p>

      {/* Ad container */}
      <div className="bg-adinkra-card border border-adinkra-highlight rounded-lg p-6 max-w-3xl mx-auto shadow">
        <div
          className="w-full flex justify-center [&_img]:max-w-full [&_img]:h-auto"
          dangerouslySetInnerHTML={{ __html: ads[index].html }}
        />
      </div>

      <p className="text-xs text-adinkra-gold/60 mt-4">
        Advertisement — not an endorsement.
      </p>
    </section>
  );
}
