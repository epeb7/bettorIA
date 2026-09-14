import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // web/ e engine/ são projetos independentes com lockfile próprio (ver
  // README.md) — isso fixa a raiz de rastreamento aqui mesmo, pra não
  // confundir com um eventual package-lock.json na raiz do repositório.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
