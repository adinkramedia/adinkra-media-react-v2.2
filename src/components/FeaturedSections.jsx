const ventures = [
  {
    id: "digital",
    name: "Adinkra Digital",
    category: "Digital Development",
    description:
      "We build professional websites, web applications, and digital platforms for businesses, organisations, and ambitious ideas.",
    image: "/digital-venture.png",
    link: "https://digital.adinkramedia.com/",
    linkLabel: "Explore Digital",
  },
  {
    id: "library",
    name: "Adinkra Library",
    category: "Music & Sound Resources",
    description:
      "An original catalogue of music and sound resources for film, media productions, creative projects, and digital experiences.",
    image: "/library-venture.png",
    link: "https://audio.adinkramedia.com/",
    linkLabel: "Explore the Library",
  },
  {
    id: "tickets",
    name: "Adinkra Tickets",
    category: "Events & Ticketing",
    description:
      "An event ticketing platform designed to help organisers manage events, sell tickets, and connect with their audiences.",
    image: "/tickets-venture.png",
    link: "https://ticketa.adinkramedia.com/",
    linkLabel: "Explore Adinkra Tickets",
  },
  {
    id: "music",
    name: "Adinkra Music",
    category: "Music Discovery & Radio",
    description:
      "A music discovery and online radio platform exploring new ways for listeners to discover music, artists, and sounds.",
    image: "/music-venture.png",
    link: "https://music.adinkramedia.com/",
    linkLabel: "Explore Adinkra Music",
  },
  {
    id: "zen-orb",
    name: "Zen Orb",
    category: "Digital Experiences",
    description:
      "A digital venture exploring focused, immersive experiences through thoughtful design and technology.",
    image: "/zen-orb-venture.png",
    link: "https://zen.adinkramedia.com/",
    linkLabel: "Explore Zen Orb",
  },
  {
    id: "tv",
    name: "Adinkra TV",
    category: "Media & Video",
    description:
      "A media venture exploring video content, digital viewing experiences, and screen-based storytelling.",
    image: "/adinkra-tv-venture.png",
    link: "https://tv.adinkramedia.com/",
    linkLabel: "Explore Adinkra TV",
  },
];

export default function FeaturedSections() {
  return (
    <section
      id="ecosystem"
      className="bg-adinkra-bg px-4 py-20 text-white md:py-28"
    >
      <div className="mx-auto max-w-screen-xl">
        {/* COMPANY INTRODUCTION */}
        <div className="mx-auto mb-20 max-w-4xl text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-adinkra-gold/70">
            Who We Are
          </p>

          <h2 className="mb-6 text-3xl font-bold leading-tight md:text-5xl">
            Where technology meets{" "}
            <span className="text-adinkra-gold">
              creative possibility.
            </span>
          </h2>

          <p className="mb-6 text-lg leading-relaxed text-white/80 md:text-xl">
            Adinkra Media is a South African company working across
            technology, music, media and creative production. We develop
            digital products and platforms, create 3D visualisations
            and animations, produce original music and sound, and bring
            ideas, products and technologies to life through visual and
            audio experiences.
          </p>

          <p className="mx-auto max-w-3xl text-base leading-relaxed text-white/60 md:text-lg">
            From websites and software to product visualisation, technical
            explainers, music production and media projects, we combine
            creative thinking with practical execution. Alongside our
            work for clients, we build our own products, platforms and
            ventures across different industries.
          </p>
        </div>

        {/* ECOSYSTEM INTRODUCTION */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-adinkra-gold/70">
              Our Ecosystem
            </p>

            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Different ideas. One growing ecosystem.
            </h2>
          </div>

          <p className="max-w-md leading-relaxed text-white/60 md:text-right">
            Explore our digital services, music and sound resources,
            independent products, and media ventures.
          </p>
        </div>

        {/* VENTURE GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ventures.map((venture) => (
            <article
              key={venture.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-adinkra-card transition-all duration-300 hover:-translate-y-1 hover:border-adinkra-gold/40 hover:shadow-xl"
            >
              {/* IMAGE */}
              <div className="relative h-56 overflow-hidden bg-black/20">
                <img
                  src={venture.image}
                  alt={venture.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <span className="absolute bottom-4 left-5 text-xs uppercase tracking-widest text-white/85">
                  {venture.category}
                </span>
              </div>

              {/* CONTENT */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-3 text-xl font-semibold text-adinkra-gold transition-colors group-hover:text-white">
                  {venture.name}
                </h3>

                <p className="mb-6 flex-1 text-sm leading-relaxed text-white/65">
                  {venture.description}
                </p>

                <a
                  href={venture.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-adinkra-gold transition-colors hover:text-white"
                >
                  {venture.linkLabel}
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* COMPANY CAPABILITIES */}
        <div className="mt-20 grid gap-10 border-t border-white/10 pt-12 md:grid-cols-3">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-adinkra-gold/70">
              01 / Develop
            </p>

            <h3 className="mb-3 text-xl font-semibold">
              Technology & digital products
            </h3>

            <p className="text-sm leading-relaxed text-white/60">
              We develop websites, web applications, digital platforms
              and independent products that solve problems, serve
              audiences and create new opportunities.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-adinkra-gold/70">
              02 / Create
            </p>

            <h3 className="mb-3 text-xl font-semibold">
              Visuals, music & sound
            </h3>

            <p className="text-sm leading-relaxed text-white/60">
              We bring ideas to life through 3D modelling, product
              visualisation, animation, technical explainers, original
              music, sound design and audio post-production.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-adinkra-gold/70">
              03 / Build
            </p>

            <h3 className="mb-3 text-xl font-semibold">
              Ventures & media
            </h3>

            <p className="text-sm leading-relaxed text-white/60">
              We build our own products, platforms and creative
              initiatives across music, events, entertainment and
              media, exploring ideas with the potential to grow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}