/* ================= SHEETS ================= */
const BASE =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM/pub?output=csv";

const SHEETS = {
  current: BASE + "&gid=0"
};

/* ================= HELPERS ================= */

function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();

  const parts = dateStr.split(/[\/\-]/);
  return new Date(parts[0], parts[1]-1, parts[2]);
}

function formatTVDate(dateStr) {
  const date = parseLocalDate(dateStr);

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });
}

function parseDateTime(date, time) {
  const d = parseLocalDate(date);
  return new Date(d.toDateString() + " " + (time || ""));
}

/* ================= LOAD ================= */

async function loadTV(){

  const res = await fetch(SHEETS.current + "&cache=" + Date.now());
  const csv = await res.text();
  const rows = Papa.parse(csv.trim()).data;

  let tv = [];

  rows.forEach(r=>{
    if((r[0] || "").toLowerCase() === "tv"){
      tv.push({
        date: r[1],
        time: r[2],
        zone: r[3],
        game: r[4],
        network: r[5]
      });
    }
  });

  renderTV(tv);
}

/* ================= RENDER ================= */

function renderTV(tv){

  tv.sort((a,b)=>{
    return parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time);
  });

  const grouped = new Map();

  tv.forEach(g=>{
    const key = formatTVDate(g.date);

    if(!grouped.has(key)){
      grouped.set(key, {
        rawDate: g.date,
        games: []
      });
    }

    grouped.get(key).games.push(g);
  });

  document.getElementById("tvData").innerHTML =
    Array.from(grouped.entries())
      .sort((a,b)=>{
        return parseLocalDate(a[1].rawDate) - parseLocalDate(b[1].rawDate);
      })
      .map(([dateLabel, obj])=>`

        <div style="margin:14px 0 6px;font-weight:700;font-size:16px;background:#111827;color:#fff;padding:8px 12px;border-radius:8px;">
          ${dateLabel}
        </div>

        ${obj.games.map(g=>`
          <div class="row">
            <div style="width:120px;">
              ${g.time} ${g.zone}
            </div>

            <div style="flex:1;">
              ${g.game}
            </div>

            <div style="width:130px;text-align:right;">
              <span class="badge">${g.network}</span>
            </div>
          </div>
        `).join("")}

      `).join("");
}

loadTV();
