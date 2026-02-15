
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
  },
  allowedDevOrigins: [
      "https://6000-firebase-studio-1753797036016.cluster-cbeiita7rbe7iuwhvjs5zww2i4.cloudworkstations.dev",
      "https://9000-firebase-studio-1753797036016.cluster-cbeiita7rbe7iuwhvjs5zww2i4.cloudworkstations.dev"
  ]
};

export default nextConfig;
