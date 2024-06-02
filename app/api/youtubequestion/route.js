const YTAPI_Key = process.env.YTAPI_Key;
const OpenAI_Key = process.env.OpenAI_Key;

const { google } = require('googleapis');
const { getSubtitles } = require('youtube-captions-scraper');
const url = require('url');
const OpenAI = require('openai');

export async function POST(request) {
    const { gradeLevel, numberOfQuestions, questionTypes, videoIdOrURL } = await request.json();
    
    console.log(gradeLevel, numberOfQuestions, questionTypes, videoIdOrURL);
    const result = await main(videoIdOrURL,YTAPI_Key,OpenAI_Key,gradeLevel,numberOfQuestions,questionTypes);
    // console.log(YTAPI_Key, OpenAI_Key)
    // const result = null;
    // Send the generated questions as a response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

// Function to extract video ID from URL
function getVideoIdFromUrl(videoUrl) {
    console.log("URL:", videoUrl)
    const parsedUrl = url.parse(videoUrl, true);
    const videoId = parsedUrl.query.v;
    return videoId;
}

// Function to check transcript availability
async function checkTranscriptAvailability(videoUrl, apiKey) {
    const videoId = getVideoIdFromUrl(videoUrl);
    if (!videoId) {
        console.error('Invalid video URL');
        return false;
    }

    // Create YouTube API client
    const youtubeClient = google.youtube({
        version: 'v3',
        auth: apiKey,
    });

    try {
        // Make API request to list captions
        const response = await youtubeClient.captions.list({
            part: 'snippet',
            videoId: videoId,
        });

        const captionsAvailable = response.data.items && response.data.items.length > 0;
        return { videoId, captionsAvailable };
    } catch (error) {
        console.error('Error fetching captions:', error);
        return null;
    }
}

// Function to fetch transcript (including auto-generated captions)
async function fetchTranscript(videoId) {
    try {
        const subtitles = await getSubtitles({
            videoID: videoId,
            lang: 'en', // Specify language code if necessary
        });
        return subtitles.map(subtitle => subtitle.text).join(' ');
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return null;
    }
}

// Function to generate questions using OpenAI API
async function generateQuestions(transcript, gradeLevel, numQuestions, questionType, openaiApiKey) {
    const openai = new OpenAI({
        apiKey: openaiApiKey // This is the default and can be omitted
    });

    const prompt = `
Generate ${numQuestions} ${questionType} questions with correct answers for a ${gradeLevel} grade student based on the following video transcript. Provide the output in the following JSON format:

[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct Option"
  },
  ...
]

Transcript:
${transcript}
`;


    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });

        // console.log("response:", response)
        // console.log("response.choices[0]:", response.choices[0])
        //console.log("response.choices[0].message:", response.choices[0].message)
        //console.log("response.choices[0].message.content:", response.choices[0].message.content)

        const questionsText = response.choices[0].message.content.trim();
        //console.log("QuestionText:", questionsText)
        // const formattedQuestions = formatQuestionsToJson(questionsText)
        // console.log("formattedQuestions:", formattedQuestions)
        console.log("JSON.PARSE",JSON.parse(questionsText))
        
        return JSON.parse(questionsText)
        //return formatQuestionsToJson(response.choices[0].message.content);
    } catch (error) {
        console.error('Error generating questions:', error);
        return null;
    }

}

// Main function to check availability and fetch transcript if available
async function main(videoUrl, youtubeApiKey, openaiApiKey, gradeLevel, numQuestions, questionType) {
    const result = await checkTranscriptAvailability(videoUrl, youtubeApiKey);
    let transcript = null;

    if (result.captionsAvailable || result.videoId) {
        // Try fetching available captions
        transcript = await fetchTranscript(result.videoId);
    }

    if (transcript == null) {
        //get from deepgram
    }

    if (transcript) {
        const questions = await generateQuestions(transcript, gradeLevel, numQuestions, questionType, openaiApiKey);
        console.log("QUESTION:",questions)
        return questions;
    } else {
        console.log('Failed to fetch transcript.');
    }

    return null;
}
