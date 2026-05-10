/* ================ UPDATED  =============== */
/* ================= SHEET ================= */
const BASE_ID = "2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM";

const SHEETS = {
  current: "814890663"
};

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  loadSchedule("current");
});

/* ================= URL ================= */
function getURL(week) {
  const gid = SHEETS[week] || SHEETS.current;
  return `https://docs.google.com/spreadsheets/d/e/${BASE_ID}/pub?gid=${gid}&single=true&output=csv`;
}

/* ================= LOAD ================= */
async function loadSchedule(week) {
  const res = await fetch(getURL(week) + "&t=" + Date.now());
  const text = await res.text();
  const rows = parseCSV(text);
  renderTV(rows);
}

/* ================= CSV ================= */
function parseCSV(csv) {
  return csv.trim().split("\n").map(r => r.split(","));
}

/* ================= RENDER TV (LOCKED) ================= */
function renderTV(rows) {
  const el = document.getElementById("tvData");
  el.innerHTML = "";

  const grouped = {};

  rows.forEach(r => {
    if ((r[0] || "").toLowerCase() !== "tv") return;

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
      const link = r[6];

      const a = document.createElement("a");

      /* 🔥 THIS IS THE CRITICAL LINE (UNCHANGED LOGIC) */
      a.href = link && link.startsWith("http") ? link : "#";
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      const card = document.createElement("div");
      card.className = "tv-card";

      card.innerHTML = `
        <div class="tv-time">
          <div class="time-main">${rawTime || ""} ET</div>
        </div>

        <div class="tv-matchup">
          <div class="teams">${matchup || ""}</div>
        </div>

        <div class="tv-status">
          <span class="badge upcoming">UPCOMING</span>
        </div>

        <div class="tv-right">
          ${network || ""}
        </div>
      `;

      a.appendChild(card);
      el.appendChild(a);
    });
  });
}
