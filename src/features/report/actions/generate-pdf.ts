"use server";

/**
 * Generate PDF — Server Action
 * 
 * Generates a PDF report and returns as base64.
 * Uses @react-pdf/renderer with server-side rendering.
 * 
 * USAGE:
 *   const result = await generateReportPdf({
 *     scope: "karigar",
 *     karigarId: "abc123",
 *   });
 *   if (result.success) {
 *     // result.data.base64 — Download or Send
 *   }
 */

import { renderToBuffer } from "@react-pdf/renderer";
import { getReportData } from "./get-report-data";
import { LedgerPdfTemplate } from "../templates/ledger-pdf";
import type { ApiResponse } from "@/types";
import type { ReportFilters, ReportFileResult } from "../types";

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function generateReportPdf(
  filters: ReportFilters
): Promise<ApiResponse<ReportFileResult>> {
  try {
    // ═══════════════════════════════════════════
    // 1. FETCH REPORT DATA
    // ═══════════════════════════════════════════
    const dataResult = await getReportData(filters);

    if (!dataResult.success) {
      return {
        success: false,
        error: dataResult.error,
      };
    }

    const reportData = dataResult.data;

    // ═══════════════════════════════════════════
    // 2. RENDER PDF TO BUFFER
    // ═══════════════════════════════════════════
    const pdfBuffer = await renderToBuffer(
      LedgerPdfTemplate({ data: reportData })
    );

    // ═══════════════════════════════════════════
    // 3. CONVERT TO BASE64
    // ═══════════════════════════════════════════
    const base64 = Buffer.from(pdfBuffer).toString("base64");

    // ═══════════════════════════════════════════
    // 4. BUILD FILENAME
    // ═══════════════════════════════════════════
    const filename = buildFilename(filters, reportData);

    return {
      success: true,
      data: {
        base64,
        mimeType: "application/pdf",
        filename,
        size: pdfBuffer.length,
      },
      message: "PDF generated successfully",
    };
  } catch (error) {
    console.error("[generateReportPdf] Error:", error);

    return {
      success: false,
      error: "Failed to generate PDF. Please try again.",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function buildFilename(
  filters: ReportFilters,
  data: import("../types").ReportData
): string {
  const timestamp = new Date()
    .toISOString()
    .slice(0, 10); // "2026-09-15"

  if (filters.scope === "karigar" && data.scope === "karigar") {
    const name = data.karigar.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return `ledger-${name}-${timestamp}.pdf`;
  }

  if (filters.scope === "all-karigars") {
    return `all-karigars-${timestamp}.pdf`;
  }

  if (filters.scope === "by-type") {
    const type = filters.type ? `-${filters.type.toLowerCase()}` : "";
    return `type-report${type}-${timestamp}.pdf`;
  }

  return `report-${timestamp}.pdf`;
}