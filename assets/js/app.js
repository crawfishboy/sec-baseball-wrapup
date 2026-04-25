/* ================= SHEETS ================= */
const BASE =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM/pub?output=csv";

const SHEETS = {
  current: BASE + "&gid=0",
  week1: BASE + "&gid=749848866",
  week2: BASE + "&gid=761086323",
  week3: BASE + "&gid=752709309",
  week4: BASE + "&gid=476878133",
  week5: BASE + "&gid=10532734",
  week6: BASE + "&gid=1203045580"
};

let isLoading = false;

/* ================= NETWORK LOGOS ================= */
const LOGOS = {
  "ESPN": "/assets/images/logo-espn.png",
  "ESPN2": "/assets/images/logo-espn2.png",
  "SECN": "/assets/images/logo-sec-network.webp",
  "SEC+": "/assets/images/logo-sec-network-plus.png"
};

/* ================= DATE FIX (CRITICAL FIX) ================= */
function normalizeDate(value) {
  if (!value) return null;

  const cleaned = value.toString().trim();

  // try native parsing first
  const native = new Date(cleaned);
  if (!isNaN(native.getTime())) {
    return new Date(native.getFullYear(), native.getMonth(), native.getDate());
  }

  // fallback MM/DD/YYYY
  const parts = cleaned.split(/[\/\-]/);
  if (parts.length === 3) {
    return new Date(
      parseInt(parts[2], 10),
      parseInt(parts[0], 10) - 1,
      parseInt(parts[1], 10)
    );
  }

  return null;
}

/* ================= HELPERS ================= */

function formatTVDate(dateObj) {
  if (!dateObj) return "";

  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "numeric",
    day: "numeric"
  });
}

function parseDateTime(dateObj, time) {
  if (!dateObj) return new Date();

  return new Date(dateObj.toDateString() + " " + (time || ""));
}

/* ================= CALCULATIONS ================= */

function calcPct(wins, losses) {
  wins = parseInt(wins) || 0;
  losses = parseInt(losses) || 0;

  const total = wins + losses;
  if (total === 0) return "0.000";

  return (wins / total).toFixed(3);
}

function calcGB(leader, team) {
  const lw = parseInt(leader.wins);
  const ll = parseInt(leader.losses);
  const tw = parseInt(team.wins);
  const tl = parseInt(team.losses);

  const gb = ((lw - tw) + (tl - ll)) / 2;

  if (gb === 0) return "-";

  if (Number.isInteger(gb)) return gb.toString();

  const whole = Math.floor(gb);
  const decimal = gb - whole;

  if (decimal === 0.5) {
    return whole === 0 ? "1/2" : `${whole} 1/2`;
  }

  return gb.toFixed(1);
}

/* ================= GAME STATUS ================= */

function getGameStatus(dateObj, time) {
  const gameTime = parseDateTime(dateObj, time);
  const now = new Date();

  const diff = gameTime - now;

  if (diff < -3 * 60 * 60 * 1000) return "Final";
  if (diff < 0) return "Live";
  return "Upcoming";
}

/* ================= LOAD ================= */

async function loadWeek(week, pushUrl = true) {

  if (isLoading) return;
  isLoading = true;

  if (pushUrl) {
    history.pushState({}, "", `?week=${week}`);
  }

  const url = (SHEETS[week] || SHEETS.current) + "&cache=" + Date.now();

  const res = await fetch(url);
  const csv = await res.text();
  const rows = Papa.parse(csv.trim()).data;

  let data = { games: [], tv: [], results: [], next: [] };
  let standings = [];
  let featured = [];

  rows.forEach(r => {
    if (!r[0]) return;

    const type = (r[0] || "").toLowerCase();

    if (type === "featured") {
      featured.push({ match: r[1], meta: r[2] });
      return;
    }

    if (type === "standings") {
      standings.push({
        team: r[1],
        wins: r[2],
        losses: r[3],
        pct: calcPct(r[2], r[3]),
        gb: 0
      });
      return;
    }

    if (type === "tv") {
      const cleanDate = normalizeDate(r[1]);

      data.tv.push({
        date: cleanDate,
        time: r[2],
        zone: r[3],
        game: r[4],
        network: r[5],
        url: r[6]
      });

      return;
    }

    if (data[type]) {
      data[type].push(r.slice(1).join(" "));
    }
  });

  renderAll(data, standings, featured);

  isLoading = false;
}

