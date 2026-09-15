"use client";

/**
 * Global Error Boundary
 * 
 * Catches errors thrown in any route segment below.
 * Must be a Client Component (Next.js requirement).
 */

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in development
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="text-slate-600">
            An unexpected error occurred. Please try again.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-400 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}