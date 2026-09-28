import fs from 'node:fs/promises';
import sharp from 'sharp';

const paths = [
  'images/cloud-2-full.png', 'images/cloud-1-cropped.png',
  'images/cloud-gradient.png', 'images/mist-gradient.png',
  'bonanza/map/world-relief.jpg', 'bonanza/logo.png',
];
const report = [];
for (const path of paths) {
  const out = path.replace(/\.(png|jpg)$/, '.webp');
  await sharp(`public/${path}`).webp(path.includes('logo') ? {lossless:true} : {quality:88, alphaQuality:100, effort:6}).toFile(`public/${out}`);
  report.push({source:path, output:out, before:(await fs.stat(`public/${path}`)).size, after:(await fs.stat(`public/${out}`)).size});
}
await fs.writeFile('docs/media-optimization.json', JSON.stringify(report, null, 2));
console.log(report);
