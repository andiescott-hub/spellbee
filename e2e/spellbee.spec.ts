import { expect, test, type Page } from '@playwright/test';
import { dayIndex, formatDay } from '../src/lib/date';
import { hintSummary } from '../src/lib/hints';
import { puzzleForDay } from '../src/lib/puzzle';
import { GENIUS, isPangram, rankIndex, rankThresholds, totalScore, wordScore } from '../src/lib/score';

const SHOTS = process.env.SCREENSHOT_DIR ?? 'test-results/screens';

// 17 Oct 2026, 11:00 in Melbourne.
const START = new Date('2026-10-17T11:00:00+11:00');
const DAY = 3083;
const PUZZLE = puzzleForDay(DAY);
const LETTERS = new Set([PUZZLE.center, ...PUZZLE.outer]);

test.use({ timezoneId: 'Australia/Melbourne' });

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: START });
});

const fourLetter = PUZZLE.answers.filter((w) => w.length === 4 && !isPangram(w));
const longer = PUZZLE.answers.filter((w) => w.length >= 7 && !isPangram(w));
const pangram = PUZZLE.pangrams[0];

/** Opens the app and waits until it is listening for key presses. */
async function open(page: Page) {
  await page.goto('/');
  await expect(page.locator('.hive')).toBeVisible();
  await page.waitForTimeout(200);
}

async function enter(page: Page, word: string) {
  await page.keyboard.type(word);
  await page.keyboard.press('Enter');
}

const message = (page: Page) => page.locator('.message');

/** Saves a screenshot of the settled page, with animations skipped to their end. */
const shot = (page: Page, name: string, fullPage = false) =>
  page.screenshot({ path: `${SHOTS}/${name}.png`, animations: 'disabled', fullPage });
const input = (page: Page) => page.locator('.hive-input-content');

test("loads straight into today's puzzle and scores words like NYT", async ({ page }) => {
  expect(dayIndex(START)).toBe(DAY);
  await open(page);

  // No welcome screen or help popup: the hive is ready, center letter first.
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.cell')).toHaveCount(7);
  await expect(page.locator('.cell.center')).toHaveText(PUZZLE.center);
  await expect(page.locator('.cell.outer')).toHaveText(PUZZLE.outer);
  await expect(page.locator('.progress-rank')).toHaveText('Beginner');
  await expect(page.locator('.wordlist-box')).toHaveText('Your words...');

  await enter(page, PUZZLE.center.repeat(2));
  await expect(message(page)).toHaveText('Too short');
  await expect(page.locator('.hive-input.shake')).toHaveCount(1);
  // The rejected word clears on its own.
  await expect(input(page)).toHaveText('');

  const bad = 'abcdefghijklmnopqrstuvwxyz'.split('').find((c) => !LETTERS.has(c))!;
  await page.keyboard.type(PUZZLE.center + bad.repeat(3));
  // Letters not in the hive show greyed out, the center letter in yellow.
  await expect(input(page).locator('.invalid')).toHaveCount(3);
  await expect(input(page).locator('.bright')).toHaveCount(1);
  await page.keyboard.press('Enter');
  await expect(message(page)).toHaveText('Bad letters');
  await expect(input(page)).toHaveText('');

  await enter(page, PUZZLE.outer[0].repeat(4));
  await expect(message(page)).toHaveText('Missing center letter');
  await expect(input(page)).toHaveText('');

  await enter(page, PUZZLE.center.repeat(4));
  await expect(message(page)).toHaveText('Not in word list');
  await expect(input(page)).toHaveText('');

  // A 4-letter word, tapped out on the hive.
  const first = fourLetter[0];
  for (const letter of first) await page.locator('.cell', { hasText: new RegExp(`^${letter}$`) }).click();
  await expect(input(page)).toHaveText(first);
  await page.getByRole('button', { name: 'Enter', exact: true }).click();
  await expect(message(page)).toHaveText('Good!+1');
  await expect(page.locator('.progress-marker')).toHaveText('1');
  await expect(page.locator('.wordlist-recent')).toHaveText(first);
  await shot(page, '01-first-word');

  await enter(page, first);
  await expect(message(page)).toHaveText('Already found');

  await enter(page, longer[0]);
  await expect(message(page)).toHaveText(`Awesome!+${longer[0].length}`);

  await enter(page, pangram);
  await expect(message(page)).toHaveText(`Pangram!+${wordScore(pangram)}`);
  await expect(page.locator('.message.pangram')).toBeVisible();
  await shot(page, '02-pangram');

  const found = [first, longer[0], pangram];
  const score = totalScore(found);
  const rank = rankIndex(score, PUZZLE.totalPoints);
  await expect(page.locator('.progress-marker')).toHaveText(String(score));
  // Newest word first in the closed list, pangram in bold.
  await expect(page.locator('.wordlist-recent > span')).toHaveText([pangram, longer[0], first]);
  await expect(page.locator('.wordlist-recent .pangram')).toHaveText(pangram);

  // Saved: a reload keeps today's words.
  await page.reload();
  await expect(page.locator('.progress-marker')).toHaveText(String(score));
  await expect(page.locator('.wordlist-recent > span')).toHaveCount(3);

  // The word list opens to every word, A to Z.
  await page.locator('.wordlist-box').click();
  await expect(page.locator('.wordlist-box')).toHaveText('You have found 3 words');
  await expect(page.locator('.wordlist-words li')).toHaveText([...found].sort());
  await shot(page, '03-word-list');
  await page.locator('.wordlist-box').click();
  await expect(page.locator('.wordlist-drawer')).toHaveCount(0);

  // Tapping the rank opens Rankings with today's thresholds.
  await page.locator('.progress').click();
  const rankings = page.getByRole('dialog', { name: 'Rankings' });
  await expect(rankings).toContainText('Ranks are based on a percentage of possible points in a puzzle.');
  const thresholds = rankThresholds(PUZZLE.totalPoints);
  await expect(rankings.locator('.rankings-min')).toHaveText(thresholds.slice(0, GENIUS + 1).reverse().map(String));
  await expect(rankings.locator('li.current .rankings-dot')).toHaveText(String(score));
  await expect(rankings.locator('li.current .rankings-name')).toHaveText(
    ['Beginner', 'Good Start', 'Moving Up', 'Good', 'Solid', 'Nice', 'Great', 'Amazing', 'Genius'][rank],
  );
  await expect(rankings).not.toContainText('Queen Bee');
  await shot(page, '04-rankings');
});

