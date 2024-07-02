'use client'
import Image from "next/image";
import Card from "@components/Card"
import AuthCheck from "@components/AuthCheck";
import Link from 'next/link';

export default function Home() {

  return (
    <div style={{ padding: "16px" }}>
      <AuthCheck
        fallback={
          <Link href="/enter">
            <button>Login</button>
          </Link>
        }
      >
      </AuthCheck>
      <h1>Welcome to the Home Page</h1>
      <Card
        icon="/youtube.svg" // path to the icon in the public directory
        title="Card Title"
        description="This is a description of the card."
        isNew={true}
        isFav={true}
        url="/youtube" // replace with the actual URL you want to redirect to
      />
      <Card
        icon="/text-dependent-question.svg" // path to the icon in the public directory
        title="Text Question"
        description="Text Dependent Question"
        isNew={true}
        isFav={true}
        url="/text-dependent-question" // replace with the actual URL you want to redirect to
      />

      <Link href="/history">
        <button>History</button>
      </Link>
    </div>
  );
}