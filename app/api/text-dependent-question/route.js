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

export async function POST(request) {
    try {

        const body = await request.json();
        const { gradeLevel, numberOfQuestions, questionTypes, hardQuestions, mediumQuestions, easyQuestions, questionText, pdfText } = body;

        console.log(gradeLevel, numberOfQuestions, hardQuestions, mediumQuestions, easyQuestions, questionTypes, questionText, pdfText);

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
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });

        let questionsText = response.choices[0].message.content.trim();
        const startIndex = questionsText.indexOf('[');
        const endIndex = questionsText.lastIndexOf(']') + 1;

        if (startIndex === -1 || endIndex === -1) {
            throw new Error("JSON array not found in the response");
        }

        // Extract and clean the JSON array
        questionsText = questionsText.substring(startIndex, endIndex);
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