test('editing, shuffling and fast typing', async ({ page }) => {
  await open(page);
  await page.keyboard.type('abc');
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(input(page)).toHaveText('ab');
  await page.keyboard.press('Backspace');
  await expect(input(page)).toHaveText('a');

  // Typing during an error starts a fresh word.
  await page.keyboard.press('Backspace');
  await enter(page, 'xx');
  await expect(message(page)).toHaveText('Too short');
  await page.keyboard.type(fourLetter[0]);
  await expect(input(page)).toHaveText(fourLetter[0]);
  await page.keyboard.press('Enter');
  await expect(message(page)).toHaveText('Good!+1');

  // Words over 19 letters are cut off with "Too long".
  await page.keyboard.type(PUZZLE.center.repeat(20));
  await expect(message(page)).toHaveText('Too long');
  await expect(input(page)).toHaveText('');

  // Shuffle moves the outer letters, never the center.
  const outer = page.locator('.cell.outer .cell-letter');
  const before = await outer.allTextContents();
  await page.getByRole('button', { name: 'Shuffle' }).click();
  await expect.poll(() => outer.allTextContents()).not.toEqual(before);
  expect([...(await outer.allTextContents())].sort()).toEqual(PUZZLE.outer);
  await expect(page.locator('.cell.center')).toHaveText(PUZZLE.center);

  // The space bar shuffles too.
  const after = await outer.allTextContents();
  await page.keyboard.press(' ');
  await expect.poll(() => outer.allTextContents()).not.toEqual(after);
});

