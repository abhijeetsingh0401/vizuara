'use client'
import Card from "@components/Card"
import Link from 'next/link';

export default function Home() {

    return (
        <div style={{ padding: "16px" }}>
            <h1>Welcome to the Home Page</h1>
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
            <Link href="/history">
                <button>History</button>
            </Link>
        </div>
    );
}