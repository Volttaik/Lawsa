import nodemailer, { Transporter } from "nodemailer";

const APP_NAME = "Sosa";
const APP_TAGLINE = "Connect, Share & Grow with your community";

let _transport: Transporter | null = null;

function getTransport(): Transporter | null {
  if (_transport) return _transport;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error("[email] GMAIL_USER or GMAIL_APP_PASSWORD env vars are missing");
    return null;
  }

  _transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    socketTimeout: 10000,
    greetingTimeout: 10000,
    connectionTimeout: 10000,
  });

  _transport.verify().then(() => {
    console.log("[email] SMTP connection OK");
  }).catch((err) => {
    console.error("[email] SMTP verify failed:", err.message);
    _transport = null;
  });

  return _transport;
}

function classifyEmailError(err: any): string {
  const msg: string = (err?.message || "").toLowerCase();
  const code: string = err?.code || "";
  const responseCode: number = err?.responseCode || 0;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return "Email service is not configured. Please contact the administrator.";
  }
  if (code === "EAUTH" || responseCode === 535 || msg.includes("invalid credentials") || msg.includes("username and password")) {
    return "Email service credentials are incorrect. Please contact the administrator.";
  }
  if (responseCode === 550 || responseCode === 553 || msg.includes("does not exist") || msg.includes("no such user") || msg.includes("invalid address") || msg.includes("bad destination")) {
    return "That email address doesn't exist or cannot receive mail. Please check and try again.";
  }
  if (responseCode === 421 || responseCode === 450 || msg.includes("daily sending quota") || msg.includes("rate limit") || msg.includes("too many")) {
    return "Email sending limit reached. Please try again later.";
  }
  if (code === "ECONNECTION" || code === "ETIMEDOUT" || code === "ESOCKET" || msg.includes("connect") || msg.includes("timeout")) {
    return "Could not connect to the email server. Please try again in a moment.";
  }
  if (responseCode === 552 || msg.includes("message too large")) {
    return "The email is too large to send.";
  }
  return "Failed to send email. Please try again later.";
}

async function send(options: nodemailer.SendMailOptions, retries = 3): Promise<void> {
  let lastError: any;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const t = getTransport();
    if (!t) {
      throw new Error("Email service is not configured. Please contact the administrator.");
    }
    try {
      const info = await t.sendMail({
        ...options,
        from: `${APP_NAME} <${process.env.GMAIL_USER}>`,
      });
      console.log(`[email] Sent "${options.subject}" to ${options.to} — ${info.messageId}`);
      return;
    } catch (err: any) {
      lastError = err;
      console.error(`[email] Attempt ${attempt}/${retries} failed:`, err.message);
      _transport = null;

      // Don't retry on permanent errors (bad address, auth failure)
      const code = err?.responseCode || 0;
      if (code === 550 || code === 553 || code === 535 || err?.code === "EAUTH") {
        break;
      }

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }

  throw new Error(classifyEmailError(lastError));
}

// ── Template helpers ──────────────────────────────────────────────────────────
function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#111;border-radius:16px;border:1px solid #222;overflow:hidden;">
        <tr><td style="padding:28px 32px 20px;text-align:center;border-bottom:1px solid #1e1e1e;">
          <p style="margin:0 0 6px;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">${APP_NAME}</p>
          <p style="margin:0;font-size:11px;color:#555;">${APP_TAGLINE}</p>
        </td></tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr><td style="padding:14px 32px 22px;border-top:1px solid #1e1e1e;text-align:center;">
          <p style="margin:0;font-size:11px;color:#444;">If you did not request this, you can safely ignore it.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr><td align="center">
      <a href="${href}" style="display:inline-block;background:#fff;color:#000;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:100px;font-size:15px;">${label}</a>
    </td></tr>
  </table>`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendVerificationCodeEmail(
  to: string,
  name: string,
  code: string
): Promise<void> {
  const html = layout(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Your verification code</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${name}, enter this code to verify your identity. It expires in <strong style="color:#fff;">30 minutes</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td align="center">
        <div style="display:inline-block;background:#1a1a1a;border:2px solid #333;border-radius:16px;padding:20px 40px;">
          <span style="font-size:40px;font-weight:900;color:#ffffff;letter-spacing:12px;font-family:monospace;">${code}</span>
        </div>
      </td></tr>
    </table>
    <p style="font-size:12px;color:#555;text-align:center;margin:0;">Do not share this code with anyone.</p>
  `);
  const text = `Hi ${name},\n\nYour ${APP_NAME} verification code is:\n\n${code}\n\nExpires in 30 minutes. Do not share it.\n\n– ${APP_NAME}`;

  await send({
    to,
    subject: `${code} — your ${APP_NAME} verification code`,
    html,
    text,
    headers: { "X-Priority": "1", "X-Mailer": APP_NAME },
  });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
  baseUrl: string
): Promise<void> {
  const link = `${baseUrl}/api/auth/verify?token=${token}`;
  const html = layout(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Verify your email address</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${name}, please confirm your email to activate your ${APP_NAME} account.</p>
    ${btn(link, "Verify Email Address")}
    <p style="font-size:12px;color:#555;text-align:center;margin:0;">Link expires in 24 hours.<br/><span style="color:#888;word-break:break-all;">${link}</span></p>
  `);
  const text = `Hi ${name},\n\nVerify your ${APP_NAME} account:\n${link}\n\nExpires in 24 hours.\n\n– ${APP_NAME}`;

  await send({
    to,
    subject: `Confirm your ${APP_NAME} email address`,
    html,
    text,
    headers: {
      "X-Priority": "3",
      "X-Mailer": APP_NAME,
      "List-Unsubscribe": `<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`,
    },
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
  baseUrl: string
): Promise<void> {
  const link = `${baseUrl}/reset-password?token=${token}`;
  const html = layout(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Reset your password</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${name}, click below to choose a new password. This link expires in 1 hour.</p>
    ${btn(link, "Reset Password")}
    <p style="font-size:12px;color:#555;text-align:center;margin:0;">If you did not request a reset, ignore this email.</p>
  `);
  const text = `Hi ${name},\n\nReset your ${APP_NAME} password:\n${link}\n\nExpires in 1 hour.\n\n– ${APP_NAME}`;

  await send({
    to,
    subject: `Reset your ${APP_NAME} password`,
    html,
    text,
    headers: {
      "X-Priority": "1",
      "X-Mailer": APP_NAME,
      "List-Unsubscribe": `<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`,
    },
  });
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  baseUrl: string
): Promise<void> {
  const html = layout(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Welcome to ${APP_NAME}!</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${name}, your account is active. Connect with fellow law students and stay updated with the community.</p>
    ${btn(`${baseUrl}/dashboard`, "Go to your feed →")}
  `);
  const text = `Hi ${name},\n\nWelcome to ${APP_NAME}!\n\nVisit your feed: ${baseUrl}/dashboard\n\n– ${APP_NAME}`;

  await send({
    to,
    subject: `Welcome to ${APP_NAME}`,
    html,
    text,
    headers: {
      "X-Priority": "3",
      "X-Mailer": APP_NAME,
      "List-Unsubscribe": `<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`,
    },
  });
}
