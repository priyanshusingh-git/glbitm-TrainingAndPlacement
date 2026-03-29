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
 fromName: settings.find((s: any) => s.key ==="smtp_from_name")?.value ||"GL Bajaj T&P Cell"
 };

 return config;
 } catch (error) {
 logger.error("Failed to fetch email settings from DB, using env fallbacks:", error);
 return {
 host: process.env.EMAIL_USER?.includes("gmail") ?"smtp.gmail.com" : undefined,
 port: 587,
 user: process.env.EMAIL_USER,
 pass: process.env.EMAIL_PASS,
 fromName:"GL Bajaj T&P Cell"
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
  const url = process.env.NEXT_PUBLIC_SITE_URL || 
              (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000');
  return url.replace(/\/$/, '');
};

const currentYear = () => new Date().getFullYear();

// ─── GL Bajaj Email Shell ─────────────────────────────────────
const brandShell = (content: string, previewText = '') => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>GL Bajaj T&amp;P Portal</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F2EAD8;font-family:Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;color:#F2EAD8;font-size:1px;">
    ${previewText}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F2EAD8;min-height:100vh;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#FDF7EF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(81,41,18,0.12);">
          <tr>
            <td style="background-color:#3A1C0B;padding:0;">
              <div style="height:4px;background:linear-gradient(90deg,#512912,#E8A020);"></div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 40px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <div style="width:44px;height:44px;background:linear-gradient(135deg,#E8A020,#C07A10);border-radius:10px;display:inline-block;text-align:center;line-height:44px;font-family:Georgia,serif;font-size:18px;font-weight:700;color:#3A1C0B;">GL</div>
                        </td>
                        <td style="padding-left:13px;vertical-align:middle;">
                          <div style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:600;line-height:1.2;">GL Bajaj Institute</div>
                          <div style="color:rgba(232,160,32,0.65);font-family:Arial,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;margin-top:2px;">Training &amp; Placement · CDC</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#E8D8C0;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12px;color:#7A5C42;line-height:1.6;">
                      GL Bajaj Institute of Technology &amp; Management<br/>
                      Plot No. 2, APJ Abdul Kalam Road, Knowledge Park 3<br/>
                      Greater Noida, Uttar Pradesh — 201306
                    </p>
                    <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#9A7A60;">
                      <a href="https://www.glbitm.org" style="color:#C07A10;text-decoration:none;">www.glbitm.org</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:tnp@glbitm.org" style="color:#C07A10;text-decoration:none;">tnp@glbitm.org</a>
                      &nbsp;·&nbsp;
                      <span>+91 99999 08292</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:16px;">
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#B09070;line-height:1.5;">
                      This email was sent to you because you have an account on the GL Bajaj T&amp;P Portal.
                      If you did not expect this email, please contact
                      <a href="mailto:tnp@glbitm.org" style="color:#C07A10;text-decoration:none;">tnp@glbitm.org</a>
                      immediately.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#3A1C0B;padding:14px 40px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:rgba(232,160,32,0.55);text-align:center;">
                © ${currentYear()} GL Bajaj Institute of Technology &amp; Management. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

function btnPrimary(text: string, url: string) {
 return `
   <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
     <tr>
       <td style="background:linear-gradient(135deg,#E8A020,#C07A10);border-radius:8px;">
         <a href="${url}" style="display:inline-block;padding:14px 28px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#3A1C0B;text-decoration:none;letter-spacing:0.3px;border-radius:8px;">
           ${text}
         </a>
       </td>
     </tr>
   </table>`
}

function btnGhost(text: string, url: string) {
 return `
   <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 0;">
     <tr>
       <td style="border:2px solid #512912;border-radius:8px;">
         <a href="${url}" style="display:inline-block;padding:12px 24px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#512912;text-decoration:none;border-radius:6px;">
           ${text}
         </a>
       </td>
     </tr>
   </table>`
}

function credBox(rows: { label: string; value: string }[]) {
 const rowsHtml = rows.map(row => `
   <tr>
     <td style="padding:10px 20px;border-bottom:1px solid #E8D8C0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#7A5C42;text-transform:uppercase;letter-spacing:0.5px;width:35%;vertical-align:top;">
       ${row.label}
     </td>
     <td style="padding:10px 20px;border-bottom:1px solid #E8D8C0;font-family:'Courier New',monospace;font-size:13px;font-weight:700;color:#3A1C0B;vertical-align:top;">
       ${row.value}
     </td>
   </tr>`).join('')

 return `
   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F2EAD8;border-radius:10px;margin:24px 0;border:1px solid #E8D8C0;overflow:hidden;">
     <tbody>${rowsHtml}</tbody>
   </table>`
}

function alertBox(text: string, type: 'warning' | 'info' | 'success' = 'warning') {
 const palette = {
 warning: { bg: '#FEF2E8', border: '#C07A10', text: '#7C2D12', icon: '⚠' },
 info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E3A5F', icon: 'ℹ' },
 success: { bg: '#F0FDF4', border: '#16A34A', text: '#14532D', icon: '✓' },
 }

 const tone = palette[type]

 return `
   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;background-color:${tone.bg};border-radius:8px;border-left:4px solid ${tone.border};overflow:hidden;">
     <tr>
       <td style="padding:14px 18px;">
         <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${tone.text};line-height:1.6;">
           <strong>${tone.icon}&nbsp;&nbsp;</strong>${text}
         </p>
       </td>
     </tr>
   </table>`
}

function emailH2(text: string) {
 return `<h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#3A1C0B;line-height:1.1;letter-spacing:-0.5px;">${text}</h2>`
}

function emailP(text: string) {
 return `<p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:#5A3A22;line-height:1.75;">${text}</p>`
}

function emailSmall(text: string) {
 return `<p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#9A7A60;line-height:1.6;">${text}</p>`
}

function statStrip(stats: { val: string; label: string }[]) {
 const columns = stats.map(stat => `
   <td style="padding:20px 16px;text-align:center;border-right:1px solid rgba(255,255,255,0.07);">
     <div style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#F5BB40;line-height:1;">${stat.val}</div>
     <div style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.5);margin-top:5px;">${stat.label}</div>
   </td>`).join('')

 return `
   <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;background-color:#3A1C0B;border-radius:12px;overflow:hidden;">
     <tr>${columns}</tr>
   </table>`
}

// ─── Welcome Email ─────────────────────────────────────────────
export const sendWelcomeEmail = async (email: string, name: string, password: string) => {
 const loginUrl = `${getSiteUrl()}/login`;

 const content = `
 ${emailH2(`Welcome, ${name.split(' ')[0]}!`)}
 ${emailP(`Your GL Bajaj T&P Portal account has been created. You now have access to placement drives, CDC training programmes, and your full academic profile.`)}

 ${credBox([
 { label: 'Email', value: email },
 { label: 'Temporary Password', value: password },
 { label: 'Your Role', value: 'Student / Portal User' },
 ])}

 ${alertBox('This temporary password expires in 48 hours. You will be asked to set your own password the moment you log in. Do not share this email with anyone.', 'warning')}

 ${btnPrimary('Sign In to Your Portal →', loginUrl)}

 ${emailSmall(`If you did not expect this email or believe your account was created in error, contact the T&P office immediately at <a href="tel:+919999908292" style="color:#C07A10;">+91 99999 08292</a> or <a href="mailto:tnp@glbitm.org" style="color:#C07A10;">tnp@glbitm.org</a>.`)}
 `;

 return sendMailWithRetry({
 to: email,
 subject: 'Your GL Bajaj T&P Portal Account is Ready',
 html: brandShell(content, `Welcome ${name}! Your GL Bajaj T&P Portal account is ready.`)
 });
};

// ─── Admin Password Reset Email (Temporary Password) ────────────
export const sendAdminPasswordResetEmail = async (email: string, name: string, password: string) => {
 const loginUrl = `${getSiteUrl()}/login`;

 const content = `
 ${emailH2('Password Reset Successful')}
 ${emailP(`Dear ${name.split(' ')[0]}, an administrator has reset your GL Bajaj T&P Portal password. Use the temporary password below to sign in.`)}

 ${credBox([
 { label: 'Login Email', value: email },
 { label: 'Temporary Password', value: password },
 ])}

 ${alertBox('This temporary password expires in 48 hours. You will be asked to set your own password the moment you log in. Do not share this email with anyone.', 'warning')}

 ${btnPrimary('Sign In to Your Portal →', loginUrl)}
 `;

 return sendMailWithRetry({
 to: email,
 subject: 'Temporary Password — GL Bajaj T&P Portal',
 html: brandShell(content, 'Your temporary GL Bajaj T&P Portal password is ready.')
 });
};

// ─── Password Reset Email ──────────────────────────────────────
export const sendPasswordResetEmail = async (email: string, name: string, otp: string) => {
 const digits = otp.split('').map(digit => `
 <span style="display:inline-block;width:44px;height:52px;background-color:#F2EAD8;border:2px solid #C07A10;border-radius:8px;margin:0 4px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#3A1C0B;text-align:center;line-height:52px;">${digit}</span>
 `).join('')

 const content = `
 ${emailH2('Reset Your Password')}
 ${emailP(`Hi ${name.split(' ')[0]}, we received a password reset request for your GL Bajaj T&P Portal account. Enter the verification code below to continue.`)}

 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;background-color:#FDF7EF;border:1px solid #E8D8C0;border-radius:12px;overflow:hidden;">
   <tr>
     <td style="padding:28px;text-align:center;">
       <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#7A5C42;letter-spacing:2px;text-transform:uppercase;">Your Verification Code</p>
       <div style="text-align:center;">${digits}</div>
       <p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#9A7A60;">
         This code expires in <strong style="color:#3A1C0B;">10 minutes</strong>
       </p>
     </td>
   </tr>
 </table>

 ${alertBox('If you did not request a password reset, ignore this email. Your password will not change. Contact the T&P office if you are concerned about account security.', 'warning')}

 ${btnPrimary('Go to Password Reset →', `${getSiteUrl()}/forgot-password`)}

 ${emailSmall('For security: this code is single-use and will expire after it is used or after 10 minutes, whichever comes first.')}
 `;

 return sendMailWithRetry({
 to: email,
 subject: `${otp} is your GL Bajaj T&P verification code`,
 html: brandShell(content, `Your verification code is ${otp}. Expires in 10 minutes.`)
 });
};

export const sendPasswordChangedEmail = async (email: string, name: string) => {
 const loginUrl = `${getSiteUrl()}/login`;

 const content = `
 ${emailH2('Password Updated')}
 ${emailP(`Hi ${name.split(' ')[0]}, your GL Bajaj T&P Portal password was successfully changed at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.`)}

 ${alertBox('If you did not make this change, contact the T&P office immediately. Your account may have been compromised.', 'warning')}

 ${btnPrimary('Sign In With New Password →', loginUrl)}
 ${btnGhost('Contact T&P Office', 'mailto:tnp@glbitm.org')}
 `;

 return sendMailWithRetry({
 to: email,
 subject: 'Your GL Bajaj T&P Portal password has been changed',
 html: brandShell(content, 'Your password was successfully updated.')
 });
};

export const sendSecurityAlertEmail = async (params: {
 ip: string
 uniqueEmails: number
 userAgent?: string
}) => {
 const content = `
 ${emailH2('Security Alert')}
 ${emailP('The GL Bajaj T&P Portal detected a credential stuffing pattern and blocked the source automatically.')}

 ${credBox([
 { label: 'Alert Type', value: 'Credential Stuffing' },
 { label: 'IP Address', value: params.ip },
 { label: 'Unique Emails', value: String(params.uniqueEmails) },
 { label: 'User Agent', value: params.userAgent || 'Unknown' },
 ])}

 ${alertBox('The IP has been blocked for 24 hours. Review audit logs for additional details and determine whether further action is required.', 'warning')}
 `;

 return sendMailWithRetry({
 to: process.env.EMAIL_USER,
 subject: 'Security Alert — Credential Stuffing Detected',
 html: brandShell(content, 'Credential stuffing was detected and blocked automatically.')
 });
};
