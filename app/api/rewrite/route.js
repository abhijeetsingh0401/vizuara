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
Original Text: ${originalText}`;

    if (pdfText) {
        prompt += `\nPDF Text: ${pdfText}`;
    }

    prompt += `\nRewrite Text: ${rewriteText}\nFormat the response as JSON with the following structure:
{
  "Title": "Title Based on Context of the originalText",
  "OriginalText": { "subTitle": "Original Text", "array": ["Sentence 1", "Sentence 2", ...] },
  "ReWrite": { "subTitle": "Rewritten Text", "array": ["Rewritten Sentence 1", "Rewritten Sentence 2", ...] }
}`;
    return prompt;
}

async function generateRewrite(originalText, rewriteText, pdfText, openaiApiKey) {
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const rewritePrompt = await generateRewritePrompt(originalText, rewriteText, pdfText);

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: rewritePrompt }],
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
        console.error('Error generating rewrite:', error);
        return null;
    }
}