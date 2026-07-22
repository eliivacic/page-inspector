/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/webhook": ["./node_modules/pdfkit/js/data/**/*"],
  },
};

module.exports = nextConfig;