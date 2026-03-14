import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';
import db from '@/lib/db';

const getEmailConfig = async () => {
 try {
 const settings = await db.systemSetting.findMany({
 where: { category:"Communications" }
 });

 const config = {
 host: settings.find((s: any) => s.key ==="smtp_host")?.value || process.env.EMAIL_USER?.includes("gmail") ?"smtp.gmail.com" : undefined,
 port: parseInt(settings.find((s: any) => s.key ==="smtp_port")?.value ||"587"),
 user: settings.find((s: any) => s.key ==="smtp_user")?.value || process.env.EMAIL_USER,
 pass: settings.find((s: any) => s.key ==="smtp_pass")?.value || process.env.EMAIL_PASS,
 fromName: settings.find((s: any) => s.key ==="smtp_from_name")?.value ||"CDC Platform"
 };

 return config;
 } catch (error) {
 logger.error("Failed to fetch email settings from DB, using env fallbacks:", error);
 return {
 host: process.env.EMAIL_USER?.includes("gmail") ?"smtp.gmail.com" : undefined,
 port: 587,
 user: process.env.EMAIL_USER,
 pass: process.env.EMAIL_PASS,
 fromName:"CDC Platform"
 };
 }
};

const sendMailWithRetry = async (mailOptions: any, retries = 3, delay = 1000): Promise<boolean> => {
 const config = await getEmailConfig();

 if (!config.user || !config.pass) {
 logger.error('Cannot send email: SMTP credentials not configured');
 return false;
 }

 const transporter = nodemailer.createTransport({
 host: config.host,
 port: config.port,
 secure: config.port === 465, // true for 465, false for other ports
 auth: {
 user: config.user,
 pass: config.pass,
 },
 // Service optimization for known providers
 service: config.host?.includes("gmail") ?"gmail" : undefined
 });

 for (let i = 0; i < retries; i++) {
 try {
 await transporter.sendMail({
 ...mailOptions,
 from: `"${config.fromName}" <${config.user}>`
 });
 logger.info('Email sent successfully');
 return true;
 } catch (error) {
 logger.error(`Email attempt ${i + 1} failed:`, error);
 if (i < retries - 1) {
 await new Promise(res => setTimeout(res, delay));
 }
 }
 }
 return false;
};

// ─── Helpers ───────────────────────────────────────────────────
const getSiteUrl = () => {
 const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
 return url.replace(/\/$/, '');
};

const currentYear = () => new Date().getFullYear();

// ─── Base Template ─────────────────────────────────────────────
// Table-based layout for maximum Gmail / Outlook / Apple Mail compatibility.
const baseTemplate = (body: string) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <meta http-equiv="X-UA-Compatible" content="IE=edge">
 <meta name="color-scheme" content="light">
 <meta name="supported-color-schemes" content="light">
 <title>CDC Platform</title>
 <!--[if mso]>
 <noscript><xml>
 <o:OfficeDocumentSettings>
 <o:PixelsPerInch>96</o:PixelsPerInch>
 </o:OfficeDocumentSettings>
 </xml></noscript>
 <![endif]-->
 <style>
 /* Reset */
 body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
 table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
 img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
 body { margin: 0; padding: 0; width: 100% !important; }
 a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
 @media only screen and (max-width: 620px) {
 .email-container { width: 100% !important; }
 .fluid { max-width: 100% !important; height: auto !important; }
 .stack-column { display: block !important; width: 100% !important; }
 .content-padding { padding-left: 20px !important; padding-right: 20px !important; }
 }
 </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

 <!-- Preheader (hidden preview text) -->
 <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
 CDC Platform — Career Development Cell
 </div>

 <!-- Outer wrapper -->
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f2f5;">
 <tr>
 <td style="padding: 30px 10px;">
 <!-- Inner container 600px -->
 <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

 <!-- ====== HEADER ====== -->
 <tr>
 <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%); padding: 48px 40px; text-align: center;">
 <!-- Logo / Brand Icon -->
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
 <tr>
 <td style="width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 16px; text-align: center; vertical-align: middle; padding: 8px;">
 <img src="${getSiteUrl()}/cdc-logo.png" alt="CDC Logo" width="64" height="64" style="display: block; margin: auto;">
 </td>
 </tr>
 </table>
 <h1 style="margin: 20px 0 6px 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
 CDC Platform
 </h1>
 <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.85); font-weight: 400;">
 Career Development Cell
 </p>
 </td>
 </tr>

 <!-- ====== BODY ====== -->
 ${body}

 <!-- ====== FOOTER ====== -->
 <tr>
 <td style="padding: 0 40px;">
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
 <tr><td style="border-top: 1px solid #e5e7eb; height: 1px; font-size: 0;">&nbsp;</td></tr>
 </table>
 </td>
 </tr>
 <tr>
 <td style="padding: 28px 40px 36px 40px; text-align: center;">
 <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">
 Career Development Cell
 </p>
 <p style="margin: 0 0 16px 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
 GL Bajaj Institute of Technology &amp; Management<br>
 Greater Noida, Uttar Pradesh
 </p>
 <p style="margin: 0; font-size: 12px; color: #d1d5db;">
 &copy; ${currentYear()} CDC Platform. All rights reserved.<br>
 This is an automated message — please do not reply.
 </p>
 </td>
 </tr>

 </table>
 <!-- /Inner container -->
 </td>
 </tr>
 </table>
