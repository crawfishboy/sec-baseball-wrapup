/* ================= STANDINGS ================= */

// Sort by winning percentage (descending)
standings.sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));

let rank = 1;

for (let i = 0; i < standings.length; i++) {
  const team = standings[i];
  const pct = parseFloat(team.pct);

  if (i === 0) {
    team.rank = rank;
    team.tie = false;
    continue;
  }

  const prev = standings[i - 1];
  const prevPct = parseFloat(prev.pct);

  if (pct === prevPct) {
    // tie group → same rank
    team.rank = prev.rank;
    team.tie = true;
    prev.tie = true;
  } else {
    // new rank → increment sequentially
    rank++;
    team.rank = rank;
    team.tie = false;
  }
}
