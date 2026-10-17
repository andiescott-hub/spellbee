# Spelling Bee

A faithful replica of the NYT Spelling Bee that opens straight onto the hive. It has no welcome
screen, menus, subscribe prompts, ads, promos or archive. Same rules, same ranks, one puzzle a day.

## What's included

- **NYT rules and scoring**: 7 letters, words of 4 or more letters that use the center letter.
  4-letter words score 1 point, longer words 1 point per letter, and pangrams 7 extra points.
  Messages read "Good!", "Nice!", "Awesome!" and "Pangram!", or "Too short", "Missing center
  letter", "Bad letters", "Not in word list" and "Already found".
- **Real NYT puzzles**: 1,181 past NYT Spelling Bee puzzles (September 2019 to March 2025), each
  with its official answer list, so only the words NYT accepted that day count. Each day's puzzle
  comes from a fixed, shuffled order, so every device gets the same puzzle and none repeats for
  over 3 years.
- **Ranks**: Beginner, Good Start, Moving Up, Good, Solid, Nice, Great, Amazing and Genius at
  NYT's percentages, shown on the dotted progress line. Tap it for **Rankings**, today's points
  for each rank. Queen Bee stays a secret until you find every word, as on NYT.
- **Genius and Queen Bee** celebrations, shown once each per puzzle.
- **Hints**: today's Spelling Bee Grid (words by first letter and length) and Two-Letter List,
  counting down as you find words, plus the words, points, pangrams, perfect pangrams and bingo
  totals. Switch to **All words** for NYT's full counts.
- **Yesterday's Answers**: every answer to yesterday's puzzle, pangrams in bold, with the words
  you found ticked.
- **Statistics**: today's rank and score, Puzzles Played, Words Found, Pangrams Found, Genius,
  Queen Bee, Longest Word, spoiler-free sharing, and a countdown to the next puzzle.
- **Found words**: newest first in the box above the hive, every word A to Z when opened.
- **Settings**: Dark Theme and **Import Stats**.
- Shuffle, Delete and Enter buttons. On a keyboard, type, press Enter, Backspace, and Space to
  shuffle.
- A new puzzle arrives at local midnight and loads automatically.
- Can be installed on the iPhone home screen, where it opens full screen like an app.

## Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import the `andiescott-hub/spellbee` repository.
3. Leave the settings as detected (Framework: **Vite**, Build: `npm run build`, Output: `dist`)
   and click **Deploy**.

Every push to the repository's default branch redeploys automatically. There is no backend
and nothing to configure.

## Put it on your iPhone home screen

Open the Vercel URL in Safari, tap **Share**, then **Add to Home Screen**. It then opens
full screen, like an app, with no Safari bars.

On iOS, the home-screen app and Safari keep **separate** saved data. Pick one way to play,
and import your stats there.

## Carry over your NYT stats

Settings → **Import Stats** → **Import**. Copy in Puzzles played, Words found, Pangrams found,
Genius, Queen Bee and your Longest word from the NYT Spelling Bee stats screen.

- Leave **"These numbers include today's puzzle"** ticked if you've already played today on NYT,
  so today's words here aren't added on top.
- Untick it if you haven't, so that today's words in this app are added.

Stats are stored in the browser on each device.

## Development

```bash
npm install
npm run dev         # local dev server
npm test            # unit tests (Vitest)
npm run test:e2e    # end-to-end tests (Playwright, Chromium)
npm run build       # typecheck + production build
```

The puzzles live in `src/data/puzzles.ts`, built by `scripts/build-puzzles.ts` from the public
archives [philshem/scrape_bee](https://github.com/philshem/scrape_bee) and
[tedmiston/spelling-bee-answers](https://github.com/tedmiston/spelling-bee-answers).
The app icons are generated with `npx tsx scripts/make-icons.ts`.
