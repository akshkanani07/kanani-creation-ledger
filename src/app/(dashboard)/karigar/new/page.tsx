/**
 * New Karigar Page
 * 
 * Add new karigar form.
 * 
 * FEATURES:
 * - Back button
 * - Page header
 * - Karigar form (create mode)
 * 
 * USAGE:
 *   http://localhost:3000/karigar/new
 */

import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { KarigarForm } from "@/features/karigar/components/karigar-form";
import { ROUTES } from "@/config/constants";

export const metadata = {
  title: "Add Karigar | Kanani Creation Ledger",
  description: "Add a new karigar to your ledger",
};

export default function NewKarigarPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* ═══════════════════════════════════════════ */}
      {/* BACK BUTTON */}
      {/* ═══════════════════════════════════════════ */}
      <Link
        href={ROUTES.KARIGAR}
        className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to Karigars
      </Link>

      {/* ═══════════════════════════════════════════ */}
      {/* PAGE HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide uppercase">
          <UserPlus className="w-3 h-3" />
          New Karigar
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Add Karigar
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Register a new textile worker. You can start recording their work,
          payments, and advances right away.
        </p>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* FORM */}
      {/* ═══════════════════════════════════════════ */}
      <KarigarForm mode="create" />
    </div>
  );
}