// A public profile: avatar, name, bio, the entrant's record and their entries,
// each entry linking back to its bounty.

import { avatarUrl, getProfile } from '../api.js';
import { date, esc, money, num, rate } from '../format.js';

function scoreOf(s) {
  if (!s?.score) return '';
  const key = s.score.column?.key ?? '';
  return key.includes('judge') ? rate(s.score.value) : num(s.score.value);
}

export async function renderProfile(el, handle) {
  const p = await getProfile(handle);
  document.title = `@${p.handle} · make.fun`;
  const name = p.display_name || p.handle;
  const rawAvatar = p.avatar?.url ?? p.image;
  const avatar = rawAvatar ? (rawAvatar.startsWith('http') ? rawAvatar : `https://make.fun${rawAvatar}`) : avatarUrl(p.handle);
  const r = p.record ?? {};
  const stats = [
    [num(r.competitions_entered), 'entered'],
    [num(r.competitions_placed), 'placed'],
    [num(r.competitions_won), 'won'],
    [num(r.podium_finishes), 'podiums'],
    [r.best_placement ? `#${r.best_placement}` : '—', 'best place'],
    [money(r.prize_usd), 'prizes won'],
  ];
  const solutions = (p.solutions ?? []).slice(0, 15);
  el.innerHTML = `
    <p class="crumbs"><a href="#/">← All bounties</a></p>
    <div class="profile-head">
      <img class="avatar" crossorigin="anonymous" src="${esc(avatar)}" alt="Avatar of ${esc(name)}" width="96" height="96">
      <div>
        <h1 class="bounty-title">${esc(name)} ${p.house ? '<span class="chip ghost">house</span>' : ''}</h1>
        <p class="handle">@${esc(p.handle)}${p.joined_at ? ` · joined ${date(p.joined_at)}` : ''}</p>
        ${p.bio ? `<p class="lede">${esc(p.bio)}</p>` : ''}
        <p class="links">
          ${p.github_login ? `<span>GitHub: ${esc(p.github_login)}</span>` : ''}
          ${p.x?.url ? `<a href="${esc(p.x.url)}" rel="noopener">X / @${esc(p.x.username ?? '')}</a>` : ''}
          ${p.discord?.url ? `<a href="${esc(p.discord.url)}" rel="noopener">Discord</a>` : ''}
          ${p.wallet?.explorer_url ? `<a href="${esc(p.wallet.explorer_url)}" rel="noopener">Wallet</a>` : ''}
        </p>
      </div>
    </div>
    <div class="stat-band">${stats.map(([v, l]) => `<div><span>${v}</span><small>${l}</small></div>`).join('')}</div>
    <h2>Entries</h2>
    ${
      solutions.length
        ? `<ul class="solutions">${solutions
            .map(
              (s) => `<li>
                <a href="#/bounty/${encodeURIComponent(s.competition.slug)}">${esc(s.competition.title)}</a>
                <span class="sol-title">${esc(s.title ?? '')}</span>
                <span class="sol-meta">${s.placement ? `Placed #${s.placement}` : esc(s.competition.status ?? '')}${s.prize_usd ? ` · won ${money(s.prize_usd)}` : ''}${scoreOf(s) ? ` · score ${scoreOf(s)}` : ''} · ${date(s.entered_at)}</span>
              </li>`,
            )
            .join('')}</ul>`
        : '<p class="empty">No entries yet.</p>'
    }`;
}
