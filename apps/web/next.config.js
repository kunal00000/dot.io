/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:shortkey',
        destination: '/api/redirect/:shortkey'
      }
    ];
  }
};

module.exports = nextConfig;
