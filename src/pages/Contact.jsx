import Header from "../components/Header";

export default function Contact() {
  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">

        {/* 🔥 HERO */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-adinkra-highlight mb-6">
            Work With Adinkra Media
          </h1>

          <p className="text-adinkra-gold/90 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Adinkra Media is a professional audio production studio specializing in cinematic music,
            film scoring, sound design, and high-quality mixing & mastering for global clients.
          </p>
        </div>

        {/* 👤 BIO */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-adinkra-highlight mb-4">
            About the Engineer
          </h2>

          <p className="text-adinkra-gold/80 leading-relaxed">
            Adinkra Media is led by a dedicated sound engineer and composer focused on delivering
            high-quality, emotionally driven audio. From concept to final master, every project is
            crafted with precision, clarity, and a strong sonic identity.
          </p>
        </div>

        {/* 🎧 SERVICES */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-adinkra-highlight mb-10 text-center">
            Services & Pricing
          </h2>

          <div className="grid md:grid-cols-2 gap-8">

            {/* 🎼 Custom Music */}
            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-adinkra-highlight mb-4">
                Custom Music & Ghost Production
              </h3>

              <p className="text-adinkra-gold/80 mb-6">
                Original compositions tailored for artists, brands, and media projects.
              </p>

              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold">$80+</p>
                  <p className="text-sm text-adinkra-gold/70">
                    (~R1,500) Short compositions, intros
                  </p>
                </div>

                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold">$150 – $500+</p>
                  <p className="text-sm text-adinkra-gold/70">
                    (~R3,000 – R10,000) Full productions & advanced work
                  </p>
                </div>
              </div>
            </div>

            {/* 🎬 Film Scoring */}
            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-adinkra-highlight mb-4">
                Film Scoring
              </h3>

              <p className="text-adinkra-gold/80 mb-6">
                Cinematic scoring for films, trailers, and visual storytelling.
              </p>

              <div className="bg-black/20 p-4 rounded-lg">
                <p className="font-bold">$250+</p>
                <p className="text-sm text-adinkra-gold/70">
                  (~R5,000+) Based on duration and complexity
                </p>
              </div>
            </div>

            {/* 🎚️ Mixing & Mastering */}
            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-adinkra-highlight mb-4">
                Mixing & Mastering
              </h3>

              <p className="text-adinkra-gold/80 mb-6">
                Professional mixing and mastering for music, podcasts, and digital content.
              </p>

              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold">Mixing: $40+ / track</p>
                  <p className="text-sm text-adinkra-gold/70">
                    (~R800)
                  </p>
                </div>

                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold">Mastering: $15+ / track</p>
                  <p className="text-sm text-adinkra-gold/70">
                    (~R300)
                  </p>
                </div>
              </div>
            </div>

            {/* 🔊 Sound Design */}
            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-adinkra-highlight mb-4">
                Sound Design
              </h3>

              <p className="text-adinkra-gold/80 mb-6">
                Custom sound design for film, games, and digital products.
              </p>

              <div className="bg-black/20 p-4 rounded-lg">
                <p className="font-bold">$100+</p>
                <p className="text-sm text-adinkra-gold/70">
                  (~R2,000+) Based on scope
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 📩 CONTACT */}
        <div className="bg-gradient-to-b from-adinkra-card/30 to-black/10 border border-adinkra-highlight/30 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-adinkra-highlight mb-10 text-center">
            Start a Project
          </h2>

          <div className="grid md:grid-cols-2 gap-12">

            <div className="space-y-6">
              <div>
                <p className="font-bold text-lg">Email</p>
                <a
                  href="mailto:sales@adinkramedia.com"
                  className="text-adinkra-highlight hover:underline"
                >
                  sales@adinkramedia.com
                </a>
              </div>

              <p className="text-adinkra-gold/70 text-sm">
                Include project type, timeline, and references for a faster response.
              </p>
            </div>

            <form
              action="https://formspree.io/f/xdkdgndb"
              method="POST"
              className="space-y-6"
            >
              <input
                type="text"
                name="name"
                required
                placeholder="Your name"
                className="w-full p-4 rounded-lg bg-black/30 border border-adinkra-gold/40"
              />

              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                className="w-full p-4 rounded-lg bg-black/30 border border-adinkra-gold/40"
              />

              <textarea
                name="message"
                rows="5"
                required
                placeholder="Tell us about your project..."
                className="w-full p-4 rounded-lg bg-black/30 border border-adinkra-gold/40"
              />

              <button className="w-full bg-adinkra-highlight text-black py-4 rounded-lg font-bold hover:bg-yellow-500 transition">
                Send Message →
              </button>
            </form>
          </div>
        </div>

      </section>
    </div>
  );
}