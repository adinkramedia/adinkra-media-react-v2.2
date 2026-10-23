export default function Hero() {
  return (
    <section
      className="relative min-h-[90vh] w-full bg-[url('/hero-mobile.jpg')] bg-cover bg-center bg-no-repeat md:bg-[url('/hero-desktop.jpg')]"
    >
      <div className="absolute inset-0 flex items-center justify-center bg-black/55 px-4 py-20 text-center">
        <div className="max-w-5xl">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-adinkra-gold md:text-base">
            Adinkra Media
          </p>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl">
            Media, Technology
            <span className="block text-adinkra-gold">
              &amp; Original Ideas.
            </span>
          </h1>

          <p className="mx-auto max-w-4xl text-lg leading-relaxed text-white/90 drop-shadow-md md:text-xl lg:text-2xl">
            We build digital products, create 3D visuals and animations,
            produce original music and sound, and develop media
            experiences that bring ideas to life.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#ecosystem"
              className="rounded-xl bg-adinkra-gold px-7 py-3.5 font-semibold text-black transition hover:opacity-90"
            >
              Explore Our Ecosystem
            </a>

            <a
              href="/gallery"
              className="rounded-xl border border-white/70 px-7 py-3.5 text-white transition hover:bg-white hover:text-black"
            >
              Explore Our Creative Work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}