</body>
</html>
`.trim();

// ─── Welcome Email ─────────────────────────────────────────────
export const sendWelcomeEmail = async (email: string, name: string, password: string) => {
 const loginUrl = `${getSiteUrl()}/login`;

 const body = `
 <tr>
 <td class="content-padding" style="padding: 44px 40px 0 40px;">
 <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #111827;">
 Welcome aboard, ${name}! 👋
 </h2>
 <p style="margin: 0 0 28px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
 Your account has been created on the CDC Platform. Use the credentials below to log in and get started.
 </p>
 </td>
 </tr>

 <!-- Credentials Card -->
 <tr>
 <td class="content-padding" style="padding: 0 40px;">
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
 <tr>
 <td style="padding: 6px 24px 0 24px;">
 <p style="margin: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px;">
 Your Login Credentials
 </p>
 </td>
 </tr>
 <tr>
 <td style="padding: 16px 24px;">
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
 <tr>
 <td style="padding: 8px 0;">
 <span style="font-size: 13px; font-weight: 600; color: #64748b;">Email</span><br>
 <span style="font-size: 16px; font-weight: 600; color: #0f172a; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 4px 10px; border-radius: 6px; border: 1px solid #e2e8f0; display: inline-block; margin-top: 4px;">
 ${email}
 </span>
 </td>
 </tr>
 <tr>
 <td style="padding: 12px 0 4px 0;">
 <span style="font-size: 13px; font-weight: 600; color: #64748b;">Password</span><br>
 <span style="font-size: 16px; font-weight: 600; color: #0f172a; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 4px 10px; border-radius: 6px; border: 1px solid #e2e8f0; display: inline-block; margin-top: 4px;">
 ${password}
 </span>
 </td>
 </tr>
 </table>
 </td>
 </tr>
 </table>
 </td>
 </tr>

 <!-- Security Notice -->
 <tr>
 <td class="content-padding" style="padding: 20px 40px 0 40px;">
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fefce8; border: 1px solid #fde68a; border-radius: 8px;">
 <tr>
 <td style="padding: 14px 18px;">
 <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
 <strong>🔒 Security Notice:</strong> You will be required to change your password upon your first login for security purposes.
 </p>
 </td>
 </tr>
 </table>
 </td>
 </tr>

 <!-- CTA Button -->
 <tr>
 <td class="content-padding" style="padding: 28px 40px 44px 40px; text-align: center;">
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
 <tr>
 <td style="border-radius: 8px; background: linear-gradient(135deg, #4f46e5, #7c3aed);">
 <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
 Login to Your Account &rarr;
 </a>
 </td>
 </tr>
 </table>
 <p style="margin: 12px 0 0 0; font-size: 13px; color: #9ca3af;">
 Or visit: <a href="${loginUrl}" style="color: #6366f1;">${loginUrl}</a>
 </p>
 </td>
 </tr>
 `;

 return sendMailWithRetry({
 to: email,
 subject: '🎓 Welcome to CDC Platform — Your Account is Ready',
 html: baseTemplate(body)
 });
};

// ─── Admin Password Reset Email (Temporary Password) ────────────
export const sendAdminPasswordResetEmail = async (email: string, name: string, password: string) => {
 const loginUrl = `${getSiteUrl()}/login`;

 const body = `
 <tr>
 <td class="content-padding" style="padding: 44px 40px 0 40px;">
 <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #111827;">
 Password Reset Successful 🔐
 </h2>
 <p style="margin: 0 0 28px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
 An administrator has reset your password for the CDC Platform. Please use the temporary credentials below to log in.
 </p>
 </td>
 </tr>

 <!-- Credentials Card -->
 <tr>
 <td class="content-padding" style="padding: 0 40px;">
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
 <tr>
 <td style="padding: 16px 24px;">
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
 <tr>
 <td style="padding: 8px 0;">
 <span style="font-size: 13px; font-weight: 600; color: #64748b;">New Password</span><br>
 <span style="font-size: 18px; font-weight: 700; color: #000000; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 6px 14px; border-radius: 6px; border: 1px solid #cbd5e1; display: inline-block; margin-top: 8px; letter-spacing: 1px;">
 ${password}
 </span>
 </td>
 </tr>
 </table>
 </td>
 </tr>
 </table>
 </td>
 </tr>

 <!-- Security Notice -->
 <tr>
 <td class="content-padding" style="padding: 20px 40px 0 40px;">
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fefce8; border: 1px solid #fde68a; border-radius: 8px;">
 <tr>
 <td style="padding: 14px 18px;">
 <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
 <strong>⚠️ Security Reminder:</strong> You will be asked to set a permanent password immediately after logging in.
 </p>
 </td>
 </tr>
 </table>
 </td>
 </tr>

 <!-- CTA Button -->
 <tr>
 <td class="content-padding" style="padding: 28px 40px 44px 40px; text-align: center;">
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
 <tr>
 <td style="border-radius: 8px; background: linear-gradient(135deg, #4f46e5, #7c3aed);">
 <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
 Go to Login &rarr;
 </a>
 </td>
 </tr>
 </table>
 </td>
 </tr>
 `;

 return sendMailWithRetry({
 to: email,
 subject: '🔐 Temporary Password — CDC Platform',
 html: baseTemplate(body)
 });
};

// ─── Password Reset Email ──────────────────────────────────────
export const sendPasswordResetEmail = async (email: string, name: string, resetUrl: string) => {
 const body = `
 <tr>
 <td class="content-padding" style="padding: 44px 40px 0 40px;">
 <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #111827;">
 Reset Your Password
 </h2>
 <p style="margin: 0 0 4px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
 Hello <strong>${name}</strong>,
 </p>
 <p style="margin: 0 0 28px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
 We received a request to reset your password for the CDC Platform. Click the button below to set a new password.
 </p>
 </td>
 </tr>
 
 <!-- CTA Button -->
 <tr>
 <td class="content-padding" style="padding: 0 40px 44px 40px; text-align: center;">
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
 <tr>
 <td style="border-radius: 8px; background: linear-gradient(135deg, #4f46e5, #7c3aed);">
 <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.5px;">
 Reset Password &rarr;
 </a>
 </td>
 </tr>
 </table>
 <p style="margin: 24px 0 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
 If the button doesn't work, copy and paste this link into your browser:<br>
 <a href="${resetUrl}" style="color: #6366f1; text-decoration: none; word-break: break-all;">${resetUrl}</a>
 </p>
 <p style="margin: 20px 0 0 0; font-size: 13px; color: #ef4444; font-weight: 500;">
 This link will expire in 1 hour.
 </p>
 </td>
 </tr>
 
 <!-- Security Notice -->
 <tr>
 <td class="content-padding" style="padding: 0 40px 20px 40px;">
 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
 <tr>
 <td style="padding: 14px 18px;">
 <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
 If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
 </p>
 </td>
 </tr>
 </table>
 </td>
 </tr>
 `;

 return sendMailWithRetry({
 to: email,
 subject: '🔐 Reset Your Password — CDC Platform',
 html: baseTemplate(body)
 });
};
