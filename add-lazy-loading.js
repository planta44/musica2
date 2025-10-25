// Quick script to add lazy loading to images
// Run: node add-lazy-loading.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  'frontend/src/pages/Home.jsx',
  'frontend/src/pages/About.jsx',
  'frontend/src/pages/Videos.jsx',
  'frontend/src/pages/Music.jsx',
  'frontend/src/pages/Merch.jsx',
  'frontend/src/components/AudioPlayer.jsx',
  'frontend/src/components/MusicPlayer.jsx',
  'frontend/src/components/admin/AdminAbout.jsx',
  'frontend/src/components/admin/AdminGallery.jsx',
  'frontend/src/components/admin/AdminLiveEvents.jsx',
  'frontend/src/components/admin/AdminMerch.jsx',
  'frontend/src/components/admin/AdminMusic.jsx',
  'frontend/src/components/admin/AdminVideos.jsx'
];

let totalChanges = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipped: ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // Add loading="lazy" to <img> tags that don't have it
  const imgRegex = /<img\s+([^>]*?)(?<!loading=["'][^"']*["'])\s*>/gi;
  content = content.replace(imgRegex, (match, attrs) => {
    // Skip if already has loading attribute
    if (attrs.includes('loading=')) return match;
    
    changes++;
    totalChanges++;
    
    // Add loading="lazy" before the closing >
    return `<img ${attrs.trim()} loading="lazy">`;
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file} (${changes} images)`);
  } else {
    console.log(`⏭️  Skipped: ${file} (no changes needed)`);
  }
});

console.log(`\n🎉 Done! Added lazy loading to ${totalChanges} images.`);
console.log('\n📝 Next steps:');
console.log('1. Review the changes: git diff');
console.log('2. Test locally: npm run dev');
console.log('3. Commit and push: git add . && git commit -m "Add lazy loading to images" && git push');
