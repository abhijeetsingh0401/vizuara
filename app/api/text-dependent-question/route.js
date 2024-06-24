import { google } from 'googleapis';
import { getSubtitles } from 'youtube-captions-scraper';
import OpenAI from 'openai';
import { parse } from 'url';
const { createClient } = require('@supabase/supabase-js');
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { string } from 'prop-types';

const OpenAI_Key = process.env.OpenAI_Key;

const supabaseUrl = 'https://qweybwlsnjkgrabqdeov.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZXlid2xzbmprZ3JhYnFkZW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4MTAxOTUsImV4cCI6MjAzMjM4NjE5NX0.g2N-K16BCzJUvQEhK2rI8exFjFKPPh1CVgHjiaTyi9E";
const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadFile(filePath) {
    try {
        const { data, error } = await supabase
            .storage
            .from('pdf')
            .download(filePath);

        if (error) {
            throw error;
        }

        return data;

        console.log(`File downloaded successfully to ${savePath}`);
    } catch (error) {
        console.error('Error downloading PDF:', error);
    }
}

export async function POST(request) {
    try {

        const body = await request.json();
        const { gradeLevel, numberOfQuestions, questionTypes, hardQuestions, mediumQuestions, easyQuestions, questionText, pdfText } = body;

        console.log(gradeLevel, numberOfQuestions, hardQuestions, mediumQuestions, easyQuestions, questionTypes, questionText, pdfText);

        // const fileResponse = await downloadFile("keph108.pdf");
        // if (typeof fileResponse === 'string') {
        //     throw fileResponse;
        // }

        // // Convert Blob to Buffer if necessary
        // const arrayBuffer = await fileResponse.arrayBuffer();
        // const buffer = Buffer.from(arrayBuffer);
        // const pdfContent = await pdf(buffer);
        // const content = pdfContent?.text;

        console.log("CONTENTS:", pdfText )

        const result = await generateQuestions(pdfText, gradeLevel, numberOfQuestions, questionTypes, hardQuestions, mediumQuestions, easyQuestions, OpenAI_Key);
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

async function generateQuestions(transcript, gradeLevel, numQuestions, questionType, hardQuestions, mediumQuestions, easyQuestions, openaiApiKey) {
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
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
        });

        let questionsText = response.choices[0].message.content.trim();
        questionsText = questionsText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');

        console.log("Native TEXT:", response.choices[0].message.content);

        console.log("Trimmerd Question:", questionsText);

        const questionParse =  JSON.parse(questionsText);
        console.log("PARSED QUESTION TEXT:", questionParse)

        return questionParse;
    } catch (error) {
        console.error('Error generating questions:', error);
        return null;
    }
}
