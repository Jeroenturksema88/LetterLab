/** @type {import('next').NextConfig} */

// next.config.mjs — productieconfig met security-headers, immutable cache voor statische
// assets en strikte React-modus. Geen experimentele features omdat de app op iPad Safari
// als primary target draait en stabiliteit voor compatibiliteit gaat.

const securityHeaders = [
  // Voorkom MIME-sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Voorkom embedding van de app in iframes (clickjacking-bescherming)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Beperk referrer-info bij navigatie naar externe URLs
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Schakel onnodige browser-features expliciet uit (kind-app heeft deze niet nodig)
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', '),
  },
  // HSTS — alleen HTTPS, 1 jaar (Vercel terminate't TLS sowieso)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  async headers() {
    return [
      // Security headers op alle routes
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Immutable cache voor audio (bestanden zijn content-addressed via itemId/type)
      {
        source: '/audio/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Immutable cache voor iconen
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Service worker: nooit cachen zodat updates direct doorkomen
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
