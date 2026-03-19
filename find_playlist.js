const { Innertube, UniversalCache } = require('youtubei.js');

async function run() {
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const results = await yt.search('Striver A2Z DSA Course', { type: 'playlist' });
    
    const mapped = results.playlists.slice(0, 10).map(p => ({
        id: p.id || p.playlist_id || p.endpoint?.payload?.playlistId,
        title: p.title?.text || p.title?.toString() || JSON.stringify(p.title)
    }));
    
    console.dir(mapped, { depth: null });
  } catch(e) { console.error(e); }
}
run();
