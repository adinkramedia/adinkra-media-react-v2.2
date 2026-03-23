import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const faqs = [
  {
    question: "What is Adinkra Media?",
    answer:
      "Adinkra Media is a professional audio production company, creating original music, soundscapes, and audio solutions for media, film, advertising, and digital projects.",
  },
  {
    question: "Who can work with you?",
    answer:
      "We work with artists, content creators, brands, and production companies looking for high-quality audio solutions — from custom compositions to sound design and audio consulting.",
  },
  {
    question: "Why choose Adinkra Media?",
    answer:
      "We combine creativity, technical expertise, and attention to detail to deliver audio that enhances your project, aligns with your vision, and elevates the listener experience.",
  },
  {
    question: "What services do you offer?",
    answer:
      "Our services include custom music creation, sound design, film scoring, foley, audio editing, mixing, and mastering tailored to your project’s needs and goals.",
  },
  {
    question: "How can I get started?",
    answer:
      "Simply reach out through our Contact page with your project details. We’ll discuss your needs, provide a quote, and start creating audio tailored specifically for you.",
  },
];

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="bg-adinkra-card py-16 px-4">
      <div className="max-w-screen-md mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-adinkra-gold text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-adinkra-gold/30 rounded-xl p-4 bg-adinkra-bg/50 transition duration-300"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center text-left text-adinkra-gold text-lg font-medium focus:outline-none"
              >
                <span>{faq.question}</span>
                <span className="text-adinkra-highlight">
                  {activeIndex === index ? <FaMinus /> : <FaPlus />}
                </span>
              </button>

              <div
                className={`mt-3 text-adinkra-gold/90 text-sm leading-relaxed transition-all duration-300 overflow-hidden ${
                  activeIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}