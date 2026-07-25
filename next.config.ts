import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El bundle del cliente fija NEXT_PUBLIC_API_URL al compilar. Playwright
  // necesita un cache separado para no reutilizar artefactos de `next dev`
  // creados con el `.env.local` (y terminar pegándole a la API real).
  distDir: process.env.BROWCHAR_E2E === "1" ? ".next-e2e" : ".next",
};

export default nextConfig;
