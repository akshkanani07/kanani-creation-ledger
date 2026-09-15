/**
 * Site Configuration
 * 
 * Application-wide metadata — single source of truth.
 * Name, URLs, routes — બધું અહીંથી Import થશે.
 */

export const siteConfig = {
  name: "Kanani Creation Ledger",
  shortName: "KC Ledger",
  description: "Internal Ledger Management System for Kanani Creation",

  company: {
    name: "Kanani Creation",
    industry: "Textile Manufacturing",
  },

  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  authRoutes: {
    login: "/login",
    verify: "/login/verify",
  },

  protectedRoutes: {
    dashboard: "/",
    karigar: "/karigar",
    transactions: "/transactions",
    ledger: "/ledger",
    reports: "/reports",
    settings: "/settings",
  },

  links: {
    support: "mailto:support@kananicreation.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;