/**
 * Full-page screenshots of all six AOS v3 UI pages (mock data for stable capture).
 *
 *   cd agents_os_v3/ui/scripts && npm install && npx playwright install chromium
 *   node capture_ui_review_screenshots.mjs
 *
 * Starts a temporary Python http.server from repo root unless AOSV3_SCREENSHOT_BASE is set.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");
const OUT = join(
  REPO_ROOT,
  "_COMMUNICATION",
  "team_31",
  "evidence",
  "ui_review_screenshots"
);

const PAGES = [
  { name: "01_pipeline", path: "/agents_os_v3/ui/index.html", qs: "mock=1" },
  { name: "02_history", path: "/agents_os_v3/ui/history.html", qs: "mock=1" },
  { name: "03_config", path: "/agents_os_v3/ui/config.html", qs: "mock=1" },
  { name: "04_teams", path: "/agents_os_v3/ui/teams.html", qs: "mock=1" },
  { name: "05_portfolio", path: "/agents_os_v3/ui/portfolio.html", qs: "mock=1" },
  { name: "06_flow", path: "/agents_os_v3/ui/flow.html", qs: "mock=1" },
];

const PORT = process.env.AOSV3_SCREENSHOT_PORT || "8899";

async function main() {
  let base = process.env.AOSV3_SCREENSHOT_BASE;
  let server;

  if (!base) {
    server = spawn("python3", ["-m", "http.server", PORT], {
      cwd: REPO_ROOT,
      stdio: "ignore",
      detached: false,
    });
    await new Promise((r) => setTimeout(r, 900));
    base = `http://127.0.0.1:${PORT}`;
  }

  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  const manifest = {
    generated: new Date().toISOString(),
    base,
    mock: true,
    outputs: [],
  };

  try {
    for (const p of PAGES) {
      const url = `${base}${p.path}?${p.qs}`;
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(400);
      const file = `${p.name}.png`;
      const fp = join(OUT, file);
      await page.screenshot({ path: fp, fullPage: true });
      manifest.outputs.push({ file, url });
      console.log("wrote", fp);
    }
    await writeFile(
      join(OUT, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf8"
    );
  } finally {
    await browser.close();
    if (server && !server.killed) {
      try {
        server.kill("SIGTERM");
      } catch (e) {
        /* ignore */
      }
    }
  }

  console.log("\nDone. Output:", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
