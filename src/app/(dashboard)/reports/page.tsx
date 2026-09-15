"use client";

/**
 * Reports Page — Client Component
 * 
 * FEATURES:
 * - URL params for pre-filled filters (from Ledger)
 * - Auto-trigger export via ?action=pdf|excel|whatsapp
 * - Live data preview
 * - PDF, Excel, WhatsApp exports
 */

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FileText, Loader2, BarChart3 } from "lucide-react";

import { ReportFilters } from "@/features/report/components/report-filters";
import { ReportSummary } from "@/features/report/components/report-summary";
import { getReportData } from "@/features/report/actions/get-report-data";
import { generateReportPdf } from "@/features/report/actions/generate-pdf";
import { generateReportExcel } from "@/features/report/actions/generate-excel";
import type {
  ReportFilters as ReportFiltersType,
  ReportFormat,
  ReportData,
  ReportScope,
} from "@/features/report/types";

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function getStartOfYear(): Date {
  const d = new Date();
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE — Suspense Wrapper
// ═══════════════════════════════════════════════════════════

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto p-12 text-center">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading reports...</p>
        </div>
      }
    >
      <ReportsPageContent />
    </Suspense>
  );
}

// ═══════════════════════════════════════════════════════════
// CONTENT COMPONENT
// ═══════════════════════════════════════════════════════════

function ReportsPageContent() {
  const searchParams = useSearchParams();

  // Initial filters — from URL or defaults
  const [filters, setFilters] = useState<ReportFiltersType>(() => {
    const scope = (searchParams.get("scope") ?? "karigar") as ReportScope;
    const karigarId = searchParams.get("karigarId") ?? undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    return {
      scope,
      karigarId,
      dateFrom: from ? new Date(from) : getStartOfYear(),
      dateTo: to ? new Date(to) : new Date(),
    };
  });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ReportFormat | null>(
    null
  );

  // Auto-trigger action from URL
  const actionFromUrl = searchParams.get("action") as ReportFormat | null;

  // ═══════════════════════════════════════════
  // FETCH DATA
  // ═══════════════════════════════════════════
  const fetchData = useCallback(async () => {
    if (filters.scope === "karigar" && !filters.karigarId) {
      setReportData(null);
      return;
    }

    setIsLoading(true);

    try {
      const result = await getReportData(filters);

      if (result.success) {
        setReportData(result.data);
      } else {
        setReportData(null);
        if (filters.karigarId || filters.scope !== "karigar") {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error("[ReportsPage] Fetch error:", error);
      toast.error("Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ═══════════════════════════════════════════
  // AUTO-TRIGGER EXPORT FROM URL
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (
      actionFromUrl &&
      reportData &&
      !isExporting &&
      !isLoading
    ) {
      const timer = setTimeout(() => {
        handleExport(actionFromUrl);
      }, 500);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportData, actionFromUrl, isLoading]);

  // ═══════════════════════════════════════════
  // EXPORT HANDLER
  // ═══════════════════════════════════════════
  const handleExport = async (format: ReportFormat) => {
    if (filters.scope === "karigar" && !filters.karigarId) {
      toast.error("Please select a karigar first");
      return;
    }

    setIsExporting(true);
    setExportingFormat(format);

    try {
      if (format === "whatsapp") {
        await handleWhatsAppExport();
        return;
      }

      const generator =
        format === "pdf" ? generateReportPdf : generateReportExcel;

      const result = await generator(filters);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const { base64, filename, mimeType } = result.data;

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        `${format === "pdf" ? "PDF" : "Excel"} downloaded successfully`
      );
    } catch (error) {
      console.error("[handleExport] Error:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  // ═══════════════════════════════════════════
  // WHATSAPP EXPORT
  // ═══════════════════════════════════════════
  const handleWhatsAppExport = async () => {
    if (!reportData || reportData.scope !== "karigar") {
      toast.error("Invalid report data");
      return;
    }

    const { karigar, metadata } = reportData;

    const balanceAbs = Math.abs(karigar.closingBalance);
    const isCredit = karigar.closingBalance > 0;
    const isSettled = balanceAbs < 0.01;

    const balanceText = isSettled
      ? "Settled ✅"
      : `Rs. ${formatNumber(balanceAbs)} ${isCredit ? "Cr" : "Dr"}`;

    const message = [
      `🧵 *${metadata.companyName}*`,
      `_Ledger Statement_`,
      ``,
      `👤 *Karigar:* ${karigar.name}`,
      `📞 ${karigar.phone}`,
      `📅 *Period:* ${metadata.period.label}`,
      ``,
      `━━━━━━━━━━━━━━━━━━`,
      `📊 *Summary*`,
      `━━━━━━━━━━━━━━━━━━`,
      `• Opening: Rs. ${formatNumber(Math.abs(karigar.openingBalance))}${karigar.openingBalance > 0 ? " Cr" : ""}`,
      `• Work: Rs. ${formatNumber(karigar.totalCredit)} Cr`,
      `• Payments: Rs. ${formatNumber(karigar.totalDebit)} Dr`,
      `• *Balance: ${balanceText}*`,
      ``,
      `📝 ${karigar.transactionCount} total transactions`,
      ``,
      `━━━━━━━━━━━━━━━━━━`,
      `_Generated by Kanani Creation Ledger_`,
    ].join("\n");

    const phone = karigar.phone.replace(/\D/g, "");
    const whatsappPhone = phone.length === 10 ? `91${phone}` : phone;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    toast.success("WhatsApp opened with report");
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* PAGE HEADER */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide uppercase">
          <BarChart3 className="w-3 h-3" />
          Reports
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Reports & Exports
        </h1>
        <p className="text-sm text-slate-500">
          Generate PDF, Excel, or WhatsApp reports
        </p>
      </div>

      {/* FILTERS */}
      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onExport={handleExport}
        isExporting={isExporting}
        exportingFormat={exportingFormat}
      />

      {/* LOADING */}
      {isLoading && (
        <div className="rounded-2xl bg-white border border-slate-200/60 p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading report data...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading &&
        !reportData &&
        filters.scope === "karigar" &&
        !filters.karigarId && (
          <div className="rounded-2xl bg-white border border-slate-200/60 p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-slate-400" strokeWidth={2} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Select a karigar
            </h3>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Choose a karigar from the dropdown above to generate a statement
              report.
            </p>
          </div>
        )}

      {/* REPORT PREVIEW */}
      {!isLoading && reportData && <ReportSummary data={reportData} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function formatNumber(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}