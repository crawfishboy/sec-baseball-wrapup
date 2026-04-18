/* ================= SHEETS ================= */
const BASE =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTJqWA6-51XcC3cm3u_x6lp-1HFr8MO8_qPenmFFbJ3ndqGhqVTUHEPGiJ7yM5lpRMLDXoc01tOqhpM/pub?output=csv";

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

  if (gb % 1 === 0) return gb.toString();

  if (gb % 1 === 0.5) return Math.floor(gb) + "½";

  return gb.toFixed(1);
}

/* ================= LOAD ================= */

async function loadStandings(){

  const res = await fetch(BASE + "&cache=" + Date.now());
  const csv = await res.text();
  const rows = Papa.parse(csv.trim()).data;

  let standings = [];

  rows.forEach(r=>{
    if((r[0] || "").toLowerCase() === "standings"){
      standings.push({
        team: r[1],
        wins: r[2],
        losses: r[3],
        pct: calcPct(r[2], r[3]),
        gb: 0
      });
    }
  });

  renderStandings(standings);
}

/* ================= RENDER ================= */

function renderStandings(standings){

  if (!standings.length) {
    document.getElementById("standingsData").innerHTML = "No data";
    return;
  }

  standings.sort((a,b)=>
    parseFloat(b.pct) - parseFloat(a.pct)
  );

  const leader = standings[0];

  standings.forEach(team=>{
    team.gb = calcGB(leader, team);
  });

  let rank = 1;

  for (let i = 0; i < standings.length; i++) {
    const team = standings[i];

    if (i === 0) {
      team.rank = 1;
      team.tie = false;
      continue;
    }

    const prev = standings[i - 1];

    if (team.pct === prev.pct) {
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

      ${standings.map(t=>`
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

loadStandings();
