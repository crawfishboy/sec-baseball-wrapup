const BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM/pub?output=csv";

/* ========= LOGOS ========= */
const LOGOS = {
  ESPN: "/assets/images/logo-espn.png",
  ESPN2: "/assets/images/logo-espn2.png",
  SECN: "/assets/images/logo-sec-network.webp",
  SECNPLUS: "/assets/images/logo-sec-network-plus.png"
};

/* ========= STATE ========= */
let allData = [];

/* ========= INIT ========= */
document.addEventListener("DOMContentLoaded", loadSchedule);

/* ========= LOAD ========= */
async function loadSchedule() {
  const res = await fetch(BASE);
  const text = await res.text();
  const rows = parseCSV(text);
  allData = rows;
  renderAll(rows);
}

/* ========= CSV ========= */
function parseCSV(csv) {
  return csv.split("\n").filter(Boolean).map(splitCSV);
}

function splitCSV(line) {
  const out = [];
  let cur = "";
  let q = false;

  for (let c of line) {
    if (c === '"') q = !q;
    else if (c === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }

  out.push(cur);
  return out;
}

/* ========= LOGOS ========= */
function normalizeNetwork(str = "") {
  return str.toUpperCase().trim().replace(/\s+/g, "").replace("+", "PLUS");
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
  const featured = [],
    games = [],
    results = [],
    next = [],
    standings = [],
    tv = [];

  rows.forEach(r => {
    const t = (r[0] || "").toLowerCase();

    if (t === "featured") featured.push(r);
    else if (t === "games") games.push(r);
    else if (t === "results") results.push(r);
    else if (t === "next") next.push(r);
    else if (t === "standings") standings.push(r);
    else if (t === "tv") tv.push(r);
  });

  renderFeatured(featured);
  renderSimple("gamesData", games);
  renderSimple("resultsData", results);
  renderSimple("nextData", next);
  renderStandings(standings);
  renderTV(tv);
}

/* ========= SIMPLE ========= */
function renderSimple(id, rows) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = rows.map(r => `<div class="row">${r[1] || ""}</div>`).join("");
}

/* ========= FEATURED ========= */
function renderFeatured(rows) {
  const el = document.getElementById("featuredGames");
  if (!el) return;

  el.innerHTML = rows
    .map(r => `<div class="hero-card">${r[1] || ""}</div>`)
    .join("");
}

/* ========= STANDINGS (FIXED — RESTORED LOGIC) ========= */
function renderStandings(rows) {
  const el = document.getElementById("standingsData");
  if (!el) return;

  const teams = [];

  // ---------- build clean dataset ----------
  rows.forEach(r => {
    const team = r[1];
    let w = parseFloat(r[2]);
    let l = parseFloat(r[3]);

    if (!team) return;

    if (isNaN(w)) w = 0;
    if (isNaN(l)) l = 0;

    const pct = (w + l) > 0 ? w / (w + l) : 0;

    teams.push({ team, w, l, pct });
  });

  // ---------- sort by pct ----------
  teams.sort((a, b) => b.pct - a.pct);

  // ---------- GB calc (leader-based) ----------
  const leaderPct = teams.length ? teams[0].pct : 0;

  teams.forEach(t => {
    t.gb = leaderPct - t.pct;
  });

  // ---------- ranking with TIES (NO SKIP) ----------
  let rank = 0;
  let displayIndex = 0;
  let lastPct = null;

  const ranked = teams.map(t => {
    displayIndex++;

    if (t.pct !== lastPct) {
      rank = displayIndex;
      lastPct = t.pct;
    }

    const isTie = teams.filter(x => x.pct === t.pct).length > 1;

    return {
      ...t,
      rankLabel: isTie ? `T${rank}` : `${rank}`
    };
  });

  // ---------- render ----------
  el.innerHTML = `
    <table class="table">
      <tr>
        <th>Rank</th>
        <th>Team</th>
        <th>W</th>
        <th>L</th>
        <th>PCT</th>
        <th>GB</th>
      </tr>

      ${ranked.map(t => `
        <tr>
          <td>${t.rankLabel}</td>
          <td>${t.team}</td>
          <td>${t.w}</td>
          <td>${t.l}</td>
          <td class="pct">${t.pct.toFixed(3)}</td>
          <td>${t.gb === 0 ? "-" : t.gb.toFixed(1)}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

  // sort
  teams.sort((a, b) => b.pct - a.pct);

  // rank with ties
  let rank = 0;
  let lastPct = null;
  let display = 0;

  const ranked = teams.map(t => {
    display++;
    if (t.pct !== lastPct) {
      rank = display;
      lastPct = t.pct;
    }

    return {
      ...t,
      rank: rank,
      gb: teams[0].pct - t.pct
    };
  });

  el.innerHTML = `
    <table class="table">
      <tr>
        <th>Rank</th>
        <th>Team</th>
        <th>W</th>
        <th>L</th>
        <th>PCT</th>
        <th>GB</th>
      </tr>

      ${ranked
        .map(
          t => `
        <tr>
          <td>${t.rank}</td>
          <td>${t.team}</td>
          <td>${t.w}</td>
          <td>${t.l}</td>
          <td class="pct">${(t.pct * 100).toFixed(1)}%</td>
          <td>${t.gb.toFixed(1)}</td>
        </tr>
      `
        )
        .join("")}
    </table>
  `;
}

/* ========= TV (FIXED LOGO SAFE) ========= */
function renderTV(rows) {
  const el = document.getElementById("tvData");
  if (!el) return;

  el.innerHTML = "";

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
      a.className = "tv-card-link";
      a.href = link || "#";
      a.target = "_blank";

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

    el.appendChild(block);
  });
}
