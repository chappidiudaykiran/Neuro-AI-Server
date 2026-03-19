const fs = require('fs');
const path = require('path');

const lines = fs.readFileSync(path.join(__dirname, 'playlist_dump.jsonl'), 'utf-16le')
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try { return JSON.parse(line); } catch (e) { return null; }
    })
    .filter(Boolean);

const videos = lines.map(item => ({
    title: item.title,
    youtubeId: item.id,
    duration: Math.round((item.duration || 600) / 60) // default 10 minutes if duration is missing
}));

fs.writeFileSync(path.join(__dirname, 'utils/dsa_videos.json'), JSON.stringify(videos, null, 2));
console.log(`Successfully saved ${videos.length} videos`);
