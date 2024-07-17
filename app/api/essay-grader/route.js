import OpenAI from 'openai';
const OpenAI_Key = process.env.OpenAI_Key;
const openai = new OpenAI({ apiKey: OpenAI_Key });

export async function POST(request) {
    const { gradeLevel, essay } = await request.json();

    const prompt = generatePrompt(gradeLevel, essay);

    try {
        const evaluation = await getEvaluationFromOpenAI(prompt);

        return new Response(JSON.stringify(evaluation), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to generate evaluation' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

}

// Function to generate the prompt
function generatePrompt(gradeLevel, essay) {
    return `
        Please grade the following essay written by a ${gradeLevel} student based on grammar and sentence coherence. The total marks are 10.
        **Essay:**
        ${essay}
        **Please provide detailed feedback in the following format:**
        {
            "mistakes": "...", // List specific grammatical errors and sentence coherence issues
            "totalMarks": ..., // Provide a score out of 10
            "strengths": "...", // Highlight the strengths of the essay
            "weaknesses": "...", // Point out the weaknesses of the essay
            "improvements": "..." // Suggest areas for improvement with examples and tips
        }
        **Examples of feedback:**
        {
            "totalMarks": 5,
            "mistakes": [
                "Incorrect verb tense usage (e.g., goes instead of went, bring instead of brought).",
                "Lack of proper punctuation and capitalization.",
                "Subject-verb agreement errors (e.g., 'My sister bring' instead of 'My sister brought').",
                "Unclear sentence structures affecting readability."
            ],
            "strengths": "The student has good ideas and a clear topic. They show enthusiasm for their vacation, which makes the essay engaging.",
            "weaknesses": "Frequent grammar errors and a lack of sentence variety. The essay also lacks proper punctuation and capitalization in several places.",
            "improvements": [
                "The student should focus on:",
                "1. Proper verb tense usage.",
                "2. Correct sentence structures to enhance clarity.",
                "3. Using a variety of sentences to make the essay more engaging.",
                "4. Proper punctuation and capitalization."
            ]
        }
        Use specific examples from the essay to illustrate each point.
    `;
}

// Function to call the OpenAI API with the prompt
async function getEvaluationFromOpenAI(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });

        const essayFeedback = response.choices[0].message.content.trim();
        console.log("essayFeedback:", essayFeedback)
        return JSON.parse(essayFeedback);
    } catch (error) {
        console.error('Error generating questions:', error);
        return null;
    }
}