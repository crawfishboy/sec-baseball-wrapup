/* ===============================
   SEC BASEBALL WRAP - FINAL JS
   CLEAN + FIXED LOGO RENDERING
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

/* ========= STATE ========= */
let allData = [];

/* ========= INIT ========= */
document.addEventListener("DOMContentLoaded", () => {
  loadSchedule();
});

/* ========= LOAD DATA ========= */
async function loadSchedule() {
  try {
    const res = await fetch(BASE);
    const text = await res.text();

    const parsed = parseCSV(text);
    allData = parsed;

    renderAll(parsed);

  } catch (err) {
    console.error("Load error:", err);
  }
}

/* ========= CSV PARSER ========= */
function parseCSV(csv) {
  const lines = csv.split("\n").filter(Boolean);
  return lines.map(line => splitCSV(line));
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

/* ========= NETWORK NORMALIZER ========= */
function normalizeNetwork(str = "") {
  return str
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "")
    .replace("+", "PLUS");
}

/* ========= GET LOGO ========= */
function getLogo(network = "") {
  return LOGOS[normalizeNetwork(network)] || null;
}

/* ========= TIME FORMAT ========= */
function formatTime(t) {
  if (!t) return "";
  if (t.includes("AM") || t.includes("PM")) return t;

  const [h, m] = t.split(":");
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

  el.innerHTML = "";

  rows.forEach(r => {
    const matchup = r[1];

    const card = document.createElement("div");
    card.className = "hero-card";

    card.innerHTML = `
      <div style="font-weight:700; font-size:13px;">
        ${matchup || ""}
      </div>
    `;

    el.appendChild(card);
  });
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

function renderStandings(rows) {
  const el = document.getElementById("standingsData");
  if (!el) return;

  el.innerHTML = `
    <table class="table">
      ${rows.map(r => `
        <tr>
          <td>${r[1] || ""}</td>
          <td>${r[2] || ""}</td>
          <td>${r[3] || ""}</td>
          <td>${r[4] || ""}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

/* ========= TV SCHEDULE (FIXED) ========= */
function renderTV(rows) {
  const container = document.getElementById("tvData");
  if (!container) return;

  container.innerHTML = "";

  const grouped = {};

  rows.forEach(row => {
    const date = row[1] || "No Date";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(row);
  });

  Object.keys(grouped).forEach(date => {

    const block = document.createElement("div");
    block.innerHTML = `<div class="tv-day">${date}</div>`;

    grouped[date].forEach(row => {

      const time = formatTime(row[2]);
      const matchup = row[4];
      const network = row[5];
      const link = row[6];

      const logo = getLogo(network);

      const card = document.createElement("a");
      card.href = link || "#";
      card.target = "_blank";
      card.className = "tv-card-link";

      card.innerHTML = `
        <div class="tv-card">

          <div class="tv-time">
            <div class="time-main">${time || ""}</div>
            <div class="time-sub">${date}</div>
          </div>

          <div class="tv-matchup">
            <div class="teams">${matchup || ""}</div>
          </div>

          <div class="tv-right">
            ${
              logo
                ? `<div class="logo-box">
                     <img class="net-logo" src="${logo}" alt="${network}">
                   </div>`
                : `<span class="network-fallback">${network || ""}</span>`
            }
          </div>

        </div>
      `;

      block.appendChild(card);
    });

    container.appendChild(block);
  });
}
