# Cloudflare test deployment

This deployment is isolated on the `cloudflare-test` branch, based on the `main` commit from 2026-10-29.

Cloudflare Pages builds a static allowlisted copy into `dist/`; it does not publish the repository root. The Pages Function in `functions/api/[[path]].js` forwards API calls to the existing Poketest Render service. The app's Node API still owns match, draft, and online-room state.

The Render service is currently suspended for billing. Static screens and artwork can be served from Pages, but API-backed gameplay will work only when the Render API responds. The Pages deployment does not replace or change Render.

Cloud saves continue to use the existing Supabase configuration returned by the API. Browser-only saves remain scoped to the Pages domain.
