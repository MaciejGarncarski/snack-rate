import { render } from "@react-email/render";
import MagicLink from "@snack-rate/email-templates";
import { createTransport, type TransportConfig } from "nodemailer";
import React from "react";

const mailerConfig: TransportConfig = {
  host: process.env.MAIL_SMTP_HOST,
  port: Number(process.env.MAIL_SMTP_PORT),
  secure: Number(process.env.MAIL_SMTP_PORT) === 465,
  auth: {
    user: process.env.MAIL_SMTP_USER,
    pass: process.env.MAIL_SMTP_PASSWORD,
  },
};

const transport = createTransport(mailerConfig);

type VerificationJob = {
  mailTo: string;
  code: string;
};

export async function sendLoginVerificationEmail(job: VerificationJob): Promise<{ ok: boolean }> {
  try {
    const html = await render(<MagicLink email={job.mailTo} validationCode={job.code} />);

    await transport.sendMail({
      from: process.env.MAIL_SMTP_FROM_ADDRESS,
      to: job.mailTo,
      subject: `Snack Rate - Weryfikacja logowania - ${job.code}`,
      html,
    });

    console.log("EMAIL SENT: Login verification email sent to", job.mailTo);

    return { ok: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { ok: false };
  }
}
