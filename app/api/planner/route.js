import OpenAI from 'openai';
const OpenAI_Key = process.env.OpenAI_Key;
const openai = new OpenAI({ apiKey: OpenAI_Key });

export async function POST(request) {

    const { gradeLevel, content, additionalContext, alignedStandard } = request.body;

    try {
        const prompt = generateLessonPlanPrompt({ gradeLevel, content, additionalContext, alignedStandard });
        const lessonPlan = await getLessonPlanFromOpenAI(prompt);
        console.log(typeof lessonPlan)
        return new Response(JSON.stringify(lessonPlan), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Error generating lesson plan:", error);
        return new Response(JSON.stringify({ error: 'Failed to generate lesson plan' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export const generateLessonPlanPrompt = ({ gradeLevel, content, additionalContext, alignedStandard }) => {
    return `
      Generate a lesson plan for the following details:
  
      Grade Level: ${gradeLevel}
      Topic/Standard: ${content}
      ${additionalContext ? `Additional Context: ${additionalContext}` : ""}
      ${alignedStandard ? `Standards Set to Align to: ${alignedStandard}` : ""}
  
      Format:
      {
        "Title": "TitleContent",
        "Objective": "ObjectiveContent",
        "Assessment": "AssessmentContent",
        "Key Points": "KeyPointsContent",
        "Opening": "OpeningContent",
        "Introduction to New Material": "IntroductionToNewMaterialContent",
        "Guided Practice": "GuidedPracticeContent",
        "Independent Practice": "IndependentPracticeContent",
        "Closing": "ClosingContent",
        "Extension Activity": "ExtensionActivityContent",
        "Homework": "HomeworkContent",
        "Standards Addressed": "StandardsAddressedContent"
      }
    `;
  };

export const getLessonPlanFromOpenAI = async (prompt) => {

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });

        const summary = response.choices[0].message.content.trim();
        console.log("Generated Plan:", summary);

        return JSON.parse(summary);
    } catch (error) {
        console.error('Error generating lesson plan:', error);
        return null;
    }
};
