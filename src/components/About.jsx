const principles = [
  {
    number: "01",
    title: "Ideas Into Reality",
    description:
      "We turn ideas into tangible experiences, products and creative work. From digital platforms and software to 3D models, animations and original music, we combine the right skills and tools to bring ideas to life.",
  },
  {
    number: "02",
    title: "Creativity Meets Technology",
    description:
      "We bring creative thinking and technical execution together. Whether we are developing a digital product, visualising a concept in 3D, producing music or creating a technical explainer, our focus is on work that communicates clearly and serves a purpose.",
  },
  {
    number: "03",
    title: "Create With Purpose",
    description:
      "Every project begins with an objective. We consider the audience, the idea and the intended outcome before choosing how to approach the work, aiming to create solutions and experiences that deliver lasting value.",
  },
  {
    number: "04",
    title: "Explore New Possibilities",
    description:
      "Our interests span technology, web development, 3D visualisation, animation, music, sound design and media production. We continue to develop our own ventures, explore new creative directions and work across disciplines to discover what is possible.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="w-full bg-adinkra-bg px-6 py-20 text-white md:py-28"
    >
      <div className="mx-auto max-w-screen-xl">
        {/* INTRODUCTION */}
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-adinkra-gold/70">
            Our Approach
          </p>

          <h2 className="mb-6 text-3xl font-bold leading-tight md:text-5xl">
            Built on ideas.
            <span className="block text-adinkra-gold">
              Driven by possibility.
            </span>
          </h2>

          <p className="mb-6 text-lg leading-relaxed text-white/80 md:text-xl">
            At Adinkra Media, we bring technology, creativity and media
            together to turn ideas into reality. We develop digital
            products and platforms, create 3D visualisations and
            animations, produce original music and sound, and develop
            visual and audio experiences for different audiences and
            industries.
          </p>

          <p className="mx-auto max-w-3xl text-base leading-relaxed text-white/60 md:text-lg">
            Our work spans digital development, visual production,
            music, audio post-production and original media projects.
            Alongside our client work, we build our own products and
            ventures, continually exploring new ideas and opportunities
            across creative and technical disciplines.
          </p>
        </div>

        {/* PRINCIPLES */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {principles.map((principle) => (
            <article
              key={principle.number}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors duration-300 hover:border-adinkra-gold/40 md:p-8"
            >
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-adinkra-gold/60">
                {principle.number}
              </p>

              <h3 className="mb-3 text-xl font-bold text-adinkra-gold md:text-2xl">
                {principle.title}
              </h3>

              <p className="text-sm leading-relaxed text-white/65 md:text-base">
                {principle.description}
              </p>
            </article>
          ))}
        </div>

        {/* CLOSING STATEMENT */}
        <div className="mx-auto mt-16 max-w-4xl border-t border-white/10 pt-10 text-center">
          <p className="text-lg leading-relaxed text-white/75 md:text-xl">
            We are building more than individual products or projects.
            Adinkra Media brings together technology, music, visual
            creativity and media under one wider vision — creating
            useful digital solutions, compelling creative work and
            original ventures with room to grow.
          </p>
        </div>
      </div>
    </section>
  );
}