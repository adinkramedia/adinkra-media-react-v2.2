// About.jsx

import React from "react";

const principles = [
  {
    number: "01",
    title: "Built for the Story",
    description:
      "We approach every project from the creative intent first. Sound should not simply sit underneath an image — it should help shape the atmosphere, emotion, rhythm, and identity of the work.",
  },
  {
    number: "02",
    title: "From Concept to Delivery",
    description:
      "We can become part of a project at any stage, from early creative development and music direction through recording, editing, sound design, mixing, mastering, and final delivery.",
  },
  {
    number: "03",
    title: "Detail Matters",
    description:
      "Great audio is often found in the details. Dialogue, ambience, transitions, textures, dynamics, space, and subtle sonic elements all contribute to how an audience experiences a production.",
  },
  {
    number: "04",
    title: "Made for the Medium",
    description:
      "Film, advertising, television, games, broadcast, and digital media all have different technical and creative requirements. We shape our approach around the platform, audience, and intended experience.",
  },
];

export default function About() {
  return (
    <section className="bg-adinkra-bg text-adinkra-gold py-20 md:py-28 px-6 w-full">
      <div className="max-w-screen-xl mx-auto">
        {/* INTRODUCTION */}
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm tracking-[0.3em] uppercase text-adinkra-gold/60 mb-4">
            Our Approach
          </p>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Sound With Purpose
          </h2>

          <p className="text-lg md:text-xl leading-relaxed text-adinkra-gold/85 mb-6">
            At Adinkra Media, we believe sound is part of the storytelling
            process from the very beginning. The right music, texture,
            performance, silence, or sonic detail can change how an audience
            experiences a scene, a brand, a character, or an entire production.
          </p>

          <p className="text-base md:text-lg leading-relaxed text-adinkra-gold/70">
            Our work combines creative thinking with technical precision.
            We take the time to understand the project, its objectives, its
            audience, and the world it is trying to create. From there, we
            develop an audio approach that feels considered, cohesive, and
            purposeful rather than simply adding sound at the end of the
            process.
          </p>
        </div>

        {/* PRINCIPLES */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {principles.map((principle) => (
            <div
              key={principle.number}
              className="border border-adinkra-gold/15 rounded-2xl p-7 md:p-8 bg-adinkra-gold/[0.03] hover:border-adinkra-gold/30 transition-colors"
            >
              <p className="text-xs tracking-[0.25em] uppercase text-adinkra-gold/50 mb-4">
                {principle.number}
              </p>

              <h3 className="text-xl md:text-2xl font-bold mb-3">
                {principle.title}
              </h3>

              <p className="text-sm md:text-base leading-relaxed text-adinkra-gold/65">
                {principle.description}
              </p>
            </div>
          ))}
        </div>

        {/* CLOSING STATEMENT */}
        <div className="max-w-4xl mx-auto text-center mt-16">
          <p className="text-lg md:text-xl leading-relaxed text-adinkra-gold/80">
            Whether we are supporting a single production requirement or
            contributing across an entire project, our goal remains the same:
            to create audio that feels intentional, sounds exceptional, and
            strengthens the work it belongs to.
          </p>
        </div>
      </div>
    </section>
  );
}