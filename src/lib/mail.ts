import "server-only";
import nodemailer from "nodemailer";

export type Mail = { subject: string; text: string; replyTo?: string; attachments?: { filename: string; path: string }[] };

/**
 * Sends to MAIL_TO (default info@cyberpoint.az) through SMTP.
 * Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE ("1" for port 465), MAIL_FROM.
 * Returns false (and logs) when SMTP is not configured or sending fails, so the caller can still store the request.
 */
export async function sendMail(mail: Mail): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.warn("[mail] SMTP_HOST not set; message stored only:", mail.subject);
    return false;
  }
  try {
    const transport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "1",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" } : undefined,
    });
    await transport.sendMail({
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER ?? "no-reply@cyberpoint.az",
      to: process.env.MAIL_TO ?? "info@cyberpoint.az",
      subject: mail.subject,
      text: mail.text,
      replyTo: mail.replyTo,
      attachments: mail.attachments,
    });
    return true;
  } catch (e) {
    console.error("[mail] send failed:", e instanceof Error ? e.message : e);
    return false;
  }
}
