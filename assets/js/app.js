function renderStandings(rows = []) {
  const el = document.getElementById("standingsData");
  if (!el) return;

  console.log("STANDINGS RAW ROWS:", rows);

  rows = rows.filter(r => r[1] && r[2] && r[3]);

  const teams = rows.map(r => {
    const w = parseFloat(r[2]) || 0;
    const l = parseFloat(r[3]) || 0;
    const pct = (w + l) > 0 ? w / (w + l) : 0;

    return {
      team: r[1],
      w,
      l,
      pct
    };
  });

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
    return { ...t, rank };
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
