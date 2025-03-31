/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['fastdl.space'],
  },
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  },
}

module.exports = nextConfig 