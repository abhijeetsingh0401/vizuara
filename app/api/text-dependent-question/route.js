import OpenAI from 'openai';
const OpenAI_Key = process.env.OpenAI_Key;
const openai = new OpenAI({ apiKey: OpenAI_Key });

export async function POST(request) {
    try {

        const body = await request.json();
        const { gradeLevel, numberOfQuestions, questionTypes, hardQuestions, mediumQuestions, easyQuestions, questionText, pdfText } = body;

        console.log(gradeLevel, numberOfQuestions, hardQuestions, mediumQuestions, easyQuestions, questionTypes, questionText, pdfText);

        const prompt = generateQuestionsPrompt(gradeLevel, numberOfQuestions, hardQuestions, mediumQuestions, easyQuestions, questionTypes, questionText,  pdfText);

        const result = await generateQuestions(prompt);
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

function generateQuestionsPrompt(gradeLevel, numberOfQuestions, hardQuestions, mediumQuestions, easyQuestions, questionTypes, questionText, pdfText) {
    let prompt = `
Generate ${numberOfQuestions} ${questionTypes} questions with correct answers for a ${gradeLevel} grade student. The questions should be divided into three categories: ${hardQuestions} hard questions, ${mediumQuestions} medium questions, and ${easyQuestions} easy questions. Provide an explanation for each question and answer. Provide the output in the following JSON format:

Format:
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

Text:
${questionText}`;

    if (pdfText) {
        prompt += `
        
Transcript:
${pdfText}`;
    }

    return prompt;
}


async function generateQuestions(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
        });

        let summary = response.choices[0].message.content.trim();
        console.log(summary)

        if (summary.startsWith('```') && summary.endsWith('```')) {
            console.log("CONTAINS BACK TICKS")
            summary = summary.slice(3, -3).trim();
        }

        // Handle case where JSON is prefixed with "json"
        if (summary.startsWith('json')) {
            console.log("CONTAINS JSON PREFIX")
            summary = summary.slice(4).trim();
        }

        // Remove potential trailing content
        const jsonStartIndex = summary.indexOf('{');
        const jsonEndIndex = summary.lastIndexOf('}');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            summary = summary.slice(jsonStartIndex, jsonEndIndex + 1).trim();
        }

        return JSON.parse(summary);

    } catch (error) {
        console.error('Error generating questions:', error);
        return null;
    }
}