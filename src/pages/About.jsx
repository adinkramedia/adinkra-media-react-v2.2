import Header from "../components/Header";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">

        {/* =====================================================
            HERO
        ===================================================== */}

        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-adinkra-highlight mb-6">
            About Adinkra Media
          </h1>

          <p className="text-adinkra-gold/90 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Adinkra Media is an audio production and post-production company
            creating original music, sound design, audio libraries, and sonic
            solutions for film, television, advertising, gaming, broadcast,
            and digital media.
          </p>

          <p className="mt-5 text-adinkra-gold/80 text-lg max-w-3xl mx-auto leading-relaxed">
            From custom composition and cinematic scoring to sound design,
            mixing, mastering, broadcast production, and audio licensing —
            we help brands, creators, agencies, studios, and media companies
            bring their projects to life through powerful sound.
          </p>
        </div>


        {/* =====================================================
            OUR APPROACH
        ===================================================== */}

        <div className="mb-24 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-adinkra-highlight mb-6">
            Our Approach
          </h2>

          <p className="text-adinkra-gold/80 leading-relaxed text-lg">
            Founded by composer, sound designer, and audio engineer
            Ngonyama Yezwe Nqaba-Ncedo, Adinkra Media combines technical
            precision with creative storytelling to deliver distinctive,
            high-quality audio experiences.
          </p>

          <p className="mt-5 text-adinkra-gold/80 leading-relaxed text-lg">
            Every project is approached with a commitment to clarity,
            emotion, and sonic excellence — whether developing original
            music, crafting immersive sound design, producing
            broadcast-ready audio, or building commercial audio assets
            for creators worldwide.
          </p>
        </div>


        {/* =====================================================
            SERVICES & PRICING
        ===================================================== */}

        <div className="mb-24">

          <h2 className="text-3xl md:text-4xl font-bold text-adinkra-highlight mb-4 text-center">
            Services & Starting Prices
          </h2>

          <p className="text-center text-adinkra-gold/70 mb-12 max-w-3xl mx-auto">
            Starting prices are provided for reference. Final quotes depend
            on project scope, complexity, asset count, licensing requirements,
            deadline, revisions, and delivery specifications.
          </p>


          {/* =====================================================
              CUSTOM MUSIC
          ===================================================== */}

          <div className="grid md:grid-cols-2 gap-8">

            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8">

              <h3 className="text-xl font-semibold text-adinkra-highlight mb-3">
                Custom Music & Production
              </h3>

              <p className="text-adinkra-gold/80 mb-6">
                Original music, production, arrangements, ghost production,
                themes, jingles, brand music, and cinematic compositions.
              </p>

              <div className="space-y-3">

                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    From $80
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Short compositions, themes, intros, stingers and
                    production elements.
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mt-2">
                    From approximately R1,500
                  </p>
                </div>


                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    From $150
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Full music production, ghost production, jingles,
                    brand music and advanced compositions.
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mt-2">
                    From approximately R2,800
                  </p>
                </div>


                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    Film & Cinematic Scoring — From $250
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Film, television, documentary, trailer and cinematic
                    scoring. Quoted according to duration, cues and complexity.
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mt-2">
                    From approximately R4,700
                  </p>
                </div>

              </div>
            </div>


            {/* =====================================================
                SOUND DESIGN
            ===================================================== */}

            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8">

              <h3 className="text-xl font-semibold text-adinkra-highlight mb-3">
                Sound Design
              </h3>

              <p className="text-adinkra-gold/80 mb-6">
                Custom sonic environments and assets for film, games,
                advertising, animation, digital products and interactive media.
              </p>

              <div className="space-y-3">

                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    From $100
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Custom sound design, SFX, Foley, atmospheres,
                    ambiences and sonic textures.
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mt-2">
                    From approximately R1,900
                  </p>
                </div>


                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    Games & Interactive Audio — From $150
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Game sound effects, UI sounds, menus, character sounds,
                    environmental audio and interactive assets.
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mt-2">
                    From approximately R2,800
                  </p>
                </div>


                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    Custom Sonic Identity — From $200
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Sonic branding systems, audio identities and custom
                    audio assets for brands and digital products.
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mt-2">
                    From approximately R3,800
                  </p>
                </div>

              </div>
            </div>


            {/* =====================================================
                MIXING & MASTERING
            ===================================================== */}

            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8">

              <h3 className="text-xl font-semibold text-adinkra-highlight mb-3">
                Mixing & Mastering
              </h3>

              <p className="text-adinkra-gold/80 mb-6">
                Professional mixing and mastering for music, podcasts,
                broadcast and digital content.
              </p>

              <div className="space-y-3">

                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    Standard Mix — From R300 / track
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Balance, EQ, compression, effects, automation and stereo mix.
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mt-2">
                    International pricing from approximately $17
                  </p>
                </div>


                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    Premium Mix — From R450 / track
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Advanced processing and detailed layer management.
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mt-2">
                    International pricing from approximately $25
                  </p>
                </div>


                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    Pro Mix — From R600 / track
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Detailed editing, vocal tuning and stem delivery.
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mt-2">
                    International pricing from approximately $33
                  </p>
                </div>


                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    Mastering — From R150 / track
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Standard mastering from R150. Premium and Pro mastering
                    available up to R250 per track.
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mt-2">
                    International pricing from approximately $9
                  </p>
                </div>

              </div>
            </div>


            {/* =====================================================
                AUDIO POST
            ===================================================== */}

            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8">

              <h3 className="text-xl font-semibold text-adinkra-highlight mb-3">
                Audio Post-Production
              </h3>

              <p className="text-adinkra-gold/80 mb-6">
                Editing, dialogue cleanup, vocal editing, noise reduction,
                podcast post-production and final audio delivery.
              </p>

              <div className="bg-black/20 p-4 rounded-lg">

                <p className="font-bold text-adinkra-highlight">
                  From $50
                </p>

                <p className="text-sm text-adinkra-gold/70 mt-1">
                  Final pricing depends on runtime, number of tracks,
                  restoration requirements and delivery specifications.
                </p>

                <p className="text-xs text-adinkra-gold/50 mt-2">
                  From approximately R950
                </p>

              </div>
            </div>


            {/* =====================================================
                FILM TV MEDIA
            ===================================================== */}

            <div className="bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8">

              <h3 className="text-xl font-semibold text-adinkra-highlight mb-3">
                Film, TV & Media Audio
              </h3>

              <p className="text-adinkra-gold/80 mb-6">
                Complete audio solutions for filmmakers, production
                companies, agencies and visual storytellers.
              </p>

              <div className="space-y-3">

                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    Film & TV Scoring — From $250
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Scoring, music editing and cinematic composition.
                  </p>
                </div>


                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    Film Sound Design — From $150
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Sound design, Foley, dialogue editing and audio post.
                  </p>
                </div>


                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="font-bold text-adinkra-highlight">
                    Complete Audio Post — Custom Quote
                  </p>

                  <p className="text-sm text-adinkra-gold/70 mt-1">
                    Full project audio from editing through final delivery.
                  </p>
                </div>

              </div>
            </div>


            {/* =====================================================
                RADIO IMAGING
            ===================================================== */}

            <div className="md:col-span-2 bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8">

              <div className="text-center mb-8">

                <h3 className="text-2xl font-bold text-adinkra-highlight mb-3">
                  Radio Imaging
                </h3>

                <p className="text-adinkra-gold/80 max-w-2xl mx-auto">
                  Professional sonic branding and recurring imaging
                  production for radio stations, online radio platforms,
                  podcast networks and broadcast brands.
                </p>

              </div>


              <div className="grid md:grid-cols-3 gap-5">

                {/* STARTER */}

                <div className="bg-black/20 rounded-xl p-6 border border-adinkra-gold/10">

                  <h4 className="text-lg font-bold text-adinkra-highlight mb-2">
                    Starter Imaging
                  </h4>

                  <p className="text-2xl font-bold text-adinkra-highlight mb-5">
                    From R7,500
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mb-4">
                    Approximately $400 / month
                  </p>

                  <ul className="space-y-2 text-sm text-adinkra-gold/75">

                    <li>• 5 Station IDs</li>
                    <li>• 10 Sweepers</li>
                    <li>• 4 Promos</li>
                    <li>• 2 Show Intros / Outros</li>
                    <li>• 2 Station Jingles</li>
                    <li>• Voice-over production</li>
                    <li>• Mixing & mastering</li>
                    <li>• Broadcast-ready delivery</li>

                  </ul>

                </div>


                {/* PROFESSIONAL */}

                <div className="bg-black/20 rounded-xl p-6 border border-adinkra-highlight/40">

                  <div className="inline-block mb-3 px-3 py-1 text-xs font-bold rounded-full bg-adinkra-highlight text-adinkra-bg">
                    MOST POPULAR
                  </div>

                  <h4 className="text-lg font-bold text-adinkra-highlight mb-2">
                    Professional Imaging
                  </h4>

                  <p className="text-2xl font-bold text-adinkra-highlight mb-5">
                    From R12,500
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mb-4">
                    Approximately $680 / month
                  </p>

                  <ul className="space-y-2 text-sm text-adinkra-gold/75">

                    <li>• 10 Station IDs</li>
                    <li>• 20 Sweepers</li>
                    <li>• 8 Promos</li>
                    <li>• 4 Show Intros / Outros</li>
                    <li>• 4 Station Jingles</li>
                    <li>• Voice-over production</li>
                    <li>• Advanced sound design</li>
                    <li>• Mixing & mastering</li>
                    <li>• Broadcast-ready delivery</li>

                  </ul>

                </div>


                {/* COMPLETE */}

                <div className="bg-black/20 rounded-xl p-6 border border-adinkra-gold/10">

                  <h4 className="text-lg font-bold text-adinkra-highlight mb-2">
                    Full Station Imaging
                  </h4>

                  <p className="text-2xl font-bold text-adinkra-highlight mb-5">
                    From R20,000
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mb-4">
                    Approximately $1,090 / month
                  </p>

                  <ul className="space-y-2 text-sm text-adinkra-gold/75">

                    <li>• 15 Station IDs</li>
                    <li>• 30 Sweepers</li>
                    <li>• 12 Promos</li>
                    <li>• 6 Show Intros / Outros</li>
                    <li>• 6 Station Jingles</li>
                    <li>• Voice-over production</li>
                    <li>• Custom sonic branding</li>
                    <li>• Advanced mixing & mastering</li>
                    <li>• Broadcast-ready delivery</li>

                  </ul>

                </div>

              </div>


              <div className="mt-8 text-center">

                <p className="text-sm text-adinkra-gold/60 max-w-3xl mx-auto">
                  Additional imaging, production, voice-over talent,
                  music composition, custom sonic branding or urgent
                  turnaround requirements are quoted separately.
                </p>

                <Link
                  to="/submit-project"
                  className="inline-block mt-6 bg-adinkra-highlight text-adinkra-bg font-bold px-8 py-3 rounded-xl hover:opacity-90 transition"
                >
                  Start a Radio Project →
                </Link>

              </div>

            </div>


            {/* =====================================================
                ADINKRA STUDIO
            ===================================================== */}

            <div className="md:col-span-2 bg-adinkra-card/60 border border-adinkra-highlight/40 rounded-2xl p-8">

              <div className="text-center mb-8">

                <h3 className="text-2xl font-bold text-adinkra-highlight mb-3">
                  Adinkra Studio
                </h3>

                <p className="text-adinkra-gold/80 max-w-2xl mx-auto">
                  Recording, production and engineering services from
                  Adinkra Studio in South Africa.
                </p>

              </div>


              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* STUDIO SESSION */}

                <div className="bg-black/20 p-6 rounded-xl">

                  <h4 className="font-bold text-adinkra-highlight mb-3">
                    Studio Session
                  </h4>

                  <p className="text-2xl font-bold mb-2">
                    R750
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mb-4">
                    Approximately $41
                  </p>

                  <p className="text-sm text-adinkra-gold/70">
                    8 hours studio + engineer.
                  </p>

                </div>


                {/* RECORDING */}

                <div className="bg-black/20 p-6 rounded-xl">

                  <h4 className="font-bold text-adinkra-highlight mb-3">
                    Recording Package
                  </h4>

                  <p className="text-2xl font-bold mb-2">
                    R950
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mb-4">
                    Approximately $52
                  </p>

                  <p className="text-sm text-adinkra-gold/70">
                    8 hours + vocal recording + basic editing.
                  </p>

                </div>


                {/* ARTIST */}

                <div className="bg-black/20 p-6 rounded-xl">

                  <h4 className="font-bold text-adinkra-highlight mb-3">
                    Artist Package
                  </h4>

                  <p className="text-2xl font-bold mb-2">
                    R1,250
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mb-4">
                    Approximately $68
                  </p>

                  <p className="text-sm text-adinkra-gold/70">
                    8 hours + recording + editing + mixing.
                  </p>

                </div>


                {/* RELEASE */}

                <div className="bg-black/20 p-6 rounded-xl">

                  <h4 className="font-bold text-adinkra-highlight mb-3">
                    Release Package
                  </h4>

                  <p className="text-2xl font-bold mb-2">
                    R1,450
                  </p>

                  <p className="text-xs text-adinkra-gold/50 mb-4">
                    Approximately $79
                  </p>

                  <p className="text-sm text-adinkra-gold/70">
                    8 hours + recording + editing + mixing + mastering.
                  </p>

                </div>

              </div>


              <div className="mt-8 pt-8 border-t border-adinkra-gold/20">

                <h4 className="text-lg font-bold text-adinkra-highlight text-center mb-6">
                  Additional Studio Services
                </h4>

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 text-center">

                  <div>
                    <p className="font-semibold">
                      Mixing
                    </p>
                    <p className="text-sm text-adinkra-gold/60">
                      R300 – R500 / song
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      Mastering
                    </p>
                    <p className="text-sm text-adinkra-gold/60">
                      R100 – R200 / song
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      Vocal Editing / Tuning
                    </p>
                    <p className="text-sm text-adinkra-gold/60">
                      From R150
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      Additional Studio Hours
                    </p>
                    <p className="text-sm text-adinkra-gold/60">
                      R100 / hour
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      Beat / Instrumental Production
                    </p>
                    <p className="text-sm text-adinkra-gold/60">
                      From R500
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>


        {/* =====================================================
            IMPORTANT PRICING NOTE
        ===================================================== */}

        <div className="mb-24 text-center max-w-3xl mx-auto">

          <h2 className="text-2xl md:text-3xl font-bold text-adinkra-highlight mb-5">
            Need Something More Specific?
          </h2>

          <p className="text-adinkra-gold/75 leading-relaxed">
            The services above represent our starting points. Large-scale
            productions, film and television projects, game audio,
            animation, broadcast campaigns, custom music libraries,
            licensing and multi-asset projects are quoted individually
            according to scope.
          </p>

          <p className="mt-4 text-adinkra-gold/60">
            International projects are quoted in USD. South African
            projects are quoted in ZAR.
          </p>

        </div>


        {/* =====================================================
            CTA
        ===================================================== */}

        <div className="bg-gradient-to-b from-adinkra-card/40 to-black/20 border border-adinkra-highlight/30 rounded-3xl p-8 md:p-12 text-center">

          <h2 className="text-3xl font-bold text-adinkra-highlight mb-5">
            Ready to start a project?
          </h2>

          <p className="text-adinkra-gold/80 text-lg max-w-2xl mx-auto mb-8">
            Tell us about your project and we’ll get back to you with
            availability, a clear quote, and next steps.
          </p>

          <Link
            to="/submit-project"
            className="inline-block bg-adinkra-highlight text-adinkra-bg font-bold text-lg px-10 py-5 rounded-xl hover:opacity-90 transition"
          >
            Submit a Project →
          </Link>


          <div className="mt-10 pt-8 border-t border-adinkra-gold/20">

            <p className="text-adinkra-gold/70 mb-2">
              Prefer email?
            </p>

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