const BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM/gviz/tq?tqx=out:csv";

console.log("APP JS LOADED");

/* INIT */
document.addEventListener("DOMContentLoaded", loadSchedule);

/* LOAD */
async function loadSchedule() {
  try {
    const res = await fetch(BASE + "&t=" + Date.now(), {
      cache: "no-store"
    });

    const text = await res.text();

    console.log("RAW DATA SAMPLE:", text.slice(0, 200));

    if (!text || text.length < 10) {
      showError("No data returned from sheet");
      return;
    }

    const rows = parseCSV(text);

    console.log("ROWS:", rows.length);

    if (!rows.length) {
      showError("CSV parsed as empty");
      return;
    }

    renderAll(rows);

  } catch (err) {
    console.error(err);
    showError("Fetch failed");
  }
}

/* ERROR */
function showError(msg) {
  document.body.innerHTML =
    `<div style="padding:20px;background:#300;color:#fff;">
      ERROR: ${msg}
    </div>`;
}

/* CSV */
function parseCSV(csv) {
  return csv
    .replace(/\r/g, "")
    .split("\n")
    .filter(Boolean)
    .map(line => line.split(",").map(x => x.trim()));
}

/* ROUTER */
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

  renderSimple("gamesData", games);
  renderSimple("resultsData", results);
  renderSimple("nextData", next);
  renderSimple("featuredGames", featured);
  renderStandings(standings);
  renderTV(tv);
}

/* SIMPLE */
function renderSimple(id, rows) {
  const el = document.getElementById(id);
  if (!el) return;

  el.innerHTML = rows.map(r => `<div class="row">${r[1] || ""}</div>`).join("");
}

/* STANDINGS (minimal safe version) */
function renderStandings(rows) {
  const el = document.getElementById("standingsData");
  if (!el) return;

  el.innerHTML = rows.map(r =>
    `<div class="row">${r[1] || ""}</div>`
  ).join("");
}

/* TV */
function renderTV(rows) {
  const el = document.getElementById("tvData");
  if (!el) return;

  el.innerHTML = rows.map(r =>
    `<div class="row">${r[1] || ""}</div>`
  ).join("");
}

/* PRINT FIX */
function printTVSchedule() {
  const content = document.getElementById("tvData").innerHTML;

  const w = window.open("", "", "width=900,height=650");

  w.document.write(`
    <html>
      <body>
        ${content}
        <script>
          window.onload = () => window.print();
        </script>
      </body>
    </html>
  `);

  w.document.close();
}
