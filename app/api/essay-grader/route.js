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
            "Title": "Title based on the Essay Context",
            "totalMarks": {subTitle:"Total Marks", array["10"]} // this is fixed 
             "marks": {
                "subTitle": "Obtained Marks",
                 array[] // "marks": 5 // Example mark, should be dynamically calculated based on the essay, should only contain single element
                },
            "mistakes": {
                "subTitle": "Mistakes",
                "array": [
                    "Incorrect verb tense usage (e.g., goes instead of went, bring instead of brought).",
                    "Lack of proper punctuation and capitalization.",
                    "Subject-verb agreement errors (e.g., 'My sister bring' instead of 'My sister brought').",
                    "Unclear sentence structures affecting readability."
                ]
            },
            "strengths": {
                "subTitle": "Strengths",
                "array": [
                    "The student has good ideas and a clear topic.",
                    "They show enthusiasm for their vacation, which makes the essay engaging."
                ]
            },
            "weaknesses": {
                "subTitle": "Weaknesses",
                "array": [
                    "Frequent grammar errors and a lack of sentence variety.",
                    "The essay also lacks proper punctuation and capitalization in several places."
                ]
            },
            "improvements": {
                "subTitle": "Improvements",
                "array": [
                    "Proper verb tense usage.",
                    "Correct sentence structures to enhance clarity.",
                    "Using a variety of sentences to make the essay more engaging.",
                    "Proper punctuation and capitalization."
                ]
            }
        }
        Use specific examples from the essay to illustrate each point.
    `;
}


// Function to call the OpenAI API with the prompt
async function getEvaluationFromOpenAI(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
        });

        let summary = response.choices[0].message.content.trim();

        console.log("SUMMARY:", summary)
        
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