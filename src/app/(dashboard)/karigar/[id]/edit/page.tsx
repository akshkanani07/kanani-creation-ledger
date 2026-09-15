/**
 * Edit Karigar Page
 * 
 * Pre-filled form with existing karigar data.
 * 
 * FEATURES:
 * - Back button → Detail page
 * - Page header
 * - Karigar form (edit mode with initial data)
 * - 404 if karigar not found
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KarigarForm } from "@/features/karigar/components/karigar-form";
import { ROUTES } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ id: string }>;
}

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function EditKarigarPage({ params }: PageProps) {
  const { id } = await params;

  // ═══════════════════════════════════════════
  // FETCH KARIGAR
  // ═══════════════════════════════════════════
  const karigar = await prisma.karigar.findFirst({
    where: { id, deletedAt: null },
  });

  if (!karigar) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* ═══════════════════════════════════════════ */}
      {/* BACK BUTTON */}
      {/* ═══════════════════════════════════════════ */}
      <Link
        href={ROUTES.KARIGAR_DETAIL(karigar.id)}
        className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to {karigar.name}
      </Link>

      {/* ═══════════════════════════════════════════ */}
      {/* PAGE HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide uppercase">
          <Pencil className="w-3 h-3" />
          Edit Karigar
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Edit {karigar.name}
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Update karigar information. Changes are logged for audit trail.
        </p>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* FORM */}
      {/* ═══════════════════════════════════════════ */}
      <KarigarForm mode="edit" initialData={karigar} />
    </div>
  );
}