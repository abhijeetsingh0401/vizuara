import OpenAI from 'openai';

const OpenAI_Key = process.env.OpenAI_Key;
const openai = new OpenAI({ apiKey: OpenAI_Key });

export async function POST(request) {
    try {

        const body = await request.json();
        const { lengthSummary, inputText, pdfText, } = body;

        console.log(lengthSummary, inputText, pdfText);
        const summarizationPrompt = await generateSummarizationPrompt(lengthSummary, inputText);
        const result = await generateSummary(summarizationPrompt);
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
        prompt = `Summarize the following texts into ${lengthSummary} sentences. Ensure the summary is clear and concise, and each point is in a separate sentence:
Text 1: ${JSON.stringify(inputText)}
Text 2: ${JSON.stringify(pdfText)}

The output should be in the following format:
{
  "Title": "Generated Summary Title",
  "OriginalText": {
    "subTitle": "Original Text",
    "array": [${JSON.stringify(inputText)}, ${JSON.stringify(pdfText)}]
  },
  "Summary": {
    "subTitle": "Summary Text",
    "array": []
  }
}`;
    } else if (inputText) {
        prompt = `Summarize the following text into ${lengthSummary} sentences. Ensure the summary is clear and concise, and each point is in a separate sentence: ${JSON.stringify(inputText)}

The output should be in the following format:
{
  "Title": "Generated Summary Title",
  "OriginalText": {
    "subTitle": "Original Text",
    "array": [${JSON.stringify(inputText)}]
  },
  "Summary": {
    "subTitle": "Summary Text",
    "array": []
  }
}`;
    } else if (pdfText) {
        prompt = `Summarize the following PDF content into ${lengthSummary} sentences. Ensure the summary is clear and concise, and each point is in a separate sentence: ${JSON.stringify(pdfText)}

The output should be in the following format:
{
  "Title": "Generated Summary Title",
  "OriginalText": {
    "subTitle": "Original Text",
    "array": [${JSON.stringify(pdfText)}]
  },
  "Summary": {
    "subTitle": "Summary Text",
    "array": []
  }
}`;
    }

    return prompt;
}

async function generateSummary(summarizationPrompt) {

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: summarizationPrompt }],
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
        console.error('Error generating summary:', error);
        return null;
    }
}