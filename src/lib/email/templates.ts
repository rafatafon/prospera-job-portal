/**
 * Email HTML templates for application notifications.
 * Matches the Supabase Auth email style (Prospera Job Portal branding).
 *
 * @module email/templates
 */

const BRAND_COLOR = '#E8501C';

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px 40px; border-bottom:1px solid #e5e5e5;">
              <span style="font-size:20px; font-weight:700; color:#1a1a2e; letter-spacing:-0.3px;">Prospera Job Portal</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; border-top:1px solid #e5e5e5; background-color:#fafafa;">
              <p style="margin:0; font-size:12px; color:#a1a1aa; line-height:1.5;">
                &copy; Prospera Job Portal. This is an automated message &mdash; please do not reply directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface CompanyNotificationParams {
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantLinkedin: string | null;
  dashboardUrl: string;
  locale: string;
}

export function companyNotificationHtml(params: CompanyNotificationParams): string {
  const isEs = params.locale === 'es';

  const heading = isEs ? 'Nueva postulacion recibida' : 'New application received';
  const subtitle = isEs
    ? `Un candidato se postulo para <strong>${params.jobTitle}</strong>.`
    : `A candidate applied for <strong>${params.jobTitle}</strong>.`;
  const detailsLabel = isEs ? 'Datos del candidato' : 'Applicant details';
  const nameLabel = isEs ? 'Nombre' : 'Name';
  const emailLabel = isEs ? 'Correo' : 'Email';
  const phoneLabel = isEs ? 'Telefono' : 'Phone';
  const ctaLabel = isEs ? 'Ver en el panel' : 'View in dashboard';

  const linkedinRow = params.applicantLinkedin
    ? `<tr>
        <td style="padding:8px 12px; font-size:14px; color:#a1a1aa; white-space:nowrap;">LinkedIn</td>
        <td style="padding:8px 12px; font-size:14px;"><a href="${params.applicantLinkedin}" style="color:${BRAND_COLOR}; text-decoration:none;">${params.applicantLinkedin}</a></td>
      </tr>`
    : '';

  return layout(`
              <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1a1a2e; line-height:1.3;">${heading}</h1>
              <p style="margin:0 0 24px 0; font-size:15px; color:#4a4a5a; line-height:1.6;">
                ${subtitle}
              </p>
              <p style="margin:0 0 12px 0; font-size:13px; font-weight:700; color:#1a1a2e; text-transform:uppercase; letter-spacing:0.5px;">${detailsLabel}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; border:1px solid #e5e5e5; border-radius:6px; overflow:hidden;">
                <tr style="background-color:#fafafa;">
                  <td style="padding:8px 12px; font-size:14px; color:#a1a1aa; white-space:nowrap; width:80px;">${nameLabel}</td>
                  <td style="padding:8px 12px; font-size:14px; font-weight:600; color:#1a1a2e;">${params.applicantName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 12px; font-size:14px; color:#a1a1aa; white-space:nowrap;">${emailLabel}</td>
                  <td style="padding:8px 12px; font-size:14px;"><a href="mailto:${params.applicantEmail}" style="color:${BRAND_COLOR}; text-decoration:none;">${params.applicantEmail}</a></td>
                </tr>
                <tr style="background-color:#fafafa;">
                  <td style="padding:8px 12px; font-size:14px; color:#a1a1aa; white-space:nowrap;">${phoneLabel}</td>
                  <td style="padding:8px 12px; font-size:14px; color:#1a1a2e;">${params.applicantPhone}</td>
                </tr>
                ${linkedinRow}
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${BRAND_COLOR}; border-radius:6px;">
                    <a href="${params.dashboardUrl}" style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none;">${ctaLabel}</a>
                  </td>
                </tr>
              </table>
  `);
}

export function companyNotificationSubject(jobTitle: string, locale: string): string {
  return locale === 'es'
    ? `Nueva postulacion para ${jobTitle}`
    : `New application for ${jobTitle}`;
}

interface CandidateConfirmationParams {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  locale: string;
}

export function candidateConfirmationHtml(params: CandidateConfirmationParams): string {
  const isEs = params.locale === 'es';

  const heading = isEs ? 'Postulacion recibida' : 'Application received';
  const greeting = isEs ? `Hola ${params.applicantName},` : `Hi ${params.applicantName},`;
  const message = isEs
    ? `Tu postulacion para <strong>${params.jobTitle}</strong> en <strong>${params.companyName}</strong> fue recibida exitosamente.`
    : `Your application for <strong>${params.jobTitle}</strong> at <strong>${params.companyName}</strong> has been received.`;
  const nextSteps = isEs
    ? 'La empresa revisara tu perfil y se pondra en contacto contigo si esta interesada.'
    : 'The company will review your profile and contact you if interested.';
  const closing = isEs ? 'Buena suerte!' : 'Good luck!';

  return layout(`
              <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#1a1a2e; line-height:1.3;">${heading}</h1>
              <p style="margin:0 0 20px 0; font-size:15px; color:#4a4a5a; line-height:1.6;">
                ${greeting}
              </p>
              <p style="margin:0 0 20px 0; font-size:15px; color:#4a4a5a; line-height:1.6;">
                ${message}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding:16px; background-color:#f0fdf4; border-left:4px solid #22c55e; border-radius:4px;">
                    <p style="margin:0; font-size:14px; color:#4a4a5a; line-height:1.5;">
                      ${nextSteps}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0; font-size:15px; color:#4a4a5a; line-height:1.6;">
                ${closing}
              </p>
  `);
}

export function candidateConfirmationSubject(jobTitle: string, companyName: string, locale: string): string {
  return locale === 'es'
    ? `Postulacion recibida — ${jobTitle} en ${companyName}`
    : `Application received — ${jobTitle} at ${companyName}`;
}
