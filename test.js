const url = require('url');
const  {parse}  = require('url');

// function getVideoIdFromUrl(videoUrl) {
//   const parsedUrl = url.parse(videoUrl, true);
//   let videoId;

//   if (parsedUrl.hostname === 'youtu.be') {
//     videoId = parsedUrl.pathname.slice(1); // Remove leading '/'
//   } else if (parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') {
//     videoId = parsedUrl.query.v;
//   }

//   return videoId;
// }

// Test cases
// console.log(getVideoIdFromUrl('https://youtu.be/D1Ymc311XS8?si=nSkmoDRnXAhoQId4')); // D1Ymc311XS8
// console.log(getVideoIdFromUrl('https://www.youtube.com/watch?v=D1Ymc311XS8')); // D1Ymc311XS8
// console.log(getVideoIdFromUrl('https://youtube.com/watch?v=D1Ymc311XS8')); // D1Ymc311XS8

function normalizeUrl(videoUrl) {
    try {
        const parsedUrl = parse(videoUrl, true);
        let videoId = '';

        if (parsedUrl.hostname === 'youtu.be') {
            videoId = parsedUrl.pathname.substring(1);
            return `https://www.youtube.com/watch?v=${videoId}`;
        } else if (parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') {
            return videoUrl;
        } else {
            throw new Error('Invalid YouTube URL');
        }
    } catch (error) {
        console.error('Error normalizing URL:', error);
        throw new Error('Invalid YouTube URL');
    }
}

function getVideoIdFromUrl(videoUrl) {
    try {
        //const normalizedUrl = normalizeUrl(videoUrl);
        const parsedUrl = parse(videoUrl, true);
        const videoId = parsedUrl.query.v || parsedUrl.pathname.split('/').pop();

        if (!videoId) {
            throw new Error('Invalid video ID');
        }

        return videoId;
    } catch (error) {
        console.error('Error extracting video ID from URL:', error);
        throw new Error('Invalid YouTube URL');
    }
}

console.log(getVideoIdFromUrl('https://youtu.be/D1Ymc311XS8?si=nSkmoDRnXAhoQId4')); // D1Ymc311XS8
console.log(getVideoIdFromUrl('https://www.youtube.com/watch?v=D1Ymc311XS8')); // D1Ymc311XS8
console.log(getVideoIdFromUrl('https://youtube.com/watch?v=D1Ymc311XS8')); // D1Ymc311XS8
