import OpenAI from 'openai';

const OpenAI_Key = process.env.OpenAI_Key;
const openai = new OpenAI({ apiKey: OpenAI_Key });

export async function POST(request) {
    try {
        const body = await request.json();
        const { originalText } = body;

        const prompt =  generateProofreadPrompt(originalText);
        const result = await generateProofread(prompt);
        if (result) {
            console.log("RESULTS:", result);
            return new Response(JSON.stringify(result), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } else {
            return new Response(JSON.stringify({ error: 'Failed to proofread text' }), {
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

function generateProofreadPrompt(text) {
    const prompt = `Please proofread the following text for grammar, spelling, and punctuation errors. Make any necessary corrections. Also, list the changes made along with explanations for each change:

Text: ${text}

Format: JSON
{
  "Title": "Title for the input text context",
  "OriginalText": {
    "subTitle": "Original Text",
    "array": ["Original text line 1", "Original text line 2", ...]
  },
  "Correct": {
    "subTitle": "Proofread Text",
    "array": ["Proofread text line 1", "Proofread text line 2", ...]
  },
  "Changes": {
    "subTitle": "Changes Made",
    "array": ["Change 1 explanation", "Change 2 explanation", ...]
  }
}`;

    return prompt;
}

async function generateProofread(proofreadPrompt) {

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: proofreadPrompt }],
            response_format: { type: "json_object" },
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
        console.error('Error generating proofread text:', error);
        return null;
    }
}
