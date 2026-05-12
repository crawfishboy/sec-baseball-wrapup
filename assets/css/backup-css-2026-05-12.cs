html {
  scroll-behavior: smooth;
  scroll-padding-top: 120px;
}

/* ================= BASE ================= */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #243355;
  color: #ffffff;
  overflow-x: hidden;
}

/* ================= NAV (STICKY) ================= */
.section-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 22px;
  padding: 10px 14px;
  background: linear-gradient(90deg, #162036, #1b2744);
  border-bottom: 1px solid #263143;

  position: sticky;
  top: 0;
  z-index: 9999;

  flex-wrap: wrap;
}

.section-nav a {
  color: #9fb3cc;
  text-decoration: none;
  font-size: 13px;
  padding: 6px 2px;
  border-bottom: 2px solid transparent;
}

.section-nav a:hover,
.section-nav a.active {
  color: #cfe3ff;
  border-bottom: 2px solid #3b82f6;
}

.nav-select {
  background: #101826;
  color: #fff;
  border: 1px solid #263143;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
}

/* ================= HERO ================= */
.hero {
  position: relative;
  height: 260px;
  background: url('https://sec-baseball-wrapup.vercel.app/assets/images/banner-sec-baseball-wrap-up-750x300.png')
    center/cover no-repeat;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 24px;
}

/* ================= REMOVE HEADER GAMES (CLEAN SLATE) ================= */
#featuredGames,
.hero-featured,
.hero-card {
  display: none !important;
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
  background: #ffffff;
  color: #111;
  border-radius: 10px;
  padding: 12px;
}

.panel-blue {
  background: #1f4e8c;
  color: #fff;
  border-radius: 10px;
  padding: 12px;
}

/* ================= TITLE ================= */
.title {
  position: sticky;
  top: 60px;
  z-index: 50;
  background: #6b7280;
  color: #ffffff;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  text-transform: uppercase;
  font-weight: 700;
}

/* ================= ROW ================= */
.row {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid #eee;
  gap: 10px;
  font-size: 13px;
}

/* ================= BADGES ================= */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge.upcoming { background: #2563eb; color: #fff; }
.badge.live { background: #dc2626; color: #fff; }
.badge.final { background: #6b7280; color: #fff; }

/* ================= TV CARD (RESTORED WORKING DESIGN) ================= */
.tv-card {
  display: grid;
  grid-template-columns: 120px 1fr 110px 90px;
  align-items: center;
  gap: 12px;

  padding: 10px 12px;
  margin-bottom: 6px;

  border-radius: 8px;
  background: linear-gradient(90deg,#111827,#1f2937);
  border: 1px solid #2a3445;

  animation: fadeIn 0.22s ease-out;
}

.tv-card:hover {
  background: linear-gradient(90deg,#243355,#0C39A1);
  transform: translateY(-2px);
}

/* ================= TIME ================= */
.tv-time {
  width: 120px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-main {
  font-size: 14px;
  font-weight: 700;
}

.time-sub {
  font-size: 10px;
  color: #9fb3cc;
}

/* ================= MATCHUP ================= */
.tv-matchup {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.teams {
  font-size: 13px;
  font-weight: 600;
}

/* ================= PREDICTED WINNER ================= */
.tv-predicted {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #ffd54a;
}

.prediction-team {
  font-weight: 800;
  color: #ffffff;
}

.prediction-team.correct { color: #3ddc97; }
.prediction-team.incorrect { color: #ff5c5c; }

/* ================= STATUS ================= */
.tv-status {
  display: flex;
  justify-content: center;
  align-items: center;
}

.tv-status .badge {
  min-width: 70px;
}

/* ================= LOGOS ================= */
.tv-right {
  width: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.net-logo {
  height: 24px;
  max-width: 70px;
  object-fit: contain;
}

/* ================= LINKS ================= */
#tvData a {
  color: #fff;
  text-decoration: none;
}

/* ================= TABLE ================= */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
}

.table th,
.table td {
  padding: 8px;
  text-align: center;
}

.table th:nth-child(1),
.table td:nth-child(1),
.table th:nth-child(2),
.table td:nth-child(2) {
  text-align: left;
}

/* ================= ANIMATION ================= */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


/* 000000 */


.section-nav {
  position: sticky;
  top: 0;
  z-index: 9999;
  width: 100%;
}

/* force correct scroll context */
html, body {
  height: auto !important;
  overflow-y: auto !important;
}

/* eliminate common sticky breakers in layouts */
main, header, .container, .grid, .hero {
  transform: none !important;
  overflow: visible !important;
}
