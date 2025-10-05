// src/pages/Home.jsx
import Hero from "../components/Hero";
import About from "../components/About";
import FeaturedSections from "../components/FeaturedSections";
import Faq from "../components/Faq";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedSections />
      <Faq />
    </>
  );
}
