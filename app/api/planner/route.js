import OpenAI from 'openai';
const OpenAI_Key = process.env.OpenAI_Key;
const openai = new OpenAI({ apiKey: OpenAI_Key });

export async function POST(request) {

    const { gradeLevel, content, additionalContext, alignedStandard } = await request.json();
    console.log(gradeLevel, content, additionalContext, alignedStandard)

    try {
        const prompt = generateLessonPlanPrompt({ gradeLevel, content, additionalContext, alignedStandard });
        console.log("PROMPT:", prompt)
        const lessonPlan = await getLessonPlanFromOpenAI(prompt);
        return new Response(JSON.stringify(lessonPlan), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
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
  
      Format: json
      {
        "Title": "TitleContent",
        "Objective": "ObjectiveContent",
        "Assessment": ["AssessmentContent1", "AssessmentContent2", ...],
        "Key Points": ["Keypoint1", "Keypoint2", "Keypoint3", ...],
        "Opening": ["OpeningContent1", "OpeningContent2", "OpeningContent3", ...],
        "Introduction to New Material": ["IntroductionToNewMaterialContent1", "IntroductionToNewMaterialContent2", ...],
        "Guided Practice": ["GuidedPracticeContent1", "GuidedPracticeContent2", ...],
        "Independent Practice": ["IndependentPracticeContent1", "IndependentPracticeContent2", ...],
        "Closing": ["ClosingContent1", "ClosingContent2", ...],
        "Extension Activity": ["ExtensionActivityContent1", "ExtensionActivityContent2", ...],
        "Homework": ["HomeworkContent1", "HomeworkContent2", ...],
        "Standards Addressed": ["StandardsAddressedContent1", "StandardsAddressedContent2", ...]
      }
    `;
};


export const getLessonPlanFromOpenAI = async (prompt) => {

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" },
        });

        let summary = response.choices[0].message.content.trim();
        console.log("Generated Plan BEFORE TRIMEED:", summary);

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

        console.log("Generated Plan:", summary);

        return JSON.parse(summary);
    } catch (error) {
        console.error('Error generating lesson plan:', error);
        return null;
    }
};
