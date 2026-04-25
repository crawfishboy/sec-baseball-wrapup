/* ===============================
   TV SCHEDULE - BULLETPROOF VERSION
   =============================== */

/* ========= DATA SOURCE ========= */
const BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM/pub?output=csv";

/* ========= NETWORK LOGOS ========= */
const LOGOS = {
  ESPN: "/assets/images/logo-espn.png",
  ESPN2: "/assets/images/logo-espn2.png",
  SECN: "/assets/images/logo-sec-network.png",
  SECNPLUS: "/assets/images/logo-sec-network-plus.png"
};

/* ========= STATE ========= */
let allData = [];
let currentDay = "ALL";

/* ========= INIT ========= */
document.addEventListener("DOMContentLoaded", () => {
  loadSchedule();
});

/* ========= LOAD DATA ========= */
async function loadSchedule() {
  try {
    const res = await fetch(BASE);
    const text = await res.text();

    allData = parseCSV(text);

    renderSchedule(allData);
  } catch (err) {
    console.error("Schedule load error:", err);
  }
}

/* ========= CSV PARSER ========= */
function parseCSV(csv) {
  const lines = csv.split("\n").filter(Boolean);
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = splitCSV(line);
    const obj = {};

    headers.forEach((h, i) => {
      obj[h] = values[i] ? values[i].trim() : "";
    });

    return obj;
  });
}

/* Handles commas inside quotes safely */
function splitCSV(line) {
  const result = [];
  let current = "";
  let inside = false;

  for (let char of line) {
    if (char === '"') inside = !inside;
    else if (char === "," && !inside) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/* ========= NETWORK NORMALIZER ========= */
function normalizeNetwork(str = "") {
  return str
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "")
    .replace("+", "PLUS");
}

/* ========= LOGO LOOKUP ========= */
function getNetworkLogo(raw) {
  const key = normalizeNetwork(raw);
  return LOGOS[key] || null;
}

/* ========= TIME FORMAT ========= */
function formatTime(timeStr) {
  if (!timeStr) return "";

  if (timeStr.includes("AM") || timeStr.includes("PM")) {
    return timeStr;
  }

  const [h, m] = timeStr.split(":");
  let hour = parseInt(h, 10);
  const min = m || "00";

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${min} ${ampm}`;
}

/* ========= RENDER ========= */
function renderSchedule(data) {
  const container = document.getElementById("tvData");
  if (!container) return;

  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "<p>No games found.</p>";
    return;
  }

  data.forEach(row => {
    const date = row[1];
    const time = formatTime(row[2]);
    const matchup = row[4];
    const networkRaw = row[5] || "";
    const link = row[6];

    const logo = getNetworkLogo(networkRaw);
    const network = networkRaw;

    const card = document.createElement("a");
    card.href = link || "#";
    card.target = "_blank";
    card.className = "tv-card-link";

    card.innerHTML = `
      <div class="tv-card">

        <div class="tv-time">
          <div class="time-main">${time}</div>
          <div class="time-sub">${date}</div>
        </div>

        <div class="tv-matchup">
          <div class="teams">${matchup}</div>
        </div>

        <div class="tv-right">
          ${
            logo
              ? `<img class="net-logo" src="${logo}" alt="${network}">`
              : `<span class="network">${network}</span>`
          }
        </div>

      </div>
    `;

    container.appendChild(card);
  });
}
