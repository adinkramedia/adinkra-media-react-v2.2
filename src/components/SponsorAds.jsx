import { useEffect, useState } from "react";

// ============================================================
// SPONSOR CARD COMPONENT — Direct Sponsorship Invitation
// ============================================================
export default function SponsorCard() {
  const [deviceType, setDeviceType] = useState("desktop");

  // Detect device for responsive text sizing (optional — you can remove if not needed)
  useEffect(() => {
    const detect = () => {
      setDeviceType(window.innerWidth < 768 ? "mobile" : "desktop");
    };
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  return (
    <section
      aria-label="Sponsorship Opportunity"
      className="bg-adinkra-highlight/10 border border-adinkra-highlight rounded-lg max-w-5xl mx-auto px-6 py-10 text-center shadow-md"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-adinkra-highlight mb-4">
        Partner with Adinkra Media
      </h2>

      <p className="text-adinkra-gold/90 mb-6 text-sm md:text-base max-w-3xl mx-auto">
        Reach thousands of engaged readers who value independent, spiritually-rooted Pan-African stories, culture, and sovereignty.
      </p>

      <div className="bg-adinkra-card border border-adinkra-highlight rounded-lg p-8 max-w-3xl mx-auto shadow">
        <p className="text-lg md:text-xl font-semibold mb-6 text-adinkra-highlight">
          Showcase your brand to a dedicated audience that cares deeply about African narratives.
        </p>

        {/* Updated CTA: Link to Contact page */}
        <a
          href="/contact"
          className="inline-block bg-adinkra-highlight text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition"
        >
          Advertise With Us →
        </a>

        {/* Optional helpful note */}
        <p className="text-sm text-adinkra-gold/70 mt-4">
          View our sponsorship placements, starting rates, and contact form.
        </p>

        <p className="text-sm mt-6 text-adinkra-gold/70">
          Premium placements available • Ethical & mission-aligned partners only
        </p>
      </div>

      <p className="text-xs text-adinkra-gold/60 mt-8">
        This is a sponsorship opportunity — not an automated ad network.
      </p>
    </section>
  );
}