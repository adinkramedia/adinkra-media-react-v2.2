export default function Hero() {
  return (
    <section
      className="w-full h-[90vh] relative bg-cover bg-center bg-no-repeat
                 bg-[url('/hero-mobile.jpg')] md:bg-[url('/hero-desktop.jpg')]"
    >
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-adinkra-gold mb-4 drop-shadow-lg">
            Adinkra Media™
          </h2>

          <p className="text-lg md:text-xl max-w-2xl mx-auto text-adinkra-gold leading-relaxed drop-shadow-md">
            Cinematic Soundscapes. Sacred Frequencies. Modern Sonic Design.
            Explore original compositions, sample packs, and creative audio tools inspired by heritage — ready for any story, culture, or world.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/audio"
              className="bg-adinkra-gold text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Explore Sounds
            </a>

            <a
              href="/contact"
              className="border border-adinkra-gold px-6 py-3 rounded-xl text-adinkra-gold hover:bg-adinkra-gold hover:text-black transition"
            >
              Start a Project
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}