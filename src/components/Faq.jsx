import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const faqs = [
  {
    question: "What is Adinkra Media?",
    answer:
      "Adinkra Media is a Pan-African platform bridging the ancient and the modern — telling stories of African kingdoms, culture, consciousness, and current affairs through media, sound, and sacred knowledge.",
  },
  {
    question: "Who is it for?",
    answer:
      "For Africans and global diasporans seeking truth, power, and reconnection. Whether you're a seeker, creator, activist, or scholar — this is your space.",
  },
  {
    question: "Why does it matter?",
    answer:
      "Because Africa's story has been stolen, silenced, and sold. We are reclaiming narrative power — documenting what’s sacred, sovereign, and ours.",
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
          What is Adinkra?
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
