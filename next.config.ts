import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/webhook": ["./node_modules/pdfkit/js/data/**/*"],
  },
};

export default nextConfig;