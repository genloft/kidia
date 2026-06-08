import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');

async function convertImages() {
  try {
    const files = fs.readdirSync(publicDir);
    for (const file of files) {
      if (file.endsWith('.png')) {
        const inputPath = path.join(publicDir, file);
        const outputPath = path.join(publicDir, file.replace('.png', '.webp'));
        
        console.log(`Converting ${file}...`);
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
          
        console.log(`Successfully converted ${file} to WebP.`);
      }
    }
    console.log('All images converted!');
  } catch (err) {
    console.error('Error converting images:', err);
  }
}

convertImages();
