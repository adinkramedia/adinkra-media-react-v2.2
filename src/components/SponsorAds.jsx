import { useEffect, useState } from "react";

// ============================================================
// SPONSOR CARD COMPONENT — Rotating Billboard Ads
// ============================================================
export default function SponsorCard() {
  const [deviceType, setDeviceType] = useState("desktop");
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  // ------------------------------------------------------------
  // Detect device type (desktop vs mobile)
  // ------------------------------------------------------------
  useEffect(() => {
    const detect = () => {
      setDeviceType(window.innerWidth < 768 ? "mobile" : "desktop");
    };
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  // ------------------------------------------------------------
  // Ad inventory
  // ------------------------------------------------------------
  const ads = [
    {
      id: "ntumarket",
      desktopSrc: "/ads/ntumarket-970x250.jpg",
      mobileSrc: "/ads/ntumarket-320x100.jpg",
      link: "https://ntumarket.adinkramedia.com",
      label: "Visit NtuMarket",
    },
    {
      id: "advertise",
      desktopSrc: "/ads/advertise-970x250.jpg",
      mobileSrc: "/ads/advertise-320x100.jpg",
      link: "https://adinkramedia.com/contact",
      label: "Advertise with Adinkra Media",
    },
  ];

  // ------------------------------------------------------------
  // Rotate ads every 20 seconds
  // ------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % ads.length);
    }, 20000); // 20 seconds
    return () => clearInterval(interval);
  }, [ads.length]);

  const activeAd = ads[activeAdIndex];
  const imgSrc = deviceType === "mobile" ? activeAd.mobileSrc : activeAd.desktopSrc;

  return (
    <section
      aria-label="Sponsorship Opportunity"
      className="bg-adinkra-highlight/10 border border-adinkra-highlight rounded-lg max-w-5xl mx-auto px-6 py-6 text-center shadow-md"
    >
      {/* ================= Rotating Image Ad ================= */}
      <div className="flex justify-center mb-6">
        <a
          key={activeAd.id}
          href={activeAd.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={activeAd.label}
          className="block rounded-lg overflow-hidden border border-adinkra-highlight shadow-lg hover:scale-[1.02] transition"
        >
          <img
            src={imgSrc}
            alt={activeAd.label}
            className="w-full h-auto object-cover"
          />
        </a>
      </div>

      {/* ================= Sponsor Copy ================= */}
      <h2 className="text-2xl md:text-3xl font-bold text-adinkra-highlight mb-3">
        Partner with Adinkra Media
      </h2>

      <p className="text-adinkra-gold/90 mb-4 text-sm md:text-base max-w-3xl mx-auto">
        Reach thousands of engaged readers who value independent,
        spiritually-rooted Pan-African stories, culture, and sovereignty.
      </p>

      <a
        href="/contact"
        className="inline-block bg-adinkra-highlight text-black px-6 py-3 rounded-lg font-bold text-base hover:bg-yellow-400 transition mb-2"
      >
        Advertise With Us →
      </a>

      <p className="text-xs text-adinkra-gold/60 mt-2">
        Premium placements available • Ethical & mission-aligned partners only
      </p>
    </section>
  );
}
