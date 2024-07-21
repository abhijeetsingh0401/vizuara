import OpenAI from 'openai';
const OpenAI_Key = process.env.OpenAI_Key;
const openai = new OpenAI({ apiKey: OpenAI_Key });

export async function POST(request) {
    const { topic } = await request.json();

    const prompt = generatePPTContentPrompt(topic);

    try {
        const content = await getPPTContentFromOpenAI(prompt);
        console.log("PPT GENERATOR:", content)
        return new Response(JSON.stringify(content), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Error generating PPT content:", error);
        return new Response(JSON.stringify({ error: 'Failed to generate PPT content' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export const generatePPTContentPrompt = (topic) => {
    return `
      Generate a detailed presentation outline on the following topic: ${topic}
      
      Format:
      {
        "Title": "Presentation Title",
        "Slides1":{
            "subTitle": "Slide 1 Title",
            "array": [Slide 1 Content, Slide 1 Content, Slide 1 Content, ... , ...]}
          "Slides2":{
            "subTitle": "Slide 2 Title",
            "array": [Slide 2 Content, Slide 2 Content, Slide 2 Content, ... , ...]},
          "Slides3":{
            "subTitle": "Slide 3 Title",
            "array": [Slide 3 Content, Slide 3 Content, Slide 3 Content, ... , ...]}
          ...
      }
    `;
};

export const getPPTContentFromOpenAI = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
        });

        const content = response.choices[0].message.content.trim();
        console.log("Generated PPT Content:", content);

        return JSON.parse(content);
    } catch (error) {
        console.error('Error generating PPT content:', error);
        throw error;
    }
};