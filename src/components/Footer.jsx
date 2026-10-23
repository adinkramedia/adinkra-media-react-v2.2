
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const ventures = [
    {
      name: "Adinkra Digital",
      href: "https://digital.adinkramedia.com/",
    },
    {
      name: "Adinkra Library",
      href: "https://audio.adinkramedia.com/",
    },
    {
      name: "Adinkra Tickets",
      href: "https://ticketa.adinkramedia.com/",
    },
    {
      name: "Adinkra Music",
      href: "https://music.adinkramedia.com/",
    },
    {
      name: "Zen Orb",
      href: "https://zen.adinkramedia.com/",
    },
    {
      name: "Adinkra TV",
      href: "https://tv.adinkramedia.com/",
    },
  ];

  return (
    <footer className="bg-adinkra-bg text-white">
      <div className="mx-auto grid max-w-screen-xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
        {/* COMPANY */}
        <div>
          <a
            href="/"
            className="mb-4 inline-block text-xl font-bold tracking-wide text-adinkra-gold"
          >
            Adinkra Media
          </a>

          <p className="mb-5 max-w-sm text-sm leading-relaxed text-white/65">
            A media and technology company building digital products,
            developing online platforms, and creating opportunities
            across media, entertainment, and technology.
          </p>

          <a
            href="https://digital.adinkramedia.com/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-adinkra-gold transition-colors hover:text-white"
          >
            Explore Adinkra Digital
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* OUR ECOSYSTEM */}
        <div>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-adinkra-gold">
            Our Ecosystem
          </h3>

          <ul className="space-y-3 text-sm text-white/65">
            {ventures.map((venture) => (
              <li key={venture.name}>
                <a
                  href={venture.href}
                  className="transition-colors hover:text-adinkra-gold"
                >
                  {venture.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-adinkra-gold">
            Get in Touch
          </h3>

          <p className="mb-4 text-sm leading-relaxed text-white/65">
            For business enquiries, project discussions, partnerships,
            or collaborations, get in touch with our team.
          </p>

          <a
            href="mailto:info@adinkramedia.com?subject=Adinkra%20Media%20Enquiry"
            className="break-words text-sm font-medium text-adinkra-gold transition-colors hover:text-white"
          >
            info@adinkramedia.com
          </a>

          <p className="mt-4 text-sm text-white/50">
            Johannesburg, South Africa
          </p>

          <p className="mt-4 text-sm text-white/65">
            Adinkra Media (Pty) Ltd
          </p>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-3 px-4 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} Adinkra Media (Pty) Ltd. All rights reserved.
          </p>

          <p>Media. Technology. Original Ideas.</p>
        </div>
      </div>
    </footer>
  );
}
