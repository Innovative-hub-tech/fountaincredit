// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Hard-pin the Nitro build target instead of relying only on Nitro's internal
// auto-detection. Vercel and Netlify both set their own env var during CI
// builds (VERCEL=1 / NETLIFY=true) — this just forwards that explicitly so
// the target never depends on a specific Nitro version's detection logic.
const preset = process.env.VERCEL
  ? "vercel"
  : process.env.NETLIFY
    ? "netlify"
    : undefined; // anywhere else: fall back to Nitro's own default (cloudflare-module)

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  ...(preset ? { nitro: { preset } } : {}),
});
