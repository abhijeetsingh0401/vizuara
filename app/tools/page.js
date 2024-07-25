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
        description: "Text Dependent Question",
        url: "/tools/worksheet-generator"
    },
    {
        icon: "/text-dependent-question.svg",
        title: "MCQ Generator",
        description: "Text Dependent Question",
        url: "/tools/mcq"
    },
    {
        icon: "/text-summarizer.svg",
        title: "Text summarizer",
        description: "Text Dependent Question",
        url: "/tools/summarizer"
    },
    {
        icon: "/rewrite.svg",
        title: "Text Rewriter",
        description: "Text Rewrite",
        url: "/tools/rewrite"
    },
    {
        icon: "/proofreader.svg",
        title: "Proof Read",
        description: "Proof Read",
        url: "/tools/proofreader"
    },
    {
        icon: "/planner.svg",
        title: "Lesson Plan",
        description: "Translate Text",
        url: "/tools/planner"
    },
    {
        icon: "/report-card.svg",
        title: "Report Card",
        description: "Translate Text",
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