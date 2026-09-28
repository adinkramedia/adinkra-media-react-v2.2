// FeaturedSections.jsx

import { Link } from "react-router-dom";

const services = [
  {
    id: "custom-music",
    title: "Custom Music Production",
    description:
      "Original compositions created for film, brands, advertising, visual media, and commercial productions. Built from the ground up to support your creative vision.",
    image: "/custom-music.png",
  },
  {
    id: "film-scoring",
    title: "Film Scoring",
    description:
      "Cinematic scores for films, trailers, documentaries, and visual storytelling. Music shaped around the emotion, pacing, and identity of every scene.",
    image: "/film-scoring.png",
  },
  {
    id: "mixing-mastering",
    title: "Mixing & Mastering",
    description:
      "Professional mixing and mastering for music, film, podcasts, advertising, and digital content. Clean, balanced, detailed, and ready for delivery.",
    image: "/mixing-mastering.png",
  },
  {
    id: "sound-design",
    title: "Sound Design",
    description:
      "Custom sound design for film, games, advertising, UI/UX, and digital media. Bespoke sonic elements crafted to give every project depth and character.",
    image: "/sound-design.png",
  },
];

export default function FeaturedSections() {
  return (
    <section className="bg-adinkra-bg text-adinkra-gold py-20 md:py-28 px-4">
      <div className="max-w-screen-xl mx-auto">
        {/* COMPANY INTRO */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <p className="text-sm tracking-[0.3em] uppercase text-adinkra-gold/60 mb-4">
            Adinkra Media
          </p>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Sound. Culture. Story.
          </h2>

          <p className="text-lg md:text-xl leading-relaxed text-adinkra-gold/85 mb-6">
            Adinkra Media is a professional audio production and
            post-production company creating original music, sound design,
            and complete audio solutions for film, television, advertising,
            gaming, broadcast, and digital media.
          </p>

          <p className="text-base md:text-lg leading-relaxed text-adinkra-gold/70 mb-5">
            We work across the full audio process, from the first creative
            concept through production, post-production, mixing, mastering,
            and final delivery. Whether a project needs an original score,
            distinctive sound design, or a complete audio post-production
            solution, we build sound around the story, the audience, and the
            creative vision.
          </p>

          <p className="text-base md:text-lg leading-relaxed text-adinkra-gold/70">
            Our approach combines technical precision with creative direction,
            bringing together music, sound effects, Foley, dialogue, mixing,
            mastering, and other audio elements to create sound that feels
            intentional, immersive, and production-ready.
          </p>
        </div>

        {/* WHAT WE DO */}
        <div>
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.3em] uppercase text-adinkra-gold/60 mb-3">
              Our Services
            </p>

            <h2 className="text-3xl md:text-4xl font-bold">What We Do</h2>
          </div>

          {/* SERVICES GRID */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-adinkra-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 hover:-translate-y-1 group"
              >
                {/* IMAGE */}
                <div className="overflow-hidden h-48">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-6 flex flex-col justify-between min-h-[250px]">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-adinkra-gold group-hover:text-adinkra-highlight transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-sm text-adinkra-gold/80 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <Link
                    to="/submit-project"
                    className="mt-6 text-sm bg-adinkra-highlight text-adinkra-bg font-semibold py-2 px-4 rounded hover:bg-yellow-500 transition-all text-center inline-block w-max"
                  >
                    Start a Project →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}