test('Genius, then Queen Bee, then statistics', async ({ page }) => {
  await open(page);
  // Find words in order until Genius, longest first so it takes fewer words.
  const words = [...PUZZLE.answers].sort((a, b) => wordScore(b) - wordScore(a));
  const geniusAt = words.findIndex((_, i) => rankIndex(totalScore(words.slice(0, i + 1)), PUZZLE.totalPoints) >= GENIUS);
  for (const w of words.slice(0, geniusAt + 1)) await enter(page, w);
  await expect(page.locator('.progress-rank')).toHaveText('Genius');

  const genius = page.getByRole('dialog', { name: 'Genius' });
  await expect(genius.getByText('Genius!')).toBeVisible({ timeout: 4000 });
  await shot(page, '05-genius');
  await genius.getByRole('button', { name: 'Keep playing' }).click();

  for (const w of words.slice(geniusAt + 1)) await enter(page, w);
  await expect(page.locator('.progress-rank')).toHaveText('Queen Bee');
  const queen = page.getByRole('dialog', { name: 'Queen Bee' });
  await expect(queen).toContainText(`You found all ${PUZZLE.answers.length} words`, { timeout: 4000 });
  await shot(page, '06-queen-bee');
  await queen.getByRole('button', { name: 'Back to puzzle' }).click();

  // Celebrations only show once.
  await page.reload();
  await page.waitForTimeout(2000);
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByRole('button', { name: 'Statistics' }).click();
  const stats = page.getByRole('dialog', { name: 'Statistics' });
  // On a tie, the longest word found first is kept.
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a));
  await expect(stats.locator('.stats-today-rank')).toHaveText('Queen Bee');
  await expect(stats.locator('.stat-value')).toHaveText(['1', String(PUZZLE.answers.length), String(PUZZLE.pangrams.length), '1', '1']);
  await expect(stats.locator('.stats-longest-word')).toContainText(longest);
  await expect(stats.locator('.countdown-time')).toHaveText(/^\d\d:\d\d:\d\d$/);
  await shot(page, '07-stats');

  // Sharing copies a spoiler-free summary.
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await stats.getByRole('button', { name: 'Share' }).click();
  await expect(page.getByText('Copied results to clipboard')).toBeVisible();
});

test('hints count down as words are found', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Hints' }).click();
  const hints = page.getByRole('dialog', { name: 'Hints' });
  const total = hintSummary(PUZZLE.answers);
  await expect(hints.locator('.page-date')).toHaveText('Saturday, October 17, 2026');
  await expect(hints.locator('.hints-summary')).toContainText(`WORDS: ${total.words}, POINTS: ${total.points}, PANGRAMS: ${total.pangrams}`);
  await expect(hints.locator('.hint-grid tr.totals .sum')).toHaveText(String(PUZZLE.answers.length));
  await shot(page, '08-hints', true);
  await hints.getByRole('button', { name: 'Back to puzzle' }).click();

  const word = fourLetter[0];
  await enter(page, word);
  await page.getByRole('button', { name: 'Hints' }).click();
  await expect(hints.locator('.hint-grid tr.totals .sum')).toHaveText(String(PUZZLE.answers.length - 1));
  await expect(hints.locator('.hints-note')).toContainText(`WORDS: ${PUZZLE.answers.length - 1}`);
  const pairs = hints.locator('.two-letter span', { hasText: new RegExp(`^${word.slice(0, 2)}-`) });
  const left = PUZZLE.answers.filter((w) => w !== word && w.startsWith(word.slice(0, 2))).length;
  await expect(pairs).toHaveText(`${word.slice(0, 2)}-${left}`);

  await hints.getByRole('radio', { name: 'All words' }).click();
  await expect(hints.locator('.hint-grid tr.totals .sum')).toHaveText(String(PUZZLE.answers.length));
});

test("a new puzzle arrives at midnight, with yesterday's answers", async ({ page }) => {
  await open(page);
  const found = [fourLetter[0], pangram];
  for (const w of found) await enter(page, w);
  await expect(page.locator('.wordlist-recent > span')).toHaveCount(2);

  // Jump to 00:00:05 the next day; the midnight timer swaps in the new puzzle.
  await page.clock.fastForward('13:00:05');
  const tomorrow = puzzleForDay(DAY + 1);
  await expect(page.locator('.cell.center')).toHaveText(tomorrow.center);
  await expect(page.locator('.wordlist-box')).toHaveText('Your words...');
  await expect(page.locator('.progress-rank')).toHaveText('Beginner');

  await page.getByRole('button', { name: "Yesterday's Answers" }).click();
  const yesterday = page.getByRole('dialog', { name: "Yesterday's Answers" });
  await expect(yesterday.locator('.page-date')).toHaveText(formatDay(DAY));
  await expect(yesterday.locator('.yesterday-summary')).toContainText(`You found 2 of ${PUZZLE.answers.length} words`);
  await expect(yesterday.locator('.answers-list li')).toHaveCount(PUZZLE.answers.length);
  await expect(yesterday.locator('.answers-list li.found')).toHaveText([...found].sort());
  await expect(yesterday.locator('.answers-list li.pangram').first()).toHaveText(PUZZLE.pangrams[0]);
  await shot(page, '09-yesterday');
  await yesterday.getByRole('button', { name: 'Back to puzzle' }).click();

  await page.getByRole('button', { name: 'Statistics' }).click();
  await expect(page.locator('.stat-value').first()).toHaveText('1');
  await expect(page.locator('.stats-today-detail')).toHaveText('No words found yet today.');
});

