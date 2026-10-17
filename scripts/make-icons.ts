// Renders the PNG app icons from an SVG with Playwright's Chromium. Run once: npx tsx scripts/make-icons.ts
import { chromium } from '@playwright/test';

// A hive of flat-topped hexagons: yellow center, white outer cells.
function hive(size: number, gap: number, cx: number, cy: number): string {
  const h = (size * Math.sqrt(3)) / 2;
  const step = h + gap;
  const dx = step * Math.cos(Math.PI / 6);
  const centres: [number, number][] = [[0, 0], [-dx, -step / 2], [0, -step], [dx, -step / 2], [dx, step / 2], [0, step], [-dx, step / 2]];
  return centres
    .map(([x, y], i) => {
      const px = cx + x;
      const py = cy + y;
      const pts = [[-size / 2, 0], [-size / 4, -h / 2], [size / 4, -h / 2], [size / 2, 0], [size / 4, h / 2], [-size / 4, h / 2]]
        .map(([a, b]) => `${(px + a).toFixed(2)},${(py + b).toFixed(2)}`)
        .join(' ');
      return `<polygon points="${pts}" fill="${i === 0 ? '#f7da21' : '#ffffff'}"/>`;
    })
    .join('');
}

// Full-bleed square (iOS rounds the corners itself); the hive is kept inside the maskable safe zone.
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#121213"/>${hive(22, 2.4, 50, 50)}
</svg>`;

const sizes: Record<string, number> = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180 };

const browser = await chromium.launch();
for (const [file, size] of Object.entries(sizes)) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${iconSvg}`);
  await page.screenshot({ path: `public/${file}` });
  await page.close();
}
await browser.close();
