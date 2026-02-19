/**
 * Root layout — minimal pass-through.
 *
 * The actual <html> and <body> tags, fonts, and providers are defined in
 * `src/app/[locale]/layout.tsx`. This root layout exists only because
 * Next.js requires one at the `app/` level.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
