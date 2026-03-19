const fs = require('fs');
const path = require('path');

let rawData = '';
try {
  rawData = fs.readFileSync(path.join(__dirname, 'all_videos.jsonl'), 'utf-16le');
} catch (err) {
  console.error("Failed to read all_videos.jsonl", err);
  process.exit(1);
}

const lines = rawData.split('\n')
    .filter(line => line.trim())
    .map(line => {
      try { return JSON.parse(line); } catch (e) { return null; }
    })
    .filter(Boolean);

// Reverse to maintain logical progression (older videos first, which are usually basics)
const videos = lines.reverse().map(item => ({
    title: item.title,
    youtubeId: item.id,
    duration: Math.round((item.duration || 600) / 60)
}));

fs.writeFileSync(path.join(__dirname, 'utils/dsa_videos.json'), JSON.stringify(videos, null, 2));
console.log(`Successfully saved ${videos.length} videos!`);
