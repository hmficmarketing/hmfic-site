import sharp from 'sharp';
import { resolve } from 'node:path';

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="100%" height="6" fill="#c45a2c"/>

  <!-- Eyebrow -->
  <text x="600" y="100" font-family="monospace" font-size="16" letter-spacing="3" fill="#888" text-anchor="middle">
    HMFIC / BUILD LOG · № 001
  </text>

  <!-- Divider line -->
  <line x1="200" y1="130" x2="1000" y2="130" stroke="#333" stroke-width="1"/>

  <!-- Headline line 1 -->
  <text x="600" y="230" font-family="Georgia, serif" font-size="68" font-weight="500" fill="#f5f0eb" letter-spacing="-2" text-anchor="middle">
    Rebuilding MFP's
  </text>

  <!-- Headline line 2 -->
  <text x="600" y="316" font-family="Georgia, serif" font-size="68" font-weight="500" fill="#f5f0eb" letter-spacing="-2" text-anchor="middle">
    Shopify from zero.
  </text>
  <rect x="490" y="324" width="280" height="5" fill="#c45a2c"/>

  <!-- Subhead -->
  <text x="600" y="410" font-family="Georgia, serif" font-size="24" fill="#999" letter-spacing="0" text-anchor="middle">
    A full storefront rebuild and an AI content engine
  </text>
  <text x="600" y="446" font-family="Georgia, serif" font-size="24" fill="#999" letter-spacing="0" text-anchor="middle">
    that produced weeks of assets in under a week.
  </text>

  <!-- Bottom bar -->
  <rect x="0" y="560" width="100%" height="70" fill="#111"/>
  <text x="600" y="602" font-family="monospace" font-size="15" letter-spacing="2" fill="#666" text-anchor="middle">
    HMFICMARKETING.COM
  </text>
</svg>
`;

const outPath = resolve('public/og/mfp.png');
await sharp(Buffer.from(svg)).png({ quality: 90 }).toFile(outPath);
console.log(`Generated: ${outPath}`);
