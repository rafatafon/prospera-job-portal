import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Supabase project hostname used in CSP and image patterns
const SUPABASE_HOST = 'pqmcymetprozeqrpmjud.supabase.co';
// CDN used by react-circle-flags for country flag SVGs
const FLAGS_CDN = 'react-circle-flags.pages.dev';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: SUPABASE_HOST,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Security headers (OWASP best practices)
  // ---------------------------------------------------------------------------
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control Referer header
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Disable DNS prefetching
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          // Enforce HTTPS (Vercel handles TLS termination)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js requires unsafe-inline for inline scripts; unsafe-eval for dev HMR
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Tailwind + Next.js inject inline styles
              "style-src 'self' 'unsafe-inline'",
              // Allow Supabase storage images, flag CDN, data URIs (base64 images), blobs (cropper)
              `img-src 'self' https://${SUPABASE_HOST} https://${FLAGS_CDN} data: blob:`,
              "font-src 'self'",
              // Allow Supabase API connections and flag CDN (react-circle-flags fetches SVGs)
              `connect-src 'self' https://${SUPABASE_HOST} https://${FLAGS_CDN}`,
              // Block framing entirely
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
