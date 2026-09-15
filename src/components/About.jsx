import React from "react";
import {
  Library,
  Tv,
  Ticket,
  FlaskConical,
  ArrowUpRight,
} from "lucide-react";

const ecosystem = [
  {
    name: "Adinkra Library",
    label: "AUDIO",
    description:
      "Professional music, sound design and audio assets for film, games, video and digital experiences.",
    href: "https://audio.adinkramedia.com/",
    icon: Library,
  },
  {
    name: "Adinkra TV",
    label: "MEDIA",
    description:
      "African stories, documentaries, news and original television programming.",
    href: "https://tv.adinkramedia.com/",
    icon: Tv,
  },
  {
    name: "Ticketa",
    label: "EVENTS",
    description:
      "Event technology that connects organisers, audiences and tickets in one place.",
    href: "https://ticketa.adinkramedia.com/",
    icon: Ticket,
  },
  {
    name: "Adinkra Lab",
    label: "EXPERIMENTAL",
    description:
      "Creative technology, experimental projects and new ideas being developed at Adinkra.",
    href: "https://lab.adinkramedia.com/",
    icon: FlaskConical,
  },
];

export default function About() {
  return (
    <section className="bg-adinkra-bg text-adinkra-gold py-16 px-6 w-full">
      <div className="max-w-screen-xl mx-auto">

        {/* ABOUT */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-5">
            About Adinkra Media
          </h2>

          <p className="max-w-3xl mx-auto text-lg leading-relaxed text-adinkra-gold/90">
            Adinkra Media is a professional audio production and creative
            media company specializing in original music, sound design,
            sonic storytelling and digital experiences.
          </p>

          <p className="max-w-3xl mx-auto text-lg leading-relaxed text-adinkra-gold/80 mt-4">
            From cinematic compositions and immersive soundscapes to
            television, events and experimental technology, we build
            creative experiences that connect sound, culture and story.
          </p>
        </div>

        {/* ECOSYSTEM */}
        <div className="mt-16">

          <div className="text-center mb-10">
            <p className="text-sm tracking-[0.3em] uppercase text-adinkra-gold/60 mb-3">
              The Adinkra Ecosystem
            </p>

            <h3 className="text-2xl md:text-3xl font-bold">
              More than a studio.
            </h3>

            <p className="max-w-2xl mx-auto mt-3 text-adinkra-gold/70">
              Explore the platforms, products and experiments we're building
              across media, audio, events and technology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {ecosystem.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group
                    relative
                    rounded-2xl
                    border
                    border-adinkra-gold/15
                    bg-adinkra-gold/[0.03]
                    p-6
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-adinkra-gold/40
                    hover:bg-adinkra-gold/[0.06]
                  "
                >

                  {/* ICON */}
                  <div
                    className="
                      w-12
                      h-12
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      border
                      border-adinkra-gold/20
                      bg-adinkra-gold/[0.05]
                      mb-6
                      transition-all
                      duration-300
                      group-hover:border-adinkra-gold/50
                      group-hover:bg-adinkra-gold/10
                    "
                  >
                    <Icon
                      size={23}
                      strokeWidth={1.7}
                      className="
                        text-adinkra-gold
                        transition-transform
                        duration-300
                        group-hover:scale-110
                      "
                    />
                  </div>

                  {/* LABEL */}
                  <p className="text-xs tracking-[0.25em] text-adinkra-gold/50 mb-2">
                    {item.label}
                  </p>

                  {/* NAME */}
                  <h4 className="text-xl font-bold text-adinkra-gold">
                    {item.name}
                  </h4>

                  {/* DESCRIPTION */}
                  <p className="mt-3 text-sm leading-relaxed text-adinkra-gold/65">
                    {item.description}
                  </p>

                  {/* ENTER */}
                  <div
                    className="
                      mt-6
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-semibold
                      text-adinkra-gold
                    "
                  >
                    Explore

                    <ArrowUpRight
                      size={16}
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                        group-hover:-translate-y-1
                      "
                    />
                  </div>

                </a>
              );
            })}

          </div>
        </div>

      </div>
    </section>
  );
}