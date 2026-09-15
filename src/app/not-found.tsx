/**
 * 404 Not Found Page
 * 
 * Shown when a route doesn't match.
 * Server Component by default.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-slate-900">404</h1>
          <h2 className="text-xl font-semibold text-slate-700">
            Page not found
          </h2>
          <p className="text-slate-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}