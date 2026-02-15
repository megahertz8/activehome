"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthCodeErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get('error');

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Sign-in failed</h1>
        <p className="text-muted-foreground mb-4">
          No worries — your data is safe. Try again whenever you're ready.
        </p>
        {errorMsg && (
          <p className="text-sm text-red-400 mb-4 bg-red-500/10 rounded p-3">
            {errorMsg}
          </p>
        )}
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

export default function AuthCodeError() {
  return (
    <Suspense>
      <AuthCodeErrorContent />
    </Suspense>
  );
}
