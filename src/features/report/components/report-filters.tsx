"use client";

/**
 * Report Filters — Scope + Karigar + Date Range
 * 
 * FEATURES:
 * - Report scope selector (karigar / all-karigars / by-type)
 * - Karigar dropdown (conditional for karigar scope)
 * - Date range picker (from / to)
 * - Quick preset buttons (this month, last 30 days, etc.)
 * - Export buttons (PDF, Excel, WhatsApp)
 * - Reset filters
 * 
 * USAGE:
 *   <ReportFilters
 *     filters={filters}
 *     onChange={handleFilterChange}
 *     onExport={handleExport}
 *   />
 */

import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  FileText,
  PieChart,
  Download,
  FileSpreadsheet,
  MessageCircle,
  Loader2,
  X,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ROUTES, TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS } from "@/config/constants";
import { getKarigars } from "@/features/karigar/actions/get-karigars";
import type { ReportFilters as ReportFiltersType, ReportScope, ReportFormat, DateRangePreset } from "../types";
import type { KarigarOption } from "@/features/karigar/types";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onChange: (filters: ReportFiltersType) => void;
  onExport: (format: ReportFormat) => void;
  isExporting: boolean;
  exportingFormat: ReportFormat | null;
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const SCOPES: Array<{
  value: ReportScope;
  label: string;
  description: string;
  icon: typeof Users;
}> = [
  {
    value: "karigar",
    label: "Karigar Statement",
    description: "Full ledger for one karigar",
    icon: User,
  },
  {
    value: "all-karigars",
    label: "All Karigars",
    description: "Summary of all karigars",
    icon: Users,
  },
  {
    value: "by-type",
    label: "By Type",
    description: "Type-wise breakdown",
    icon: PieChart,
  },
];

