import { useState, useEffect } from "react";

// ============================================================
// AFFILIATE ADS BY DEVICE
// ============================================================
const adsByDevice = {
  mobile: [
    // -------------------- TALKPAL (Responsive) --------------------
    {
      html: `
        <a href="https://talkpal.ai" target="_blank" rel="noopener">
          <img src="/ads/talkpal-mobile.jpg" 
               alt="Talkpal"
               class="w-full h-auto max-w-[350px] mx-auto rounded-lg" />
        </a>
      `,
    },

    // -------------------- AWeber (Mobile 300×250) --------------------
    {
      html: `
        <a href="https://www.aweber.com" target="_blank" rel="noopener">
          <img src="/ads/aweber-300x250.jpg"
               alt="AWeber Email Marketing"
               class="w-full h-auto max-w-[300px] mx-auto rounded-lg" />
        </a>
      `,
    },

    // -------------------- BC Babycare (Text Ad - Option A) --------------------
    {
      html: `
        <a href="https://bcbabycare.com" target="_blank" rel="noopener">
          <div class="p-4 bg-indigo-600 text-white text-center rounded-lg shadow-md">
            Shop the Dino Barron Playpen — Click to View
          </div>
        </a>
      `,
    },

    // -------------------- Existing Affiliate Ads --------------------
    {
      html: `<a href="https://www.anrdoezrs.net/click-101502333-15351955" target="_top">
               <img src="https://www.tqlkg.com/image-101502333-15351955"
               class="w-full h-auto max-w-[350px] mx-auto rounded-lg"
               alt="Social Catfish" loading="lazy"/>
             </a>`,
    },
    {
      html: `<a href="https://www.kqzyfj.com/click-101502333-17126293" target="_top">
               <img src="https://www.ftjcfx.com/image-101502333-17126293"
               class="w-full h-auto max-w-[220px] mx-auto rounded-lg"
               alt="EconomyBookings Mobile" loading="lazy"/>
             </a>`,
    },
    {
      html: `
        <div class="p-4 bg-indigo-600/20 rounded-lg text-center">
          <p class="text-sm font-semibold mb-2">Proton VPN — Swiss Security</p>
          <a href="https://www.jdoqocy.com/click-101502333-15834536" 
             target="_blank" 
             class="inline-block bg-indigo-600 text-white px-4 py-2 rounded">
            Get Proton VPN
          </a>
        </div>
      `,
    },
  ],

  // ========================================================================================

  desktop: [
    // -------------------- TALKPAL (Responsive Desktop) --------------------
    {
      html: `
        <a href="https://talkpal.ai" target="_blank" rel="noopener">
          <img src="/ads/talkpal-desktop.jpg" 
               alt="Talkpal"
               class="w-full h-auto max-w-[600px] mx-auto rounded-lg" />
        </a>
      `,
    },

    // -------------------- Aweber (Desktop 468×60) --------------------
    {
      html: `
        <a href="https://www.aweber.com" target="_blank" rel="noopener">
          <img src="/ads/aweber-468x60.jpg"
               alt="AWeber Email Marketing"
               class="w-full h-auto max-w-[468px] mx-auto rounded-lg" />
        </a>
      `,
    },

    // -------------------- BC Babycare (Text Ad - Option A) --------------------
    {
      html: `
        <a href="https://bcbabycare.com" target="_blank" rel="noopener">
          <div class="p-4 bg-indigo-600 text-white text-center rounded-lg shadow-md">
            BC Babycare — Award-winning Baby Essentials
          </div>
        </a>
      `,
    },

    // -------------------- Existing Affiliate Ads --------------------
    {
      html: `<a href="https://www.anrdoezrs.net/click-101502333-17126205" target="_top">
               <img src="https://www.tqlkg.com/image-101502333-17126205"
               class="w-full h-auto max-w-[450px] mx-auto rounded-lg"
               alt="EconomyBookings Desktop" loading="lazy"/>
             </a>`,
    },
    {
      html: `
        <div class="p-6 bg-indigo-600/20 rounded-lg text-center">
          <p class="text-base font-semibold mb-2">Safeshell VPN — 2025 Best Pick</p>
          <a href="https://www.kqzyfj.com/click-101502333-17077457" 
             class="inline-block bg-indigo-600 text-white px-6 py-3 rounded">
            Try Safeshell VPN
          </a>
        </div>
      `,
    },
  ],
};

// ============================================================
// SPONSOR CARD COMPONENT
// ============================================================
export default function SponsorCard({ rotationInterval = 10000 }) {
  const [index, setIndex] = useState(0);
  const [deviceType, setDeviceType] = useState("desktop");

  // Detect device (mobile vs desktop)
  useEffect(() => {
    const detect = () => {
      setDeviceType(window.innerWidth < 768 ? "mobile" : "desktop");
    };
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  const ads = adsByDevice[deviceType] ?? [];

  // Rotate ads
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % ads.length),
      rotationInterval
    );
    return () => clearInterval(interval);
  }, [ads, rotationInterval]);

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
