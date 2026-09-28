// netlify/functions/submit-project.js

// =========================================================
// PROJECT SUBMISSION — ADINKRA MEDIA
// Sends project enquiries directly to sales@adinkramedia.com
// No Supabase required.
// =========================================================

import nodemailer from "nodemailer";

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
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");

  const random = Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase();

  return `ADM-${year}${month}${day}-${random}`;
};

// =========================================================
// ESCAPE HTML
// =========================================================

const escapeHtml = (value) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
    // CHECK EMAIL CONFIGURATION
    // =====================================================

    if (!process.env.ZOHO_SMTP_USER || !process.env.ZOHO_SMTP_PASSWORD) {
      console.error(
        "[submit-project] Missing Zoho SMTP environment variables."
      );

      return jsonResponse(500, {
        success: false,
        error: "Server configuration is incomplete.",
      });
    }

    // =====================================================
    // PARSE JSON
    // =====================================================

    let body = {};

    try {
      body = JSON.parse(event.body || "{}");
    } catch (parseError) {
      console.error("[submit-project] Invalid JSON:", parseError);

      return jsonResponse(400, {
        success: false,
        error: "Invalid project submission data.",
      });
    }

    // =====================================================
    // EXTRACT FIELDS
    // =====================================================

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const company =
      typeof body.company === "string" ? body.company.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const projectName =
      typeof body.projectName === "string" ? body.projectName.trim() : "";
    const projectType =
      typeof body.projectType === "string" ? body.projectType.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const budget = typeof body.budget === "string" ? body.budget.trim() : "";
    const deadline =
      typeof body.deadline === "string" ? body.deadline.trim() : "";
    const referenceLinks =
      typeof body.referenceLinks === "string"
        ? body.referenceLinks.trim()
        : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    // =====================================================
    // SERVICES
    // =====================================================

    const services = Array.isArray(body.services)
      ? body.services
          .filter((service) => typeof service === "string")
          .map((service) => service.trim())
          .filter(Boolean)
      : [];

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
        error: "Project name is required.",
      });
    }

    if (!projectType) {
      return jsonResponse(400, {
        success: false,
        error: "Project type is required.",
      });
    }

    if (!description) {
      return jsonResponse(400, {
        success: false,
        error: "Project description is required.",
      });
    }

    if (services.length === 0) {
      return jsonResponse(400, {
        success: false,
        error: "Please select at least one service.",
      });
    }

    // =====================================================
    // EMAIL VALIDATION
    // =====================================================

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return jsonResponse(400, {
        success: false,
        error: "Please provide a valid email address.",
      });
    }

    // =====================================================
    // DEADLINE VALIDATION
    // =====================================================

    let validDeadline = "";

    if (deadline) {
      const deadlineDate = new Date(`${deadline}T00:00:00Z`);

      if (Number.isNaN(deadlineDate.getTime())) {
        return jsonResponse(400, {
          success: false,
          error: "Please provide a valid deadline.",
        });
      }

      validDeadline = deadline;
    }

    // =====================================================
    // GENERATE SUBMISSION ID
    // =====================================================

    const submissionId = generateSubmissionId();

    console.log("[submit-project] New submission:", submissionId);

    // =====================================================
    // EMAIL CONFIGURATION
    // =====================================================

    const smtpHost = process.env.ZOHO_SMTP_HOST || "smtp.zoho.com";
    const smtpPort = Number(process.env.ZOHO_SMTP_PORT || 465);

    const fromEmail = process.env.ZOHO_SMTP_USER;
    const toEmail =
      process.env.PROJECT_EMAIL_TO || "sales@adinkramedia.com";

    // =====================================================
    // EMAIL SUBJECT
    // =====================================================

    const subject = `New Project Enquiry — ${projectName} — ${submissionId}`;

    // =====================================================
    // PLAIN TEXT EMAIL
    // =====================================================

    const text = `
ADINKRA MEDIA — NEW PROJECT ENQUIRY

Submission ID:
${submissionId}

==================================================
CONTACT INFORMATION
==================================================

Name:
${name}

Company:
${company || "Not provided"}

Email:
${email}

Phone / WhatsApp:
${phone || "Not provided"}


==================================================
PROJECT INFORMATION
==================================================

Project Name:
${projectName}

Project Type:
${projectType}

Services Required:
${services.join(", ")}


==================================================
PROJECT DESCRIPTION
==================================================

${description}


==================================================
BUDGET & TIMELINE
==================================================

Budget:
${budget || "Not provided"}

Deadline:
${validDeadline || "Not provided"}


==================================================
REFERENCES
==================================================

${referenceLinks || "No reference links provided."}


==================================================
ADDITIONAL NOTES
==================================================

${notes || "No additional notes provided."}


==================================================

Submitted through:
adinkramedia.com

Submission ID:
${submissionId}
`;

    // =====================================================
    // HTML EMAIL
    // =====================================================

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(subject)}</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#222;">

  <div style="max-width:760px;margin:30px auto;background:#ffffff;border-radius:10px;overflow:hidden;">

    <div style="background:#194138;padding:28px 32px;color:#fbe5b6;">
      <h1 style="margin:0;font-size:24px;">
        New Project Enquiry
      </h1>

      <p style="margin:8px 0 0;font-size:14px;">
        Adinkra Media Pty Ltd
      </p>
    </div>

    <div style="padding:32px;">

      <div style="background:#f7f3e8;padding:16px 20px;border-radius:8px;margin-bottom:28px;">
        <strong>Submission ID:</strong>
        ${escapeHtml(submissionId)}
      </div>

      <h2 style="font-size:18px;color:#194138;">
        Contact Information
      </h2>

      <p>
        <strong>Name:</strong><br />
        ${escapeHtml(name)}
      </p>

      <p>
        <strong>Company:</strong><br />
        ${escapeHtml(company || "Not provided")}
      </p>

      <p>
        <strong>Email:</strong><br />
        <a href="mailto:${escapeHtml(email)}">
          ${escapeHtml(email)}
        </a>
      </p>

      <p>
        <strong>Phone / WhatsApp:</strong><br />
        ${escapeHtml(phone || "Not provided")}
      </p>

      <hr style="border:0;border-top:1px solid #ddd;margin:28px 0;" />

      <h2 style="font-size:18px;color:#194138;">
        Project Information
      </h2>

      <p>
        <strong>Project Name:</strong><br />
        ${escapeHtml(projectName)}
      </p>

      <p>
        <strong>Project Type:</strong><br />
        ${escapeHtml(projectType)}
      </p>

      <p>
        <strong>Services Required:</strong><br />
        ${escapeHtml(services.join(", "))}
      </p>

      <p>
        <strong>Project Description:</strong><br />
        ${escapeHtml(description).replace(/\n/g, "<br />")}
      </p>

      <hr style="border:0;border-top:1px solid #ddd;margin:28px 0;" />

      <h2 style="font-size:18px;color:#194138;">
        Budget &amp; Timeline
      </h2>

      <p>
        <strong>Budget:</strong><br />
        ${escapeHtml(budget || "Not provided")}
      </p>

      <p>
        <strong>Deadline:</strong><br />
        ${escapeHtml(validDeadline || "Not provided")}
      </p>

      <hr style="border:0;border-top:1px solid #ddd;margin:28px 0;" />

      <h2 style="font-size:18px;color:#194138;">
        References
      </h2>

      <p>
        ${escapeHtml(
          referenceLinks || "No reference links provided."
        ).replace(/\n/g, "<br />")}
      </p>

      <h2 style="font-size:18px;color:#194138;margin-top:28px;">
        Additional Notes
      </h2>

      <p>
        ${escapeHtml(
          notes || "No additional notes provided."
        ).replace(/\n/g, "<br />")}
      </p>

      <div style="margin-top:35px;padding-top:20px;border-top:1px solid #ddd;font-size:12px;color:#777;">
        Submitted through adinkramedia.com<br />
        Submission ID: ${escapeHtml(submissionId)}
      </div>

    </div>

  </div>

</body>
</html>
`;

    // =====================================================
    // CREATE SMTP TRANSPORT
    // =====================================================

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: fromEmail,
        pass: process.env.ZOHO_SMTP_PASSWORD,
      },
    });

    // =====================================================
    // SEND EMAIL
    // =====================================================

    await transporter.sendMail({
      from: `"Adinkra Media Website" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject,
      text,
      html,
    });

    // =====================================================
    // SUCCESS
    // =====================================================

    console.log("[submit-project] Email sent:", submissionId);

    return jsonResponse(200, {
      success: true,
      message: "Your project has been submitted successfully.",
      submissionId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    // =====================================================
    // UNEXPECTED ERROR
    // =====================================================

    console.error("[submit-project] Unexpected error:", error);

    return jsonResponse(500, {
      success: false,
      error:
        "Something went wrong while submitting your project. Please try again.",
    });
  }
};