import ToolCard from "@components/ToolCard";

const tools = [
    {
        icon: "/youtube.svg",
        title: "Youtube Generator",
        description: "Generate guiding questions aligned to a YouTube video.",
        url: "/tools/youtube"
    },
    {
        icon: "/text-dependent-question.svg",
        title: "Text Question",
        description: "Generate text-dependent questions for students based on any text that you input.",
        url: "/tools/text-dependent-question"
    },
    {
        icon: "/text-dependent-question.svg",
        title: "Worksheet Generator",
        description: "Generate a worksheet based on any topic or text.",
        url: "/tools/worksheet-generator"
    },
    {
        icon: "/text-dependent-question.svg",
        title: "MCQ Generator",
        description: "Create a multiple choice assessment based on any topic, standard(s), or criteria!",
        url: "/tools/mcq"
    },
    {
        icon: "/text-summarizer.svg",
        title: "Text summarizer",
        description: "Take any text and summarize it in whatever length you choose.",
        url: "/tools/summarizer"
    },
    {
        icon: "/rewrite.svg",
        title: "Text Rewriter",
        description: "Take any text and rewrite it with custom criteria however you’d like!",
        url: "/tools/rewrite"
    },
    {
        icon: "/proofreader.svg",
        title: "Proof Read",
        description: "Take any text and have it proofread, correcting grammar, spelling, punctuation and adding clarity.",
        url: "/tools/proofreader"
    },
    {
        icon: "/planner.svg",
        title: "Lesson Plan",
        description: "Generate a lesson plan for a topic or objective you’re teaching.",
        url: "/tools/planner"
    },
    {
        icon: "/report-card.svg",
        title: "Report Card",
        description: "Generate report card comments with a student's strengths and areas for growth.",
        url: "/tools/report-card"
    },
    {
        icon: "/essay.png",
        title: "Essay Grader",
        description: "Grade Essay",
        url: "/tools/essay-grader"
    },
    {
        icon: "/ppt.png",
        title: "PPT Generator",
        description: "Generate PPT",
        url: "/tools/ppt-generator"
    }
];

export default function Tools() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, index) => (
          <ToolCard
            key={index}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            isNew={tool.isNew}
            url={tool.url}
          />
        ))}
      </div>
    );
  }