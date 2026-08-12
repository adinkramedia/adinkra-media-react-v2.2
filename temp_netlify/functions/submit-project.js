import { createClient } from "@supabase/supabase-js";

// =========================================================
// SUPABASE
// =========================================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =========================================================
// RESPONSE HELPER
// =========================================================

const jsonResponse = (statusCode, body) => {
  return {
    statusCode,

    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },

    body: JSON.stringify(body),
  };
};

// =========================================================
// GENERATE SUBMISSION ID
// =========================================================

const generateSubmissionId = () => {
  const now = new Date();

  const year = now.getUTCFullYear();

  const month = String(
    now.getUTCMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getUTCDate()
  ).padStart(2, "0");

  const random = Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase();

  return `ADM-${year}${month}${day}-${random}`;
};

// =========================================================
// MAIN HANDLER
// =========================================================

export const handler = async (event) => {
  // =======================================================
  // CORS PREFLIGHT
  // =======================================================

  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, {});
  }

  // =======================================================
  // ONLY POST ALLOWED
  // =======================================================

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, {
      success: false,
      error: "Method not allowed.",
    });
  }

  try {
    // =====================================================
    // CHECK SUPABASE CONFIGURATION
    // =====================================================

    if (
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error(
        "[submit-project] Missing Supabase environment variables."
      );

      return jsonResponse(500, {
        success: false,
        error:
          "Server configuration is incomplete.",
      });
    }

    // =====================================================
    // PARSE JSON
    // =====================================================

    let body = {};

    try {
      body = JSON.parse(event.body || "{}");
    } catch (parseError) {
      console.error(
        "[submit-project] Invalid JSON:",
        parseError
      );

      return jsonResponse(400, {
        success: false,
        error:
          "Invalid project submission data.",
      });
    }

    console.log(
      "[submit-project] Received fields:",
      Object.keys(body)
    );

    // =====================================================
    // EXTRACT FIELDS
    // =====================================================

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const company =
      typeof body.company === "string"
        ? body.company.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const projectName =
      typeof body.projectName === "string"
        ? body.projectName.trim()
        : "";

    const projectType =
      typeof body.projectType === "string"
        ? body.projectType.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const budget =
      typeof body.budget === "string"
        ? body.budget.trim()
        : "";

    const deadline =
      typeof body.deadline === "string"
        ? body.deadline.trim()
        : "";

    const referenceLinks =
      typeof body.referenceLinks === "string"
        ? body.referenceLinks.trim()
        : "";

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim()
        : "";

    // =====================================================
    // SERVICES
    // =====================================================

    const services = Array.isArray(
      body.services
    )
      ? body.services
          .filter(
            (service) =>
              typeof service === "string"
          )
          .map((service) =>
            service.trim()
          )
          .filter(Boolean)
      : [];

    // =====================================================
    // LOG IMPORTANT VALUES
    // =====================================================

    console.log(
      "[submit-project] Project:",
      projectName
    );

    console.log(
      "[submit-project] Project type:",
      projectType
    );

    console.log(
      "[submit-project] Services:",
      services
    );

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!name) {
      return jsonResponse(400, {
        success: false,
        error: "Name is required.",
      });
    }

    if (!email) {
      return jsonResponse(400, {
        success: false,
        error: "Email is required.",
      });
    }

    if (!projectName) {
      return jsonResponse(400, {
        success: false,
        error:
          "Project name is required.",
      });
    }

    if (!projectType) {
      return jsonResponse(400, {
        success: false,
        error:
          "Project type is required.",
      });
    }

    if (!description) {
      return jsonResponse(400, {
        success: false,
        error:
          "Project description is required.",
      });
    }

    if (services.length === 0) {
      return jsonResponse(400, {
        success: false,
        error:
          "Please select at least one service.",
      });
    }

    // =====================================================
    // EMAIL VALIDATION
    // =====================================================

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return jsonResponse(400, {
        success: false,
        error:
          "Please provide a valid email address.",
      });
    }

    // =====================================================
    // DEADLINE VALIDATION
    // =====================================================

    let validDeadline = null;

    if (deadline) {
      const deadlineDate =
        new Date(
          `${deadline}T00:00:00Z`
        );

      if (
        Number.isNaN(
          deadlineDate.getTime()
        )
      ) {
        return jsonResponse(400, {
          success: false,
          error:
            "Please provide a valid deadline.",
        });
      }

      validDeadline = deadline;
    }

    // =====================================================
    // GENERATE SUBMISSION ID
    // =====================================================

    const submissionId =
      generateSubmissionId();

    console.log(
      "[submit-project] New submission:",
      submissionId
    );

    // =====================================================
    // INSERT INTO SUPABASE
    // =====================================================

    const { data, error } =
      await supabase
        .from("project_submissions")
        .insert([
          {
            submission_id:
              submissionId,

            name,

            company:
              company || null,

            email,

            phone:
              phone || null,

            project_name:
              projectName,

            project_type:
              projectType,

            services,

            description,

            budget:
              budget || null,

            deadline:
              validDeadline,

            reference_links:
              referenceLinks ||
              null,

            notes:
              notes || null,

            status: "new",
          },
        ])
        .select(
          "id, submission_id, created_at"
        )
        .single();

    // =====================================================
    // DATABASE ERROR
    // =====================================================

    if (error) {
      console.error(
        "[submit-project] Supabase insert error:",
        error
      );

      return jsonResponse(500, {
        success: false,
        error:
          "We were unable to save your project submission. Please try again.",
      });
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    console.log(
      "[submit-project] Submission saved:",
      data.submission_id
    );

    return jsonResponse(200, {
      success: true,

      message:
        "Your project has been submitted successfully.",

      submissionId:
        data.submission_id,

      createdAt:
        data.created_at,
    });

  } catch (error) {
    // =====================================================
    // UNEXPECTED ERROR
    // =====================================================

    console.error(
      "[submit-project] Unexpected error:",
      error
    );

    return jsonResponse(500, {
      success: false,
      error:
        "Something went wrong while submitting your project. Please try again.",
    });
  }
};