const DATE_PRESETS: Array<{ value: DateRangePreset; label: string }> = [
  { value: "this-month", label: "This Month" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "this-quarter", label: "This Quarter" },
  { value: "this-year", label: "This Year" },
  { value: "all-time", label: "All Time" },
];

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function ReportFilters({
  filters,
  onChange,
  onExport,
  isExporting,
  exportingFormat,
}: ReportFiltersProps) {
  const [karigars, setKarigars] = useState<KarigarOption[]>([]);
  const [loadingKarigars, setLoadingKarigars] = useState(true);
  const [activePreset, setActivePreset] = useState<DateRangePreset | null>(
    "this-year"
  );

  // ═══════════════════════════════════════════
  // LOAD KARIGARS (for scope=karigar)
  // ═══════════════════════════════════════════
  useEffect(() => {
    let mounted = true;

    (async () => {
      const result = await getKarigars({ limit: 200 });
      if (mounted && result.success) {
        setKarigars(
          result.data.items.map((k) => ({
            value: k.id,
            label: k.name,
            phone: k.phone,
            balance: k.balance,
          }))
        );
      }
      setLoadingKarigars(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ═══════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════
  const handleScopeChange = (scope: ReportScope) => {
    onChange({
      ...filters,
      scope,
      karigarId: scope === "karigar" ? filters.karigarId : undefined,
    });
  };

  const handleKarigarChange = (karigarId: string) => {
    onChange({ ...filters, karigarId });
  };

  const handlePresetChange = (preset: DateRangePreset) => {
    setActivePreset(preset);

    if (preset === "all-time") {
      onChange({ ...filters, dateFrom: undefined, dateTo: undefined });
      return;
    }

    const now = new Date();
    const from = new Date();

    if (preset === "this-month") {
      from.setDate(1);
    } else if (preset === "last-30-days") {
      from.setDate(now.getDate() - 30);
    } else if (preset === "this-quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      from.setMonth(quarter * 3, 1);
    } else if (preset === "this-year") {
      from.setMonth(0, 1);
    }

    from.setHours(0, 0, 0, 0);
    onChange({ ...filters, dateFrom: from, dateTo: now });
  };

  const handleDateChange = (
    field: "dateFrom" | "dateTo",
    value: string
  ) => {
    setActivePreset("custom");
    onChange({
      ...filters,
      [field]: value ? new Date(value) : undefined,
    });
  };

  const handleReset = () => {
    onChange({ scope: filters.scope });
    setActivePreset(null);
  };

  // ═══════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════
  const canExport =
    filters.scope !== "karigar" || !!filters.karigarId;

  const selectedKarigar = karigars.find((k) => k.value === filters.karigarId);
  const hasFilters = !!(filters.dateFrom || filters.dateTo || filters.karigarId);

  return (
    <div className="rounded-2xl bg-white border border-slate-200/60 p-4 lg:p-5 space-y-5">
      
      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 1 — SCOPE */}
      {/* ═══════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Report Type
          </Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SCOPES.map((scope) => {
            const isActive = filters.scope === scope.value;
            const Icon = scope.icon;

            return (
              <button
                key={scope.value}
                type="button"
                onClick={() => handleScopeChange(scope.value)}
                className={cn(
                  "relative text-left rounded-xl border-2 p-3 transition-all group",
                  isActive
                    ? "border-transparent bg-slate-900 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                      isActive ? "bg-white/10" : "bg-slate-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isActive ? "text-white" : "text-slate-700"
                      )}
                      strokeWidth={2.25}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold leading-tight",
                        isActive ? "text-white" : "text-slate-900"
                      )}
                    >
                      {scope.label}
                    </p>
                    <p
                      className={cn(
                        "text-[10px] leading-snug mt-0.5 line-clamp-2",
                        isActive ? "text-white/70" : "text-slate-500"
                      )}
                    >
                      {scope.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 2 — KARIGAR (Conditional) */}
      {/* ═══════════════════════════════════════════ */}
      {filters.scope === "karigar" && (
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Select Karigar
            </Label>
            <span className="text-red-500">*</span>
          </div>

          <Select
            value={filters.karigarId ?? ""}
            onValueChange={handleKarigarChange}
            disabled={loadingKarigars}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue
                placeholder={
                  loadingKarigars
                    ? "Loading karigars..."
                    : "Choose a karigar..."
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {karigars.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No karigars found
                </div>
              ) : (
                karigars.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span className="font-medium">{k.label}</span>
                      <span className="text-xs text-slate-500">
                        {k.phone}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {selectedKarigar && (
            <p className="text-[11px] text-slate-500">
              📞 {selectedKarigar.phone}
            </p>
          )}

          {!filters.karigarId && (
            <p className="text-[11px] text-amber-600">
              Please select a karigar to enable export
            </p>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 3 — DATE RANGE */}
      {/* ═══════════════════════════════════════════ */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Date Range
          </Label>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5">
          {DATE_PRESETS.map((preset) => {
            const isActive = activePreset === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePresetChange(preset.value)}
                className={cn(
                  "inline-flex items-center px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label
              htmlFor="dateFrom"
              className="text-[10px] font-medium text-slate-500"
            >
              From
            </Label>
            <input
              id="dateFrom"
              type="date"
              value={formatDateInput(filters.dateFrom)}
              max={formatDateInput(filters.dateTo ?? new Date())}
              onChange={(e) => handleDateChange("dateFrom", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-transparent text-xs text-slate-900 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="dateTo"
              className="text-[10px] font-medium text-slate-500"
            >
              To
            </Label>
            <input
              id="dateTo"
              type="date"
              value={formatDateInput(filters.dateTo)}
              min={formatDateInput(filters.dateFrom)}
              max={formatDateInput(new Date())}
              onChange={(e) => handleDateChange("dateTo", e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-transparent text-xs text-slate-900 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
          </div>
        </div>

        {/* Active Range */}
        {(filters.dateFrom || filters.dateTo) && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-[11px] text-blue-800">
              <span className="font-semibold">Period:</span>{" "}
              {formatRangeLabel(filters.dateFrom, filters.dateTo)}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-700 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 4 — EXPORT BUTTONS */}
      {/* ═══════════════════════════════════════════ */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-slate-500" />
          <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Export As
          </Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* PDF */}
          <Button
            onClick={() => onExport("pdf")}
            disabled={!canExport || isExporting}
            className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-medium"
          >
            {exportingFormat === "pdf" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>

          {/* Excel */}
          <Button
            onClick={() => onExport("excel")}
            disabled={!canExport || isExporting}
            variant="outline"
            className="h-11 rounded-xl text-sm font-medium border-slate-200"
          >
            {exportingFormat === "excel" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Download Excel
              </>
            )}
          </Button>

          {/* WhatsApp */}
          <Button
            onClick={() => onExport("whatsapp")}
            disabled={!canExport || isExporting || filters.scope !== "karigar"}
            variant="outline"
            className="h-11 rounded-xl text-sm font-medium border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            {exportingFormat === "whatsapp" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                Share WhatsApp
              </>
            )}
          </Button>
        </div>

        {filters.scope !== "karigar" && (
          <p className="text-[11px] text-slate-500 text-center">
            WhatsApp share available only for Karigar Statement
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function formatDateInput(date: Date | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

function formatRangeLabel(
  from: Date | undefined,
  to: Date | undefined
): string {
  const format = (d: Date) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (from && to) return `${format(from)} - ${format(to)}`;
  if (from) return `From ${format(from)}`;
  if (to) return `Until ${format(to)}`;
  return "All Time";
}