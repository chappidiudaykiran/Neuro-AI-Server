const { Innertube, UniversalCache } = require('youtubei.js');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    console.log('Fetching playlist...');
    let playlist = await yt.getPlaylist('PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BZA');
    
    let allItems = [...playlist.items];
    
    let current = playlist;
    while(current.has_continuation) {
      console.log('Fetching continuation...');
      current = await current.getContinuation();
      allItems.push(...current.items);
    }
    
    console.log(`Fetched ${allItems.length} videos. Preparing JSON...`);
    
    const formatted = allItems.map(item => {
      let durationMins = 10;
      if (item.duration && item.duration.text) {
          let parts = item.duration.text.split(':').map(Number);
          if (parts.length === 3) {
              durationMins = Math.round(parts[0]*60 + parts[1] + parts[2]/60);
          } else if (parts.length === 2) {
              durationMins = Math.round(parts[0] + parts[1]/60);
          } else if (parts.length === 1) {
              durationMins = Math.round(parts[0]);
          }
      }
      return {
         title: item.title.text,
         youtubeId: item.id,
         duration: durationMins
      };
    });
    
    const outputPath = path.join(__dirname, 'dsa_videos.json');
    fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2));
    console.log(`Successfully saved ${formatted.length} videos to ${outputPath}.`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

run();
