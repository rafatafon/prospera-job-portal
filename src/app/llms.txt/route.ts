const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';

export async function GET() {
  const body = `# Próspera Job Portal

> Multi-company job board for Próspera (Roatán, Honduras). Public users can browse, search, and filter published job listings from all registered companies. Companies manage their own postings; candidates can create profiles and apply.

The site is bilingual: Spanish (default, \`/es\`) and English (\`/en\`). All public pages are available under both locale prefixes.

## Main Pages

- [Home (Spanish)](${SITE_URL}/es): Landing page with featured jobs and companies
- [Home (English)](${SITE_URL}/en): English version of the landing page
- [Job Listings](${SITE_URL}/es/jobs): Browse and filter all published job openings
- [Job Listings (English)](${SITE_URL}/en/jobs): English version of the job board
- [Talent](${SITE_URL}/es/talent): Candidate talent directory

## Machine-Readable Resources

- [Sitemap](${SITE_URL}/sitemap.xml): Full index of public pages, job postings, and company profiles
- [Robots](${SITE_URL}/robots.txt): Crawling rules

## Notes for Agents

- Individual jobs live at \`/{locale}/jobs/{id}\` and company profiles at \`/{locale}/companies/{slug}\`; the sitemap lists all current URLs.
- The \`/dashboard\`, \`/admin\`, \`/auth\`, and \`/api\` areas are private and require authentication — do not crawl them.
- Job content is posted in a single language per listing; only the UI is bilingual.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
