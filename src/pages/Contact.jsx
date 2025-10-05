import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Contact() {
  return (
    <div className="bg-adinkra-bg text-adinkra-gold">
      <Header />

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Contact Us</h1>

        <p className="text-adinkra-gold/90 text-lg mb-10 text-center max-w-3xl mx-auto">
          Adinkra Media was founded to liberate and decolonise the Nubian nation through media, edutainment, spirituality, and music — connecting the continent and its diaspora. We believe in reclaiming our narratives through powerful stories and sonic identity rooted in African heritage.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-adinkra-highlight">Email</h2>
              <p className="text-adinkra-gold/80 break-all">info@adinkramedia.com</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-adinkra-highlight">Phone</h2>
              <p className="text-adinkra-gold/80">072 076 1243</p>
              <p className="text-adinkra-gold/80">065 293 2642</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-adinkra-highlight">Our Services</h2>
              <ul className="list-disc list-inside text-adinkra-gold/80">
                <li>🎼 Custom Music Creation</li>
                <li>🎧 Mixing & Mastering</li>
                <li>🎬 Film Scoring & Foley</li>
                <li>🤝 Collaborate with Us</li>
                <li>📢 Sponsorship Opportunities</li>
                <li>🎤 Media Coverage</li>
              </ul>
              <p className="text-sm text-adinkra-gold/60 mt-2 italic">* Pricing details available upon request or per project brief.</p>
            </div>
          </div>

          {/* Contact Form */}
          <form
            action="https://formspree.io/f/xdkdgndb"
            method="POST"
            className="bg-adinkra-card p-6 rounded-xl shadow-md space-y-5"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full p-3 rounded bg-adinkra-bg border border-adinkra-gold/40 text-adinkra-gold placeholder:text-adinkra-gold/50"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full p-3 rounded bg-adinkra-bg border border-adinkra-gold/40 text-adinkra-gold placeholder:text-adinkra-gold/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                rows="5"
                required
                className="w-full p-3 rounded bg-adinkra-bg border border-adinkra-gold/40 text-adinkra-gold placeholder:text-adinkra-gold/50"
                placeholder="Tell us what you're working on..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-adinkra-highlight text-adinkra-bg font-semibold py-3 px-6 rounded hover:bg-yellow-500 transition"
            >
              Send Message →
            </button>
          </form>
        </div>
      </section>

      
    </div>
  );
}
