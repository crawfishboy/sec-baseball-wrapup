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
let standingsCache = [];
let sortState = { key: "pct", dir: "desc" };

/* ========= INIT ========= */
document.addEventListener("DOMContentLoaded", loadSchedule);

/* ========= LOAD ========= */
async function loadSchedule() {
  try {
    const res = await fetch(BASE);
    const text = await res.text();
    allData = parseCSV(text);
    renderAll(allData);
  } catch (e) {
    console.error(e);
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
    } else cur += c;
  }
  out.push(cur);
  return out;
}

/* ========= HELPERS ========= */
function normalizeNetwork(str = "") {
  return str.toUpperCase().trim().replace(/\s+/g, "").replace("+", "PLUS");
}

function getLogo(net) {
  return LOGOS[normalizeNetwork(net)] || null;
}

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
  const sections = {
    featured: [],
    games: [],
    results: [],
    next: [],
    standings: [],
    tv: []
  };

  rows.forEach(r => {
    const t = (r[0] || "").toLowerCase();
    if (sections[t]) sections[t].push(r);
  });

  renderFeatured(sections.featured);
  renderSimple("gamesData", sections.games);
  renderSimple("resultsData", sections.results);
  renderSimple("nextData", sections.next);
  renderStandings(sections.standings);
  renderTV(sections.tv);
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
  el.innerHTML = rows.map(r => `<div class="hero-card">${r[1] || ""}</div>`).join("");
}

/* =========================================================
   STANDINGS ENGINE (FIXED + STABLE)
========================================================= */

function buildStandings(rows) {
  return rows.map(r => {
    const team = r[1];
    const w = Number(r[2]) || 0;
    const l = Number(r[3]) || 0;

    const pct = (w + l) ? w / (w + l) : 0;

    return { team, w, l, pct };
  }).filter(t => t.team);
}

function sortStandings(teams) {
  const { key, dir } = sortState;

  return [...teams].sort((a, b) => {
    let v1 = a[key];
    let v2 = b[key];

    if (key === "team") {
      v1 = a.team;
      v2 = b.team;
      return dir === "asc"
        ? v1.localeCompare(v2)
        : v2.localeCompare(v1);
    }

    return dir === "asc" ? v1 - v2 : v2 - v1;
  });
}

/* ========= GB (½ ONLY) ========= */
function calcGB(teams) {
  const leader = teams[0];
  const leaderGames = leader.w + leader.l;

  return teams.map(t => {
    const raw = (leader.pct - t.pct) * leaderGames;
    const gb = Math.round(raw * 2) / 2;
    return { ...t, gb };
  });
}

/* ========= RANKING (NO SKIPS, PROPER TIES) ========= */
function applyRanks(teams) {
  let rank = 0;
  let last = null;
  let i = 0;

  return teams.map(t => {
    i++;
    if (t.pct !== last) {
      rank = i;
      last = t.pct;
    }

    const tied = teams.filter(x => x.pct === t.pct).length > 1;

    return {
      ...t,
      rank: tied ? `T${rank}` : `${rank}`
    };
  });
}

/* ========= FORMAT GB ========= */
function formatGB(v) {
  if (v === 0) return "-";
  const whole = Math.floor(v);
  const frac = v - whole;

  if (frac === 0.5) return whole ? `${whole}½` : "½";
  return `${v.toFixed(1)}`;
}

/* ========= RENDER ========= */
function renderStandings(rows) {
  const el = document.getElementById("standingsData");
  if (!el) return;

  let teams = buildStandings(rows);
  if (!teams.length) return;

  teams = sortStandings(teams);
  teams = calcGB(teams);
  teams = applyRanks(teams);

  standingsCache = teams;

  el.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th onclick="changeSort('rank')">Rank</th>
          <th onclick="changeSort('team')">Team</th>
          <th onclick="changeSort('w')">W</th>
          <th onclick="changeSort('l')">L</th>
          <th onclick="changeSort('pct')">PCT</th>
          <th onclick="changeSort('gb')">GB</th>
        </tr>
      </thead>
      <tbody>
        ${teams.map(t => `
          <tr>
            <td>${t.rank}</td>
            <td>${t.team}</td>
            <td>${t.w}</td>
            <td>${t.l}</td>
            <td>${t.pct.toFixed(3)}</td>
            <td>${formatGB(t.gb)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

/* ========= SORT HANDLER ========= */
window.changeSort = function (key) {
  if (sortState.key === key) {
    sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
  } else {
    sortState.key = key;
    sortState.dir = "desc";
  }

  const standings = allData.filter(r => (r[0] || "").toLowerCase() === "standings");
  renderStandings(standings);
};

/* ========= TV ========= */
function renderTV(rows) {
  const el = document.getElementById("tvData");
  if (!el) return;

  el.innerHTML = "";

  const grouped = {};

  rows.forEach(r => {
    const date = r[1] || "No Date";
    grouped[date] = grouped[date] || [];
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
            ${matchup || ""}
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
