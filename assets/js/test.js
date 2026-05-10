document.addEventListener("DOMContentLoaded", () => {
  loadSchedule("current");

  const select = document.getElementById("weekSelect");
  if (select) {
    select.addEventListener("change", (e) => {
      loadSchedule(e.target.value);
    });
  }
});

/* ======================= SHEET SETUP ======================= */
const BASE_ID =
  "2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM";

const SHEETS = {
  current: "814890663",
  week1: "749848866",
  week2: "761086323",
  week3: "752709309",
  week4: "476878133",
  week5: "10532734",
  week6: "1203045580",
  week7: "0",
  week8: "969761286"
};

/* ======================= LOGOS ======================= */
const LOGOS = {
  ESPN: "/assets/images/logo-espn.png",
  ESPN2: "/assets/images/logo-espn2.png",
  SECN: "/assets/images/logo-sec-network.webp",
  SECNPLUS: "/assets/images/logo-sec-network-plus.png"
};

/* ======================= LOAD ======================= */
function getURL(week) {
  const gid = SHEETS[week] || SHEETS.current;
  return `https://docs.google.com/spreadsheets/d/e/${BASE_ID}/pub?gid=${gid}&single=true&output=csv`;
}

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

/* ======================= CSV ======================= */
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

/* ======================= SAFE LINK HANDLER ======================= */
function safeLink(url) {
  if (!url) return null;
  const clean = url.trim();
  if (clean.startsWith("http")) return clean;
  return null;
}

/* ======================= RENDER ROUTER ======================= */
function renderAll(rows) {
  const games = rows.filter(r => (r[0] || "").toLowerCase() === "games");
  const tv = rows.filter(r => (r[0] || "").toLowerCase() === "tv");
  const results = rows.filter(r => (r[0] || "").toLowerCase() === "results");
  const next = rows.filter(r => (r[0] || "").toLowerCase() === "next");
  const standings = rows.filter(r => (r[0] || "").toLowerCase() === "standings");

  renderFeaturedGames(games);
  renderSimple("gamesData", games);
  renderSimple("resultsData", results);
  renderSimple("nextData", next);
  renderStandings(standings);
  renderTV(tv);
}

/* ======================= SIMPLE ======================= */
function renderSimple(id, rows) {
  const el = document.getElementById(id);
  if (!el) return;

  el.innerHTML = rows.map(r => `<div class="row">${r[1] || ""}</div>`).join("");
}

/* ======================= FEATURED ======================= */
function renderFeaturedGames(rows) {
  const el = document.getElementById("featuredGames");
  if (!el) return;

  el.innerHTML = "";

  rows.slice(0, 8).forEach(r => {
    const card = document.createElement("div");
    card.className = "hero-card";

    card.innerHTML = `
      <div style="font-size:11px; opacity:0.75;">${r[1] || ""}</div>
      <div style="font-size:14px; font-weight:700;">${r[4] || ""}</div>
      <div style="font-size:11px; margin-top:6px; color:#9fb3cc;">
        ${r[2] || ""} ET ${r[5] ? "• " + r[5] : ""}
      </div>
    `;

    el.appendChild(card);
  });
}

/* ======================= STANDINGS (UNCHANGED CORE) ======================= */
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

  el.innerHTML = `
    <table class="table">
      <tr><th>Rank</th><th>Team</th><th>W</th><th>L</th><th>PCT</th><th>GB</th></tr>
      ${teams.map(t => `
        <tr>
          <td>${t.team}</td>
          <td>${t.w}</td>
          <td>${t.l}</td>
          <td>${t.pct.toFixed(3)}</td>
          <td>${t.gb}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

/* ======================= TV (FULLY CLICK SAFE) ======================= */
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
    const day = document.createElement("div");
    day.className = "tv-day";
    day.textContent = date;
    el.appendChild(day);

    grouped[date].forEach(r => {

      const rawTime = r[2];
      const matchup = r[4];
      const network = r[5];
      const link = safeLink(r[6]);

      const card = document.createElement("div");
      card.className = "tv-card";

      card.innerHTML = `
        <div class="tv-time">
          <div class="time-main">${rawTime || ""} ET</div>
        </div>

        <div class="tv-matchup">
          <div class="teams">${matchup || ""}</div>
        </div>

        <div class="tv-status"></div>

        <div class="tv-right">
          ${network || ""}
        </div>
      `;

      /* ================= CLICK HANDLER (KEY FIX) ================= */
      card.addEventListener("click", () => {
        if (link) {
          window.open(link, "_blank", "noopener,noreferrer");
        }
      });

      /* cursor feedback */
      card.style.cursor = link ? "pointer" : "default";

      el.appendChild(card);
    });
  });
}

/* ======================= PRINT ======================= */
function printTVOnly() {
  window.print();
}
