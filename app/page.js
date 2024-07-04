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
        icon="/tools.svg" // path to the icon in the public directory
        title="All Tools "
        description="This is a description of the card."
        isNew={true}
        isFav={true}
        url="/tools" // replace with the actual URL you want to redirect to
      />
      <Link href="/history">
        <button>History</button>
      </Link>
    </div>
  );
}