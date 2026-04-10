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
  <text x="80" y="90" font-family="monospace" font-size="16" letter-spacing="3" fill="#888" text-anchor="start">
    HMFIC / BUILD LOG · ● LIVE · № 001
  </text>

  <!-- Divider line -->
  <line x1="80" y1="120" x2="1120" y2="120" stroke="#333" stroke-width="1"/>

  <!-- Headline line 1 -->
  <text x="80" y="220" font-family="Georgia, serif" font-size="72" font-weight="500" fill="#f5f0eb" letter-spacing="-2">
    Rebuilding MFP's
  </text>

  <!-- Headline line 2 -->
  <text x="80" y="310" font-family="Georgia, serif" font-size="72" font-weight="500" fill="#f5f0eb" letter-spacing="-2">
    Shopify
  </text>

  <!-- Accent underlined word -->
  <text x="340" y="310" font-family="Georgia, serif" font-size="72" font-weight="500" fill="#f5f0eb" letter-spacing="-2">
    from zero.
  </text>
  <rect x="340" y="318" width="340" height="5" fill="#c45a2c"/>

  <!-- Subhead -->
  <text x="80" y="400" font-family="Georgia, serif" font-size="26" fill="#999" letter-spacing="0">
    A full storefront rebuild and an AI content engine
  </text>
  <text x="80" y="438" font-family="Georgia, serif" font-size="26" fill="#999" letter-spacing="0">
    that produced weeks of assets in under a week.
  </text>

  <!-- Bottom bar -->
  <rect x="0" y="560" width="100%" height="70" fill="#111"/>
  <text x="80" y="602" font-family="monospace" font-size="15" letter-spacing="2" fill="#666">
    FILED APR 2026
  </text>
  <text x="1120" y="602" font-family="monospace" font-size="15" letter-spacing="2" fill="#666" text-anchor="end">
    HMFICMARKETING.COM
  </text>
</svg>
`;

const outPath = resolve('public/og/mfp.png');
await sharp(Buffer.from(svg)).png({ quality: 90 }).toFile(outPath);
console.log(`Generated: ${outPath}`);
