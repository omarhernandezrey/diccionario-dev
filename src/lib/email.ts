import { Resend } from "resend";

// Lazy initialization to avoid build errors when RESEND_API_KEY is not set
let resend: Resend | null = null;
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const client = getResendClient();
  if (!client) {
    console.warn("[email] RESEND_API_KEY not configured, skipping email send");
    return { success: false, error: "Email not configured" };
  }

  try {
    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[email] Error sending email:", error);
      return { success: false, error: error.message };
    }

    console.log("[email] Email sent successfully:", data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[email] Exception sending email:", err);
    return { success: false, error: "Failed to send email" };
  }
}

type PasswordResetEmailOptions = {
  to: string;
  username: string;
  resetUrl: string;
  expiresInMinutes?: number;
};

export async function sendPasswordResetEmail({
  to,
  username,
  resetUrl,
  expiresInMinutes = 15,
}: PasswordResetEmailOptions) {
  const subject = "🔐 Recupera tu contraseña - Diccionario Dev";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0b0c10; color: #f8f9fb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; width: 100%; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #f8f9fb;">
                🔐 Diccionario Dev
              </h1>
            </td>
          </tr>
          
          <!-- Content Card -->
          <tr>
            <td style="background-color: #111217; border-radius: 16px; padding: 32px; border: 1px solid #2a2d33;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #f8f9fb;">
                Hola ${username},
              </h2>
              
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #9ba0a8;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta. 
                Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              
              <!-- Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4d9aff, #a783ff); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 12px; box-shadow: 0 4px 14px rgba(77, 154, 255, 0.3);">
                      Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.5; color: #9ba0a8;">
                Este enlace expirará en <strong style="color: #f8f9fb;">${expiresInMinutes} minutos</strong>.
              </p>
              
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #9ba0a8;">
                Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá igual.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 0; font-size: 11px; color: #4d9aff; word-break: break-all;">
                ${resetUrl}
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6b7280;">
                © ${new Date().getFullYear()} Diccionario Dev. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Hola ${username},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Diccionario Dev.

Haz clic en el siguiente enlace para crear una nueva contraseña:
${resetUrl}

Este enlace expirará en ${expiresInMinutes} minutos.

Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá igual.

---
Diccionario Dev
`;

  return sendEmail({ to, subject, html, text });
}
