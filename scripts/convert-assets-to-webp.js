import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.join(__dirname, '../src/assets');

async function convertAssets() {
  try {
    const files = fs.readdirSync(assetsDir);
    for (const file of files) {
      if (file.endsWith('.png')) {
        const inputPath = path.join(assetsDir, file);
        const outputPath = path.join(assetsDir, file.replace('.png', '.webp'));
        
        console.log(`Converting ${file}...`);
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
          
        console.log(`Successfully converted ${file} to WebP.`);
      }
    }
  } catch (err) {
    console.error('Error converting images:', err);
  }
}

convertAssets();
