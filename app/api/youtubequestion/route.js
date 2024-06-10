import { google } from 'googleapis';
import { getSubtitles } from 'youtube-captions-scraper';
import OpenAI from 'openai';
import { parse } from 'url';

const YTAPI_Key = process.env.YTAPI_Key;
const OpenAI_Key = process.env.OpenAI_Key;

export async function POST(request) {
    try {

        const body = await request.json();
        const { gradeLevel, numberOfQuestions, questionTypes, videoIdOrURL, hardQuestions, mediumQuestions, easyQuestions } = body;

        const result = await main(videoIdOrURL, YTAPI_Key, OpenAI_Key, gradeLevel, numberOfQuestions, questionTypes, hardQuestions, mediumQuestions, easyQuestions);
        if (result) {
            return new Response(JSON.stringify(result), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } else {
            return new Response(JSON.stringify({ error: 'Failed to generate questions' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
    } catch (error) {
        console.error('Error in POST handler:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
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

async function checkTranscriptAvailability(videoUrl, apiKey) {
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

async function generateQuestions(transcript, gradeLevel, numQuestions, questionType, openaiApiKey, hardQuestions, mediumQuestions, easyQuestions) {
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const prompt = `
Generate ${numQuestions} ${questionType} questions with correct answers for a ${gradeLevel} grade student based on the following video transcript. The questions should be divided into three categories: ${hardQuestions} hard questions, ${mediumQuestions} medium questions, and ${easyQuestions} easy questions. Provide an explanation for each question and answer. Provide the output in the following JSON format:

[
  {
    "difficulty": "easy",
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct Option",
    "explanation": "Explanation of the correct answer"
  },
  {
    "difficulty": "medium",
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct Option",
    "explanation": "Explanation of the correct answer"
  },
  {
    "difficulty": "hard",
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct Option",
    "explanation": "Explanation of the correct answer"
  }
]

Transcript:
${transcript}
`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });

        const questionsText = response.choices[0].message.content.trim();
        return JSON.parse(questionsText);
    } catch (error) {
        console.error('Error generating questions:', error);
        return null;
    }
}

async function main(videoUrl, youtubeApiKey, openaiApiKey, gradeLevel, numQuestions, questionType, hardQuestions, mediumQuestions, easyQuestions) {
    try {
        const { videoId, captionsAvailable } = await checkTranscriptAvailability(videoUrl, youtubeApiKey);

        if (!videoId) {
            console.error('Invalid video ID');
            return null;
        }

        let transcript = null;

        if (captionsAvailable) {
            transcript = await fetchTranscript(videoId);
        }

        if (!transcript) {
            // Fetch from another source like Deepgram if needed
            console.error('Transcript not available');
            return null;
        }

        return await generateQuestions(transcript, gradeLevel, numQuestions, questionType, openaiApiKey, hardQuestions, mediumQuestions, easyQuestions);
    } catch (error) {
        console.error('Error in main function:', error);
        return null;
    }
}
