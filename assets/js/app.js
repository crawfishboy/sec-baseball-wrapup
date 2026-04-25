/* ===============================
   TV SCHEDULE - STABLE VERSION
   =============================== */

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
document.addEventListener("DOMContentLoaded", () => {
  loadSchedule();
});

/* ========= LOAD ========= */
async function loadSchedule() {
  try {
    const res = await fetch(BASE);
    const text = await res.text();

    const parsed = parseCSV(text);

    // ONLY TV rows
    allData = parsed.filter(r => r[0] === "tv");

    renderTV(allData);

  } catch (err) {
    console.error("Load error:", err);
  }
}

/* ========= CSV PARSER ========= */
function parseCSV(csv) {
  const lines = csv.split("\n").filter(Boolean);

  return lines.map(line => {
    const values = splitCSV(line);
    return values;
  });
}

/* safer CSV split */
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

/* ========= NORMALIZE NETWORK ========= */
function normalizeNetwork(str = "") {
  return str
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "")
    .replace("+", "PLUS");
}

/* ========= LOGO ========= */
function getLogo(net) {
  const key = normalizeNetwork(net);
  return LOGOS[key] || null;
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

/* ========= RENDER ========= */
function renderTV(rows) {
  const container = document.getElementById("tvData");
  if (!container) return;

  container.innerHTML = "";

  if (!rows.length) {
    container.innerHTML = "<p>No TV data found.</p>";
    return;
  }

  /* ===============================
     1. GROUP BY DATE (row[1])
  =============================== */
  const grouped = {};

  rows.forEach(row => {
    const date = row[1] || "No Date";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(row);
  });

  /* ===============================
     2. SORT DATES (optional but nice)
  =============================== */
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  /* ===============================
     3. RENDER GROUPS
  =============================== */
  sortedDates.forEach(date => {
    const dayBlock = document.createElement("div");

    dayBlock.innerHTML = `
      <div class="tv-day">${date}</div>
    `;

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
                ? `<img class="net-logo" src="${logo}" alt="${network}">`
                : `<span class="network-fallback">${network || ""}</span>`
            }
          </div>

        </div>
      `;

      dayBlock.appendChild(card);
    });

    container.appendChild(dayBlock);
  });
}
