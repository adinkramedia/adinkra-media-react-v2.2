import { Link } from "react-router-dom";

const services = [
  {
    id: "custom-music",
    title: "Custom Music Production",
    description:
      "Original compositions tailored for film, artists, brands, and commercial use. Built from scratch to match your vision.",
    image: "/custom-music.png",
  },
  {
    id: "film-scoring",
    title: "Film Scoring",
    description:
      "Cinematic scoring for films, trailers, and visual storytelling. Emotion-driven sound built to elevate every scene.",
    image: "/film-scoring.png",
  },
  {
    id: "mixing-mastering",
    title: "Mixing & Mastering",
    description:
      "Professional mixing and mastering for music, podcasts, and audio content. Clean, balanced, and industry-ready sound.",
    image: "/mixing-mastering.png",
  },
  {
    id: "sound-design",
    title: "Sound Design",
    description:
      "Custom sound design for games, film, UI/UX, and media. Unique sonic identities crafted from the ground up.",
    image: "/sound-design.png",
  },
];

export default function FeaturedSections() {
  return (
    <section className="bg-adinkra-bg py-20 px-4">
      <div className="max-w-screen-xl mx-auto">

        {/* 🔥 NEW TITLE */}
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-adinkra-gold text-center">
          What We Do
        </h2>

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
              <div className="p-6 flex flex-col justify-between h-[220px]">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-adinkra-gold group-hover:text-adinkra-highlight transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-sm text-adinkra-gold/80 leading-snug">
                    {service.description}
                  </p>
                </div>

                {/* CTA */}
                <Link
                  to="/contact"
                  className="mt-4 text-sm bg-adinkra-highlight text-adinkra-bg font-semibold py-2 px-4 rounded hover:bg-yellow-500 transition-all text-center inline-block w-max"
                >
                  Start a Project →
                </Link>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}