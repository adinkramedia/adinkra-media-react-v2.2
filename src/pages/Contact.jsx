import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Contact() {
  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Mission */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-adinkra-highlight mb-6">
            Contact & Services
          </h1>
          <p className="text-adinkra-gold/90 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            Adinkra Media was founded to liberate and decolonise the Nubian nation through media, edutainment, spirituality, and music — connecting the continent and its diaspora. We believe in reclaiming our narratives through powerful stories and sonic identity rooted in African heritage.
          </p>
        </div>

        {/* Services & Rate Cards */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-adinkra-highlight mb-10 text-center">
            Our Services & Rate Cards
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Custom Music Creation */}
            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-adinkra-highlight mb-4">
                🎼 Custom Music Creation
              </h3>
              <p className="text-adinkra-gold/80 mb-6">
                Original compositions tailored to your vision — rooted in African sonic identity.
              </p>
              <div className="space-y-4">
                <div className="bg-black/20 p-5 rounded-xl">
                  <p className="font-bold text-xl">R134 ZAR (~$8 USD)</p>
                  <p className="text-base">Standard License</p>
                  <p className="text-sm text-adinkra-gold/70 mt-1">For YouTube, podcasts, personal use</p>
                </div>
                <div className="bg-black/20 p-5 rounded-xl">
                  <p className="font-bold text-xl">R346 ZAR (~$21 USD)</p>
                  <p className="text-base">Extended License</p>
                  <p className="text-sm text-adinkra-gold/70 mt-1">For film, ads, apps, monetized projects</p>
                </div>
                <div className="bg-black/20 p-5 rounded-xl">
                  <p className="font-bold text-xl">R576 ZAR (~$35 USD)</p>
                  <p className="text-base">Broadcast License</p>
                  <p className="text-sm text-adinkra-gold/70 mt-1">For TV, radio, cinema, video games, major commercial distribution</p>
                </div>
              </div>
            </div>

            {/* Film Scoring & Foley */}
            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-adinkra-highlight mb-4">
                🎬 Film Scoring & Foley
              </h3>
              <p className="text-adinkra-gold/80 mb-6">
                Custom scoring and sound design for film, documentaries, or visual media. Pricing depends on project length, complexity, and scope.
              </p>
              <div className="bg-black/20 p-6 rounded-xl text-center">
                <p className="font-bold text-xl">Starting from R9,600 ZAR (~$500 USD)</p>
                <p className="text-sm mt-2 italic">Contact us for a detailed quote.</p>
              </div>
            </div>

            {/* Collaborate & Sponsorship */}
            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 md:col-span-2 lg:col-span-1">
              <h3 className="text-2xl font-semibold text-adinkra-highlight mb-6">
                🤝 Collaborate with Us
              </h3>
              <p className="text-adinkra-gold/80 mb-6">
                Partnerships, joint projects, content co-creation, or cultural initiatives.
              </p>

              <h4 className="text-xl font-semibold text-adinkra-highlight mb-4 mt-8">
                📢 Sponsorship Opportunities
              </h4>
              <p className="text-adinkra-gold/80 mb-4">
                Premium placements on our platform — reach an engaged, mission-driven audience passionate about Pan-African stories, culture, and sovereignty.
              </p>
              <ul className="text-adinkra-gold/90 space-y-2 mb-4">
                <li>• Homepage Billboard (rotating feature)</li>
                <li>• Sponsored Article / Native Integration</li>
                <li>• Sidebar or Inline Banner</li>
                <li>• Newsletter Shoutout (coming soon)</li>
              </ul>
              <p className="text-sm italic text-adinkra-gold/70 mb-4">
                Starting from <span className="font-bold">R2,500 ZAR/month</span> (~$130 USD) for premium spots • Flexible & custom packages available • Early partners receive preferential positioning & discounted rates.
              </p>
              <p className="text-adinkra-gold/80">
                Interested? Email <a href="mailto:sales@adinkramedia.com" className="text-adinkra-highlight hover:underline">sales@adinkramedia.com</a> with "Sponsorship" in the subject — let's discuss how your brand can align with our mission.
              </p>
            </div>
          </div>
        </div>

        {/* Web Solutions */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-adinkra-highlight mb-10 text-center">
            Web Solutions
          </h2>

          {/* One-Time Packages */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-adinkra-highlight mb-8 text-center">
              One-Time Website Packages
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Starter Plan",
                  bestFor: "Freelancers, small shops, events",
                  features: ["1–3 Pages (Home, About, Contact)", "Mobile-friendly design", "Social media links"],
                  price: "R1,500 – R3,500 (~$90 – $210 USD)",
                },
                {
                  name: "Business Plan",
                  bestFor: "Small & medium business",
                  features: ["4–6 Pages", "Basic SEO setup", "E-commerce integration", "Blog or Product Listings"],
                  price: "R2,800 – R5,000 (~$170 – $300 USD)",
                },
                {
                  name: "Premium Plan",
                  bestFor: "Growing brands needing performance & polish",
                  features: [
                    "Custom animations & dynamic sections",
                    "SEO optimization",
                    "Analytics setup",
                    "Payment system integration",
                    "Sponsorship/Ad slot integration",
                    "Online Radio and podcast integration",
                  ],
                  price: "R8,000 + (~$485+ USD)",
                },
              ].map((pkg) => (
                <div
                  key={pkg.name}
                  className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:border-adinkra-highlight transition-all duration-300"
                >
                  <h4 className="text-xl font-bold text-adinkra-highlight mb-3 text-center">
                    {pkg.name}
                  </h4>
                  <p className="text-center text-adinkra-gold/80 text-sm mb-4 italic">{pkg.bestFor}</p>
                  <ul className="space-y-2 text-sm mb-6">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-adinkra-highlight mr-2">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="font-bold text-lg text-center">{pkg.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rental Plans */}
          <div>
            <h3 className="text-2xl font-semibold text-adinkra-highlight mb-8 text-center">
              Website Rental Plans (Monthly)
            </h3>
            <div className="space-y-6 max-w-3xl mx-auto">
              {[
                { name: "Basic Rent", fee: "R350/month (~$21 USD)", includes: "Hosting, domain, monthly backup", setup: "R850 (~$52 USD)" },
                { name: "Standard Rent", fee: "R550/month (~$33 USD)", includes: "Hosting, domain, monthly updates, CMS integration", setup: "R950 (~$58 USD)" },
                {
                  name: "Premium Rent",
                  fee: "R850/month (~$52 USD)",
                  includes: "Hosting, domain, Ad integration, monthly backup, priority support, E-commerce",
                  setup: "R1,500 (~$91 USD)",
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-xl font-bold text-adinkra-highlight">{plan.name}</h4>
                      <p className="text-sm mt-1">{plan.includes}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl">{plan.fee}</p>
                      <p className="text-sm text-adinkra-gold/70">Setup: {plan.setup}</p>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-center text-sm text-adinkra-gold/60 italic mt-6">
                All rental plans include SSL security and website maintenance • Cancel anytime with 30-day notice
              </p>
            </div>
          </div>
        </div>

        {/* Get in Touch */}
        <div className="bg-gradient-to-b from-adinkra-card/30 to-black/10 border border-adinkra-highlight/30 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-adinkra-highlight mb-10 text-center">
            Get in Touch
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info - Expanded with new emails */}
            <div className="space-y-10 flex flex-col justify-center">
              <div>
                <h3 className="text-xl font-semibold text-adinkra-highlight mb-4">Contact Emails</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-bold text-lg">General & Support</p>
                    <p className="text-lg break-all">
                      <a href="mailto:support@adinkramedia.com" className="text-adinkra-highlight hover:underline">
                        support@adinkramedia.com
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Sales, Sponsorships & Business Inquiries</p>
                    <p className="text-lg break-all">
                      <a href="mailto:sales@adinkramedia.com" className="text-adinkra-highlight hover:underline">
                        sales@adinkramedia.com
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-lg">General Info (fallback)</p>
                    <p className="text-lg break-all">
                      <a href="mailto:info@adinkramedia.com" className="text-adinkra-highlight hover:underline">
                        info@adinkramedia.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-adinkra-highlight mb-3">Phone</h3>
                <p className="text-lg">072 076 1243</p>
                <p className="text-lg">065 293 2642</p>
              </div>
            </div>

            {/* Form */}
            <form action="https://formspree.io/f/xdkdgndb" method="POST" className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-4 rounded-lg bg-black/30 border border-adinkra-gold/40 text-adinkra-gold placeholder:text-adinkra-gold/50 focus:outline-none focus:border-adinkra-highlight transition duration-300"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full p-4 rounded-lg bg-black/30 border border-adinkra-gold/40 text-adinkra-gold placeholder:text-adinkra-gold/50 focus:outline-none focus:border-adinkra-highlight transition duration-300"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select
                  name="subject"
                  className="w-full p-4 rounded-lg bg-black/30 border border-adinkra-gold/40 text-adinkra-gold focus:outline-none focus:border-adinkra-highlight transition duration-300"
                >
                  <option value="">General Inquiry</option>
                  <option value="Sponsorship Opportunities">Sponsorship Opportunities</option>
                  <option value="Collaborate with Us">Collaborate with Us</option>
                  <option value="Custom Music Creation">Custom Music Creation</option>
                  <option value="Film Scoring & Foley">Film Scoring & Foley</option>
                  <option value="Web Solutions">Web Solutions / Website</option>
                  <option value="Support / Technical">Support / Technical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  rows="5"
                  required
                  className="w-full p-4 rounded-lg bg-black/30 border border-adinkra-gold/40 text-adinkra-gold placeholder:text-adinkra-gold/50 focus:outline-none focus:border-adinkra-highlight transition duration-300"
                  placeholder="Tell us about your project, collaboration idea, sponsorship interest, or support question..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-adinkra-highlight to-yellow-600 text-black font-bold py-4 px-8 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </section>

      
    </div>
  );
}