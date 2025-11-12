import type { NextConfig } from "next";

const remotePatterns: {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
}[] = [];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (apiBaseUrl) {
  try {
    const url = new URL(apiBaseUrl);
    const protocol = url.protocol.replace(":", "") as "http" | "https";
    remotePatterns.push({
      protocol,
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: "/**",
    });
  } catch (error) {
    console.warn("Invalid NEXT_PUBLIC_API_BASE_URL, falling back to defaults.", error);
  }
}

if (remotePatterns.length === 0) {
  remotePatterns.push({
    protocol: "http",
    hostname: "localhost",
    port: "8000",
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
