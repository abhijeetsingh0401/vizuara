const { google } = require('googleapis');
const { getSubtitles } = require('youtube-captions-scraper');
import { parse } from 'url';
const url = require('url');

export async function POST(request) {
    console.log("INSIDE TRANSCIPT")
    try {

        const {videoIdOrURL} = await request.json();
        console.log("Received body:", videoIdOrURL);

        const { videoId, captionsAvailable } = await checkTranscriptAvailability(videoIdOrURL);

        let transcript = null;

        console.log(videoIdOrURL, videoId, captionsAvailable)

        if (captionsAvailable) {
            transcript = await fetchTranscript(videoId);
        }

        console.log("TRANSCRIPT:", transcript)
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
        const normalizedUrl = normalizeUrl(videoUrl);
        const parsedUrl = parse(normalizedUrl, true);
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

async function checkTranscriptAvailability(videoUrl) {
    const apiKey = process.env.YTAPI_KEY;

    const videoId = getVideoIdFromUrl(videoUrl);

    if (!videoId) {
        console.error('Invalid video URL');
        return { videoId: null, captionsAvailable: false };
    }

    const youtubeClient = google.youtube({
        version: 'v3',
        auth: apiKey,
    });

    try {
        const response = await youtubeClient.captions.list({
            part: 'snippet',
            videoId,
        });

        return {
            videoId,
            captionsAvailable: response.data.items && response.data.items.length > 0,
        };
    } catch (error) {
        console.error('Error fetching captions:', error);
        return { videoId, captionsAvailable: false };
    }
}

async function fetchTranscript(videoId) {
    try {
        const subtitles = await getSubtitles({
            videoID: videoId,
            lang: 'en',
        });
        return subtitles.map(subtitle => subtitle.text).join(' ');
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return null;
    }
}
