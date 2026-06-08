Set GitHub repo secrets for Vercel deployment

Prerequisites
- Node 18+ (for global `fetch`).
- A GitHub Personal Access Token with `repo` scope. Set as `GITHUB_TOKEN` env var.
- The Vercel values: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

Install and run

```bash
npm install
# Example (replace the values):
GITHUB_TOKEN="ghp_..." \
VERCEL_TOKEN="vercel_..." \
VERCEL_ORG_ID="org_..." \
VERCEL_PROJECT_ID="proj_..." \
  npm run set-secrets
```

This uploads the three secrets to the `warriormind24/kapena-ni-lelo` repository by default. To target a different repo, set `REPO=owner/repo` in the environment.
