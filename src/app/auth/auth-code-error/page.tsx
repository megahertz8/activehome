"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AuthCodeError() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Sign-in cancelled</h1>
        <p className="text-muted-foreground mb-8">
          No worries — your data is safe. Try again whenever you're ready.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-lg font-semibold"
        >
          ← Back to Home
        </Button>
      </div>
    </main>
  );
}
