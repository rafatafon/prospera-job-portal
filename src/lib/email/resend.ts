/**
 * Email sending via Resend.
 *
 * Sends application notification emails to companies and confirmation
 * emails to candidates. Fails gracefully — email errors never block
 * the application submission flow.
 *
 * @module email/resend
 */

import 'server-only';

import { Resend } from 'resend';
import {
  companyNotificationHtml,
  companyNotificationSubject,
  candidateConfirmationHtml,
  candidateConfirmationSubject,
} from '@/lib/email/templates';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Próspera Jobs <noreply@resend.dev>';

function getClient(): Resend | null {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not configured — skipping email');
    return null;
  }
  return new Resend(RESEND_API_KEY);
}

interface SendCompanyNotificationParams {
  companyEmails: string[];
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantLinkedin: string | null;
  dashboardUrl: string;
  locale: string;
}

export async function sendCompanyNotification(params: SendCompanyNotificationParams): Promise<void> {
  const resend = getClient();
  if (!resend || params.companyEmails.length === 0) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.companyEmails,
      subject: companyNotificationSubject(params.jobTitle, params.locale),
      html: companyNotificationHtml(params),
    });
  } catch (error) {
    console.error('[email] Failed to send company notification:', error);
  }
}

interface SendCandidateConfirmationParams {
  candidateEmail: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  locale: string;
}

export async function sendCandidateConfirmation(params: SendCandidateConfirmationParams): Promise<void> {
  const resend = getClient();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.candidateEmail,
      subject: candidateConfirmationSubject(params.jobTitle, params.companyName, params.locale),
      html: candidateConfirmationHtml(params),
    });
  } catch (error) {
    console.error('[email] Failed to send candidate confirmation:', error);
  }
}
