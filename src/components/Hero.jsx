export default function Hero() {
  return (
    <section
      className="w-full h-[90vh] relative bg-cover bg-center bg-no-repeat
                 bg-[url('/hero-mobile.jpg')] md:bg-[url('/hero-desktop.jpg')]"
    >
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center px-4">
      <div>
    <h2 className="text-4xl md:text-5xl font-bold text-adinkra-gold mb-4 drop-shadow-lg">
      Adinkra Media
    </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-adinkra-gold leading-relaxed drop-shadow-md">
            “Reclaiming the Narrative of a Continent.”
           African stories. African power. African future.
           Pan-African stories, sacred knowledge, modern sound, and sovereign thought.
          </p>
        </div>
      </div>
    </section>
  );
}
