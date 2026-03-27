/**
 * GATE_3 visual matrix — 26 screenshots per Team 00 canonical response v1.1.0.
 * 12 presets × 2 phases + idle + complete (no phase param).
 *
 *   cd agents_os_v3/ui/scripts && npm install && npx playwright install chromium
 *   node capture_gate3_matrix.mjs
 *
 * Base URL: AOSV3_BASE_URL or http://127.0.0.1:8766/agents_os_v3/ui/index.html
 */
import { chromium } from "playwright";
import { mkdir, writeFile, readdir, unlink } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");
const OUT = join(
  REPO_ROOT,
  "_COMMUNICATION",
  "team_51",
  "evidence",
  "pipeline_gate3_matrix"
);

/** Order matches TEAM_00_TO_TEAM_51_GATE3_MATRIX_CLARIFICATION_RESPONSE_v1.1.0 §4.1 */
const PRESETS_WITH_PHASE = [
  "active",
  "await_feedback",
  "feedback_fallback",
  "feedback_pass",
  "feedback_fail",
  "feedback_low",
  "correction_blocking",
  "paused",
  "escalated",
  "human_gate",
  "sentinel",
  "sse_connected",
];

const PHASES = ["phase_3_1", "phase_3_2"];

const PRESETS_NO_PHASE = [
  { key: "idle", file: "gate3_idle.png" },
  { key: "complete", file: "gate3_complete.png" },
];

const BASE =
  process.env.AOSV3_BASE_URL ||
  "http://127.0.0.1:8766/agents_os_v3/ui/index.html";

function indexUrl(preset, phase) {
  const u = new URL(BASE.split("?")[0]);
  u.searchParams.set("aosv3_preset", preset);
  if (phase) u.searchParams.set("aosv3_phase", phase);
  return u.toString();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  try {
    const old = await readdir(OUT);
    for (const f of old) {
      if (f.endsWith(".png") && (f.startsWith("g3_") || f.startsWith("gate3_")))
        await unlink(join(OUT, f));
    }
  } catch (e) {
    /* ignore */
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  const manifest = {
    generated: new Date().toISOString(),
    base: BASE,
    reference:
      "_COMMUNICATION/team_00/TEAM_00_TO_TEAM_51_GATE3_MATRIX_CLARIFICATION_RESPONSE_v1.1.0.md",
    cells: [],
  };

  for (const preset of PRESETS_WITH_PHASE) {
    for (const phase of PHASES) {
      const url = indexUrl(preset, phase);
      await page.goto(url, { waitUntil: "load", timeout: 30000 });
      await new Promise(function (r) {
        setTimeout(r, 450);
      });
      const name = "gate3_" + preset + "_" + phase + ".png";
      await page.screenshot({ path: join(OUT, name), fullPage: true });
      manifest.cells.push({ file: name, preset: preset, phase: phase, url: url });
      console.log("wrote", name);
    }
  }

  for (const row of PRESETS_NO_PHASE) {
    const url = indexUrl(row.key, null);
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    await new Promise(function (r) {
      setTimeout(r, 450);
    });
    await page.screenshot({ path: join(OUT, row.file), fullPage: true });
    manifest.cells.push({
      file: row.file,
      preset: row.key,
      phase: "—",
      url: url,
    });
    console.log("wrote", row.file);
  }

  await browser.close();
  await writeFile(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("Done. Output:", OUT);
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
