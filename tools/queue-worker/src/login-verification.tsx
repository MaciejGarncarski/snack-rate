import { render } from "@react-email/render";
import MagicLink from "@snack-rate/email-templates";
import { createTransport, type TransportConfig } from "nodemailer";
import * as React from "react";

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
  key: string;
};

export async function sendLoginVerificationEmail(job: VerificationJob): Promise<{ ok: boolean }> {
  try {
    const html = await render(<MagicLink email={job.key} validationCode="RAN-DOM" />);
    await transport.sendMail({
      from: process.env.MAIL_SMTP_FROM_ADDRESS,
      to: job.key,
      subject: "Potwierdź logowanie do SnackRate",
      html,
    });

    console.log("EMAIL SENT: Login verification email sent to", job.key);

    return { ok: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { ok: false };
  }
}
