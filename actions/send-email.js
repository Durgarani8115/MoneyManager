import { Resend } from "resend";

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  // simple validation
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export async function sendEmail({ to, subject, react }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const err = new Error("RESEND_API_KEY is not set in environment");
    console.error(err);
    return { success: false, error: err };
  }

  if (!isValidEmail(to)) {
    const err = new Error(`Invalid "to" email address: ${String(to)}`);
    console.error(err);
    return { success: false, error: err };
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    // result shape may vary; log for observability
    console.info("resend.emails.send result:", result);

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return { success: false, error };
  }
}