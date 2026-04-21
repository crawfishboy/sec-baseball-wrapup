/* ===============================
   TV SCHEDULE APP - UPDATED JS
   =============================== */

/* ========= CONFIG ========= */
const BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM/pub?output=csv";

/* Optional sheet mapping (extend as needed) */
const SHEETS = {
  current: BASE
};

/* ========= STATE ========= */
let allData = [];
let filteredData = [];
let currentDay = "ALL";

/* ========= INIT ========= */
document.addEventListener("DOMContentLoaded", () => {
  loadSchedule();
  setupDayFilter();
});

/* ========= LOAD DATA ========= */
async function loadSchedule() {
  try {
    const res = await fetch(SHEETS.current);
    const text = await res.text();

    allData = parseCSV(text);
    renderSchedule(allData);
  } catch (err) {
    console.error("Error loading schedule:", err);
  }
}

/* ========= CSV PARSER ========= */
function parseCSV(csv) {
  const lines = csv.split("\n").filter(l => l.trim() !== "");
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = splitCSVLine(line);
    const row = {};

    headers.forEach((h, i) => {
      row[h] = values[i] ? values[i].trim() : "";
    });

    return row;
  });
}

/* Handles commas inside quotes safely */
function splitCSVLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let char of line) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/* ========= FILTER BY DAY ========= */
function setupDayFilter() {
  const buttons = document.querySelectorAll("[data-day]");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      currentDay = btn.dataset.day;
      applyFilter();
    });
  });
}

function applyFilter() {
  if (currentDay === "ALL") {
    filteredData = allData;
  } else {
    filteredData = allData.filter(item =>
      (item.Day || "").toUpperCase() === currentDay.toUpperCase()
    );
  }

  renderSchedule(filteredData);
}

/* ========= RENDER ========= */
function renderSchedule(data) {
  const container = document.getElementById("schedule");
  if (!container) return;

  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "<p>No schedule items found.</p>";
    return;
  }

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "schedule-card";

    const time = formatTime(item.Time);
    const title = item.Show || "Untitled Show";
    const channel = item.Channel || "";
    const day = item.Day || "";

    card.innerHTML = `
      <div class="time">${time}</div>
      <div class="title">${title}</div>
      <div class="meta">
        <span>${channel}</span>
        <span>${day}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

/* ========= TIME FORMATTER ========= */
/* Hook for conversion (24h → 12h etc.) */
function formatTime(timeStr) {
  if (!timeStr) return "";

  // If already formatted, return
  if (timeStr.includes("AM") || timeStr.includes("PM")) {
    return timeStr;
  }

  // Expecting "HH:MM"
  const [h, m] = timeStr.split(":");
  let hour = parseInt(h, 10);
  const min = m || "00";

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${min} ${ampm}`;
}

/* ========= OPTIONAL: REFRESH ========= */
function refreshSchedule() {
  loadSchedule();
}
