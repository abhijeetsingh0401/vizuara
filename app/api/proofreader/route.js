import OpenAI from 'openai';

const OpenAI_Key = process.env.OpenAI_Key;

export async function POST(request) {
    try {
        const body = await request.json();
        const { originalText } = body;

        const result = await generateProofread(originalText, OpenAI_Key);
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

async function generateProofreadPrompt(text) {
    const prompt = `Please proofread the following text for grammar, spelling, and punctuation errors. Make any necessary corrections:

Text: ${text}`;

    return prompt;
}

async function generateProofread(text, openaiApiKey) {
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const proofreadPrompt = await generateProofreadPrompt(text);

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: proofreadPrompt }],
        });

        const proofreadText = response.choices[0].message.content.trim();
        console.log("Proofread Text:", proofreadText);

        return proofreadText;
    } catch (error) {
        console.error('Error generating proofread text:', error);
        return null;
    }
}
