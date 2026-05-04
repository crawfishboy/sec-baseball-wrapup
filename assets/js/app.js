/* =======================
   SEC BASEBALL WRAP UP
   CLEAN STABLE VERSION
======================= */

/* ========== SHEET SETUP ========== */
const BASE_ID =
  "2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM";

const SHEETS = {
  current: "969761286",
  week1: "749848866",
  week2: "761086323",
  week3: "752709309",
  week4: "476878133",
  week5: "10532734",
  week6: "1203045580",
  week7: "0",
  week8: "814890663"
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

/* ========= LOAD ========= */
async function loadSchedule(week = "current") {
  try {
    const res = await fetch(getURL(week) + "&t=" + Date.now(), {
      cache: "no-store"
    });

    const text = await res.text();
    if (!text || !text.trim()) return;

    const rows = parseCSV(text);
    renderAll(rows);

  } catch (err) {
    console.error("Load error:", err);
  }
}

/* ========= CSV ========= */
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
    if (c === '"') q = !q;
    else if (c === "," && !q) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }

  out.push(cur.trim());
  return out;
}

/* ========= NETWORK LOGOS ========= */
function normalizeNetwork(str = "") {
  return str.toUpperCase().trim().replace(/\s+/g, "").replace("+", "PLUS");
}

function getLogo(net) {
  return LOGOS[normalizeNetwork(net)] || null;
}

/* ========= TIME (DISPLAY ONLY) ========= */
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

/* ========= SAFE LOCAL TIME CONVERTER ========= */
function getLocalGameTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "";

  const isoGuess = new Date(`${dateStr} ${timeStr} GMT-0400`);
  if (isNaN(isoGuess)) return "";

  return isoGuess.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

/* ========= STATUS ========= */
function buildETDate(dateStr, timeStr) {
  try {
    const date = new Date(dateStr);
    if (isNaN(date)) return null;

    let t = timeStr.toUpperCase().trim();
    let isPM = t.includes("PM");
    let isAM = t.includes("AM");

    t = t.replace(/AM|PM/g, "").trim();
    let [h, m] = t.split(":");

    let hour = parseInt(h, 10);
    let min = parseInt(m || "0", 10);

    if (isNaN(hour)) return null;

    if (isPM && hour !== 12) hour += 12;
    if (isAM && hour === 12) hour = 0;

    date.setHours(hour, min, 0, 0);
    return date;
  } catch {
    return null;
  }
}

function getStatus(dateStr, timeStr) {
  const base = buildETDate(dateStr, timeStr);
  if (!base) return "upcoming";

  const now = new Date();
  const start = base.getTime();
  const end = start + 3 * 60 * 60 * 1000;

  if (now < start) return "upcoming";
  if (now <= end) return "live";
  return "final";
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
    const type = (r[0] || "").toLowerCase();
    if (sections[type]) sections[type].push(r);
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
    const w = parseFloat(r[2]) || 0;
    const l = parseFloat(r[3]) || 0;

    if (!team) return;

    const total = w + l;
    const pct = total ? w / total : 0;

    teams.push({ team, w, l, pct });
  });

  teams.sort((a, b) => b.pct - a.pct);

  const leader = teams[0];
  const leaderGames = leader ? leader.w + leader.l : 1;

  teams.forEach(t => {
    t.gb = Math.round(((leader.pct - t.pct) * leaderGames) * 2) / 2;
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
        <th>Rank</th><th>Team</th><th>W</th><th>L</th><th>PCT</th><th>GB</th>
      </tr>
      ${ranked
        .map(
          t => `
        <tr>
          <td>${t.rankLabel}</td>
          <td>${t.team}</td>
          <td>${t.w}</td>
          <td>${t.l}</td>
          <td>${t.pct.toFixed(3)}</td>
          <td>${formatGB(t.gb)}</td>
        </tr>`
        )
        .join("")}
    </table>
  `;
}

/* ========= TV (FINAL CLEAN VERSION) ========= */
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
      const rawTime = r[2];
      const matchup = r[4];
      const network = r[5];
      const link = r[6];

      const status = getStatus(date, rawTime);
      const logo = getLogo(network);

      const localTime = getLocalGameTime(date, rawTime);

      const a = document.createElement("a");
      a.href = link || "#";
      a.target = "_blank";
      a.style.textDecoration = "none";

      a.innerHTML = `
        <div class="tv-card ${status}">
          <div class="tv-time">
            <div class="time-main">${formatTime(rawTime)} ET</div>
            ${localTime ? `<div class="time-sub">${localTime} (local)</div>` : ""}
          </div>

          <div class="tv-matchup">
            <div class="teams">${matchup || ""}</div>
          </div>

          <div class="tv-status">
            <span class="badge ${status}">${status.toUpperCase()}</span>
          </div>

          <div class="tv-right">
            ${
              logo
                ? `<img class="net-logo" src="${logo}">`
                : `<span>${network || ""}</span>`
            }
          </div>
        </div>
      `;

      block.appendChild(a);
    });

    el.appendChild(block);
  });
}
