#!/usr/bin/env node
/**
 * Static checks: portfolio <th> counts vs app.js table render contracts (Team 31).
 * Run from repo root: node agents_os_v3/ui/scripts/verify_table_header_contract.mjs
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const portfolioPath = join(__dirname, "../portfolio.html");
const appPath = join(__dirname, "../app.js");

function countThBeforeTbody(html, tbodyId) {
  const needle = `id="${tbodyId}"`;
  const idx = html.indexOf(needle);
  if (idx < 0) throw new Error(`tbody ${tbodyId} not found in portfolio.html`);
  const before = html.slice(0, idx);
  const lastThead = before.lastIndexOf("<thead>");
  if (lastThead < 0) throw new Error(`no <thead> before ${tbodyId}`);
  const theadEnd = before.indexOf("</thead>", lastThead);
  if (theadEnd < 0) throw new Error(`no </thead> before ${tbodyId}`);
  const thead = before.slice(lastThead, theadEnd);
  return (thead.match(/<th\b/gi) || []).length;
}

function main() {
  const portfolio = readFileSync(portfolioPath, "utf8");
  const app = readFileSync(appPath, "utf8");

  const expected = {
    "aosv3-portfolio-active-tbody": 10,
    "aosv3-portfolio-completed-tbody": 8,
    "aosv3-portfolio-wp-tbody": 8,
    "aosv3-portfolio-ideas-tbody": 9,
  };

  for (const [id, n] of Object.entries(expected)) {
    const c = countThBeforeTbody(portfolio, id);
    if (c !== n) {
      throw new Error(
        `Portfolio table ${id}: expected ${n} <th>, got ${c}`
      );
    }
    console.log(`OK  portfolio ${id}: ${c} columns`);
  }

  if (!portfolio.includes("<th>stage_id</th>")) {
    throw new Error("WP thead: missing <th>stage_id</th>");
  }
  if (!portfolio.includes("<th>wp_id</th>")) {
    throw new Error("WP thead: missing <th>wp_id</th>");
  }
  if (!portfolio.includes("<th>program_id</th>")) {
    throw new Error("WP thead: missing <th>program_id</th>");
  }
  console.log("OK  portfolio.html WP headers (stage_id, wp_id, program_id)");

  if (!app.includes("colspan=\"8\" class=\"aosv3-wp-milestone-label\"")) {
    throw new Error("renderWp: expected colspan=8 on milestone header row");
  }
  console.log("OK  app.js renderWp colspan=8");

  if (!app.includes("esc(r.started_at || \"—\")")) {
    throw new Error("renderActive: expected ISO started_at in cell body");
  }
  if (!app.includes('class="aosv3-mono" title="')) {
    throw new Error("renderActive: expected relative hint on started_at title=");
  }
  console.log("OK  app.js renderActive started_at (ISO + title relative)");

  if (!app.includes("esc(subAt || \"—\")")) {
    throw new Error("renderIdeas: expected ISO submitted_at in cell body");
  }
  if (app.includes("formatRelativeTime(idea")) {
    throw new Error("renderIdeas: must not call formatRelativeTime(idea…)");
  }
  if (!app.includes("esc(idea.idea_id)")) {
    throw new Error("renderIdeas: expected idea_id in markup");
  }
  if (
    !app.includes('"</span></td><td>" +') ||
    !app.includes("esc(idea.title)")
  ) {
    throw new Error("renderIdeas: expected title column without idea_id tooltip");
  }
  console.log("OK  app.js renderIdeas (idea_id title on col1, submitted_at ISO)");

  if (!app.includes("findTeamById(e.actor.team_id)")) {
    throw new Error("renderRunLog: expected findTeamById for actor label");
  }
  if (!app.includes('albl ? " · " + esc(albl)')) {
    throw new Error("renderRunLog: expected team_id · label join");
  }
  console.log("OK  app.js renderRunLog actor format");

  if (app.includes("esc(w.program_id || w.wp_id)")) {
    throw new Error("renderWp: removed program_id||wp_id merge — use separate columns");
  }
  console.log("OK  app.js renderWp wp_id vs program_id split");

  console.log("\nverify_table_header_contract: all checks passed.");
}

main();
