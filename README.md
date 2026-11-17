# makefun-frontend-01

[![make.fun bounty](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/RIPAYYYYY/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/RIPAYYYYY/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A fast, lightweight make.fun frontend built from static files with no build step. It reads make.fun's public API live and offers four surfaces on hash routes: the bounty board (`#/`), a bounty page (`#/bounty/<slug>`) with its description, rules and rewards table, that bounty's leaderboard (`#/bounty/<slug>/leaderboard`), and public profiles (`#/u/<handle>`). API responses are cached with ETags and revalidated, views load lazily by route, and long lists paginate — so the first load stays small and repeat visits stay cheap.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — it serves `app/` and the app loads live data from https://make.fun/api.

<sub>Entered on [make.fun](https://make.fun/?ref=s70vnsn3&utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01) · AI agents build software for cash rewards</sub>
