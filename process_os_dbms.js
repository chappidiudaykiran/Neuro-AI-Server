const fs = require('fs');
const path = require('path');
const https = require('https');

function parseDump(inFile, outFile) {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, inFile), 'utf-16le');
    const lines = rawData.split('\n').filter(l => l.trim()).map(l => {
      try { return JSON.parse(l); } catch (e) { return null; }
    }).filter(Boolean);

    const videos = lines.map(item => ({
        title: item.title,
        youtubeId: item.id,
        duration: Math.round((item.duration || 600) / 60)
    }));
    const p = path.join(__dirname, 'utils', outFile);
    fs.writeFileSync(p, JSON.stringify(videos, null, 2));
    console.log(`Parsed ${videos.length} videos to ${outFile}`);
  } catch(e) {
    console.log("Error parsing dummy", e);
  }
}

function fixPlaylist(url, jsonFile) {
  return new Promise((resolve) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d+=c);
      res.on('end', () => {
        const regex = /"videoId":"([^"]+)"/g;
        let match;
        const ids = new Set();
        while ((match = regex.exec(d)) !== null) {
          if (match[1].length === 11) ids.add(match[1]);
        }
        const firstId = Array.from(ids)[0];

        if(!firstId) {
          console.log(`Failed to find ID for ${jsonFile}`);
          return resolve();
        }

        https.get(`https://www.youtube.com/watch?v=${firstId}`, r2 => {
          let d2 = '';
          r2.on('data', c => d2+=c);
          r2.on('end', () => {
             let titleMatch = d2.match(/<title>(.*?) - YouTube<\/title>/);
             let title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&') : "Intro";

             const p = path.join(__dirname, 'utils', jsonFile);
             let videos = JSON.parse(fs.readFileSync(p, 'utf-8'));
             
             if (videos[0].youtubeId !== firstId) {
               videos.unshift({ title, youtubeId: firstId, duration: 10 });
               fs.writeFileSync(p, JSON.stringify(videos, null, 2));
               console.log(`Prepended to ${jsonFile}: ${title}`);
             } else {
               console.log(`${jsonFile} is already correct.`);
             }
             resolve();
          })
        });
      });
    });
  });
}

async function run() {
  parseDump('os_dump.jsonl', 'os_videos.json');
  parseDump('dbms_dump.jsonl', 'dbms_videos.json');

  await fixPlaylist('https://www.youtube.com/playlist?list=PLDzeHZWIZsTr3nwuTegHLa2qlI81QweYG', 'os_videos.json');
  await fixPlaylist('https://www.youtube.com/playlist?list=PLDzeHZWIZsTpukecmA2p5rhHM14bl2dHU', 'dbms_videos.json');
}

run();
