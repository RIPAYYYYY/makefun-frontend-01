// One bounty's page: summary, live pot, dates and status, the rewards table,
// the full description and rules, and a link on to its leaderboard.

import { getBounty } from '../api.js';
import { date, esc, isClosed, money, num, richText, timeLeft } from '../format.js';

function rewardsTable(b) {
  const rows = (b.rewardsNow ?? [])
    .map(
      (r) => `<tr><td>#${r.place}</td><td class="amount">${money(r.amountUsd)}</td><td>${money(r.baseUsd)}${Number(r.feeShareUsd) > 0 ? ` + ${money(r.feeShareUsd)} fees` : ''}</td></tr>`,
    )
    .join('');
  if (rows) return `<table class="rewards"><thead><tr><th>Place</th><th>Pays now</th><th>Base + fee share</th></tr></thead><tbody>${rows}</tbody></table>`;
  const plain = Object.entries(b.rewards ?? {})
    .map(([place, amount]) => `<tr><td>#${place}</td><td class="amount">${money(amount)}</td><td></td></tr>`)
    .join('');
  return plain ? `<table class="rewards"><thead><tr><th>Place</th><th>Reward</th><th></th></tr></thead><tbody>${plain}</tbody></table>` : '<p>No rewards listed.</p>';
}

function recentEntries(b) {
  const subs = (b.submissions ?? []).slice(0, 8);
  if (!subs.length) return '';
  const rows = subs
    .map((s) =>
      s.hunter
        ? `<li><a href="#/u/${encodeURIComponent(s.hunter)}">@${esc(s.hunter)}</a> ${s.title ? `<span>${esc(s.title)}</span>` : ''}</li>`
        : `<li><span>Entry received ${date(s.createdAt)}</span></li>`,
    )
    .join('');
  return `<h2>Recent entries</h2><ul class="recent">${rows}</ul>`;
}

export async function renderBounty(el, slug) {
  const b = await getBounty(slug);
  document.title = `${b.title} · make.fun`;
  const closed = isClosed(b);
  el.innerHTML = `
    <p class="crumbs"><a href="#/">← All bounties</a> · <a href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard">Leaderboard →</a></p>
    <div class="card-top">
      <span class="chip">${esc(b.category ?? 'Bounty')}</span>
      <span class="chip ghost">${esc(b.sponsor?.name ?? 'make.fun')}</span>
      <span class="chip ${closed ? 'ended' : 'open'}">${closed ? 'Entries closed' : esc(b.status ?? 'open')}</span>
    </div>
    <h1 class="bounty-title">${esc(b.title)}</h1>
    <p class="lede">${esc(b.summary ?? '')}</p>
    <div class="stat-band">
      <div><span class="pot">${money(b.potUsd ?? b.rewardAmount)}</span><small>live pot</small></div>
      <div><span>${money(b.rewardAmount)}</span><small>base reward</small></div>
      <div><span>${b.entryFeeUsd ? money(b.entryFeeUsd) : 'Free'}</span><small>entry fee</small></div>
      <div><span>${num(b.submissionCount)}</span><small>entries</small></div>
      <div><span>${closed ? 'Closed' : timeLeft(b.deadline)}</span><small>deadline ${date(b.deadline)}</small></div>
    </div>
    ${b.skills?.length ? `<p class="skills">${b.skills.map((s) => `<span>${esc(s)}</span>`).join('')}</p>` : ''}
    <p><a class="cta" href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard">View the leaderboard</a></p>
    <h2>Rewards</h2>
    ${rewardsTable(b)}
    <p class="fine">Published ${date(b.publishedAt)}${b.opensAt ? ` · Opens ${date(b.opensAt)}` : ''} · Status: ${esc(b.status ?? '')}${Number(b.entryFeesUsd) > 0 ? ` · Entry fees in the pot: ${money(b.entryFeesUsd)} from ${num(b.entryFeePayers)} entrants` : ''}</p>
    <h2>About this bounty</h2>
    <div class="prose">${richText(b.description ?? '')}</div>
    ${b.rules && b.rules !== b.description ? `<h2>Rules</h2><div class="prose">${richText(b.rules)}</div>` : ''}
    ${recentEntries(b)}`;
}
