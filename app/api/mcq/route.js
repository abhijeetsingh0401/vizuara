import OpenAI from 'openai';

const OpenAI_Key = process.env.OpenAI_Key;

export async function POST(request) {
    try {

        const body = await request.json();
        const {questionText, gradeLevel, questionTypes, numberOfQuestions, hardQuestions, mediumQuestions, easyQuestions } = body;

        const result = await generateQuestions(questionText, gradeLevel, questionTypes, numberOfQuestions, hardQuestions, mediumQuestions, easyQuestions, OpenAI_Key);
        if (result) {
            console.log("RESULTS:", result)
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

async function generateQuestions(transcript, gradeLevel, questionType, numQuestions, hardQuestions, mediumQuestions, easyQuestions, openaiApiKey) {
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
;