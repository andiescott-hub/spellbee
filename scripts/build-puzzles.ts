// Builds src/data/puzzles.ts from two public archives of past NYT Spelling Bee puzzles:
//   git clone https://github.com/philshem/scrape_bee
//   git clone https://github.com/tedmiston/spelling-bee-answers
//   npx tsx scripts/build-puzzles.ts ../scrape_bee/data ../spelling-bee-answers/days
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface NytPuzzle {
  printDate: string;
  centerLetter: string;
  outerLetters: string[];
  answers: string[];
}

interface Puzzle {
  date: string;
  center: string;
  outer: string;
  answers: string[];
}

const byDate = new Map<string, Puzzle>();

function add(p: NytPuzzle | undefined) {
  if (!p || !Array.isArray(p.answers) || !/^\d{4}-\d\d-\d\d$/.test(p.printDate)) return;
  const center = p.centerLetter;
  const outer = [...p.outerLetters].sort().join('');
  const letters = new Set(center + outer);
  const answers = [...new Set(p.answers)].sort();
  const valid =
    letters.size === 7 &&
    /^[a-z]{7}$/.test(center + outer) &&
    answers.every((w) => w.length >= 4 && w.includes(center) && [...w].every((c) => letters.has(c))) &&
    answers.some((w) => new Set(w).size === 7);
  if (!valid) throw new Error(`Bad puzzle on ${p.printDate}`);
  byDate.set(p.printDate, { date: p.printDate, center, outer, answers });
}

for (const dir of process.argv.slice(2)) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const json = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    // spelling-bee-answers stores one puzzle per file, scrape_bee stores { yesterday, today }.
    for (const p of 'answers' in json ? [json] : [json.yesterday, json.today]) add(p);
  }
}

// NYT has re-run a few letter sets. Keep only the latest run of each.
const latest = new Map<string, Puzzle>();
for (const p of [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))) latest.set(p.center + p.outer, p);
const puzzles = [...latest.values()].sort((a, b) => a.date.localeCompare(b.date));

const first = puzzles[0].date;
const last = puzzles[puzzles.length - 1].date;
const lines = puzzles.map((p) => [p.center, p.outer, ...p.answers].join(' '));

writeFileSync(
  'src/data/puzzles.ts',
  `// ${puzzles.length.toLocaleString('en-US')} past NYT Spelling Bee puzzles (${first} to ${last}) with their official answer lists.
// Sources: https://github.com/philshem/scrape_bee and https://github.com/tedmiston/spelling-bee-answers
// Built by scripts/build-puzzles.ts. One puzzle per line: center letter, the six outer letters, then every answer.
const PUZZLES = \`${lines.join('\n')}\`;

export default PUZZLES;
`,
);
console.log(`Wrote ${puzzles.length} puzzles (${first} to ${last})`);
