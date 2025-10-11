import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

// USAGE:
//   npm run tile -- ./path/to/your/huge-image.jpg "© History Discovery — Demo"
// OUTPUT:
//   public/tiles/sample.dzi and public/tiles/sample_files/*

const src = process.argv[2];
const mark = process.argv[3] ?? '© Demo — Not for distribution';
if (!src) { console.error('Provide source image path.'); process.exit(1); }

const outDir = path.join(process.cwd(), 'public', 'tiles');
await fs.promises.mkdir(outDir, { recursive: true });
const base = 'sample'; // change if you want multiple items later

// Create a subtle diagonal SVG pattern for watermark
const svg = (w, h) => `\
<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
  <defs>
    <pattern id='wm' patternUnits='userSpaceOnUse' width='480' height='200' patternTransform='rotate(-18)'>
      <text x='0' y='120' font-family='Segoe UI, Roboto, Arial' font-size='64' fill='rgba(255,255,255,0.12)'>${mark}</text>
    </pattern>
  </defs>
  <rect width='100%' height='100%' fill='url(#wm)' />
</svg>`;

const meta = await sharp(src).metadata();
const { width, height } = meta;
if (!width || !height) throw new Error('Cannot read image size');

const overlay = Buffer.from(svg(width, height));

// Burn watermark, then emit DZI tiles
await sharp(src)
  .composite([{ input: overlay }])
  .toFormat('jpeg', { quality: 90 })
  .tile({ layout: 'dz', size: 256, overlap: 1 })
  .toFile(path.join(outDir, `${base}.dzi`));

console.log('✓ DZI tiles created at public/tiles');
