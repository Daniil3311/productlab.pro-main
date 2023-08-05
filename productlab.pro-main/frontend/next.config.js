/** @type {import("next").NextConfig} */
module.exports = {
  // reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ]
  },
  env: {
    BASE_URL: process.env.BASE_URL,
    LOCALE_URL: process.env.LOCALE_URL
  },
  output: "standalone"
};
