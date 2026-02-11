import { Suspense } from "react";
import ScoreResults from "./ScoreResults";

export default function ScorePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🏠</div>
          <p className="text-muted-foreground">Looking up your home...</p>
        </div>
      </div>
    }>
      <ScoreResults />
    </Suspense>
  );
}
