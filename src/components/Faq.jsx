import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const faqs = [
  {
    question: "What is Adinkra Media?",
    answer:
      "Adinkra Media (Pty) Ltd is a South African company working across technology, media, music and creative production. We develop digital products and platforms, create 3D visualisations and animations, produce music and sound, and bring ideas to life through visual and audio experiences.",
  },
  {
    question: "What does Adinkra Media do?",
    answer:
      "Our work spans website and software development, digital platforms, 3D modelling, visualisation, animation, music production, sound design, audio post-production and media projects. We also develop our own products and ventures alongside our creative and technical work for clients.",
  },
  {
    question: "Can Adinkra Media create 3D models and animated explainers?",
    answer:
      "Yes. Our creative work includes 3D visualisation, product presentations, animated logo concepts and technical explainers that help communicate how products, systems and technologies work. These can be used for marketing, education, product promotion and other visual communication needs. Visit our Gallery to explore our creative work.",
  },
  {
    question: "Does Adinkra Media offer music and audio production?",
    answer:
      "Yes. Our audio capabilities include original music composition, cinematic scoring, sound design, Foley, dialogue editing, mixing, mastering and audio post-production. We work across different creative formats and media projects.",
  },
  {
    question: "What is Adinkra Digital?",
    answer:
      "Adinkra Digital is our digital development division, focused on professional websites, web applications and digital platforms for businesses, organisations and individuals. Visit digital.adinkramedia.com to explore our services and work.",
  },
  {
    question: "What platforms and ventures are part of Adinkra Media?",
    answer:
      "Our wider ecosystem includes Adinkra Digital, Adinkra Library, Adinkra Tickets, Adinkra Music, Zen Orb and Adinkra TV. Each venture has its own focus, spanning digital development, audio resources, music discovery, event ticketing, digital experiences and media.",
  },
  {
    question: "Can I hire Adinkra Media for a project?",
    answer:
      "Yes. We welcome enquiries about websites, web applications, digital products, 3D visualisation, animation, technical explainers, music, audio production, video and other creative projects. Tell us about your idea, intended audience and goals so we can discuss a suitable approach.",
  },
  {
    question: "Does Adinkra Media develop its own products?",
    answer:
      "Yes. Alongside client work, we develop our own digital products, platforms and creative initiatives. Building these ventures allows us to explore new ideas, experiment across disciplines and create opportunities for long-term growth.",
  },
  {
    question: "How can I partner or collaborate with Adinkra Media?",
    answer:
      "We welcome relevant partnerships, creative collaborations and business opportunities across technology, music, media and digital products. Email us with an introduction, an outline of your proposal and how you envision working together.",
  },
];

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="bg-adinkra-card px-4 py-20 md:py-24"
    >
      <div className="mx-auto max-w-screen-md">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-adinkra-gold/70">
            Need to Know
          </p>

          <h2 className="mb-4 text-3xl font-bold text-adinkra-gold md:text-4xl">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
            Discover what we do across technology, music, media and
            creative production, and learn how we can work together.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            const answerId = `faq-answer-${index}`;

            return (
              <div
                key={faq.question}
                className={`rounded-xl border bg-adinkra-bg/50 p-5 transition-colors duration-300 ${
                  isOpen
                    ? "border-adinkra-gold/50"
                    : "border-adinkra-gold/20 hover:border-adinkra-gold/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="flex w-full items-center justify-between gap-5 text-left text-base font-medium text-adinkra-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adinkra-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-adinkra-bg md:text-lg"
                >
                  <span>{faq.question}</span>

                  <span className="shrink-0 text-adinkra-highlight">
                    {isOpen ? (
                      <FaMinus aria-hidden="true" />
                    ) : (
                      <FaPlus aria-hidden="true" />
                    )}
                  </span>
                </button>

                <div
                  id={answerId}
                  hidden={!isOpen}
                  className="pt-4"
                >
                  <p className="text-sm leading-relaxed text-white/70 md:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-5 text-sm text-white/60">
            Have an idea, a question or a project in mind?
          </p>

          <a
            href="mailto:info@adinkramedia.com?subject=Adinkra%20Media%20Enquiry"
            className="inline-flex items-center justify-center rounded-lg bg-adinkra-gold px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adinkra-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-adinkra-card"
          >
            Email Adinkra Media
            <span className="ml-2" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}