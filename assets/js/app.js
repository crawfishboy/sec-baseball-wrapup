/* ===============================
   SEC BASEBALL WRAP - CLEAN FINAL JS
   FIXED: standings, pct, safety, logos
   =============================== */

const BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM/pub?output=csv";

/* ========= NETWORK LOGOS ========= */
const LOGOS = {
  ESPN: "/assets/images/logo-espn.png",
  ESPN2: "/assets/images/logo-espn2.png",
  SECN: "/assets/images/logo-sec-network.webp",
  SECNPLUS: "/assets/images/logo-sec-network-plus.png"
};

/* ========= INIT ========= */
document.addEventListener("DOMContentLoaded", loadSchedule);

/* ========= LOAD ========= */
async function loadSchedule() {
  try {
    const res = await fetch(BASE);
    const text = await res.text();
    const rows = parseCSV(text);
    renderAll(rows);
  } catch (e) {
    console.error("Load error:", e);
  }
}

/* ========= CSV ========= */
function parseCSV(csv) {
  return csv
    .split("\n")
    .filter(Boolean)
    .map(line => {
      const out = [];
      let cur = "";
      let q = false;

      for (let c of line) {
        if (c === '"') q = !q;
        else if (c === "," && !q) {
          out.push(cur);
          cur = "";
        } else {
          cur += c;
        }
      }

      out.push(cur);
      return out;
    });
}

/* ========= LOGO ========= */
function normalizeNetwork(n = "") {
  return n.toUpperCase().replace(/\s+/g, "").replace("+", "PLUS");
}

function getLogo(net) {
  return LOGOS[normalizeNetwork(net)] || null;
}

/* ========= TIME ========= */
function formatTime(t) {
  if (!t) return "";
  if (t.includes("AM") || t.includes("PM")) return t;

  let [h, m] = t.split(":");
  let hour = parseInt(h, 10);
  const min = m || "00";
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;
  return `${hour}:${min} ${ampm}`;
}

/* ========= ROUTER ========= */
function renderAll(rows) {
  const featured = [];
  const games = [];
  const results = [];
  const next = [];
  const standings = [];
  const tv = [];

  rows.forEach(r => {
    const type = (r[0] || "").trim().toLowerCase();

    if (type === "featured") featured.push(r);
    else if (type === "games") games.push(r);
    else if (type === "results") results.push(r);
    else if (type === "next") next.push(r);
    else if (type === "standings") standings.push(r);
    else if (type === "tv") tv.push(r);
  });

  renderFeatured(featured);
  renderGames(games);
  renderResults(results);
  renderNext(next);
  renderStandings(standings);
  renderTV(tv);
}

/* ========= FEATURED ========= */
function renderFeatured(rows) {
  const el = document.getElementById("featuredGames");
  if (!el) return;

  el.innerHTML = rows.map(r => `
    <div class="hero-card">
      <div style="font-weight:700;font-size:13px;">
        ${r[1] || ""}
      </div>
    </div>
  `).join("");
}

/* ========= SIMPLE SECTIONS ========= */
function renderGames(rows) {
  const el = document.getElementById("gamesData");
  if (!el) return;
  el.innerHTML = rows.map(r => `<div class="row">${r[1] || ""}</div>`).join("");
}

function renderResults(rows) {
  const el = document.getElementById("resultsData");
  if (!el) return;
  el.innerHTML = rows.map(r => `<div class="row">${r[1] || ""}</div>`).join("");
}

function renderNext(rows) {
  const el = document.getElementById("nextData");
  if (!el) return;
  el.innerHTML = rows.map(r => `<div class="row">${r[1] || ""}</div>`).join("");
}

/* ========= STANDINGS (FIXED - USES YOUR .pct COLUMN) ========= */
function renderStandings(rows = []) {
  const el = document.getElementById("standingsData");
  if (!el) return;

  const teams = rows
    .filter(r => r[1])
    .map(r => ({
      team: r[1],
      w: parseFloat(r[2]) || 0,
      l: parseFloat(r[3]) || 0,
      pct: parseFloat(r[4]) || 0   // 👈 YOUR SHEET VALUE
    }));

  teams.sort((a, b) => b.pct - a.pct);

  let lastPct = null;
  let rank = 0;
  let display = 0;

  const ranked = teams.map(t => {
    display++;

    if (t.pct !== lastPct) {
      rank = display;
      lastPct = t.pct;
    }

    return { ...t, rank };
  });

  el.innerHTML = `
    <table class="table">
      <tr>
        <th>Rank</th>
        <th>Team</th>
        <th>W</th>
        <th>L</th>
        <th>PCT</th>
      </tr>

      ${ranked.map(t => `
        <tr>
          <td>${t.rank}</td>
          <td>${t.team}</td>
          <td>${t.w}</td>
          <td>${t.l}</td>
          <td class="pct">${(t.pct * 100).toFixed(1)}%</td>
        </tr>
      `).join("")}
    </table>
  `;
}

/* ========= TV ========= */
function renderTV(rows) {
  const container = document.getElementById("tvData");
  if (!container) return;

  container.innerHTML = "";

  const grouped = {};

  rows.forEach(r => {
    const date = r[1] || "No Date";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(r);
  });

  Object.keys(grouped).forEach(date => {
    const block = document.createElement("div");
    block.innerHTML = `<div class="tv-day">${date}</div>`;

    grouped[date].forEach(r => {
      const time = formatTime(r[2]);
      const matchup = r[4];
      const network = r[5];
      const link = r[6];

      const logo = getLogo(network);

      const a = document.createElement("a");
      a.href = link || "#";
      a.target = "_blank";
      a.className = "tv-card-link";

      a.innerHTML = `
        <div class="tv-card">

          <div class="tv-time">
            <div class="time-main">${time}</div>
            <div class="time-sub">${date}</div>
          </div>

          <div class="tv-matchup">
            <div class="teams">${matchup || ""}</div>
          </div>

          <div class="tv-right">
            ${
              logo
                ? `<div class="logo-box"><img class="net-logo" src="${logo}" /></div>`
                : `<span class="network-fallback">${network || ""}</span>`
            }
          </div>

        </div>
      `;

      block.appendChild(a);
    });

    container.appendChild(block);
  });
}
