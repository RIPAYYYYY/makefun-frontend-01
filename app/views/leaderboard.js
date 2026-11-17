// A bounty's leaderboard: ranked rows built from the payload's own column
// definitions. Standings can run to thousands of rows, so the table renders
// in pages of 100 and grows only when asked — the DOM stays small.

import { getLeaderboard } from '../api.js';
import { bytes, date, esc, num, rate } from '../format.js';

const PAGE = 100;

/** Image fields are usually make.fun paths ('/api/…') but can be absolute URLs. */
const imgUrl = (u) => (u.startsWith('http') ? u : `https://make.fun${u}`);

function cell(col, entry) {
  const v = entry.values?.[col.key];
  if (v === null || v === undefined) return '—';
  if (col.key === 'bytes') return bytes(v);
  if (col.key === 'valid') return v ? '✓' : '—';
  if (col.key.includes('judge')) return rate(v);
  return num(v);
}

export async function renderLeaderboard(el, slug) {
  const data = await getLeaderboard(slug);
  const comp = data.competition ?? {};
  document.title = `${comp.title ?? slug} — leaderboard · make.fun`;
  const entries = data.entries ?? [];
  const cols = (data.columns ?? []).filter((c) => !c.hidden);
  let shown = PAGE;

  const head = cols.map((c) => `<th>${esc(c.title)}</th>`).join('');
  const row = (e) => `
    <tr>
      <td class="rank">${e.rank ?? ''}</td>
      <td class="entrant">
        ${e.image ? `<img class="mini-avatar" crossorigin="anonymous" src="${esc(imgUrl(e.image))}" alt="">` : ''}
        <a href="#/u/${encodeURIComponent(e.handle ?? '')}">@${esc(e.handle ?? '')}</a>
        ${e.house ? '<span class="chip ghost">house</span>' : ''}
      </td>
      <td class="entry-title">${esc(e.title ?? '')}<small>${e.received_at ? date(e.received_at) : ''}</small></td>
      ${cols.map((c) => `<td>${cell(c, e)}</td>`).join('')}
    </tr>`;

  el.innerHTML = `
    <p class="crumbs"><a href="#/">← All bounties</a> · <a href="#/bounty/${encodeURIComponent(slug)}">← ${esc(comp.title ?? slug)}</a></p>
    <h1 class="bounty-title">Leaderboard</h1>
    <p class="lede">${esc(comp.title ?? '')} · ${esc(data.phase?.title ?? '')} phase${data.phase?.ends_at ? ` · ends ${date(data.phase.ends_at)}` : ''}</p>
    ${
      entries.length
        ? `<div class="table-wrap"><table class="board-table">
             <thead><tr><th>#</th><th>Entrant</th><th>Entry</th>${head}</tr></thead>
             <tbody id="rows"></tbody>
           </table></div>
           <p class="more-row"><span id="shown" class="count"></span> <button id="more" type="button">Show more</button></p>`
        : '<p class="empty">No standings yet — this bounty has no ranked entries so far. Check back once the first results are in.</p>'
    }`;

  if (!entries.length) return;
  const tbody = el.querySelector('#rows');
  const paint = () => {
    tbody.innerHTML = entries.slice(0, shown).map(row).join('');
    el.querySelector('#shown').textContent = `Showing ${Math.min(shown, entries.length)} of ${num(entries.length)} entries`;
    el.querySelector('#more').hidden = shown >= entries.length;
  };
  el.querySelector('#more').addEventListener('click', () => {
    shown += PAGE;
    paint();
  });
  paint();
}
