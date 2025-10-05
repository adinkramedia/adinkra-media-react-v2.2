import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Apply() {
  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      <section className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-6 text-adinkra-highlight text-center">
          Apply to Become a Contributor
        </h1>

        <div className="text-adinkra-gold/90 text-sm md:text-base leading-relaxed mb-12 space-y-6">
          <p className="text-center">
            Are you a student journalist, young writer, or emerging voice passionate about Africa’s future?
          </p>

          <p>
            <strong className="text-adinkra-gold">African Trending News</strong> is Adinkra Media’s independent news platform — built for young Africans to report, reflect, and reframe the continent’s stories from the ground up.
          </p>

          <p>We welcome fresh voices who want to:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Build a real publishing portfolio</li>
            <li>Fulfill school writing assignments or practical hours</li>
            <li>Share untold local stories and youth perspectives</li>
            <li>Report on issues that matter to African communities</li>
            <li>Be part of a Pan-African storytelling platform</li>
          </ul>

          <p>Once accepted, you’ll receive your own Contributor Dashboard where you can:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Submit and manage articles directly</li>
            <li>Edit your contributor profile (bio, name, photo)</li>
            <li>Track your published work</li>
            <li>Use your portfolio for CVs, job applications, or school credit</li>
          </ul>

          <p>
            Our goal is to amplify the next generation of African journalists and storytellers who speak boldly, think critically, and honor cultural memory.
          </p>

          <p className="text-center font-semibold text-adinkra-highlight">
            Fill in the form below to apply. Once approved, you’ll receive access to your dashboard and begin your contributor journey.
          </p>

          <p className="text-center text-sm italic text-adinkra-gold/80">
            Please upload your CV to Google Drive or Dropbox and paste the public link in the form below.
          </p>
        </div>

        {/* Formspree Form */}
        <form
          action="https://formspree.io/f/mqaleagw"
          method="POST"
          className="space-y-6"
        >
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 bg-adinkra-card border border-adinkra-highlight rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 bg-adinkra-card border border-adinkra-highlight rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Portfolio or Website</label>
            <input
              type="url"
              name="portfolio"
              placeholder="https://"
              className="w-full px-4 py-2 bg-adinkra-card border border-adinkra-highlight rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Link to Your CV (Google Drive or Dropbox)</label>
            <input
              type="url"
              name="cvLink"
              placeholder="https://drive.google.com/..."
              required
              className="w-full px-4 py-2 bg-adinkra-card border border-adinkra-highlight rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Tell Us Why You Want to Contribute</label>
            <textarea
              name="message"
              rows="5"
              required
              className="w-full px-4 py-2 bg-adinkra-card border border-adinkra-highlight rounded"
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-adinkra-highlight hover:bg-adinkra-highlight/80 text-adinkra-bg font-semibold px-6 py-3 rounded-full transition w-full md:w-auto"
          >
            Submit Application
          </button>
        </form>
      </section>

      
    </div>
  );
}
