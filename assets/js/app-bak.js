const BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM/pub?output=csv";

/* ========= LOGOS ========= */
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

/* ========= STATUS ========= */
function getStatus(dateStr, timeStr) {
  try {
    const gameTime = new Date(`${dateStr} ${timeStr} ET`);
    const now = new Date();

    const start = gameTime.getTime();
    const end = start + (3 * 60 * 60 * 1000); // 3-hour window

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "live";
    return "final";
  } catch {
    return "upcoming";
  }
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

  el.innerHTML = rows.map(r =>
    `<div class="hero-card">${r[1] || ""}</div>`
  ).join("");
}

/* ========= GB FORMAT ========= */
function formatGB(val) {
  if (val === 0) return "-";

  const whole = Math.floor(val);
  const isHalf = Math.abs(val % 1) === 0.5;

  if (isHalf) return whole === 0 ? "½" : `${whole}½`;
  return `${whole}`;
}

/* ========= STANDINGS ========= */
function renderStandings(rows) {
  const el = document.getElementById("standingsData");
  if (!el) return;

  const teams = [];

  rows.forEach(r => {
    const team = r[1];
    const w = parseFloat(r[2]);
    const l = parseFloat(r[3]);

    if (!team) return;

    const wins = isNaN(w) ? 0 : w;
    const losses = isNaN(l) ? 0 : l;

    const total = wins + losses;
    const pct = total > 0 ? wins / total : 0;

    teams.push({ team, w: wins, l: losses, pct });
  });

  teams.sort((a, b) => b.pct - a.pct);

  const leader = teams[0];
  const leaderGames = leader.w + leader.l;

  teams.forEach(t => {
    const gbRaw = (leader.pct - t.pct) * leaderGames;
    t.gb = Math.round(gbRaw * 2) / 2;
  });

  let rank = 0;
  let lastPct = -1;

  const ranked = teams.map(t => {
    if (Math.abs(t.pct - lastPct) > 0.000001) {
      rank++;
      lastPct = t.pct;
    }

    const tied = teams.filter(x => x.pct === t.pct).length > 1;

    return {
      ...t,
      rankLabel: tied ? `T${rank}` : `${rank}`
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

      ${ranked.map(t => `
        <tr>
          <td>${t.rankLabel}</td>
          <td>${t.team}</td>
          <td>${t.w}</td>
          <td>${t.l}</td>
          <td class="pct">${t.pct.toFixed(3)}</td>
          <td>${formatGB(t.gb)}</td>
        </tr>
      `).join("")}
    </table>
  `;
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

      const status = getStatus(date, time);
      const logo = getLogo(network);

      const a = document.createElement("a");
      a.className = "tv-card-link";
      a.href = link || "#";
      a.target = "_blank";

      a.innerHTML = `
        <div class="tv-card ${status}">

          <div class="tv-time">
            <div class="time-main">${time} ET</div>
            <div class="time-sub">${date}</div>
          </div>

          <div class="tv-matchup">
            <div class="teams">${matchup || ""}</div>
          </div>

          <div class="tv-status">
           <span class="badge ${status}">
              ${status.toUpperCase()}
            </span>
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

/* ======= PRINT FUNCTION ===== */
function printTVSchedule() {
  const printContent = document.getElementById("tvData").innerHTML;

  const win = window.open("", "", "width=900,height=650");

  win.document.write(`
    <html>
      <head>
        <title>TV Schedule</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 10px;
          }

          .tv-card {
            display: grid;
            grid-template-columns: 110px 1fr 120px 90px;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
          }

          .tv-status,
          .tv-right {
            text-align: center;
          }

          .badge {
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
          }

          .badge.live { background: #dc2626; color: #fff; }
          .badge.upcoming { background: #2563eb; color: #fff; }
          .badge.final { background: #6b7280; color: #fff; }
        </style>
      </head>

      <body>
        ${printContent}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `);

  win.document.close();
}
