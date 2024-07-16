'use client'
import Card from "@components/Card"
import Link from 'next/link';

export default function Home() {

    return (
        <div class="container mx-auto p-4">
            <h1>Welcome to the Home Page</h1>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" >
                <Card
                    icon="/youtube.svg" // path to the icon in the public directory
                    title="Youtube Generator"
                    description="This is a description of the card."
                    isNew={true}
                    isFav={true}
                    url="/tools/youtube" // replace with the actual URL you want to redirect to
                />
                <Card
                    icon="/text-dependent-question.svg" // path to the icon in the public directory
                    title="Text Question"
                    description="Text Dependent Question"
                    isNew={true}
                    isFav={true}
                    url="/tools/text-dependent-question" // replace with the actual URL you want to redirect to
                />
                <Card
                    icon="/text-dependent-question.svg" // path to the icon in the public directory
                    title="Worksheet Generator"
                    description="Text Dependent Question"
                    isNew={true}
                    isFav={true}
                    url="/tools/worksheet-generator" // replace with the actual URL you want to redirect to
                />
                <Card
                    icon="/text-dependent-question.svg" // path to the icon in the public directory
                    title="MCQ Generator"
                    description="Text Dependent Question"
                    isNew={true}
                    isFav={true}
                    url="/tools/mcq" // replace with the actual URL you want to redirect to
                />
                <Card
                    icon="/text-summarizer.svg" // path to the icon in the public directory
                    title="Text summarizer"
                    description="Text Dependent Question"
                    isNew={true}
                    isFav={true}
                    url="/tools/summarizer" // replace with the actual URL you want to redirect to
                />
                <Card
                    icon="/rewrite.svg" // path to the icon in the public directory
                    title="Text Rewriter"
                    description="Text Rewrite"
                    isNew={true}
                    isFav={true}
                    url="/tools/rewrite" // replace with the actual URL you want to redirect to
                />
                <Card
                    icon="/proofreader.svg" // path to the icon in the public directory
                    title="Proof Read"
                    description="Proof Read"
                    isNew={true}
                    isFav={true}
                    url="/tools/proofreader" // replace with the actual URL you want to redirect to
                />
                <Card
                    icon="/translator.svg" // path to the icon in the public directory
                    title="Translate Text"
                    description="Translate Text"
                    isNew={true}
                    isFav={true}
                    url="/tools/translator" // replace with the actual URL you want to redirect to
                />
            </div>
            <Link href="/history">
                <button>History</button>
            </Link>
        </div>
    );
}