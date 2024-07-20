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
      Generate a detailed evaluation for a student with the following details:
      
      Grade Level: ${gradeLevel}
      Student Pronouns: ${studentPronouns}
      Strengths: ${strengths}
      Areas for Growth: ${growths}
      
      Format:
      {
        "Title": "Title for storage",
        "Strength": {
          "subTitle": "Areas of Strength",
          "array": [
            "StrengthContent1",
            "StrengthContent2",
            ...
          ]
        },
        "Weakness": {
          "subTitle": "Areas for Growth",
          "array": [
            "WeaknessContent1",
            "WeaknessContent2",
            ...
          ]
        }
      }
    `;
};

export const getEvaluationFromOpenAI = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
        });

        let summary = response.choices[0].message.content.trim();
        
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
        console.error('Error generating evaluation:', error);
        throw error;
    }
};
