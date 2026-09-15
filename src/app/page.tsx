/**
 * Root Page — Session-Based Redirect
 * 
 * FLOW:
 * - Session હોય → /dashboard (Protected Area)
 * - Session ન હોય → /login
 * 
 * WHY REDIRECT (not render):
 * - Root URL is a "gateway"
 * - All real pages live under route groups
 * - Clean separation: (auth) + (dashboard)
 */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function RootPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // No session → Login
  if (!session) {
    redirect("/login");
  }

  // Session exists → Dashboard
  redirect("/dashboard");
}