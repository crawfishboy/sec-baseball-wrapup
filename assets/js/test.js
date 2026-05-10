html {
  scroll-behavior: smooth;
  scroll-padding-top: 120px;
}

/* ================= THEME VARIABLES ================= */
:root {
  --bg: #D7DEE9;
  --card: #F2F5FA;

  --primary: #2B5A9E;
  --accent: #3D7BC6;

  --text: #1A1F2B;
  --text-muted: #5B6475;

  --border: #D1D7E5;

  --win: #2ECC71;
  --loss: #E74C3C;

  --highlight: #F5B700;
}

/* ================= BASE ================= */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
}

/* ================= NAV ================= */
.section-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 22px;
  padding: 10px 14px;
  background: var(--primary);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1000;
  flex-wrap: wrap;
}

.section-nav a {
  color: #ffffff;
  text-decoration: none;
  font-size: 13px;
  opacity: 0.85;
}

.section-nav a:hover,
.section-nav a.active {
  color: var(--highlight);
  opacity: 1;
}

/* ================= HERO ================= */
.hero {
  position: relative;
  background: var(--primary);
  padding: 18px 16px;
  color: #fff;
}

/* IMPORTANT: prevents overlay from blocking clicks anywhere */
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.15);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
}

/* ================= HERO CARDS ================= */
.hero-featured {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.hero-card {
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 10px;
  padding: 6px 8px;
  min-height: 44px;
  color: #fff;
}

/* ================= LAYOUT ================= */
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px;
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 14px;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* ================= PANELS ================= */
.panel-white {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
}

.panel-blue {
  background: var(--primary);
  color: #fff;
  border-radius: 10px;
  padding: 12px;
}

/* ================= TITLE ================= */
.title {
  background: var(--text-muted);
  color: #fff;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 10px;
}

/* ================= ROW ================= */
.row {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}

/* ================= TV DAY ================= */
.tv-day {
  font-weight: 700;
  color: var(--text-muted);
  margin: 12px 0 6px;
}

/* ================= IMPORTANT: LINK FIX ================= */
#tvData a {
  display: block;
  text-decoration: none;
  color: inherit;
}

/* ================= TV CARD (SAFE VERSION) ================= */
.tv-card {
  display: grid;
  grid-template-columns: 120px 1fr 110px 90px;
  align-items: center;
  gap: 12px;

  padding: 10px 12px;
  margin-bottom: 6px;

  border-radius: 8px;
  background: #243355;
  border: 1px solid #2a3445;

  color: #fff;

  cursor: pointer;

  /* CRITICAL: prevents stacking issues */
  position: relative;
}

/* SAFE HOVER (NO TRANSFORM = NO CLICK BREAKING) */
.tv-card:hover {
  background: #2c4370;
  border-color: var(--accent);
  transition: background 0.2s ease, border-color 0.2s ease;
}

/* ================= TIME ================= */
.tv-time {
  width: 120px;
}

.time-main {
  font-size: 14px;
  font-weight: 700;
}

.time-sub {
  font-size: 10px;
  color: #cfe3ff;
}

/* ================= MATCHUP ================= */
.tv-matchup {
  display: flex;
  flex-direction: column;
}

/* ================= STATUS ================= */
.badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 5px;
  font-weight: bold;
}

.badge.upcoming { background: var(--accent); color: #fff; }
.badge.live { background: #dc2626; color: #fff; }
.badge.final { background: var(--text-muted); color: #fff; }

/* ================= LOGOS ================= */
.tv-right {
  display: flex;
  justify-content: center;
  align-items: center;
}

.net-logo {
  height: 24px;
  max-width: 70px;
  object-fit: contain;
}

/* ================= TABLE ================= */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th,
.table td {
  padding: 8px;
  text-align: center;
}

/* ================= LINKS SAFETY ================= */
#tvData a:hover {
  text-decoration: none;
}
