import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

async function downloadIcons() {
  const iconUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png';
  try {
    console.log('Downloading high-resolution PWA icons from:', iconUrl);
    const response = await fetch(iconUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch icon: status ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Ensure directories exist
    mkdirSync(resolve('public'), { recursive: true });

    // Write primary files
    writeFileSync(resolve('public/icon-512.png'), buffer);
    writeFileSync(resolve('public/icon-192.png'), buffer);
    console.log('Successfully wrote local icon-192.png and icon-512.png inside /public directory.');
  } catch (error) {
    console.error('Error downloading PWA icons:', error);
    process.exit(1);
  }
}

downloadIcons();
