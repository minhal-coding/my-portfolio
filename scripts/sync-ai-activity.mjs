import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(scriptDirectory, "../data/ai-activity.json");
const data = JSON.parse(await readFile(dataPath, "utf8"));
const originalSnapshot = JSON.stringify(data);
const repository = process.env.GROWTH_AI_REPOSITORY || data.growthAI.repository;
if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
  throw new Error("Activity source must use owner/repository format.");
}
const githubToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "minhal-portfolio-activity-sync",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {})
};

async function getJson(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

const [repositoryData, commits] = await Promise.all([
  getJson(`https://api.github.com/repos/${repository}`),
  getJson(`https://api.github.com/repos/${repository}/commits?per_page=3`)
]);

if (repositoryData.private !== false) {
  throw new Error("Activity snapshots may only publish verified public repositories.");
}

const recentUpdates = commits.map((commit) => ({
  title: commit.commit.message.split("\n")[0],
  timestamp: commit.commit.committer.date,
  url: commit.html_url,
  shortSha: commit.sha.slice(0, 7)
}));

data.growthAI.repository = repository;
data.growthAI.repositoryUrl = repositoryData.html_url;

const incomingLatestTime = new Date(recentUpdates[0]?.timestamp || 0).getTime();
const recordedLatestTime = new Date(data.growthAI.latestUpdate?.timestamp || 0).getTime();
if (recentUpdates.length && incomingLatestTime > recordedLatestTime) {
  const combinedUpdates = [...recentUpdates, ...(data.growthAI.recentUpdates || [])]
    .filter(
      (update, index, allUpdates) =>
        allUpdates.findIndex(
          (candidate) =>
            candidate.timestamp === update.timestamp && candidate.title === update.title
        ) === index
    )
    .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))
    .slice(0, 3);
  data.growthAI.latestUpdate = combinedUpdates[0];
  data.growthAI.recentUpdates = combinedUpdates;
}

const configuredTokenTotal = Number(process.env.CODEX_TOKEN_TOTAL);
if (Number.isFinite(configuredTokenTotal) && configuredTokenTotal > 0 && configuredTokenTotal !== data.tokens.total) {
  data.tokens.total = configuredTokenTotal;
  data.tokens.updatedAt = new Date().toISOString();
  data.tokens.sourceLabel = "Self-reported cross-platform AI usage estimate";
}

if (JSON.stringify(data) !== originalSnapshot) {
  data.generatedAt = new Date().toISOString();
  await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
} else {
  console.log("No substantive activity or owner-input changes; snapshot left untouched.");
}
console.log(`Checked ${recentUpdates.length} updates from ${repository}.`);
console.log(
  incomingLatestTime > recordedLatestTime
    ? "Published a newer repository update."
    : "Kept the newer curated portfolio update."
);
console.log(`Token estimate: ${data.tokens.total.toLocaleString("en-US")}.`);
