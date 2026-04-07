/**
 * Email HTML templates for application notifications.
 *
 * @module email/templates
 */

const BRAND_COLOR = '#ff2c02';

function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
        <tr><td style="height:4px;background:${BRAND_COLOR}"></td></tr>
        <tr><td style="padding:32px 24px">
          ${content}
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #f1f5f9;text-align:center">
          <p style="margin:0;font-size:12px;color:#94a3b8">Próspera Job Portal</p>
        </td></tr>
      </table>
    </td></tr>
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

  const heading = isEs
    ? `Nueva postulacion para <strong>${params.jobTitle}</strong>`
    : `New application for <strong>${params.jobTitle}</strong>`;

  const detailsLabel = isEs ? 'Datos del candidato' : 'Applicant details';
  const nameLabel = isEs ? 'Nombre' : 'Name';
  const emailLabel = isEs ? 'Correo' : 'Email';
  const phoneLabel = isEs ? 'Telefono' : 'Phone';
  const ctaLabel = isEs ? 'Ver en el panel' : 'View in dashboard';

  const linkedinRow = params.applicantLinkedin
    ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px">LinkedIn</td><td style="padding:6px 0;font-size:14px"><a href="${params.applicantLinkedin}" style="color:${BRAND_COLOR}">${params.applicantLinkedin}</a></td></tr>`
    : '';

  return layout(`
    <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a">${heading}</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b">${detailsLabel}:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#64748b;font-size:14px;width:80px">${nameLabel}</td><td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:600">${params.applicantName}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;font-size:14px">${emailLabel}</td><td style="padding:6px 0;font-size:14px"><a href="mailto:${params.applicantEmail}" style="color:${BRAND_COLOR}">${params.applicantEmail}</a></td></tr>
      <tr><td style="padding:6px 0;color:#64748b;font-size:14px">${phoneLabel}</td><td style="padding:6px 0;font-size:14px;color:#0f172a">${params.applicantPhone}</td></tr>
      ${linkedinRow}
    </table>
    <a href="${params.dashboardUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600">${ctaLabel}</a>
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

  const heading = isEs
    ? `Postulacion recibida`
    : `Application received`;

  const message = isEs
    ? `Hola <strong>${params.applicantName}</strong>, tu postulacion para <strong>${params.jobTitle}</strong> en <strong>${params.companyName}</strong> fue recibida exitosamente. La empresa revisara tu perfil y se pondra en contacto contigo si esta interesada.`
    : `Hi <strong>${params.applicantName}</strong>, your application for <strong>${params.jobTitle}</strong> at <strong>${params.companyName}</strong> has been received. The company will review your profile and contact you if interested.`;

  const closing = isEs ? 'Buena suerte!' : 'Good luck!';

  return layout(`
    <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a">${heading}</h1>
    <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6">${message}</p>
    <p style="margin:0;font-size:14px;color:#64748b">${closing}</p>
  `);
}

export function candidateConfirmationSubject(jobTitle: string, companyName: string, locale: string): string {
  return locale === 'es'
    ? `Postulacion recibida — ${jobTitle} en ${companyName}`
    : `Application received — ${jobTitle} at ${companyName}`;
}
