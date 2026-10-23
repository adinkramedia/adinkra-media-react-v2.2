import { useState } from "react";

const ENQUIRY_TYPES = [
  "Website Development",
  "Web Application or Digital Platform",
  "Digital Product",
  "3D Modelling or Product Visualisation",
  "3D Animation or Technical Explainer",
  "Music or Audio Production",
  "Video or Creative Content",
  "Media or Creative Project",
  "Business Partnership",
  "Product Collaboration",
  "Other Enquiry",
];

const BUDGET_OPTIONS = [
  "Under R5,000",
  "R5,000 – R10,000",
  "R10,000 – R20,000",
  "R20,000 – R50,000",
  "R50,000+",
  "Not sure yet",
  "Not applicable",
];

const INITIAL_FORM_DATA = {
  name: "",
  company: "",
  email: "",
  phone: "",
  enquiryType: "",
  projectName: "",
  description: "",
  budget: "",
  deadline: "",
  referenceLinks: "",
  notes: "",
};

const inputClass =
  "mt-2 w-full rounded-lg border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none transition focus:border-adinkra-highlight";

const labelClass =
  "block text-sm font-medium text-adinkra-gold";

const sectionClass =
  "rounded-2xl border border-adinkra-gold/15 bg-adinkra-card p-6 md:p-8";

