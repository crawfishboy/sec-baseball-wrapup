function renderStandings(rows) {
  const el = document.getElementById("standingsData");
  if (!el) return;

  const teams = [];

  rows.forEach(r => {
    const team = r[1];
    const w = parseFloat(r[2]);
    const l = parseFloat(r[3]);

    if (!team) return;

    const wins = isNaN(w) ? 0 : w;
    const losses = isNaN(l) ? 0 : l;
    const total = wins + losses;

    const pct = total > 0 ? wins / total : 0;

    teams.push({
      team,
      w: wins,
      l: losses,
      pct
    });
  });

  // sort by win %
  teams.sort((a, b) => b.pct - a.pct);

  let lastPct = null;
  let rank = 0;
  let display = 0;

  const ranked = teams.map(t => {
    display++;

    if (t.pct !== lastPct) {
      rank = display;
      lastPct = t.pct;
    }

    return {
      ...t,
      rank
    };
  });

  el.innerHTML = `
    <table class="table">
      <tr>
        <th>Rank</th>
        <th>Team</th>
        <th>W</th>
        <th>L</th>
        <th>PCT</th>
      </tr>

      ${ranked.map(t => `
        <tr>
          <td>${t.rank}</td>
          <td>${t.team}</td>
          <td>${t.w}</td>
          <td>${t.l}</td>
          <td class="pct">${(t.pct * 100).toFixed(1)}%</td>
        </tr>
      `).join("")}
    </table>
  `;
}
