const https = require('https');
https.get('https://www.youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH', res => {
  let d = '';
  res.on('data', c => d+=c);
  res.on('end', () => {
    // Find all video IDs
    const regex = /"videoId":"([^"]+)"/g;
    let match;
    const ids = new Set();
    while ((match = regex.exec(d)) !== null) {
      if (match[1].length === 11) ids.add(match[1]);
    }
    console.log(Array.from(ids).slice(0, 5));
  });
});
