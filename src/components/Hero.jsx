// Hero.jsx

export default function Hero() {
  return (
    <section
      className="w-full h-[90vh] relative bg-cover bg-center bg-no-repeat bg-[url('/hero-mobile.jpg')] md:bg-[url('/hero-desktop.jpg')]"
    >
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center px-4">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-adinkra-gold mb-6 drop-shadow-lg">
            Sound for Film, Media &amp; Digital
          </h1>

          <p className="text-lg md:text-2xl max-w-3xl mx-auto text-white leading-relaxed drop-shadow-md">
            World-class audio production and post-production for film,
            television, advertising, gaming, and digital media.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {/* START A PROJECT */}
            <a
              href="/submit-project"
              className="bg-adinkra-gold text-black px-7 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Start a Project
            </a>

            {/* VIEW OUR WORK */}
            <a
              href="/gallery"
              className="border border-adinkra-gold px-7 py-3 rounded-xl text-adinkra-gold hover:bg-adinkra-gold hover:text-black transition"
            >
              View Our Work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}