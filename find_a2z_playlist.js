const fs = require('fs');

const raw = fs.readFileSync('channel_playlists.jsonl', 'utf-16le');
const lines = raw.split('\n').filter(l => l.trim()).map(l => {
  try { return JSON.parse(l); } catch(e) { return null; }
}).filter(Boolean);

console.log('Total Playlists:', lines.length);

const a2z = lines.filter(p => p.title && p.title.toLowerCase().includes('a2z'));
if (a2z.length > 0) {
  console.log('A2Z Playlists:');
  a2z.forEach(p => console.log(`${p.title} - ${p.id}`));
} else {
  console.log('No playlists found with "A2Z" in title. Looking for "DSA":');
  lines.filter(p => p.title && p.title.toLowerCase().includes('dsa')).forEach(p => console.log(`${p.title} - ${p.id}`));
}
