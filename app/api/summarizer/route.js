import OpenAI from 'openai';

const OpenAI_Key = process.env.OpenAI_Key;

export async function POST(request) {
    try {

        const body = await request.json();
        const { lengthSummary, inputText, pdfText, } = body;

        console.log(lengthSummary, inputText, pdfText);

        const result = await generateSummary(lengthSummary, inputText, pdfText, OpenAI_Key);
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

async function generateSummarizationPrompt(lengthSummary, inputText, pdfText) {
    let prompt = '';

    if (inputText && pdfText) {
        prompt = `Summarize the following texts into ${lengthSummary}:
Text 1: ${inputText}
Text 2: ${pdfText}`;
    } else if (inputText) {
        prompt = `Summarize the following text into ${lengthSummary}: ${inputText}`;
    } else if (pdfText) {
        prompt = `Summarize the following PDF content into ${lengthSummary}: ${pdfText}`;
    }

    return prompt;
}

async function generateSummary(lengthSummary, inputText, pdfText, openaiApiKey) {
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const summarizationPrompt = await generateSummarizationPrompt(lengthSummary, inputText, pdfText);

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: summarizationPrompt }],
        });

        const summary = response.choices[0].message.content.trim();
        console.log("Generated Summary:", summary);

        return summary;
    } catch (error) {
        console.error('Error generating summary:', error);
        return null;
    }
}