# Deployment Guide

This guide covers deploying WriteSpace to [Vercel](https://vercel.com), including repository connection, build configuration, environment variables, SPA routing, custom domains, and CI/CD.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Connecting Your GitHub Repository](#connecting-your-github-repository)
- [Build Settings](#build-settings)
- [Environment Variables](#environment-variables)
- [SPA Rewrites (vercel.json)](#spa-rewrites-verceljson)
- [Custom Domain Setup](#custom-domain-setup)
- [CI/CD Notes](#cicd-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
- Your WriteSpace project pushed to a GitHub, GitLab, or Bitbucket repository
- Node.js 18+ used for local development and testing

---

## Connecting Your GitHub Repository

1. Log in to [Vercel](https://vercel.com) and click **"Add New Project"** from your dashboard.
2. Select **"Import Git Repository"** and authorize Vercel to access your GitHub account if you haven't already.
3. Find and select your WriteSpace repository from the list.
4. Vercel will automatically detect the project as a **Vite** application and pre-fill the build settings.
5. Click **"Deploy"** to trigger the first build.

### Alternative: Vercel CLI

If you prefer deploying from the command line:

```bash
# Install the Vercel CLI globally
npm install -g vercel

# Log in to your Vercel account
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Build Settings

Vercel auto-detects Vite projects and configures the correct settings. If you need to set them manually, use the following:

| Setting            | Value         |
| ------------------ | ------------- |
| **Framework Preset** | Vite          |
| **Build Command**    | `vite build`  |
| **Output Directory** | `dist`        |
| **Install Command**  | `npm install`  |
| **Node.js Version**  | 18.x or 20.x |

These values match the project's `package.json` scripts and `vite.config.js` output configuration:

```js
// vite.config.js
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### Overriding Build Settings in Vercel

1. Go to your project in the Vercel dashboard.
2. Navigate to **Settings → General**.
3. Scroll to **Build & Development Settings**.
4. Update the **Framework Preset**, **Build Command**, or **Output Directory** as needed.
5. Redeploy for changes to take effect.

---

## Environment Variables

WriteSpace is a fully client-side application with no backend services. **No environment variables are required** for deployment.

The only optional variable is:

| Variable         | Description       | Default      | Required |
| ---------------- | ----------------- | ------------ | -------- |
| `VITE_APP_TITLE` | Application title | `WriteSpace` | No       |

### Adding Environment Variables in Vercel

If you want to customize the optional variable:

1. Go to your project in the Vercel dashboard.
2. Navigate to **Settings → Environment Variables**.
3. Add the variable name (e.g., `VITE_APP_TITLE`) and its value.
4. Select which environments it applies to: **Production**, **Preview**, and/or **Development**.
5. Click **Save** and redeploy.

> **Note:** Vite exposes environment variables to the client only if they are prefixed with `VITE_`. Variables are accessed in code via `import.meta.env.VITE_*` — never `process.env`.

---

## SPA Rewrites (vercel.json)

WriteSpace uses client-side routing via React Router v6. All navigation is handled in the browser, which means the server must serve `index.html` for every route — otherwise, direct URL access or page refreshes on routes like `/blogs` or `/admin` would return a 404.

The project includes a `vercel.json` file that configures this behavior:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### How It Works

- **`source: "/(.*)"` ** — Matches every incoming request path.
- **`destination: "/index.html"`** — Serves the Vite-built `index.html` for all matched routes.
- Static assets (JS, CSS, images in `dist/assets/`) are served normally because Vercel resolves static files before applying rewrites.

### Why This Is Necessary

Without this rewrite rule:

- Visiting `https://yourdomain.com/blogs` directly would result in a **404 Not Found** because there is no `blogs/index.html` file on the server.
- React Router can only handle routing after `index.html` loads and the JavaScript bundle executes.
- The rewrite ensures the HTML shell is always delivered, allowing React Router to parse the URL and render the correct page component.

> **Important:** Do not remove `vercel.json` from the repository. If you deploy to a different platform, you will need an equivalent catch-all rewrite rule.

---

## Custom Domain Setup

### Adding a Custom Domain

1. Go to your project in the Vercel dashboard.
2. Navigate to **Settings → Domains**.
3. Enter your custom domain (e.g., `writespace.example.com`) and click **Add**.
4. Vercel will provide DNS configuration instructions.

### DNS Configuration

Depending on your domain setup, configure one of the following:

**For apex domains (e.g., `example.com`):**

| Type | Name | Value            |
| ---- | ---- | ---------------- |
| A    | @    | `76.76.21.21`    |

**For subdomains (e.g., `app.example.com`):**

| Type  | Name | Value                |
| ----- | ---- | -------------------- |
| CNAME | app  | `cname.vercel-dns.com` |

### SSL/HTTPS

Vercel automatically provisions and renews SSL certificates for all custom domains at no additional cost. HTTPS is enabled by default — no manual configuration is required.

### Verifying Domain Configuration

After updating your DNS records:

1. Return to **Settings → Domains** in the Vercel dashboard.
2. Vercel will automatically verify the DNS configuration (this may take a few minutes to propagate).
3. Once verified, your custom domain will show a green checkmark and serve your WriteSpace deployment.

---

## CI/CD Notes

### Automatic Deployments

When your GitHub repository is connected to Vercel, deployments are triggered automatically:

| Event                        | Deployment Type | URL                                      |
| ---------------------------- | --------------- | ---------------------------------------- |
| Push to `main` (or default branch) | **Production**  | `https://your-project.vercel.app`        |
| Push to any other branch     | **Preview**     | `https://your-project-<hash>.vercel.app` |
| Pull request opened/updated  | **Preview**     | Unique URL posted as a PR comment        |

### Running Tests Before Deployment

Vercel does not run tests as part of the build process by default. To ensure tests pass before deploying, you have several options:

**Option 1: GitHub Actions (Recommended)**

Create `.github/workflows/ci.yml` in your repository:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test -- --run
      - run: npm run build
```

This ensures every push and pull request runs the test suite and verifies the build succeeds before Vercel deploys.

**Option 2: Vercel Ignored Build Step**

You can configure Vercel to skip deployments when only non-code files change. In **Settings → Git → Ignored Build Step**, use:

```bash
git diff --quiet HEAD^ HEAD -- src/ index.html package.json vite.config.js
```

This skips the build if none of the listed paths changed.

### Preview Deployments

Every pull request automatically receives a unique preview URL. This is useful for:

- Reviewing UI changes before merging
- Sharing work-in-progress with team members
- Testing in a production-like environment

Preview deployments use the same build settings and environment variables (unless you configure environment-specific variables in Vercel).

### Rollbacks

If a production deployment introduces issues:

1. Go to your project in the Vercel dashboard.
2. Navigate to the **Deployments** tab.
3. Find the last known good deployment.
4. Click the three-dot menu (⋯) and select **"Promote to Production"**.

This instantly rolls back production to the selected deployment without triggering a new build.

---

## Troubleshooting

### Common Issues

**404 on page refresh or direct URL access:**
- Ensure `vercel.json` is present in the repository root with the SPA rewrite rule.
- Verify the file is committed and pushed to your repository.

**Build fails with "command not found" errors:**
- Confirm the Node.js version is set to 18.x or 20.x in Vercel project settings.
- Ensure `package.json` includes all required dependencies.

**Blank page after deployment:**
- Open the browser developer console and check for JavaScript errors.
- Verify that `index.html` references `/src/main.jsx` correctly.
- Ensure the Vite build output directory is set to `dist`.

**Environment variables not available in the app:**
- Confirm the variable name starts with `VITE_` (e.g., `VITE_APP_TITLE`).
- Redeploy after adding or changing environment variables — they are embedded at build time, not runtime.

**Styles missing or broken:**
- Ensure `tailwindcss` and `autoprefixer` are listed in `devDependencies` in `package.json`.
- Verify `postcss.config.js` and `tailwind.config.js` are present in the repository root.

### Getting Help

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [React Router — Deployment](https://reactrouter.com/en/main/guides/deploying)