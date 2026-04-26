function renderStandings(rows = []) {
  const el = document.getElementById("standingsData");
  if (!el) return;

  const teams = rows
    .filter(r => r[1])
    .map(r => {
      const team = r[1];

      const w = parseFloat(r[2]) || 0;
      const l = parseFloat(r[3]) || 0;

      // use sheet pct if it exists, otherwise compute it
      let pct = parseFloat(r[4]);

      if (isNaN(pct)) {
        const total = w + l;
        pct = total > 0 ? w / total : 0;
      }

      return { team, w, l, pct };
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
