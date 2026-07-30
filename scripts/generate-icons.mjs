// Generates the extension icons (16/32/48/128) from the master KeyStash logo
// at images/keystash-icon.png. Run with: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = resolve(__dirname, '../images/keystash-icon.png');
const outDir = resolve(__dirname, '../public/icons');
mkdirSync(outDir, { recursive: true });

const sizes = [16, 32, 48, 128];

await Promise.all(
  sizes.map(async (size) => {
    await sharp(source)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(resolve(outDir, `icon-${size}.png`));
    console.log(`icons/icon-${size}.png`);
  }),
);
