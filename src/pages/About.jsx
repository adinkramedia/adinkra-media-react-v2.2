// About.jsx

import Header from "../components/Header";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* =====================================================
            PAGE INTRO
        ===================================================== */}
        <div className="text-center mb-24">
          <p className="text-sm uppercase tracking-[0.3em] text-adinkra-highlight mb-4">
            About Adinkra Media
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-adinkra-highlight mb-6">
            Sound. Culture. Story.
          </h1>

          <p className="text-lg md:text-2xl max-w-4xl mx-auto text-adinkra-gold/90 leading-relaxed">
            Adinkra Media is a professional audio production and
            post-production company creating original music, sound design,
            and complete audio solutions for film, television, advertising,
            gaming, broadcast, and digital media.
          </p>
        </div>

        {/* =====================================================
            WHO WE ARE
        ===================================================== */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start mb-28">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-adinkra-highlight mb-4">
              Who We Are
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-adinkra-highlight mb-6">
              An audio company built around the story.
            </h2>
          </div>

          <div className="space-y-5 text-lg text-adinkra-gold/80 leading-relaxed">
            <p>
              Adinkra Media creates music and sound for projects that need
              more than a soundtrack. We build audio that supports the
              narrative, strengthens the visual experience, and gives each
              project its own sonic identity.
            </p>

            <p>
              Our work spans original composition, cinematic scoring,
              sound design, Foley, dialogue editing, mixing, mastering,
              broadcast production, and audio post-production.
            </p>

            <p>
              We work with filmmakers, production companies, agencies,
              brands, game developers, broadcasters, creators, and other
              teams looking for a dedicated audio partner.
            </p>
          </div>
        </div>

        {/* =====================================================
            OUR APPROACH
        ===================================================== */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-sm uppercase tracking-[0.25em] text-adinkra-highlight mb-4">
              Our Approach
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-adinkra-highlight mb-6">
              Creative thinking. Technical precision.
            </h2>

            <p className="text-lg text-adinkra-gold/75 leading-relaxed">
              Every project requires a different approach. We combine
              composition, sound design and engineering to create audio
              that serves the project rather than simply filling space.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-adinkra-card/50 border border-adinkra-highlight/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-adinkra-highlight mb-4">
                Story
              </h3>

              <p className="text-adinkra-gold/70 leading-relaxed">
                We begin with the purpose of the project, its audience,
                its visual language and the story the audio needs to support.
              </p>
            </div>

            <div className="bg-adinkra-card/50 border border-adinkra-highlight/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-adinkra-highlight mb-4">
                Sound
              </h3>

              <p className="text-adinkra-gold/70 leading-relaxed">
                Music, sound design, Foley, dialogue and effects are
                developed with attention to detail and the character of
                the project.
              </p>
            </div>

            <div className="bg-adinkra-card/50 border border-adinkra-highlight/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-adinkra-highlight mb-4">
                Finish
              </h3>

              <p className="text-adinkra-gold/70 leading-relaxed">
                Projects are refined through editing, mixing, mastering
                and delivery to meet the technical requirements of their
                intended platform.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            SERVICES
        ===================================================== */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-sm uppercase tracking-[0.25em] text-adinkra-highlight mb-4">
              What We Do
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-adinkra-highlight mb-5">
              Audio production from concept to final delivery.
            </h2>

            <p className="text-lg text-adinkra-gold/75 leading-relaxed">
              Our services can be commissioned individually or combined
              into a complete audio production and post-production workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* MUSIC */}
            <div className="bg-adinkra-card/50 border border-adinkra-highlight/30 rounded-2xl p-7">
              <h3 className="text-xl font-bold text-adinkra-highlight mb-3">
                Original Music
              </h3>

              <p className="text-adinkra-gold/70 leading-relaxed">
                Custom composition, cinematic scoring, themes, jingles,
                brand music, production and music editing.
              </p>
            </div>

            {/* SOUND DESIGN */}
            <div className="bg-adinkra-card/50 border border-adinkra-highlight/30 rounded-2xl p-7">
              <h3 className="text-xl font-bold text-adinkra-highlight mb-3">
                Sound Design
              </h3>

              <p className="text-adinkra-gold/70 leading-relaxed">
                Bespoke sound effects, Foley, atmospheres, environments,
                sonic textures and sound worlds for visual media.
              </p>
            </div>

            {/* AUDIO POST */}
            <div className="bg-adinkra-card/50 border border-adinkra-highlight/30 rounded-2xl p-7">
              <h3 className="text-xl font-bold text-adinkra-highlight mb-3">
                Audio Post-Production
              </h3>

              <p className="text-adinkra-gold/70 leading-relaxed">
                Dialogue editing, cleanup, restoration, sound editing,
                mixing, mastering and final delivery.
              </p>
            </div>

            {/* FILM & TV */}
            <div className="bg-adinkra-card/50 border border-adinkra-highlight/30 rounded-2xl p-7">
              <h3 className="text-xl font-bold text-adinkra-highlight mb-3">
                Film &amp; Television
              </h3>

              <p className="text-adinkra-gold/70 leading-relaxed">
                Scoring, sound design, Foley, dialogue editing, music
                editing and complete audio post-production.
              </p>
            </div>

            {/* GAMES */}
            <div className="bg-adinkra-card/50 border border-adinkra-highlight/30 rounded-2xl p-7">
              <h3 className="text-xl font-bold text-adinkra-highlight mb-3">
                Games &amp; Interactive
              </h3>

              <p className="text-adinkra-gold/70 leading-relaxed">
                Game sound effects, UI audio, environmental sound,
                character audio and interactive sonic assets.
              </p>
            </div>

            {/* BROADCAST */}
            <div className="bg-adinkra-card/50 border border-adinkra-highlight/30 rounded-2xl p-7">
              <h3 className="text-xl font-bold text-adinkra-highlight mb-3">
                Broadcast &amp; Digital
              </h3>

              <p className="text-adinkra-gold/70 leading-relaxed">
                Broadcast production, radio imaging, podcast post-production,
                digital content audio and platform-ready delivery.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            FOUNDER
        ===================================================== */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center mb-28">
          <div className="bg-adinkra-card/40 border border-adinkra-highlight/30 rounded-3xl p-8 md:p-10">
            <p className="text-sm uppercase tracking-[0.25em] text-adinkra-highlight mb-4">
              Founded By
            </p>

            <h2 className="text-3xl font-bold text-adinkra-highlight mb-5">
              Ngonyama Yezwe Nqaba-Ncedo
            </h2>

            <p className="text-adinkra-gold/75 leading-relaxed">
              Composer, sound designer and audio engineer whose work brings
              together music, engineering and creative sound design.
            </p>
          </div>

          <div className="text-lg text-adinkra-gold/75 leading-relaxed space-y-5">
            <p>
              Adinkra Media was built around the belief that sound is an
              essential part of how people experience stories, products
              and visual worlds.
            </p>

            <p>
              From a single piece of music to a complete audio post-production
              workflow, our focus remains the same: create sound that belongs
              to the project and performs at the level the project demands.
            </p>
          </div>
        </div>

        {/* =====================================================
            CAPABILITIES
        ===================================================== */}
        <div className="mb-28">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.25em] text-adinkra-highlight mb-4">
              Capabilities
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-adinkra-highlight">
              Built for professional production.
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              "Original Music",
              "Film Scoring",
              "Sound Design",
              "Foley",
              "Dialogue Editing",
              "Audio Restoration",
              "Mixing",
              "Mastering",
              "Music Editing",
              "Sonic Branding",
              "Radio Imaging",
              "Podcast Post",
              "Game Audio",
              "Broadcast Audio",
              "Audio Licensing",
            ].map((item) => (
              <span
                key={item}
                className="px-4 py-2 rounded-full border border-adinkra-highlight/30 bg-adinkra-card/30 text-sm text-adinkra-gold/80"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* =====================================================
            COMMERCIAL POSITIONING
        ===================================================== */}
        <div className="mb-28 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-adinkra-highlight mb-6">
            Every project is different.
          </h2>

          <p className="text-lg text-adinkra-gold/75 leading-relaxed">
            Audio requirements vary by project, runtime, number of assets,
            creative direction, licensing, revisions and delivery
            specifications. We develop each proposal around the actual
            requirements of the production.
          </p>
        </div>

        {/* =====================================================
            CTA
        ===================================================== */}
        <div className="bg-gradient-to-b from-adinkra-card/40 to-black/20 border border-adinkra-highlight/30 rounded-3xl p-8 md:p-12 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-adinkra-highlight mb-4">
            Start a Conversation
          </p>

          <h2 className="text-3xl md:text-5xl font-bold text-adinkra-highlight mb-5">
            Have a project in development?
          </h2>

          <p className="text-adinkra-gold/80 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Tell us what you're creating, what you need from audio,
            and where the project is in production. We'll review the
            brief and respond with next steps.
          </p>

          <Link
            to="/submit-project"
            className="inline-block bg-adinkra-highlight text-adinkra-bg font-bold text-lg px-10 py-5 rounded-xl hover:opacity-90 transition"
          >
            Start a Project →
          </Link>

          <div className="mt-10 pt-8 border-t border-adinkra-gold/20">
            <p className="text-adinkra-gold/60 mb-2">Prefer email?</p>

            <a
              href="mailto:sales@adinkramedia.com"
              className="text-adinkra-highlight text-lg font-medium hover:underline"
            >
              sales@adinkramedia.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}