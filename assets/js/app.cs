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
let standingsState = [];
let sortState = { key: "pct", dir: "desc" };

/* ========= INIT ========= */
document.addEventListener("DOMContentLoaded", loadSchedule);

/* ========= LOAD ========= */
async function loadSchedule() {
  try {
    const res = await fetch(BASE);
    const text = await res.text();
    const rows = parseCSV(text);

    allData = rows;
    renderAll(rows);
  } catch (e) {
    console.error("Load error:", e);
  }
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
    } else {
      cur += c;
    }
  }

  out.push(cur);
  return out;
}

/* ========= NETWORK ========= */
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

/* =========================================================
   STANDINGS ENGINE (SORTABLE + TIES + GB + PCT)
========================================================= */

function formatGB(val) {
  if (val === 0) return "-";

  const whole = Math.floor(val);
  const frac = val - whole;

  if (frac === 0.5) return whole ? `${whole}½` : "½";
  return `${Math.round(val)}`;
}

function buildStandings(rows) {
  const teams = [];

  rows.forEach(r => {
    const team = r[1];
    const w = parseFloat(r[2]);
    const l = parseFloat(r[3]);

    if (!team) return;

    const wins = isNaN(w) ? 0 : w;
    const losses = isNaN(l) ? 0 : l;

    const pct = (wins + losses) ? wins / (wins + losses) : 0;

    teams.push({ team, w: wins, l: losses, pct });
  });

  return teams;
}

function applySort(teams) {
  return [...teams].sort((a, b) => {
    const k = sortState.key;
    const dir = sortState.dir === "asc" ? 1 : -1;

    return (a[k] - b[k]) * dir;
  });
}

function applyRanking(teams) {
  let rank = 0;
  let lastPct = null;
  let display = 0;

  return teams.map(t => {
    display++;

    if (t.pct !== lastPct) {
      rank = display;
      lastPct = t.pct;
    }

    const tied = teams.filter(x => x.pct === t.pct).length > 1;

    return {
      ...t,
      rankLabel: tied ? `T${rank}` : `${rank}`
    };
  });
}

function calcGB(teams) {
  const leader = teams[0];
  const leaderGames = leader.w + leader.l;

  return teams.map(t => {
    const raw = (leader.pct - t.pct) * leaderGames;
    const gb = Math.round(raw * 2) / 2; // ½ increments only
    return { ...t, gb };
  });
}

function renderStandings(rows) {
  const el = document.getElementById("standingsData");
  if (!el) return;

  let teams = buildStandings(rows);
  if (!teams.length) return;

  teams = applySort(teams);
  teams = calcGB(teams);
  teams = applyRanking(teams);

  standingsState = teams;

  el.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th onclick="sortStandings('rank')">Rank</th>
          <th onclick="sortStandings('team')">Team</th>
          <th onclick="sortStandings('w')">W</th>
          <th onclick="sortStandings('l')">L</th>
          <th onclick="sortStandings('pct')">PCT</th>
          <th onclick="sortStandings('gb')">GB</th>
        </tr>
      </thead>
      <tbody>
        ${teams.map(t => `
          <tr>
            <td>${t.rankLabel}</td>
            <td>${t.team}</td>
            <td>${t.w}</td>
            <td>${t.l}</td>
            <td class="pct">${t.pct.toFixed(3)}</td>
            <td>${formatGB(t.gb)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

/* ========= SORT CLICK ========= */
function sortStandings(key) {
  if (sortState.key === key) {
    sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
  } else {
    sortState.key = key;
    sortState.dir = "desc";
  }

  renderStandings(
    allData.filter(r => (r[0] || "").toLowerCase() === "standings")
  );
}

/* ========= TV ========= */
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
                ? `<div class="logo-box"><img class="net-logo" src="${logo}"></div>`
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
