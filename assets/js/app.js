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

// Fix date shifting
function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();

  const parts = dateStr.split(/[\/\-]/);
  return new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2])
  );
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

/* ================= CALCULATIONS ================= */

// Win %
function calcPct(wins, losses) {
  wins = parseInt(wins) || 0;
  losses = parseInt(losses) || 0;

  const total = wins + losses;
  if (total === 0) return "0.000";

  return (wins / total).toFixed(3);
}

// Games Behind (FIXED + CLEAN)
function calcGB(leader, team) {
  const lw = parseInt(leader.wins);
  const ll = parseInt(leader.losses);
  const tw = parseInt(team.wins);
  const tl = parseInt(team.losses);

  const gb = ((lw - tw) + (tl - ll)) / 2;

  if (gb === 0) return "-";

  // whole number
  if (Number.isInteger(gb)) {
    return gb.toString();
  }

  // handle halves correctly (9.5 → 9 1/2)
  const whole = Math.floor(gb);
  const decimal = gb - whole;

  if (decimal === 0.5) {
    return whole === 0 ? "1/2" : `${whole} 1/2`;
  }

  // fallback safety
  return gb.toFixed(1);
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
      data.tv.push({
        date: r[1],
        time: r[2],
        zone: r[3],
        game: r[4],
        network: r[5]
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

  /* ===== FEATURED ===== */
  document.getElementById("featuredGames").innerHTML =
    featured.map(f => `
      <div class="hero-card">
        <b>${f.match}</b>
        <div style="font-size:12px;color:#cfe3ff;">${f.meta}</div>
      </div>
    `).join("");

  /* ===== LISTS ===== */
  document.getElementById("gamesData").innerHTML =
    data.games.map(r => `<div class="row">${r}</div>`).join("");

  document.getElementById("resultsData").innerHTML =
    data.results.map(r => `<div class="row">${r}</div>`).join("");

  document.getElementById("nextData").innerHTML =
    data.next.map(r => `<div class="row">${r}</div>`).join("");

  /* ================= TV ================= */
  data.tv.sort((a, b) => {
    return parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time);
  });

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
      .sort((a, b) => {
        return parseLocalDate(a[1].rawDate) - parseLocalDate(b[1].rawDate);
      })
      .map(([dateLabel, obj]) => `

        <div style="margin:14px 0 6px;font-weight:700;font-size:16px;background:#111827;color:#fff;padding:8px 12px;border-radius:8px;">
          ${dateLabel}
        </div>

        ${obj.games.map(g => `
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

  if (!standings || standings.length === 0) {
    document.getElementById("standingsData").innerHTML =
      "<div style='padding:10px;'>No standings available</div>";
    return;
  }

  standings.sort((a, b) =>
    (parseFloat(b.pct) || 0) - (parseFloat(a.pct) || 0)
  );

  const leader = standings[0];

  standings.forEach(team => {
    team.gb = calcGB(leader, team);
  });

  let rank = 1;

  for (let i = 0; i < standings.length; i++) {
    const team = standings[i];
    const pct = parseFloat(team.pct) || 0;

    if (i === 0) {
      team.rank = 1;
      team.tie = false;
      continue;
    }

    const prev = standings[i - 1];
    const prevPct = parseFloat(prev.pct) || 0;

    if (pct === prevPct) {
      team.rank = prev.rank;
      team.tie = true;
      prev.tie = true;
    } else {
      rank++;
      team.rank = rank;
      team.tie = false;
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
document.getElementById("weekSelect").addEventListener("change", (e) => {
  loadWeek(e.target.value);
});

const params = new URLSearchParams(window.location.search);
loadWeek(params.get("week") || "current", false);
