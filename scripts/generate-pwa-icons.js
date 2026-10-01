import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const c = crc32(typeAndData);
  chunk.writeUInt32BE(c, 8 + len);
  return chunk;
}

function generatePng(width, height, isMaskable = false) {
  // RGBA raw buffer with 1 filter byte per scanline
  const rowBytes = 1 + width * 4;
  const raw = Buffer.alloc(rowBytes * height);

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = width / 2;

  // Maskable has safe zone padding (central 75% for content)
  const contentRadius = isMaskable ? width * 0.35 : width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    raw[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: Deep Ruby / Burgundy gradient #99281a to #6a1310
      const ny = y / height;
      let r = Math.round(153 * (1 - ny * 0.3) + 20); // ~153 to 110
      let g = Math.round(40 * (1 - ny * 0.4) + 10);  // ~40 to 25
      let b = Math.round(26 * (1 - ny * 0.4) + 15);  // ~26 to 20
      let a = 255;

      // Inner glow / golden circle
      if (Math.abs(dist - contentRadius) < width * 0.02) {
        // Golden ring
        r = 251; g = 191; b = 36;
      } else if (dist < contentRadius) {
        // Cloche / Jewel center glow
        const glow = 1 - (dist / contentRadius);
        r = Math.min(255, Math.round(r + glow * 50));
        g = Math.min(255, Math.round(g + glow * 25));
        b = Math.min(255, Math.round(b + glow * 15));

        // Draw Stylized 'G' logo
        const inGOuter = dist < contentRadius * 0.65 && dist > contentRadius * 0.32;
        const inGBar = dy >= -contentRadius * 0.08 && dy <= contentRadius * 0.08 && dx >= 0 && dx <= contentRadius * 0.55;
        const inGGap = dx > 0 && dy < -contentRadius * 0.08 && dy > -contentRadius * 0.5;

        if ((inGOuter && !inGGap) || inGBar) {
          r = 255; g = 220; b = 130; // Bright Warm Gold
        }

        // Fork / knife accent sparkles
        const isSparkle1 = Math.abs(dx - contentRadius * 0.4) < 4 && Math.abs(dy - contentRadius * 0.4) < 4;
        const isSparkle2 = Math.abs(dx + contentRadius * 0.4) < 4 && Math.abs(dy - contentRadius * 0.4) < 4;
        if (isSparkle1 || isSparkle2) {
          r = 255; g = 255; b = 255;
        }
      }

      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdr = makeChunk('IHDR', ihdrData);
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. 192x192 PNG
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192, false));
console.log('✓ Generated public/pwa-192x192.png');

// 2. 512x512 PNG
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512, false));
console.log('✓ Generated public/pwa-512x512.png');

// 3. Maskable 512x512 PNG (10-15% safe padding)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
console.log('✓ Generated public/pwa-maskable-512x512.png');

// 4. Apple Touch Icon 180x180 PNG (Required by iOS Safari)
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180, false));
console.log('✓ Generated public/apple-touch-icon.png');
