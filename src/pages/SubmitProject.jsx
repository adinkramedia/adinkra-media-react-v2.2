import { useState } from "react";

const PROJECT_TYPES = [
  "Film",
  "TV",
  "Game",
  "Advertisement",
  "Podcast",
  "YouTube / Online",
  "Music",
  "Other",
];

const SERVICES = [
  "Custom Music",
  "Sound Design",
  "Mixing",
  "Mastering",
  "Foley",
  "Audio Editing",
  "Studio Recording",
];

const BUDGET_OPTIONS = [
  "Under $250",
  "$250 – $500",
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000+",
  "Not sure yet",
];

const INITIAL_FORM_DATA = {
  name: "",
  company: "",
  email: "",
  phone: "",
  projectName: "",
  projectType: "",
  services: [],
  description: "",
  budget: "",
  deadline: "",
  referenceLinks: "",
  notes: "",
};

export default function SubmitProject() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // HANDLE INPUT CHANGES
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE SERVICE SELECTION
  // =========================================================

  const handleServiceChange = (service) => {
    setFormData((previous) => {
      const alreadySelected = previous.services.includes(service);
      return {
        ...previous,
        services: alreadySelected
          ? previous.services.filter((item) => item !== service)
          : [...previous.services, service],
      };
    });
  };

  // =========================================================
  // FORM SUBMISSION
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setSubmitted(false);
    setError("");

    try {
      // -----------------------------------------------------
      // BASIC VALIDATION
      // -----------------------------------------------------

      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.projectName.trim() ||
        !formData.projectType.trim() ||
        !formData.description.trim()
      ) {
        throw new Error("Please complete all required fields.");
      }

      if (!Array.isArray(formData.services) || formData.services.length === 0) {
        throw new Error("Please select at least one service.");
      }

      // -----------------------------------------------------
      // BUILD JSON PAYLOAD
      // -----------------------------------------------------

      const payload = {
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        projectName: formData.projectName.trim(),
        projectType: formData.projectType.trim(),
        services: formData.services,
        description: formData.description.trim(),
        budget: formData.budget.trim(),
        deadline: formData.deadline.trim(),
        referenceLinks: formData.referenceLinks.trim(),
        notes: formData.notes.trim(),
      };

      console.log("[SubmitProject] Submitting project...", payload);

      // -----------------------------------------------------
      // SEND TO NETLIFY FUNCTION
      // -----------------------------------------------------

      const response = await fetch("/.netlify/functions/submit-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // -----------------------------------------------------
      // READ SERVER RESPONSE
      // -----------------------------------------------------

      const contentType = response.headers.get("content-type") || "";
      let data = {};

      if (contentType.includes("application/json")) {
        data = await response.json().catch(() => ({}));
      } else {
        const text = await response.text();
        data = { error: text };
      }

      console.log("[SubmitProject] Server response:", response.status, data);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Unable to submit your project. Please try again."
        );
      }

      if (data?.success === false) {
        throw new Error(data?.error || "Your project could not be submitted.");
      }

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      setSubmitted(true);
      setFormData({ ...INITIAL_FORM_DATA, services: [] });

      // Scroll to success message.
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("[SubmitProject] Submission error:", err);
      setError(err?.message || "Something went wrong while submitting your project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-adinkra-bg text-adinkra-gold px-6 py-32">
      <div className="mx-auto max-w-5xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="max-w-3xl">
          <span className="inline-block border border-adinkra-gold/30 bg-adinkra-card px-5 py-2 text-sm text-adinkra-highlight">
            Adinkra Media
          </span>
          <h1 className="mt-8 font-heading text-5xl font-bold md:text-7xl">
            Submit a Project
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-adinkra-gold/80">
            Need original music, sound design, mixing, mastering, Foley, or other audio production
            services?
          </p>
          <p className="mt-3 text-lg leading-relaxed text-adinkra-gold/70">
            Tell us about your project and our team will review your requirements and get back to you.
          </p>
        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {submitted && (
          <div className="mt-10 border border-green-500/40 bg-green-500/10 px-6 py-6">
            <h2 className="text-2xl font-bold text-green-400">Project Submitted</h2>
            <p className="mt-3 text-adinkra-gold/80">
              Thank you for contacting Adinkra Media. We've received your project information and
              will review it before getting back to you.
            </p>
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="mt-10 border border-red-500/40 bg-red-500/10 px-6 py-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit} className="mt-14 space-y-8">
          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <section className="border border-adinkra-gold/15 bg-adinkra-card p-8">
            <h2 className="font-heading text-3xl font-bold text-adinkra-highlight">
              Contact Information
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {/* NAME */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2 w-full border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none focus:border-adinkra-highlight"
                  placeholder="Your name"
                />
              </div>

              {/* COMPANY */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium">
                  Company / Studio
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  className="mt-2 w-full border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none focus:border-adinkra-highlight"
                  placeholder="Company or studio name"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 w-full border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none focus:border-adinkra-highlight"
                  placeholder="you@example.com"
                />
              </div>

              {/* PHONE */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium">
                  Phone / WhatsApp
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-2 w-full border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none focus:border-adinkra-highlight"
                  placeholder="+27 ..."
                />
              </div>
            </div>
          </section>

          {/* =================================================
              PROJECT INFORMATION
          ================================================= */}

          <section className="border border-adinkra-gold/15 bg-adinkra-card p-8">
            <h2 className="font-heading text-3xl font-bold text-adinkra-highlight">
              Project Information
            </h2>

            <div className="mt-8 space-y-6">
              {/* PROJECT NAME */}
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium">
                  Project Name *
                </label>
                <input
                  id="projectName"
                  name="projectName"
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={handleChange}
                  className="mt-2 w-full border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none focus:border-adinkra-highlight"
                  placeholder="Name of your project"
                />
              </div>

              {/* PROJECT TYPE */}
              <div>
                <label htmlFor="projectType" className="block text-sm font-medium">
                  Project Type *
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  required
                  value={formData.projectType}
                  onChange={handleChange}
                  className="mt-2 w-full border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none focus:border-adinkra-highlight"
                >
                  <option value="">Select project type</option>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium">
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={7}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-2 w-full resize-y border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none focus:border-adinkra-highlight"
                  placeholder="Tell us about the project, what you are creating, and what you need from Adinkra Media."
                />
              </div>
            </div>
          </section>

          {/* =================================================
              SERVICES
          ================================================= */}

          <section className="border border-adinkra-gold/15 bg-adinkra-card p-8">
            <h2 className="font-heading text-3xl font-bold text-adinkra-highlight">
              Services Required
            </h2>
            <p className="mt-3 text-sm text-adinkra-gold/60">
              Select all services that apply.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {SERVICES.map((service) => {
                const selected = formData.services.includes(service);
                return (
                  <label
                    key={service}
                    className={`flex cursor-pointer items-center gap-3 border px-4 py-4 transition ${
                      selected
                        ? "border-adinkra-highlight bg-adinkra-highlight/10"
                        : "border-adinkra-gold/15 hover:border-adinkra-gold/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleServiceChange(service)}
                      className="h-4 w-4"
                    />
                    <span>{service}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* =================================================
              BUDGET & DEADLINE
          ================================================= */}

          <section className="border border-adinkra-gold/15 bg-adinkra-card p-8">
            <h2 className="font-heading text-3xl font-bold text-adinkra-highlight">
              Budget & Timeline
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium">
                  Estimated Budget
                </label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="mt-2 w-full border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none focus:border-adinkra-highlight"
                >
                  <option value="">Select estimated budget</option>
                  {BUDGET_OPTIONS.map((budget) => (
                    <option key={budget} value={budget}>
                      {budget}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium">
                  Deadline
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="mt-2 w-full border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none focus:border-adinkra-highlight"
                />
              </div>
            </div>
          </section>

          {/* =================================================
              REFERENCES
          ================================================= */}

          <section className="border border-adinkra-gold/15 bg-adinkra-card p-8">
            <h2 className="font-heading text-3xl font-bold text-adinkra-highlight">
              References & Notes
            </h2>

            <div className="mt-8 space-y-6">
              {/* REFERENCE LINKS */}
              <div>
                <label htmlFor="referenceLinks" className="block text-sm font-medium">
                  Reference Links
                </label>
                <textarea
                  id="referenceLinks"
                  name="referenceLinks"
                  rows={4}
                  value={formData.referenceLinks}
                  onChange={handleChange}
                  className="mt-2 w-full resize-y border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none focus:border-adinkra-highlight"
                  placeholder="Paste links to references, demos, videos, briefs, Google Drive folders, etc."
                />
                <p className="mt-2 text-xs text-adinkra-gold/50">
                  For large audio or video files, please provide a shareable link instead of uploading
                  them here.
                </p>
              </div>

              {/* ADDITIONAL NOTES */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={6}
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-2 w-full resize-y border border-adinkra-gold/20 bg-adinkra-bg px-4 py-3 text-adinkra-gold outline-none focus:border-adinkra-highlight"
                  placeholder="Anything else we should know about your project?"
                />
              </div>
            </div>
          </section>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="border border-adinkra-gold/15 bg-adinkra-card p-8">
            <p className="text-sm leading-relaxed text-adinkra-gold/60">
              Submitting this form does not create a binding agreement or guarantee acceptance of your
              project. We will review your requirements and contact you regarding availability, pricing,
              and next steps.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 w-full bg-adinkra-highlight px-6 py-5 text-lg font-bold text-adinkra-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting Project..." : "Submit Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}