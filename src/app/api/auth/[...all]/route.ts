/**
 * Better Auth API Route Handler
 * 
 * Catch-all route for all /api/auth/* requests.
 * Better Auth handles everything internally:
 * - POST /api/auth/sign-in/magic-link
 * - GET  /api/auth/magic-link/verify
 * - POST /api/auth/sign-out
 * - GET  /api/auth/get-session
 * - etc.
 * 
 * WHY THIS FILE EXISTS:
 * Better Auth needs a single entry point to handle all auth requests.
 * This route delegates to Better Auth's built-in handler.
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);