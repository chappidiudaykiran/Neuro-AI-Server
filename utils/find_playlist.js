const { Innertube, UniversalCache } = require('youtubei.js');

async function run() {
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const results = await yt.search('Striver A2Z DSA Course', { type: 'playlist' });
    console.log(results.playlists.slice(0, 5).map(p => p.id + " : " + (p.title?.text || "No title")));
  } catch(e) { console.error(e); }
}
run();
