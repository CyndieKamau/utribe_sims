# Gold Run

A browser-based 2D game prototype (a playable vertical slice). "Gold Run" is a working title.

## Requirements

Node 24, as pinned in `.nvmrc`. Node 22.12 or later also works.

## Run it

```sh
npm ci                          # install dependencies
npx playwright install chromium # one-time browser download for e2e tests
npm run dev                     # dev server on http://localhost:8080
npm test                        # unit tests
npm run e2e                     # end-to-end tests
npm run lint
npm run typecheck
npm run build                   # production build into dist/
```

## Testing

Unit tests live in `tests/unit` and run with Vitest.

End-to-end tests live in `tests/e2e` and run with Playwright on a Pixel 7 profile and desktop
Chromium. The game world is a canvas, so the tests drive it through `window.__GOLD_RUN__`, a small
test hook that exists only on the dev server and in preview builds, never in production.

## Deploy previews

The site is hosted on Cloudflare Pages through its GitHub integration. Production deploys from
`main`, and every pull request gets its own public `*.pages.dev` preview URL that opens on a phone.

Creating the Cloudflare Pages project and connecting this repository is a one-time manual step for
the repository owner. Automation cannot do it.

Project settings:

| Setting | Value |
| --- | --- |
| Framework preset | `None` |
| Build command | `[ "$CF_PAGES_BRANCH" = "main" ] \|\| export VITE_GOLD_RUN_DEV=true; npm run build` |
| Build output directory | `dist` |
| Production branch | `main` |
| Preview branch | All non-Production branches |

Pages sets `CF_PAGES_BRANCH` during every build, so the build command turns the test hook on for
every branch except `main`. No environment variable is needed in the dashboard; don't add
`VITE_GOLD_RUN_DEV` there, because dashboard variables can apply to Production too.

Cloudflare reads the Node version from `.nvmrc`. If the Pages build fails because its build image
can't provide Node 24, change `.nvmrc` to `22`; `engines` in `package.json` already allows
`>=22.12`.

Previews include the test hook on purpose, so they can be driven and inspected the same way as the
dev server. The production build never sets the flag, and CI fails if the hook shows up anywhere in
`dist`.

## Credits

Scaffolded from [phaserjs/template-react-ts](https://github.com/phaserjs/template-react-ts) at
commit `c7265972c856906cacf1f2892d8565d64a358d34`, used under the MIT License:

```
Copyright (c) 2025 Phaser Studio Inc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Art credits live in `public/assets/CREDITS.md`.