/* ================= RENDER ================= */

function renderAll(data, standings, featured) {

  /* FEATURED */
  document.getElementById("featuredGames").innerHTML =
    featured.map(f => `
      <div class="hero-card">
        <b>${f.match}</b>
        <div style="font-size:12px;color:#cfe3ff;">${f.meta}</div>
      </div>
    `).join("");

  /* LISTS */
  document.getElementById("gamesData").innerHTML =
    data.games.map(r => `<div class="row">${r}</div>`).join("");

  document.getElementById("resultsData").innerHTML =
    data.results.map(r => `<div class="row">${r}</div>`).join("");

  document.getElementById("nextData").innerHTML =
    data.next.map(r => `<div class="row">${r}</div>`).join("");

  /* ================= TV ================= */

  data.tv.sort((a, b) =>
    parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time)
  );

  const grouped = new Map();

  data.tv.forEach(g => {
    const key = formatTVDate(g.date);

    if (!grouped.has(key)) {
      grouped.set(key, {
        rawDate: g.date,
        games: []
      });
    }

    grouped.get(key).games.push(g);
  });

  document.getElementById("tvData").innerHTML =
    Array.from(grouped.entries())
      .sort((a, b) =>
        a[1].rawDate - b[1].rawDate
      )
      .map(([dateLabel, obj]) => `

        <div style="margin:14px 0 6px;font-weight:700;font-size:16px;background:#111827;color:#fff;padding:8px 12px;border-radius:8px;">
          ${dateLabel}
        </div>

        ${obj.games.map(g => {

          const status = getGameStatus(g.date, g.time);
          const logo = LOGOS[g.network] || "";

          return `
            <a href="${g.url || '#'}" target="_blank" class="tv-row-link">

              <div class="tv-row">

                <div style="width:120px;">
                  ${g.time} ${g.zone}
                </div>

                <div style="flex:1;">
                  ${g.game}
                </div>

                <div style="width:90px;text-align:center;">
                  <span class="status ${status.toLowerCase()}">${status}</span>
                </div>

                <div style="width:130px;text-align:right;">
                  <span class="badge">
                    ${logo ? `<img src="${logo}" class="net-logo">` : ""}
                    ${g.network}
                  </span>
                </div>

              </div>

            </a>
          `;
        }).join("")}

      `).join("");

  /* ================= STANDINGS ================= */

  if (!standings.length) {
    document.getElementById("standingsData").innerHTML =
      "<div style='padding:10px;'>No standings available</div>";
    return;
  }

  standings.sort((a, b) =>
    (parseFloat(b.pct) || 0) - (parseFloat(a.pct) || 0)
  );

  const leader = standings[0];

  standings.forEach(t => {
    t.gb = calcGB(leader, t);
  });

  let rank = 1;

  for (let i = 0; i < standings.length; i++) {
    const t = standings[i];

    if (i === 0) {
      t.rank = 1;
      t.tie = false;
      continue;
    }

    const prev = standings[i - 1];

    if (parseFloat(t.pct) === parseFloat(prev.pct)) {
      t.rank = prev.rank;
      t.tie = true;
      prev.tie = true;
    } else {
      rank++;
      t.rank = rank;
      t.tie = false;
    }
  }

  document.getElementById("standingsData").innerHTML = `
    <table class="table">
      <tr>
        <th>RK</th>
        <th>TEAM</th>
        <th>W</th>
        <th>L</th>
        <th>PCT</th>
        <th>GB</th>
      </tr>

      ${standings.map(t => `
        <tr>
          <td>${t.tie ? "T" + t.rank : t.rank}</td>
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

document.getElementById("weekSelect").addEventListener("change", e => {
  loadWeek(e.target.value);
});

const params = new URLSearchParams(window.location.search);
loadWeek(params.get("week") || "current", false);

/* ================= AUTO REFRESH ================= */
setInterval(() => {
  const currentWeek = new URLSearchParams(window.location.search).get("week") || "current";
  loadWeek(currentWeek, false);
}, 120000);