export default function SubmitProject() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
    if (submitted) setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setSubmitted(false);
    setError("");

    try {
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.enquiryType ||
        !formData.description.trim()
      ) {
        throw new Error("Please complete all required fields.");
      }

      if (formData.description.trim().length < 10) {
        throw new Error(
          "Please provide a little more detail about your enquiry."
        );
      }

      const formElement = event.currentTarget;
      const botField = formElement.elements.namedItem("bot-field");

      if (botField && botField.value.trim()) {
        throw new Error(
          "Unable to submit this enquiry. Please try again."
        );
      }

      const netlifyFormData = new URLSearchParams();

      netlifyFormData.append("form-name", "project-enquiry");
      netlifyFormData.append(
        "subject",
        `New Adinkra Media Enquiry: ${formData.enquiryType}`
      );

      Object.entries(formData).forEach(([key, value]) => {
        netlifyFormData.append(key, value.trim());
      });

      netlifyFormData.append(
        "bot-field",
        botField?.value || ""
      );

      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: netlifyFormData.toString(),
      });

      if (!response.ok) {
        throw new Error(
          "We couldn't submit your enquiry. Please try again or contact us by email."
        );
      }

      setSubmitted(true);
      setFormData({ ...INITIAL_FORM_DATA });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("[SubmitProject] Submission error:", err);

      setError(
        err?.message ||
          "Something went wrong. Please email info@adinkramedia.com instead."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-adinkra-bg px-6 py-32 text-adinkra-gold">
      <div className="mx-auto max-w-5xl">
        {/* PAGE INTRO */}
        <header className="max-w-3xl">
          <span className="inline-block rounded-full border border-adinkra-highlight/30 bg-adinkra-card px-5 py-2 text-sm text-adinkra-highlight">
            Adinkra Media (Pty) Ltd
          </span>

          <h1 className="mt-8 text-4xl font-bold leading-tight text-adinkra-highlight md:text-6xl">
            Let's Build Something.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-adinkra-gold/80 md:text-xl">
            Have a project, an idea or an opportunity to collaborate?
            Tell us what you're working on and how we can help bring it
            to life.
          </p>

          <p className="mt-4 leading-relaxed text-adinkra-gold/60">
            We work across technology, digital development, 3D visual
            production, music, audio and media. Whether you're planning
            a website, developing a digital product, exploring a
            visual concept or producing creative content, we'd like
            to hear from you.
          </p>
        </header>

        {/* SUCCESS MESSAGE */}
        {submitted && (
          <div
            role="status"
            aria-live="polite"
            className="mt-10 rounded-xl border border-green-500/40 bg-green-500/10 p-6"
          >
            <h2 className="text-2xl font-bold text-green-400">
              Thank You for Getting in Touch
            </h2>

            <p className="mt-3 leading-relaxed text-adinkra-gold/80">
              Your enquiry has been submitted successfully. We
              appreciate your interest in Adinkra Media and will
              review the details provided.
            </p>

            <p className="mt-3 text-sm text-adinkra-gold/60">
              If you need to add information, you can reach us at{" "}
              <a
                href="mailto:info@adinkramedia.com"
                className="text-adinkra-highlight hover:underline"
              >
                info@adinkramedia.com
              </a>
              .
            </p>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div
            role="alert"
            className="mt-10 rounded-xl border border-red-500/40 bg-red-500/10 p-6"
          >
            <h2 className="font-semibold text-red-400">
              Enquiry Not Submitted
            </h2>

            <p className="mt-2 leading-relaxed text-adinkra-gold/80">
              {error}
            </p>

            <p className="mt-3 text-sm text-adinkra-gold/70">
              You can also contact us directly at{" "}
              <a
                href="mailto:info@adinkramedia.com"
                className="font-medium text-adinkra-highlight hover:underline"
              >
                info@adinkramedia.com
              </a>
              .
            </p>
          </div>
        )}

        {/* ENQUIRY FORM */}
        <form
          name="project-enquiry"
          method="POST"
          action="/"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
          className="mt-12 space-y-7"
        >
          <input
            type="hidden"
            name="form-name"
            value="project-enquiry"
          />

          {/* NETLIFY SPAM HONEYPOT */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="bot-field">
              Leave this field empty:
            </label>
            <input
              id="bot-field"
              name="bot-field"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* CONTACT INFORMATION */}
          <section className={sectionClass}>
            <h2 className="text-2xl font-bold text-adinkra-highlight md:text-3xl">
              Your Information
            </h2>

            <p className="mt-2 text-sm text-adinkra-gold/60">
              Tell us who we're speaking with.
            </p>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={150}
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="company" className={labelClass}>
                  Company or Organisation
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  maxLength={200}
                  value={formData.company}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Company name (optional)"
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone or WhatsApp
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="+27 ..."
                />
              </div>
            </div>
          </section>

          {/* ENQUIRY DETAILS */}
          <section className={sectionClass}>
            <h2 className="text-2xl font-bold text-adinkra-highlight md:text-3xl">
              Tell Us About Your Project
            </h2>

            <p className="mt-2 text-sm text-adinkra-gold/60">
              Choose the area that best matches your enquiry.
            </p>

            <div className="mt-7 space-y-6">
              <div>
                <label htmlFor="enquiryType" className={labelClass}>
                  What Is Your Enquiry About? *
                </label>

                <select
                  id="enquiryType"
                  name="enquiryType"
                  required
                  value={formData.enquiryType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select an enquiry type</option>
                  {ENQUIRY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="projectName" className={labelClass}>
                  Project or Opportunity Name
                </label>
                <input
                  id="projectName"
                  name="projectName"
                  type="text"
                  maxLength={200}
                  value={formData.projectName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Give your project a name (optional)"
                />
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  How Can We Help? *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  minLength={10}
                  maxLength={10000}
                  rows={7}
                  value={formData.description}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Tell us about your idea, requirements, goals, intended audience or the opportunity you'd like to discuss."
                />
              </div>
            </div>
          </section>

          {/* BUDGET AND TIMELINE */}
          <section className={sectionClass}>
            <h2 className="text-2xl font-bold text-adinkra-highlight md:text-3xl">
              Budget &amp; Timeline
            </h2>

            <p className="mt-2 text-sm text-adinkra-gold/60">
              These details are optional, but they can help us
              understand the scope and timing of your project.
            </p>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="budget" className={labelClass}>
                  Indicative Budget (ZAR)
                </label>

                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Prefer not to say</option>
                  {BUDGET_OPTIONS.map((budget) => (
                    <option key={budget} value={budget}>
                      {budget}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="deadline" className={labelClass}>
                  Target Completion Date
                </label>

                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* REFERENCES AND NOTES */}
          <section className={sectionClass}>
            <h2 className="text-2xl font-bold text-adinkra-highlight md:text-3xl">
              Links &amp; Additional Information
            </h2>

            <p className="mt-2 text-sm text-adinkra-gold/60">
              Share any references that will help us understand
              what you have in mind.
            </p>

            <div className="mt-7 space-y-6">
              <div>
                <label htmlFor="referenceLinks" className={labelClass}>
                  Relevant Links
                </label>

                <textarea
                  id="referenceLinks"
                  name="referenceLinks"
                  rows={4}
                  maxLength={5000}
                  value={formData.referenceLinks}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Website links, design references, briefs, examples or shared documents."
                />

                <p className="mt-2 text-xs text-adinkra-gold/50">
                  Use shareable links for files and documents. Please
                  do not include passwords or confidential access
                  credentials.
                </p>
              </div>

              <div>
                <label htmlFor="notes" className={labelClass}>
                  Anything Else?
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  maxLength={5000}
                  value={formData.notes}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Any additional context, questions or information you'd like us to know."
                />
              </div>
            </div>
          </section>

          {/* SUBMISSION */}
          <section className={sectionClass}>
            <p className="text-sm leading-relaxed text-adinkra-gold/60">
              Submitting an enquiry does not create a binding
              agreement or guarantee that a project will be accepted.
              We'll review the information provided and respond about
              potential next steps.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 w-full rounded-xl bg-adinkra-highlight px-6 py-4 text-lg font-bold text-adinkra-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting Enquiry..." : "Send Enquiry"}
            </button>

            <p className="mt-5 text-center text-sm text-adinkra-gold/60">
              Prefer email?{" "}
              <a
                href="mailto:info@adinkramedia.com?subject=Adinkra%20Media%20Enquiry"
                className="font-medium text-adinkra-highlight hover:underline"
              >
                info@adinkramedia.com
              </a>
            </p>
          </section>
        </form>
      </div>
    </main>
  );
}