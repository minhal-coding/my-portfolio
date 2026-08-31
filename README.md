# Syed Muhammad Minhal Abbas Rizvi Portfolio

Static portfolio website focused on AI systems, product operations, SaaS implementation, workflow automation, technical execution across industries, academics, and leadership.

Live site: `https://minhal-coding.github.io/my-portfolio/`

Key pages:

- `index.html` — portfolio overview
- `growth-ai-agent.html` — current construction-opportunity product concept
- `experience.html?id=...` — data-driven experience details

## Daily AI activity snapshot

The home page and Growth AI Agent page read `data/ai-activity.json`. The
`.github/workflows/sync-ai-activity.yml` workflow refreshes recent public repository activity
once per day and commits the updated snapshot.

Optional GitHub repository variables:

- `GROWTH_AI_REPOSITORY` — public repository in `owner/repository` format. The default is
  `minhal-coding/growthagent-ai-website-v2`. Point this only at a repository whose commit
  activity is appropriate to publish.
- `CODEX_TOKEN_TOTAL` — owner-maintained cumulative token estimate as a plain integer. Codex does
  not currently expose a public lifetime-token feed to this static site, so this value is labeled
  as an estimate in the interface.

The workflow can also be run manually from the repository's Actions tab after either variable is
updated.

## GitHub Pages

This is a static site with no build step. The repository does not currently include a GitHub Actions Pages workflow.

To publish directly from the branch after committing to `main`:

1. Open the repository settings.
2. Go to **Pages**.
3. Set **Source** to **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder.
5. The site will deploy to:
   `https://minhal-coding.github.io/my-portfolio/`
