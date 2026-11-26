# Occultum Relic Tracker

A shared Phantom Weapons Occultum (IL 795, the "Final Phantasm" step) tracker for Woven, Charli and Mimikyu.
When anyone ticks a box, everyone's page updates within about 3 seconds.

## What's inside
```
public/index.html                 the whole site (styles, sprites, animations)
netlify/functions/progress.mjs    the shared save/load endpoint (/api/progress)
netlify.toml                      tells Netlify where things are
package.json                      one dependency: @netlify/blobs
```
Progress is stored in Netlify Blobs, which is included on the free plan. You don't need a database or any other account.

## Deploy (pick one)
**Important:** Netlify Drop (drag-and-drop) only publishes static files. It won't run the sync function, so ticks won't be shared. Use one of these instead:

### A) Netlify CLI (about 2 minutes)
1. Install Node.js (https://nodejs.org) if you don't have it.
2. Unzip this folder, open a terminal inside it, and run:
   ```
   npm install
   npx netlify-cli login
   npx netlify-cli deploy --prod
   ```
3. Choose "Create & configure a new project" and accept the defaults. The publish directory is read from netlify.toml.
4. Share the URL it prints with Charli and Mimi.

### B) GitHub + Netlify
1. Push this folder to a new GitHub repo.
2. In Netlify, go to Add new project → Import from Git and pick the repo. Leave the build command blank; netlify.toml handles the rest.
3. Every push redeploys automatically.

## Notes
- Anyone with the link can tick boxes for any character. "Reset" asks for confirmation first.
- **Party Board** shows all three side by side and tags anything all three still need with PARTY UP, so you can queue it together.
- Sound is off by default. Use the 🔇 button to turn it on.
- If you open index.html straight from your computer, it runs in an offline preview mode that saves only in that browser.
