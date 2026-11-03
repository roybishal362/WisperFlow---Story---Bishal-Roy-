# The Vast Realm · Bishal Roy

A portfolio you explore like a game world, built by voice for the Wispr Flow challenge.

*Bishal* means "vast" in Bengali, so the portfolio is a world: the **Vast City** in the middle, six realms around it, floating bridges between them, and **Roy** (a chibi version of me) flying you around in his balloon.

## The realms

| Realm | What it tells you |
|---|---|
| **The Vast City** | Who I am, ring by ring: roots, values, learning, work, trophies, community, and a sealed letter at the top for whoever explores everything |
| **The Long Line** | My journey as a train, from a steam engine in Chandrapur to a sky-train. Every setback is a depot where the engine changes |
| **The Lake of Mirrors** | Eight wins, and what each one cost. Every tower has its reflection in the water, and the gold that mended it |
| **The Lantern Ring** | Twelve shops, one for each thing I've built, each with an item card of real numbers |
| **The Crafters' Quarter** | Five workshops, five families of skills: engineering, data and ML, generative AI, research, communication |
| **The Echo Caves** | Proof of voice: sentences I really dictated while building this, and my Wispr Flow numbers. You can talk to the cave too |
| **The Wispr Skyport** | Three growth ideas for Wispr Flow India, my first 30 days, and the "hire me" treaty |

In a hurry? The **60-second version** is one click away on every screen.

## How it was made

- **Built by voice.** I dictated every decision, every piece of feedback and every story through **Wispr Flow** to **Claude Code**, which wrote the code.
- **Art:** made with Google Gemini and FLUX (Cloudflare Workers AI). Every image was reviewed for accuracy and consistency, and redone when it fell short.
- **Tool logos:** Simple Icons (CC0).
- **Facts:** every number on the site comes from my own verified records. Nothing is rounded up.

## Tech

- React 19 + Vite.
- framer-motion for transitions; a canvas for particles.
- The world map and the shop plaza are a hand-rolled 360° ring you can drag.
- The scenes are painted backgrounds with gentle parallax.
- One 1440×900 stage scales to fit any screen; phones held upright get their own layout.
- Voice navigation uses the Web Speech API (Chrome and Edge); other browsers show phrase buttons.
- It respects "reduce motion".

## Run it

```
npm install
npm run dev        # or: npm run build && npx vite preview
```

## Tests

With the preview server running (`npx vite preview --port 4173`), these drive Microsoft Edge through every screen and the main interactions. They fail on any console error.

```
node tests/robot.mjs   [--mobile]   # every screen
node tests/flows.mjs   [--mobile]   # balloon travel, depot engine change, shops + bag, forge, echo, overlay, drag
```

## Contact

**Bishal Roy** · roybishal9989@gmail.com · [LinkedIn](https://www.linkedin.com/in/bishal-roy-5410b5257/) · [GitHub](https://github.com/roybishal362)
