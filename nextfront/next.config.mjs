/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
      // Variables d'environnement accessibles côté client
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    },
    // Configuration pour les images externes si nécessaire
    images: {
      domains: [],
    },
    // Configuration pour les réécritures personnalisées
    async rewrites() {
      return [
        // Rediriger les appels d'API vers votre backend
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || ''}/api/:path*`,
        },
      ];
    },
  }

export default nextConfig;
