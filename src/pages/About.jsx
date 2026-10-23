import Header from "../components/Header";
import { Link } from "react-router-dom";
import {
  Lightbulb,
  Layers3,
  Compass,
  TrendingUp,
  ArrowUpRight,
  Code2,
  Music2,
  Ticket,
  Radio,
  Sparkles,
  MonitorPlay,
  Box,
  Clapperboard,
} from "lucide-react";

const principles = [
  {
    icon: Lightbulb,
    title: "Ideas Into Reality",
    description:
      "We turn ideas into digital products, visual experiences and creative work. From software and platforms to 3D models, animations and original music, we bring concepts to life through practical execution.",
  },
  {
    icon: Compass,
    title: "Creativity Meets Technology",
    description:
      "We combine creative thinking with technical skills to develop purposeful solutions, compelling visuals, engaging audio and digital experiences shaped around their intended audience.",
  },
  {
    icon: Layers3,
    title: "Think Across Disciplines",
    description:
      "Our work spans digital development, 3D visualisation, animation, music, sound design and media production. Bringing these disciplines together allows us to explore ideas from different perspectives.",
  },
  {
    icon: TrendingUp,
    title: "Create Long-Term Value",
    description:
      "We deliver work for clients while developing our own products, platforms and creative ventures. Our aim is to build useful solutions, meaningful experiences and opportunities that can grow over time.",
  },
];

const capabilities = [
  {
    icon: Code2,
    title: "Technology & Digital Development",
    description:
      "Websites, web applications, digital platforms and independent products designed to solve problems and create opportunities.",
  },
  {
    icon: Box,
    title: "3D & Visual Production",
    description:
      "3D modelling, product visualisation, animated brand presentations and technical explainers that help bring ideas and technologies to life.",
  },
  {
    icon: Music2,
    title: "Music & Audio Production",
    description:
      "Original music, composition, cinematic scoring, sound design, Foley, dialogue editing, mixing and audio post-production.",
  },
  {
    icon: Clapperboard,
    title: "Media & Creative Content",
    description:
      "Video projects, commercials, visual storytelling and creative content developed for different audiences, platforms and purposes.",
  },
];