test('imported NYT stats carry over without double counting today', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Import' }).click();

  const form = page.locator('.import-form');
  await form.getByLabel('Puzzles played').fill('412');
  await form.getByLabel('Words found').fill('13250');
  await form.getByLabel('Pangrams found').fill('520');
  await form.getByLabel('Genius').fill('200');
  await form.getByLabel('Queen Bee').fill('31');
  await form.getByLabel('Longest word').fill('Nationalization');
  await expect(form.getByLabel(/include today's puzzle/)).toBeChecked();
  await shot(page, '10-import');
  await form.getByRole('button', { name: 'Import' }).click();
  await expect(page.getByText('Stats imported')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  // Today was already counted in the imported numbers, so words found here don't change them.
  await enter(page, fourLetter[0]);
  await page.getByRole('button', { name: 'Statistics' }).click();
  const stats = page.getByRole('dialog', { name: 'Statistics' });
  await expect(stats.locator('.stat-value')).toHaveText(['412', '13,250', '520', '200', '31']);
  await expect(stats.locator('.stats-longest-word')).toHaveText('nationalization (15 letters)');
  await stats.getByRole('button', { name: 'Back to puzzle' }).click();

  // Rejects impossible numbers.
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Import' }).click();
  await form.getByLabel('Queen Bee').fill('300');
  await form.getByRole('button', { name: 'Import' }).click();
  await expect(form.getByRole('alert')).toHaveText(/cannot be more than Genius/);
});

test('settings switch the theme, and How to Play explains the rules', async ({ page }) => {
  await open(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('switch', { name: 'Dark Theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  // Saved across reloads, with no dark flash first.
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: 'How to Play' }).click();
  const help = page.getByRole('dialog', { name: 'How to Play' });
  await expect(help).toContainText('Words must include the center letter.');
  await expect(help).toContainText('These are worth 7 extra points!');
  await shot(page, '11-help-light');

  // Keys are ignored while a page is open.
  await page.keyboard.type(fourLetter[0]);
  await page.keyboard.press('Escape');
  await expect(help).toHaveCount(0);
  await expect(input(page)).toHaveText('');
});

test('in the iOS home-screen app the header clears the status bar blur', async ({ page }) => {
  await open(page);
  await expect(page.locator('html')).not.toHaveAttribute('data-standalone');
  expect((await page.locator('.header').boundingBox())!.y).toBe(0);

  // Simulate launching from the iPhone home screen.
  await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'standalone', { get: () => true }));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-standalone', 'ios');
  expect((await page.locator('.header').boundingBox())!.y).toBe(40);

  // The whole game still fits on screen, and full-screen pages keep their close button clear too.
  const actions = (await page.locator('.hive-actions').boundingBox())!;
  expect(actions.y + actions.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.getByRole('button', { name: 'How to Play' }).click();
  expect((await page.getByRole('button', { name: 'Close' }).boundingBox())!.y).toBeGreaterThanOrEqual(40);
});

test('fits small and large screens', async ({ page }) => {
  for (const size of [
    { width: 320, height: 568 },
    { width: 1280, height: 800 },
  ]) {
    await page.setViewportSize(size);
    await open(page);
    const actions = (await page.locator('.hive-actions').boundingBox())!;
    expect(actions.y + actions.height).toBeLessThanOrEqual(size.height);
    const header = (await page.locator('.header-icons').boundingBox())!;
    expect(header.x + header.width).toBeLessThanOrEqual(size.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width);
    await shot(page, `12-${size.width}`);
  }
});
