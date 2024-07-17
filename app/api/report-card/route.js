import OpenAI from 'openai';
const OpenAI_Key = process.env.OpenAI_Key;
const openai = new OpenAI({ apiKey: OpenAI_Key });

export async function POST(request) {
    const { gradeLevel, studentPronouns, strengths, growths } = await request.json();

    try {
        const prompt = generateStrengthsWeaknessesPrompt({ gradeLevel, studentPronouns, strengths, growths });
        const evaluation = await getEvaluationFromOpenAI(prompt);

        return new Response(JSON.stringify(evaluation), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Error generating evaluation:", error);
        return new Response(JSON.stringify({ error: 'Failed to generate evaluation' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export const generateStrengthsWeaknessesPrompt = ({ gradeLevel, studentPronouns, strengths, growths }) => {
    return `
      Generate a detailed evaluation for a student in the following details:
      
      Grade Level: ${gradeLevel}
      Student Pronouns: ${studentPronouns}
      Strengths: ${strengths}
      Areas for Growth: ${growths}
      
      Format:
      {
        "Strength": "StrengthContent",
        "Weakness": "WeaknessContent"
      }
    `;
};

export const getEvaluationFromOpenAI = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });

        const evaluation = response.choices[0].message.content.trim();
        console.log("Generated Evaluation:", evaluation);

        return JSON.parse(evaluation);
    } catch (error) {
        console.error('Error generating evaluation:', error);
        throw error;
    }
};
