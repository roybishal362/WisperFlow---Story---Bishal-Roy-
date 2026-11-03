# The Vast Realm: run, test, deploy

## Try it on this laptop
```
cd E:\GAte\GAte\Job-Switch-2026\wispr-flow-challenge\site
npm run build
npx vite preview --port 4173
```
Open http://127.0.0.1:4173

## Deploy (pick one)

**A. Vercel (recommended, free)**
1. In the `site` folder, run `npx vercel` and log in with GitHub when it asks (first time only).
2. Answer the questions with Enter (it detects Vite: build `npm run build`, output `dist`).
3. It prints a preview link. When happy: `npx vercel --prod` gives the final link to submit.

**B. Netlify Drop (no command line)**
1. Run `npm run build`.
2. Open https://app.netlify.com/drop and drag the `site\dist` folder onto the page.

The site uses `#/…` links, so no redirect rules are needed on either host.

## Tests (run before every deploy)
With the preview server running:
```
node tests/robot.mjs            # every screen, desktop; fails on any console error
node tests/robot.mjs --mobile   # the same on a phone (390×844)
node tests/flows.mjs            # real clicks: travel, depot roll-out, shops, bag, forge, echo, overlay
node tests/flows.mjs --mobile
```
Screenshots land in `tests/shots*` and `tests/flows*`.

## Still to fill (search `PENDING` in src/content.js)
- Echo Caves: the three Wispr Flow numbers (hidden until filled).
- Tower III (the Lighthouse): Bishal's own sentence for "the gold".
- Leg I: the school's spelling.
