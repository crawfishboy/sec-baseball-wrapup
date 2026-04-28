/* =======================
   SEC BASEBALL WRAP UP
   STABLE GID VERSION
======================= */

/* ========== SHEET SETUP ========== */
const BASE_ID =
  "2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM";

/* == Replace these with your REAL tab GIDs ==*/
const SHEETS = {
  current: "969761286",
  week1: "749848866",
  week2: "761086323",
  week3: "752709309",
  week4: "476878133",
  week5: "10532734",
  week6: "1203045580",
   week7: "0"
};

/* ========= LOGOS ========= */
const LOGOS = {
  ESPN: "/assets/images/logo-espn.png",
  ESPN2: "/assets/images/logo-espn2.png",
  SECN: "/assets/images/logo-sec-network.webp",
  SECNPLUS: "/assets/images/logo-sec-network-plus.png"
};

/* ========= INIT ========= */
document.addEventListener("DOMContentLoaded", () => {
  loadSchedule("current");

  const select = document.getElementById("weekSelect");
  if (select) {
    select.addEventListener("change", (e) => {
      loadSchedule(e.target.value);
    });
  }
});

/* ========= BUILD URL ========= */
function getURL(week) {
  const gid = SHEETS[week] || SHEETS.current;

  return `https://docs.google.com/spreadsheets/d/e/${BASE_ID}/pub?gid=${gid}&single=true&output=csv`;
}

/* ========= LOAD DATA ========= */
async function loadSchedule(week = "current") {
  try {
    const url = getURL(week);

    const res = await fetch(url + "&t=" + Date.now(), {
      cache: "no-store"
    });

    const text = await res.text();

    if (!text || text.trim().length === 0) {
      console.error("Empty CSV response");
      return;
    }

    const rows = parseCSV(text);

    renderAll(rows);
  } catch (err) {
    console.error("Load error:", err);
  }
}

/* ========= CSV PARSER ========= */
function parseCSV(csv) {
  return csv
    .replace(/\r/g, "")
    .split("\n")
    .filter(Boolean)
    .map(splitCSV);
}

function splitCSV(line) {
  const out = [];
  let cur = "";
  let q = false;

  for (let c of line) {
    if (c === '"') {
      q = !q;
    } else if (c === "," && !q) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }

  out.push(cur.trim());
  return out;
}
/* Helpers */
/* ========= LOGO ========= */
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

/* ================= TIMEZONE SYSTEM ================= */

/* Convert ET time string + date into real Date object */
function buildETDate(dateStr, timeStr) {
  try {
    const date = new Date(dateStr);
     
    if (isNaN(date.getTime())) return null;

    let time = timeStr.toUpperCase().trim();

    let isPM = time.includes("PM");
    let isAM = time.includes("AM");

    let clean = time.replace(/AM|PM/g, "").trim();
    let [h, m] = clean.split(":");

    let hour = parseInt(h, 10);
    let min = parseInt(m || "0", 10);

    if (isNaN(hour)) return null;

    if (isPM && hour !== 12) hour += 12;
    if (isAM && hour === 12) hour = 0;

    // FORCE ET CONTEXT (important assumption)
    date.setHours(hour, min, 0, 0);

    return date;
  } catch {
    return null;
  }
}

/* Detect user timezone region (not offset guessing) */
function getUserTZLabel() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (tz === "America/New_York") return "ET";
  if (tz === "America/Chicago") return "CT";
  if (tz === "America/Denver") return "MT";
  if (tz === "America/Los_Angeles") return "PT";

  return "LOCAL";
}
/* Convert ET date → user local time string */
function getLocalTime(etDate) {
  if (!etDate) return "";

  return etDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

/* ========= STATUS ========= */
function getStatus(dateStr, timeStr) {
  try {
    if (!dateStr || !timeStr) return "upcoming";

    const base = buildETDate(dateStr, timeStr);
    if (!base) return "upcoming";

    const now = new Date();

    const start = base.getTime();
    const end = start + (3 * 60 * 60 * 1000);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "live";
    return "final";

  } catch (e) {
    return "upcoming";
  }
}

/* ========= MAIN ROUTER ========= */
function renderAll(rows) {
  const featured = [];
  const games = [];
  const results = [];
  const next = [];
  const standings = [];
  const tv = [];

  rows.forEach(r => {
    const type = (r[0] || "").toLowerCase();

    if (type === "featured") featured.push(r);
    else if (type === "games") games.push(r);
    else if (type === "results") results.push(r);
    else if (type === "next") next.push(r);
    else if (type === "standings") standings.push(r);
    else if (type === "tv") tv.push(r);
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

  el.innerHTML = rows
    .map(r => `<div class="row">${r[1] || ""}</div>`)
    .join("");
}

/* ========= FEATURED ========= */
function renderFeatured(rows) {
  const el = document.getElementById("featuredGames");
  if (!el) return;

  el.innerHTML = rows
    .map(r => `<div class="hero-card">${r[1] || ""}</div>`)
    .join("");
}

/* ========= STANDINGS ========= */
function formatGB(val) {
  if (val === 0) return "-";

  const whole = Math.floor(val);
  const isHalf = Math.abs(val % 1) === 0.5;

  if (isHalf) return whole === 0 ? "½" : `${whole}½`;
  return `${whole}`;
}

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
    const pct = total ? wins / total : 0;

    teams.push({ team, w: wins, l: losses, pct });
  });

  teams.sort((a, b) => b.pct - a.pct);

  const leader = teams[0];
  const leaderGames = leader ? leader.w + leader.l : 1;

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
          <td>${t.pct.toFixed(3)}</td>
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
   const tzLabel = getUserTZLabel();
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
      const rawTime = r[2];
const time = formatTime(rawTime);

// Convert ET-based display time → user local time (approx visual only)
const etDate = buildETDate(date, rawTime);

const localTime = etDate
  ? getLocalTime(etDate)
  : "";
      const matchup = r[4];
      const network = r[5];
      const link = r[6];

      const status = getStatus(date, rawTime);
      const logo = getLogo(network);

      const a = document.createElement("a");
      a.href = link || "#";
      a.target = "_blank";
      a.style.textDecoration = "none";

      a.innerHTML = `
        <div class="tv-card ${status}">
         <div class="tv-time">
        <div class="time-main">${time} ET</div>
       ${localTime && tzLabel !== "ET"
  ? `<div class="time-sub">${localTime} (${tzLabel})</div>`
  : ""}
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

/* ========= PRINT ========= */
function printTVSchedule() {
  const printContent = document.getElementById("tvData").innerHTML;

  const win = window.open("", "", "width=900,height=650");

  win.document.write(`
    <html>
      <head>
        <title>TV Schedule</title>
        <style>
          body { font-family: Arial; padding: 10px; }
          .tv-card { padding: 10px; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        ${printContent}
        <script>
          window.onload = () => { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `);

  win.document.close();
}
