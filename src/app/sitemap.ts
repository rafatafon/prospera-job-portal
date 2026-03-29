import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const locales = ['es', 'en'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static pages
  const staticPages = ['', '/jobs', '/talent'];
  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '' ? 'daily' as const : 'hourly' as const,
      priority: path === '' ? 1.0 : 0.8,
    })),
  );

  // Published jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, updated_at')
    .eq('status', 'published');

  const jobEntries: MetadataRoute.Sitemap = (jobs ?? []).flatMap((job) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/jobs/${job.id}`,
      lastModified: new Date(job.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  );

  // Active companies
  const { data: companies } = await supabase
    .from('companies')
    .select('slug, updated_at')
    .eq('is_active', true);

  const companyEntries: MetadataRoute.Sitemap = (companies ?? []).flatMap((company) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/companies/${company.slug}`,
      lastModified: new Date(company.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  );

  return [...staticEntries, ...jobEntries, ...companyEntries];
}
