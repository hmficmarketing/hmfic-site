import sharp from 'sharp';
import { resolve } from 'node:path';

const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <text x="256" y="380" font-family="Arial, Helvetica, sans-serif" font-size="400" font-weight="900" fill="#c0392b" text-anchor="middle" letter-spacing="-20">
    H
  </text>
</svg>
`;

// Generate PNG favicon (works in all modern browsers)
await sharp(Buffer.from(svg))
  .resize(32, 32)
  .png()
  .toFile(resolve('public/favicon.png'));

// Generate larger apple-touch-icon
await sharp(Buffer.from(svg))
  .resize(180, 180)
  .png()
  .toFile(resolve('public/apple-touch-icon.png'));

// Generate ICO-compatible 32x32 PNG (rename to .ico — browsers accept PNG-in-ICO)
await sharp(Buffer.from(svg))
  .resize(32, 32)
  .png()
  .toFile(resolve('public/favicon.ico'));

console.log('Generated: favicon.ico, favicon.png, apple-touch-icon.png');
