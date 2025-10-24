import nodemailer from "nodemailer";
import { Resend } from "resend";

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type SendMailInput = {
  to: string;
  subject: string;
  text?: string;
  html: string;
  attachments?: MailAttachment[];
  tags?: Record<string, string>;
};

let transporterPromise: Promise<nodemailer.Transporter> | undefined;
let resendClient: Resend | undefined;

const fromAddress = process.env.MAIL_FROM ?? "Katana Forge <no-reply@kfor.ge>";

export const sendMail = async (input: SendMailInput) => {
  if (isResendEnabled()) {
    const resend = getResend();
    await resend.emails.send({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content.toString("base64"),
        path: undefined,
        contentType: attachment.contentType,
      })),
      headers: mapTagsToHeaders(input.tags),
    });
    return;
  }

  const transporter = await getTransporter();
  const mailAttachments =
    input.attachments?.map((item) => ({
      filename: item.filename,
      content: item.content,
      contentType: item.contentType,
    })) ?? [];

  await transporter.sendMail({
    from: fromAddress,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: mailAttachments,
    headers: mapTagsToHeaders(input.tags),
  });
};

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
};

const createTransporter = async () => {
  const host = process.env.SMTP_HOST ?? "localhost";
  const port = Number.parseInt(process.env.SMTP_PORT ?? "1025", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
};

const isResendEnabled = () =>
  process.env.FEATURE_RESEND === "true" && Boolean(process.env.RESEND_API_KEY);

const getResend = () => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is required when FEATURE_RESEND is true");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

const mapTagsToHeaders = (tags?: Record<string, string>) => {
  if (!tags) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(tags).map(([key, value]) => [
      `X-KatanaForge-${key}`,
      value,
    ]),
  );
};
