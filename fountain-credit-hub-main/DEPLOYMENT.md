# Deploying Fountain Credit Hub to Vercel

## What was wrong
This is a **TanStack Start** app (SSR + server functions), built with **Nitro**. Nitro must
compile a *different* server output depending on where it's hosted (Cloudflare Worker,
Vercel Function, Netlify Function, plain Node, etc). Left with no explicit target, it was
defaulting to the **Cloudflare Worker** format — which Vercel/Netlify can't run, so every
route 404'd except static assets.

## What was fixed
- Verified (by building locally with `VERCEL=1`) that Nitro correctly auto-generates a
  **Vercel Build Output API v3** bundle (`.vercel/output/`) — this is the format Vercel
  runs directly, with the server function wired up to handle every route.
- Added `vercel.json` (`framework: null`) so Vercel never falls back to generic
  Vite/static-site handling and always defers to that Build Output API bundle.
- Added `.env`, `.vercel`, `.netlify` to `.gitignore` — your real Supabase keys were not
  excluded before, so they'd have been pushed to GitHub.
- Added `.env.example` documenting every variable the app actually needs.

## Deploy to Vercel
1. Push this project to a GitHub repo (make sure `.env` is **not** in the commit — check with `git status`).
2. On [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Leave Framework Preset as **Other** (or whatever it defaults to — `vercel.json` overrides it anyway). Leave build/output settings on their defaults.
4. Under **Environment Variables**, add all six from `.env.example` with your real values:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` ← get this from **Supabase Dashboard → Project Settings → API → service_role key**. This one is new/easy to miss since Lovable Cloud used to inject it for you.
5. Click **Deploy**.

That's it — no `vercel.json` output overrides, no manual routing rules needed. Nitro + the Build Output API handles SSR routing, static assets, and caching automatically.

## A note on Netlify
Netlify support for this exact combo (TanStack Start + Nitro v3-beta) is much less mature.
A local `npm run build` with `NETLIFY=1` set produces an internal artifact
(`.netlify/functions-internal/`) meant to be finished off by Netlify's own build image —
but no `_redirects` file was generated pointing routes to the function, which is the same
404 symptom you saw. Since Nitro v3 is still beta, Netlify's zero-config detection for it
isn't reliable yet. **Vercel is the verified, recommended path for this app right now.**
If you specifically need Netlify, that's a separate investigation — happy to dig into it
if Vercel doesn't work for your use case.