const ventures = [
  {
    name: "Adinkra Digital",
    category: "Web Development & Digital Products",
    description:
      "Websites, web applications and digital platforms built for businesses, organisations and ideas that need more than a template.",
    href: "https://digital.adinkramedia.com/",
    icon: Code2,
  },
  {
    name: "Adinkra Library",
    category: "Audio & Creative Assets",
    description:
      "An original library of music and sound resources for creative projects, productions and digital media.",
    href: "https://audio.adinkramedia.com/",
    icon: Music2,
  },
  {
    name: "Adinkra Tickets",
    category: "Events & Ticketing",
    description:
      "A ticketing platform designed to help event organisers manage events and connect with their audiences.",
    href: "https://ticketa.adinkramedia.com/",
    icon: Ticket,
  },
  {
    name: "Adinkra Music",
    category: "Music Discovery",
    description:
      "A music-focused venture exploring music discovery and online radio experiences.",
    href: "https://music.adinkramedia.com/",
    icon: Radio,
  },
  {
    name: "Zen Orb",
    category: "Digital Experiences",
    description:
      "A digital venture exploring focused, immersive experiences through design and technology.",
    href: "https://zen.adinkramedia.com/",
    icon: Sparkles,
  },
  {
    name: "Adinkra TV",
    category: "Video & Media",
    description:
      "A media venture exploring video content and digital viewing experiences.",
    href: "https://tv.adinkramedia.com/",
    icon: MonitorPlay,
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-adinkra-bg text-adinkra-gold">
      <Header />

      <main>
        {/* PAGE INTRO */}
        <section className="px-6 pb-20 pt-32 md:pb-28 md:pt-40">
          <div className="mx-auto max-w-6xl text-center">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-adinkra-highlight">
              About Adinkra Media
            </p>

            <h1 className="mb-8 text-4xl font-bold leading-tight text-adinkra-highlight md:text-6xl lg:text-7xl">
              Media, Technology
              <span className="block">&amp; Original Ideas.</span>
            </h1>

            <p className="mx-auto max-w-4xl text-lg leading-relaxed text-adinkra-gold/80 md:text-2xl">
              Adinkra Media is a South African company working across
              technology, music, media and creative production. We
              develop digital products and platforms, create 3D
              visualisations and animations, produce original music
              and sound, and bring ideas to life through visual and
              audio experiences.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="#our-approach"
                className="rounded-xl bg-adinkra-highlight px-7 py-4 font-semibold text-adinkra-bg transition hover:opacity-90"
              >
                Discover Our Approach
              </a>

              <a
                href="#our-ventures"
                className="rounded-xl border border-adinkra-highlight/40 px-7 py-4 font-semibold transition hover:bg-adinkra-highlight/10"
              >
                Explore Our Ventures
              </a>
            </div>
          </div>
        </section>

        {/* WHO WE ARE */}
        <section className="border-y border-adinkra-highlight/15 bg-adinkra-card/20 px-6 py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl items-start gap-10 md:grid-cols-2 md:gap-20">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.25em] text-adinkra-highlight">
                Who We Are
              </p>

              <h2 className="text-3xl font-bold leading-tight text-adinkra-highlight md:text-5xl">
                A company built to turn ideas into something real.
              </h2>
            </div>

            <div className="space-y-5 text-lg leading-relaxed text-adinkra-gold/75">
              <p>
                Adinkra Media brings together technology, music, media
                and creative production under one company. Our work
                includes developing digital solutions, creating 3D
                visuals and animations, producing original music and
                sound, and exploring new forms of visual and audio
                storytelling.
              </p>

              <p>
                We work across different disciplines, from building
                digital products to visualising products and explaining
                how technologies work. Alongside client projects, we
                develop our own ventures and explore opportunities
                that bring creative ideas and technical execution
                together.
              </p>

              <p>
                Our focus is practical: understand the idea, identify
                the opportunity, choose the right approach and create
                work that serves a clear purpose.
              </p>
            </div>
          </div>
        </section>

        {/* OUR CAPABILITIES */}
        <section className="px-6 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-4 text-sm uppercase tracking-[0.25em] text-adinkra-highlight">
                What We Do
              </p>

              <h2 className="mb-6 text-3xl font-bold text-adinkra-highlight md:text-5xl">
                Different disciplines. One creative vision.
              </h2>

              <p className="text-lg leading-relaxed text-adinkra-gold/75">
                We bring together technical development and creative
                production to build digital solutions, create
                compelling content and communicate ideas in different
                ways.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {capabilities.map((capability) => {
                const Icon = capability.icon;

                return (
                  <article
                    key={capability.title}
                    className="rounded-2xl border border-adinkra-highlight/20 bg-adinkra-card/40 p-7 transition hover:border-adinkra-highlight/50 md:p-8"
                  >
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-adinkra-highlight/10">
                      <Icon className="h-6 w-6 text-adinkra-highlight" />
                    </div>

                    <h3 className="mb-4 text-xl font-bold text-adinkra-highlight md:text-2xl">
                      {capability.title}
                    </h3>

                    <p className="leading-relaxed text-adinkra-gold/70">
                      {capability.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 rounded-xl border border-adinkra-highlight/40 px-6 py-3 font-semibold text-adinkra-highlight transition hover:bg-adinkra-highlight/10"
              >
                Explore Our Creative Work
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* OUR APPROACH */}
        <section
          id="our-approach"
          className="scroll-mt-24 border-y border-adinkra-highlight/15 bg-adinkra-card/20 px-6 py-20 md:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-4 text-sm uppercase tracking-[0.25em] text-adinkra-highlight">
                Our Approach
              </p>

              <h2 className="mb-6 text-3xl font-bold text-adinkra-highlight md:text-5xl">
                Think clearly. Create deliberately.
              </h2>

              <p className="text-lg leading-relaxed text-adinkra-gold/75">
                Good ideas need more than inspiration. They need
                direction, thoughtful execution and an understanding
                of the people they are intended to serve.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {principles.map((principle) => {
                const Icon = principle.icon;

                return (
                  <article
                    key={principle.title}
                    className="rounded-2xl border border-adinkra-highlight/20 bg-adinkra-bg/50 p-7 transition hover:border-adinkra-highlight/50"
                  >
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-adinkra-highlight/10">
                      <Icon className="h-6 w-6 text-adinkra-highlight" />
                    </div>

                    <h3 className="mb-4 text-xl font-bold text-adinkra-highlight">
                      {principle.title}
                    </h3>

                    <p className="leading-relaxed text-adinkra-gold/70">
                      {principle.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* OUR VENTURES */}
        <section
          id="our-ventures"
          className="scroll-mt-24 px-6 py-20 md:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <p className="mb-4 text-sm uppercase tracking-[0.25em] text-adinkra-highlight">
                  Our Ecosystem
                </p>

                <h2 className="mb-5 text-3xl font-bold text-adinkra-highlight md:text-5xl">
                  Different ideas. One wider vision.
                </h2>

                <p className="text-lg leading-relaxed text-adinkra-gold/75">
                  Our ventures explore opportunities across digital
                  development, music, events and media. Each has its
                  own purpose and identity while contributing to
                  the wider Adinkra Media ecosystem.
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex shrink-0 items-center gap-2 font-semibold text-adinkra-highlight transition hover:opacity-80"
              >
                Back to Home
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ventures.map((venture) => {
                const Icon = venture.icon;

                return (
                  <article
                    key={venture.name}
                    className="flex h-full flex-col rounded-2xl border border-adinkra-highlight/20 bg-adinkra-card/40 p-7 transition hover:-translate-y-1 hover:border-adinkra-highlight/50"
                  >
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-adinkra-highlight/10">
                      <Icon className="h-6 w-6 text-adinkra-highlight" />
                    </div>

                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-adinkra-highlight/80">
                      {venture.category}
                    </p>

                    <h3 className="mb-4 text-2xl font-bold text-adinkra-highlight">
                      {venture.name}
                    </h3>

                    <p className="mb-7 flex-grow leading-relaxed text-adinkra-gold/70">
                      {venture.description}
                    </p>

                    <a
                      href={venture.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-semibold text-adinkra-highlight transition hover:opacity-80"
                    >
                      Explore Venture
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* WORK WITH US */}
        <section className="px-6 py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-3xl border border-adinkra-highlight/25 bg-gradient-to-br from-adinkra-card/70 to-black/30 p-8 md:grid-cols-2 md:gap-16 md:p-12">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.25em] text-adinkra-highlight">
                Work With Us
              </p>

              <h2 className="mb-6 text-3xl font-bold leading-tight text-adinkra-highlight md:text-5xl">
                Have an idea worth bringing to life?
              </h2>

              <p className="text-lg leading-relaxed text-adinkra-gold/75">
                Whether you need a digital solution, a 3D visualisation,
                an animated explainer, music, audio production or support
                with a creative project, we welcome conversations about
                ideas and opportunities worth exploring.
              </p>
            </div>

            <div className="flex flex-col items-start gap-5">
              <a
                href="https://digital.adinkramedia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl bg-adinkra-highlight px-7 py-4 font-bold text-adinkra-bg transition hover:opacity-90"
              >
                Explore Adinkra Digital
                <ArrowUpRight className="h-5 w-5" />
              </a>

              <a
                href="mailto:info@adinkramedia.com?subject=Adinkra%20Media%20Enquiry"
                className="inline-flex items-center gap-2 font-semibold text-adinkra-highlight hover:underline"
              >
                Contact Adinkra Media
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}