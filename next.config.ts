import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
  },
  allowedDevOrigins: [
      "https://6000-firebase-studio-1753797036016.cluster-cbeiita7rbe7iuwhvjs5zww2i4.cloudworkstations.dev",
      "https://9000-firebase-studio-1753797036016.cluster-cbeiita7rbe7iuwhvjs5zww2i4.cloudworkstations.dev"
  ]
};

export default nextConfig;
