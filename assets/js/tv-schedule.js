/* ================= SHEETS ================= */
const BASE =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM/pub?output=csv";

const SHEETS = {
  current: BASE + "&gid=0",
  week1: BASE + "&gid=749848866",
  week2: BASE + "&gid=761086323",
  week3: BASE + "&gid=752709309",
  week4: BASE + "&gid=476878133",
  week5: BASE + "&gid=10532734"
};

let isLoading = false;

/* ================= HELPERS ================= */
function formatTVDate(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr.replace(/\//g, "-"));

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });
}

function parseDateTime(date, time) {
  return new Date((date || "").replace(/\//g, "-") + " " + (time || ""));
}

/* ================= LOAD ================= */
async function loadWeek(week, pushUrl = true){

  if(isLoading) return;
  isLoading = true;

  if(pushUrl){
    history.pushState({}, "", `?week=${week}`);
  }

  const url = (SHEETS[week] || SHEETS.current) + "&cache=" + Date.now();

  const res = await fetch(url);
  const csv = await res.text();
  const rows = Papa.parse(csv.trim()).data;

  let data = {games:[], tv:[], results:[], next:[]};
  let standings = [];
  let featured = [];

  rows.forEach(r=>{
    if(!r[0]) return;

    const type = (r[0]||"").toLowerCase();

    if(type === "featured"){
      featured.push({ match:r[1], meta:r[2] });
      return;
    }

    if(type === "standings"){
      standings.push({
        team:r[1],
        wins:r[2],
        losses:r[3],
        pct:r[4],
        gb:r[5]
      });
      return;
    }

    /* ================= TV PARSING ================= */
    if(type === "tv"){
      data.tv.push({
        date: r[1],
        time: r[2],
        zone: r[3],
        game: r[4],
        network: r[5]
      });
      return;
    }

    if(data[type]){
      data[type].push(r.slice(1).join(" "));
    }
  });

  renderAll(data, standings, featured);
  isLoading = false;
}

/* ================= RENDER ================= */
function renderAll(data, standings, featured){

  document.getElementById("featuredGames").innerHTML =
    featured.map(f=>`
      <div class="hero-card">
        <b>${f.match}</b>
        <div style="font-size:12px;color:#cfe3ff;">${f.meta}</div>
      </div>
    `).join("");

  document.getElementById("gamesData").innerHTML =
    data.games.map(r=>`<div class="row">${r}</div>`).join("");

  document.getElementById("resultsData").innerHTML =
    data.results.map(r=>`<div class="row">${r}</div>`).join("");

  document.getElementById("nextData").innerHTML =
    data.next.map(r=>`<div class="row">${r}</div>`).join("");

/* ================= TV SORT ================= */
data.tv.sort((a,b)=>{
  return parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time);
});

/* ================= TV GROUP ================= */
const grouped = new Map();

data.tv.forEach(g=>{
  const key = formatTVDate(g.date);

  if(!grouped.has(key)){
    grouped.set(key, {
      rawDate: g.date,
      games: []
    });
  }

  grouped.get(key).games.push(g);
});

/* ================= TV RENDER ================= */
document.getElementById("tvData").innerHTML =
  Array.from(grouped.entries())
    .sort((a,b)=>{
      return new Date(a[1].rawDate.replace(/\//g,"-")) -
             new Date(b[1].rawDate.replace(/\//g,"-"));
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

  

  /* ================= STANDINGS ================= */
  standings.sort((a,b)=>parseFloat(b.pct)-parseFloat(a.pct));

  document.getElementById("standingsData").innerHTML = `
    <table class="table">
      <tr><th>RK</th><th>TEAM</th><th>W</th><th>L</th><th>PCT</th><th>GB</th></tr>
      ${standings.map((t,i)=>`
        <tr>
          <td>${i+1}</td>
          <td>${t.team}</td>
          <td>${t.wins}</td>
          <td>${t.losses}</td>
          <td>${t.pct}</td>
          <td>${t.gb}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

/* ================= EVENTS ================= */
document.getElementById("weekSelect").addEventListener("change",(e)=>{
  loadWeek(e.target.value);
});

const params = new URLSearchParams(window.location.search);
loadWeek(params.get("week") || "current", false);
