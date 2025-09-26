"use client";

import Link from "next/link";
import { PageLayout, Button } from "../components";

export default function Home() {
  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center -mt-16">
        <div className="max-w-2xl mx-auto text-center px-4">
          <Link href="/get-started">
            <Button variant="primary" size="lg" className="px-12 py-4 text-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
