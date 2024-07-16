import OpenAI from 'openai';

const OpenAI_Key = process.env.OpenAI_Key;

export async function POST(request) {
    try {

        const body = await request.json();

        const { originalText, rewriteText, pdfText } = body;

        console.log(originalText, rewriteText, pdfText);

        const result = await generateRewrite(originalText, rewriteText, pdfText, OpenAI_Key);
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

async function generateRewritePrompt(originalText, rewriteText, pdfText) {
    let prompt = `Rewrite the following texts in the requested way:
Original Text: ${originalText}
Rewrite Text: ${rewriteText}`;

    if (pdfText) {
        prompt += `\nPDF Text: ${pdfText}`;
    }

    return prompt;
}

async function generateRewrite(originalText, rewriteText, pdfText, openaiApiKey) {
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const rewritePrompt = await generateRewritePrompt(originalText, rewriteText, pdfText);

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: rewritePrompt }],
        });

        const rewrittenText = response.choices[0].message.content.trim();
        console.log("Generated Rewrite:", rewrittenText);

        return rewrittenText;
    } catch (error) {
        console.error('Error generating rewrite:', error);
        return null;
    }
}