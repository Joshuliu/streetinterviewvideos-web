/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/pages/process', destination: '/process/', permanent: true },
      { source: '/pages/portfolio', destination: '/portfolio/', permanent: true },
      // Renamed /work/ → /portfolio/. Permanent 301s preserve any inbound SEO
      // juice and any link a client might still have from before the rename.
      { source: '/work', destination: '/portfolio/', permanent: true },
      { source: '/work/', destination: '/portfolio/', permanent: true },
      { source: '/work/:slug*', destination: '/portfolio/:slug*', permanent: true },
      { source: '/pages/reviews', destination: '/reviews/', permanent: true },
      { source: '/pages/about-us', destination: '/about/', permanent: true },
      { source: '/pages/faq', destination: '/faq/', permanent: true },
      { source: '/products/20-authentic-videos', destination: '/services/street-interview-video-ads/', permanent: true },
      { source: '/products/street-interview-style-video', destination: '/services/street-interview-video-ads/', permanent: true },
      { source: '/products/:slug*', destination: '/services/', permanent: true },
      { source: '/collections/:path*', destination: '/services/', permanent: true },
      { source: '/services/video-production-for-social-media', destination: '/services/social-media-video-production/', permanent: true },
      { source: '/services/man-on-the-street-interviews-for-brands', destination: '/services/street-interview-video-ads/', permanent: true },
      // /resources/ is no longer a public route, so legacy /blog/* gets sent to home instead.
      { source: '/blog/:path*', destination: '/', permanent: true },
      { source: '/pricing', destination: '/contact/', permanent: true },
      { source: '/pricing/', destination: '/contact/', permanent: true },
      { source: '/cart', destination: '/contact/', permanent: true },
      { source: '/checkout', destination: '/contact/', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
