# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Backend connection

Copy `.env.example` to `.env` and point `VITE_API_BASE_URL` to the FastAPI backend.

Default local value:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_LANGUAGE_CODE=en
VITE_HTTP_TIMEOUT_MS=15000
```

## Project Case smoke verification

The Project Case public contract is fixed to:

- `currentCategory`
- `categories`
- `heroSlides`
- `cases`

Notes:

- `detailHref` is the canonical route used by the current frontend.
- `legacyDetailHref` is currently nullable because there is no verified numeric legacy detail route in the app yet.
- `categories[].projects` stays available because the current Project Case sidebar still depends on nested project lists.

Local verification flow:

1. Ensure the backend database configured in `China_BE/.env` is reachable.
2. Install the Playwright browser once:

```powershell
cd e:\uiChina_Web\China_Web_FE
npx playwright install chromium
```

3. Run the smoke test:

```powershell
cd e:\uiChina_Web\China_Web_FE
npm run test:smoke
```

What this does:

- seeds `Star Hotel` before backend startup
- starts backend on `127.0.0.1:18000`
- starts frontend on `127.0.0.1:14173`
- verifies `/project_list/1676767239059300352.html`
- verifies `/project_list/1676767239059300352.html#ctn2`
- verifies seeded category title, first case title, and canonical detail link
