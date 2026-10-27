import fs from 'node:fs';
import zlib from 'node:zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeChunk(type, data) {
  const len = data ? data.length : 0;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  if (data) data.copy(chunk, 8);
  const crcData = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(crcData), 8 + len);
  return chunk;
}

function generatePNG(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rawBytes = Buffer.alloc((width * 4 + 1) * height);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      // Calculate distance from center
      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = size * 0.45;

      // Brand colors: Navy #0a2540 (10, 37, 64), Sky #0284c7 (2, 132, 199), Light Blue #38bdf8 (56, 189, 248), White (255,255,255)
      let r = 10;
      let g = 37;
      let b = 64;
      let a = 255;

      // Draw rounded card / circle background
      if (dist <= radius || isMaskable) {
        // Subtle vertical gradient
        const t = y / height;
        r = Math.round(10 + t * 4);
        g = Math.round(37 + t * 10);
        b = Math.round(64 + t * 20);

        // Center T letter and node network
        const relX = (x - cx) / (size * 0.5);
        const relY = (y - cy) / (size * 0.5);

        // T top horizontal bar
        if (relY >= -0.55 && relY <= -0.32 && relX >= -0.65 && relX <= 0.65) {
          r = 56; g = 189; b = 248; // Cyan / Sky
        }
        // T vertical stem
        else if (relY >= -0.55 && relY <= 0.45 && relX >= -0.12 && relX <= 0.12) {
          r = 255; g = 255; b = 255; // White
        }
        // Left node (Taxcent Consulting)
        else if (Math.hypot(relX - (-0.45), relY - 0.25) <= 0.14) {
          r = 2; g = 132; b = 199;
        }
        // Right node (Quantum Learning)
        else if (Math.hypot(relX - 0.45, relY - 0.25) <= 0.14) {
          r = 2; g = 132; b = 199;
        }
        // Bottom node (CSC Ranabari)
        else if (Math.hypot(relX - 0.0, relY - 0.55) <= 0.12) {
          r = 56; g = 189; b = 248;
        }
      } else {
        a = 0; // Transparent corner for regular icons
      }

      rawBytes[offset++] = r;
      rawBytes[offset++] = g;
      rawBytes[offset++] = b;
      rawBytes[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawBytes);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = writeChunk('IHDR', ihdr);
  const idatChunk = writeChunk('IDAT', compressedData);
  const iendChunk = writeChunk('IEND', null);

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/icon-192x192.png', generatePNG(192, false));
fs.writeFileSync('public/icon-512x512.png', generatePNG(512, false));
fs.writeFileSync('public/icon-maskable-512x512.png', generatePNG(512, true));
fs.writeFileSync('public/apple-touch-icon.png', generatePNG(180, true));
fs.writeFileSync('public/favicon.ico', generatePNG(64, false));

console.log('Successfully generated all PWA icons!');
