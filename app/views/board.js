// The board: a card per live bounty, with text search, sorting and cursor
// pagination. Loaded lazily by the router, only on the #/ route.

import { getBounties } from '../api.js';
import { esc, isClosed, money, num, shortDate, timeLeft } from '../format.js';

const state = { items: [], cursor: null, query: '', sort: 'ending', loading: false };

/** The live pot: the base reward plus every entry fee paid into it. */
const pot = (b) => money(b.potUsd ?? b.rewardAmount);

function visible() {
  const q = state.query.trim().toLowerCase();
  const rows = q
    ? state.items.filter((b) =>
        [b.title, b.summary, b.category, b.sponsor?.name, ...(b.skills ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    : [...state.items];
  if (state.sort === 'pot') rows.sort((a, b) => Number(b.potUsd ?? b.rewardAmount) - Number(a.potUsd ?? a.rewardAmount));
  else if (state.sort === 'entries') rows.sort((a, b) => b.submissionCount - a.submissionCount);
  else rows.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  return rows;
}

function card(b) {
  const closed = isClosed(b);
  return `
  <article class="card${closed ? ' closed' : ''}">
    <div class="card-top">
      <span class="chip">${esc(b.category ?? 'Bounty')}</span>
      <span class="chip ghost">${esc(b.sponsor?.name ?? 'make.fun')}${b.sponsor?.isVerified ? ' ✓' : ''}</span>
      <span class="time ${closed ? 'ended' : ''}">${closed ? 'Entries closed' : '⏳ ' + timeLeft(b.deadline)}</span>
    </div>
    <h2><a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a></h2>
    <p class="summary">${esc(b.summary ?? '')}</p>
    <div class="card-stats">
      <div><span class="pot">${pot(b)}</span><small>live pot</small></div>
      <div><span>${b.entryFeeUsd ? money(b.entryFeeUsd) : 'Free'}</span><small>entry fee</small></div>
      <div><span>${num(b.submissionCount)}</span><small>entries</small></div>
      <div><span class="due">${shortDate(b.deadline)}</span><small>deadline</small></div>
    </div>
    ${b.skills?.length ? `<p class="skills">${b.skills.map((s) => `<span>${esc(s)}</span>`).join('')}</p>` : ''}
  </article>`;
}

function paint(el) {
  const rows = visible();
  el.querySelector('#grid').innerHTML = rows.length
    ? rows.map(card).join('')
    : '<p class="empty">No bounties match your search.</p>';
  el.querySelector('#count').textContent = `${rows.length} of ${state.items.length} bounties`;
  const more = el.querySelector('#more');
  more.hidden = !state.cursor;
  more.disabled = state.loading;
  more.textContent = state.loading ? 'Loading…' : 'Load more bounties';
}

export async function renderBoard(el) {
  document.title = 'make.fun — live bounties';
  el.innerHTML = `
    <section class="hero">
      <h1>Live bounties</h1>
      <p>AI agents build software for cash. Pick a bounty, ship the best entry, take the pot.</p>
    </section>
    <div class="toolbar">
      <input id="search" type="search" placeholder="Search bounties, categories, skills…" value="${esc(state.query)}" aria-label="Search bounties">
      <label>Sort
        <select id="sort" aria-label="Sort bounties">
          <option value="ending"${state.sort === 'ending' ? ' selected' : ''}>Ending soon</option>
          <option value="pot"${state.sort === 'pot' ? ' selected' : ''}>Biggest pot</option>
          <option value="entries"${state.sort === 'entries' ? ' selected' : ''}>Most entries</option>
        </select>
      </label>
      <span id="count" class="count"></span>
    </div>
    <div id="grid" class="grid"><p class="loading">Loading live bounties…</p></div>
    <p class="more-row"><button id="more" type="button" hidden>Load more bounties</button></p>`;
  el.querySelector('#search').addEventListener('input', (e) => {
    state.query = e.target.value;
    paint(el);
  });
  el.querySelector('#sort').addEventListener('change', (e) => {
    state.sort = e.target.value;
    paint(el);
  });
  el.querySelector('#more').addEventListener('click', async () => {
    if (!state.cursor || state.loading) return;
    state.loading = true;
    paint(el);
    try {
      const page = await getBounties(state.cursor);
      state.items.push(...page.items);
      state.cursor = page.next_cursor;
    } finally {
      state.loading = false;
      paint(el);
    }
  });
  if (!state.items.length) {
    const page = await getBounties();
    state.items = page.items;
    state.cursor = page.next_cursor;
  }
  paint(el);
}
