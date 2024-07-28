const { google } = require('googleapis');
const { getSubtitles } = require('youtube-captions-scraper');
import { parse } from 'url';
const url = require('url');

export async function POST(request) {
    console.log("INSIDE TRANSCIPT")
    try {

        const { videoIdOrURL, transcriptData } = await request.json();

        const videoId = getVideoIdFromUrl(videoIdOrURL);
        let transcript = null;

        if (videoId && videoId !== null) {
            transcript = await getTranscriptFromScraper(videoId);
        }

        if (!transcript) {
            return new Response(JSON.stringify({ error: 'Transcript Not available or disabled' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        return new Response(JSON.stringify(transcript), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate transcript' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

}

// Fallback function to get video transcript using youtube-captions-scraper
async function getTranscriptFromScraper(videoId) {
    try {
        const subtitles = await getSubtitles({ videoID: videoId, lang: 'en' });
        return subtitles.map(subtitle => subtitle.text).join(' ');
    } catch (error) {
        console.error('Error fetching transcript using scraper:', error);
        return 'No transcript available.';
    }
}

function getVideoIdFromUrl(url) {
    if (typeof url !== 'string') return null;

    // Regular expressions for different YouTube URL formats
    const regexPatterns = [
        // youtu.be URLs
        /^https?:\/\/youtu\.be\/([^\/\?\&]+)/,
        // youtube.com/watch?v= URLs
        /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:[^&]+&)*v=([^&]+)/,
        // youtube.com/embed/ URLs
        /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([^\/\?\&]+)/,
        // youtube.com/v/ URLs
        /^https?:\/\/(?:www\.)?youtube\.com\/v\/([^\/\?\&]+)/,
        // youtube.com/shorts/ URLs
        /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([^\/\?\&]+)/
    ];

    for (const pattern of regexPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}