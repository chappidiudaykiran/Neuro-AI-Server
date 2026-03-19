const fs = require('fs');
const path = require('path');
const https = require('https');

const p = path.join(__dirname, 'utils/ml_videos.json');
let videos = JSON.parse(fs.readFileSync(p, 'utf-8'));

https.get('https://www.youtube.com/watch?v=ZftI2fEz0Fw', res => {
  let d = '';
  res.on('data', c => d+=c);
  res.on('end', () => {
    let titleMatch = d.match(/<title>(.*?) - YouTube<\/title>/);
    let title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&') : "100 Days of Machine Learning - Intro";
    
    if (videos[0].youtubeId !== 'ZftI2fEz0Fw') {
      videos.unshift({
        title: title,
        youtubeId: "ZftI2fEz0Fw",
        duration: 12
      });
      fs.writeFileSync(p, JSON.stringify(videos, null, 2));
      console.log("Prepended:", title);
    } else {
      console.log("Already present.");
    }
  })
}).on('error', err => console.error(err));
