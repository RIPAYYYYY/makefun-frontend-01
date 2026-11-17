// A make.fun frontend: four surfaces on hash routes, each view loaded lazily
// with import() so the first load is only this router.
//
//   #/                              the board of live bounties
//   #/bounty/<slug>                 one bounty's page
//   #/bounty/<slug>/leaderboard    that bounty's leaderboard
//   #/u/<handle>                    a public profile
//
// window.__shotReady is false while a route loads and true once its data has
// rendered, so a screenshot script knows when to capture.

const app = document.getElementById('app');
let run = 0; // drops a slow render when the route has already changed

async function render() {
  const mine = ++run;
  window.__shotReady = false;
  app.innerHTML = '<p class="loading">Loading…</p>';
  const hash = location.hash || '#/';
  try {
    let m;
    if ((m = hash.match(/^#\/bounty\/([^/]+)\/leaderboard\/?$/))) {
      const { renderLeaderboard } = await import('./views/leaderboard.js');
      if (mine === run) await renderLeaderboard(app, decodeURIComponent(m[1]));
    } else if ((m = hash.match(/^#\/bounty\/([^/]+)\/?$/))) {
      const { renderBounty } = await import('./views/bounty.js');
      if (mine === run) await renderBounty(app, decodeURIComponent(m[1]));
    } else if ((m = hash.match(/^#\/u\/([^/]+)\/?$/))) {
      const { renderProfile } = await import('./views/profile.js');
      if (mine === run) await renderProfile(app, decodeURIComponent(m[1]));
    } else {
      const { renderBoard } = await import('./views/board.js');
      if (mine === run) await renderBoard(app);
    }
  } catch (err) {
    if (mine !== run) return;
    document.title = 'make.fun — something went wrong';
    app.innerHTML = `<div class="error"><h1>Could not load this page</h1><p>${String(err?.message ?? err)}</p><p><a href="#/">Back to the board</a></p></div>`;
  }
  if (mine !== run) return;
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
