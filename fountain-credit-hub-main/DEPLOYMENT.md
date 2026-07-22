# Deploying Fountain Credit Hub

## Why the 404 happens
This is a **TanStack Start** app (SSR + server functions), built with **Nitro**. Nitro must
compile a *different* server bundle depending on where it runs (Cloudflare Worker, Vercel
Function, Netlify Function, plain Node, etc). TanStack Start itself is not the problem —
Nitro's build *target* is. Left ambiguous, it can default to the Cloudflare Worker format,
which Vercel/Netlify don't know how to run — every route 404s except static files.

## What changed in this version
- **`vite.config.ts`** now hard-pins the Nitro preset explicitly (`vercel` / `netlify`)
  based on the platform's own build-time env var, instead of relying only on Nitro's
  internal auto-detection. Same architecture, same routes, same server functions —
  just an explicit build target instead of an implicit one.
- **`package.json`** now declares `"engines": { "node": ">=20.9.0" }` so Vercel/Netlify
  don't build with a mismatched default Node version.
- **`vercel.json`** — `framework: null` so Vercel always defers to Nitro's Build Output
  API bundle instead of guessing.
- **`netlify.toml`** — `command = "npm run build"`, `publish = "dist"`, pinned Node
  version. This matches Nitro's own official zero-config Netlify setup.
- **`.gitignore`** — added `.env`, `.vercel`, `.netlify` so secrets and build output
  never get committed.
- **`.env.example`** — documents every variable the app needs, including
  `SUPABASE_SERVICE_ROLE_KEY`, which your original `.env` didn't have.

I rebuilt this locally with `VERCEL=1` and separately with `NETLIFY=1` set (simulating
each platform's build environment) and confirmed both produce correct, complete SSR
bundles — a Vercel Build Output API v3 bundle with all routes wired to the server
function, and a Netlify Nitro bundle in the format their build system auto-wires.

## Deploy to Vercel
1. Push this project to GitHub (confirm `.env` isn't in the commit).
2. Vercel → Add New Project → import the repo → leave build settings on defaults.
3. Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL` = `https://wajxhipxsowbkdjinmre.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_0D7kpfNAKjjesYz4nbHSAw_sl4Zaflm`
   - `VITE_SUPABASE_PROJECT_ID` = `wajxhipxsowbkdjinmre`
   - `SUPABASE_URL` = `https://wajxhipxsowbkdjinmre.supabase.co`
   - `SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_0D7kpfNAKjjesYz4nbHSAw_sl4Zaflm`
   - `SUPABASE_SERVICE_ROLE_KEY` = (from Supabase Dashboard → Project Settings → API)
4. Deploy.

## Deploy to Netlify
1. Same repo, same env vars, added in Netlify → Site settings → Environment variables.
2. Netlify → Add new site → Import from Git → it will read `netlify.toml` automatically
   (build command + publish dir are already set — don't override them in the UI).
3. Deploy.

## If a build still fails
The fixes above address the most common causes (ambiguous build target, Node version
mismatch, missing env vars). If a build still fails after this, **the actual error
message in the platform's Build Logs is required** to diagnose further — a failed
build produces a different error for basically every possible cause (dependency
resolution, out-of-memory, a genuine code error, a registry issue), and none of those
look like each other. Copy the last 20–30 lines of the log (anything starting with
`Error`, `npm ERR!`, or a stack trace) and share it for a precise fix.
