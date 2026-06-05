import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : '';

const securityHeaders = [
  // Block the site from being embedded in iframes (clickjacking protection)
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME-type sniffing (browser content-type confusion attacks)
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Enforce HTTPS for 1 year, include subdomains
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // Control how much referrer info is sent with requests
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Disable browser features not used by the app
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Content-Security-Policy: Allowlist only known trusted sources
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: self + Next.js inline scripts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: self + Google Fonts + inline (Next.js requires)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts: Google Fonts CDN
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + data URIs + Supabase storage
      `img-src 'self' data: blob: https://${supabaseHost}`,
      // Connections: self + Supabase API + Supabase Realtime websocket
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
      // Frames: completely blocked
      "frame-src 'none'",
      // Objects: completely blocked
      "object-src 'none'",
      // Base URI restriction
      "base-uri 'self'",
      // Form submission only to self
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

