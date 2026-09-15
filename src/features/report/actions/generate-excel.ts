"use server";

/**
 * Generate Excel — Server Action
 * 
 * Generates Excel report with multiple sheets:
 * - Summary (for all reports)
 * - Transactions (for karigar/by-type)
 * - All Karigars (for all-karigars scope)
 * 
 * USAGE:
 *   const result = await generateReportExcel({ scope: "karigar", karigarId });
 *   if (result.success) {
 *     // result.data.base64 — Download
 *   }
 */

import ExcelJS from "exceljs";
import { getReportData } from "./get-report-data";
import { TRANSACTION_TYPE_LABELS, PAYMENT_MODE_LABELS } from "@/config/constants";
import type { ApiResponse } from "@/types";
import type {
  ReportFilters,
  ReportFileResult,
  ReportData,
} from "../types";

// ═══════════════════════════════════════════════════════════
// BRAND COLORS
// ═══════════════════════════════════════════════════════════

const COLORS = {
  primary: "FF0F172A", // Slate-900
  primaryText: "FFFFFFFF",
  accent: "FF1E40AF", // Blue-800
  success: "FF10B981", // Emerald-500
  warning: "FFF59E0B", // Amber-500
  danger: "FFEF4444", // Red-500
  lightGray: "FFF1F5F9", // Slate-100
  border: "FFE2E8F0", // Slate-200
  text: "FF0F172A", // Slate-900
  textMuted: "FF64748B", // Slate-500
  creditBg: "FFECFDF5", // Emerald-50
  debitBg: "FFFFFBEB", // Amber-50
};

// ═══════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function generateReportExcel(
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
    // 2. BUILD WORKBOOK
    // ═══════════════════════════════════════════
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Kanani Creation Ledger";
    workbook.created = new Date();
    workbook.modified = new Date();

    // ═══════════════════════════════════════════
    // 3. BUILD SHEETS BY SCOPE
    // ═══════════════════════════════════════════
    switch (reportData.scope) {
      case "karigar":
        buildKarigarSheets(workbook, reportData);
        break;

      case "all-karigars":
        buildAllKarigarsSheet(workbook, reportData);
        break;

      case "by-type":
        buildByTypeSheets(workbook, reportData);
        break;
    }

    // ═══════════════════════════════════════════
    // 4. GENERATE BUFFER
    // ═══════════════════════════════════════════
    const buffer = await workbook.xlsx.writeBuffer();

    // ═══════════════════════════════════════════
    // 5. CONVERT TO BASE64
    // ═══════════════════════════════════════════
    const base64 = Buffer.from(buffer).toString("base64");

    // ═══════════════════════════════════════════
    // 6. BUILD FILENAME
    // ═══════════════════════════════════════════
    const filename = buildFilename(filters, reportData);

    return {
      success: true,
      data: {
        base64,
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename,
        size: buffer.byteLength,
      },
      message: "Excel file generated successfully",
    };
  } catch (error) {
    console.error("[generateReportExcel] Error:", error);

    return {
      success: false,
      error: "Failed to generate Excel. Please try again.",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// SHEET 1 — KARIGAR SHEETS (Summary + Transactions)
// ═══════════════════════════════════════════════════════════

function buildKarigarSheets(
  workbook: ExcelJS.Workbook,
  data: Extract<ReportData, { scope: "karigar" }>
) {
  // ─────────────────────────────────────────
  // Sheet 1: Summary
  // ─────────────────────────────────────────
  const summarySheet = workbook.addWorksheet("Summary", {
    properties: { tabColor: { argb: COLORS.primary.slice(2) } },
  });

  summarySheet.columns = [
    { header: "", key: "label", width: 25 },
    { header: "", key: "value", width: 25 },
  ];

  // Title
  const titleRow = summarySheet.addRow(["Kanani Creation Ledger"]);
  summarySheet.mergeCells(`A${titleRow.number}:B${titleRow.number}`);
  titleRow.font = { size: 16, bold: true, color: { argb: COLORS.text } };
  titleRow.alignment = { horizontal: "center", vertical: "middle" };
  titleRow.height = 30;

  summarySheet.addRow([""]);

  // Karigar Info
  addSectionHeader(summarySheet, "Karigar Information");
  summarySheet.addRow(["Name", data.karigar.name]);
  summarySheet.addRow(["Phone", data.karigar.phone]);
  if (data.karigar.address) {
    summarySheet.addRow(["Address", data.karigar.address]);
  }
  summarySheet.addRow(["Period", data.metadata.period.label]);

  summarySheet.addRow([""]);

  // Balance Summary
  addSectionHeader(summarySheet, "Balance Summary");
  summarySheet.addRow(["Opening Balance", formatAmount(data.karigar.openingBalance)]);
  summarySheet.addRow(["Total Credit", formatAmount(data.karigar.totalCredit)]);
  summarySheet.addRow(["Total Debit", formatAmount(data.karigar.totalDebit)]);
  summarySheet.addRow(["Closing Balance", formatAmount(data.karigar.closingBalance)]);
  summarySheet.addRow(["Transactions", data.karigar.transactionCount]);

  // Styling for values
  summarySheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
      row.getCell(1).font = { bold: true, size: 11, color: { argb: COLORS.textMuted } };
      row.getCell(2).font = { size: 11, color: { argb: COLORS.text } };
    }
  });

  // Highlight closing balance
  const closingRow = summarySheet.getRow(summarySheet.rowCount);
  summarySheet.eachRow((row) => {
    if (row.getCell(1).value === "Closing Balance") {
      row.getCell(1).font = { bold: true, size: 12, color: { argb: COLORS.primary } };
      row.getCell(2).font = { bold: true, size: 12, color: { argb: COLORS.primary } };
      row.getCell(2).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.lightGray },
      };
    }
  });

  summarySheet.addRow([""]);
  summarySheet.addRow(["Generated", formatDateTime(data.metadata.generatedAt)]);

  // ─────────────────────────────────────────
  // Sheet 2: Transactions
  // ─────────────────────────────────────────
  const txSheet = workbook.addWorksheet("Transactions", {
    properties: { tabColor: { argb: COLORS.accent.slice(2) } },
  });

  txSheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Type", key: "type", width: 18 },
    { header: "Description", key: "description", width: 40 },
    { header: "Quantity", key: "quantity", width: 12 },
    { header: "Rate", key: "rate", width: 12 },
    { header: "Payment Mode", key: "paymentMode", width: 15 },
    { header: "Reference", key: "reference", width: 15 },
    { header: "Credit", key: "credit", width: 14 },
    { header: "Debit", key: "debit", width: 14 },
    { header: "Balance", key: "balance", width: 16 },
  ];

  // Header styling
  const headerRow = txSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: COLORS.primaryText }, size: 10 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.primary },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 24;

  // Add rows
  data.transactions.forEach((tx) => {
    const isCredit = tx.direction === "CREDIT";

    const row = txSheet.addRow({
      date: formatDate(tx.date),
      type: TRANSACTION_TYPE_LABELS[tx.type],
      description: tx.description,
      quantity: tx.quantity ?? "",
      rate: tx.rate ? formatAmount(tx.rate) : "",
      paymentMode: tx.paymentMode
        ? PAYMENT_MODE_LABELS[tx.paymentMode as keyof typeof PAYMENT_MODE_LABELS]
        : "",
      reference: tx.reference ?? "",
      credit: isCredit ? tx.amount : "",
      debit: !isCredit ? tx.amount : "",
      balance: tx.runningBalance,
    });

    // Color coding
    const creditCell = row.getCell("credit");
    const debitCell = row.getCell("debit");

    if (isCredit) {
      creditCell.font = { color: { argb: COLORS.success }, bold: true };
    } else {
      debitCell.font = { color: { argb: COLORS.warning }, bold: true };
    }

    // Number formats
    row.getCell("credit").numFmt = '"_"₹"#,##0.00';
    row.getCell("debit").numFmt = '"_"₹"#,##0.00';
    row.getCell("balance").numFmt = '"_"₹"#,##0.00';
    row.getCell("quantity").alignment = { horizontal: "right" };
    row.getCell("rate").alignment = { horizontal: "right" };

    // Border
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
    });
  });

  // Freeze header
  txSheet.views = [{ state: "frozen", ySplit: 1 }];
}

// ═══════════════════════════════════════════════════════════
// SHEET 2 — ALL KARIGARS
// ═══════════════════════════════════════════════════════════

function buildAllKarigarsSheet(
  workbook: ExcelJS.Workbook,
  data: Extract<ReportData, { scope: "all-karigars" }>
) {
  const sheet = workbook.addWorksheet("All Karigars", {
    properties: { tabColor: { argb: COLORS.primary.slice(2) } },
  });

  sheet.columns = [
    { header: "#", key: "index", width: 6 },
    { header: "Name", key: "name", width: 25 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Address", key: "address", width: 30 },
    { header: "Transactions", key: "count", width: 14 },
    { header: "Credit", key: "credit", width: 14 },
    { header: "Debit", key: "debit", width: 14 },
    { header: "Balance", key: "balance", width: 16 },
    { header: "Status", key: "status", width: 12 },
  ];

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: COLORS.primaryText }, size: 10 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.primary },
  };
  headerRow.height = 24;
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // Add rows
  data.karigars.forEach((karigar, index) => {
    const isCredit = karigar.closingBalance > 0.01;
    const isDebit = karigar.closingBalance < -0.01;
    const status = isCredit ? "CREDIT" : isDebit ? "DEBIT" : "Settled";

    const row = sheet.addRow({
      index: index + 1,
      name: karigar.name,
      phone: karigar.phone,
      address: karigar.address ?? "",
      count: karigar.transactionCount,
      credit: karigar.totalCredit,
      debit: karigar.totalDebit,
      balance: karigar.closingBalance,
      status,
    });

    // Number formats
    row.getCell("credit").numFmt = '"_"₹"#,##0.00';
    row.getCell("debit").numFmt = '"_"₹"#,##0.00';
    row.getCell("balance").numFmt = '"_"₹"#,##0.00';
    row.getCell("count").alignment = { horizontal: "center" };
    row.getCell("status").alignment = { horizontal: "center" };

    // Status color
    const statusCell = row.getCell("status");
    if (isCredit) {
      statusCell.font = { color: { argb: COLORS.success }, bold: true };
    } else if (isDebit) {
      statusCell.font = { color: { argb: COLORS.warning }, bold: true };
    } else {
      statusCell.font = { color: { argb: COLORS.textMuted } };
    }

    // Border
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
    });
  });

  // Totals Row
  const totalsRow = sheet.addRow({
    index: "",
    name: "TOTAL",
    phone: "",
    address: `${data.totals.totalKarigars} karigars`,
    count: "",
    credit: data.totals.totalCredit,
    debit: data.totals.totalDebit,
    balance: data.totals.totalClosing,
    status: "",
  });

  totalsRow.font = { bold: true, size: 11, color: { argb: COLORS.primary } };
  totalsRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.lightGray },
  };
  totalsRow.getCell("credit").numFmt = '"_"₹"#,##0.00';
  totalsRow.getCell("debit").numFmt = '"_"₹"#,##0.00';
  totalsRow.getCell("balance").numFmt = '"_"₹"#,##0.00';

  // Freeze header
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

// ═══════════════════════════════════════════════════════════
// SHEET 3 — BY TYPE (Distribution + Transactions)
// ═══════════════════════════════════════════════════════════

function buildByTypeSheets(
  workbook: ExcelJS.Workbook,
  data: Extract<ReportData, { scope: "by-type" }>
) {
  // Sheet 1: Distribution
  const distSheet = workbook.addWorksheet("Distribution", {
    properties: { tabColor: { argb: COLORS.primary.slice(2) } },
  });

  distSheet.columns = [
    { header: "Type", key: "type", width: 22 },
    { header: "Count", key: "count", width: 12 },
    { header: "Total Amount", key: "amount", width: 18 },
  ];

  const headerRow = distSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: COLORS.primaryText }, size: 10 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.primary },
  };
  headerRow.height = 24;
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  data.distribution.forEach((item) => {
    const row = distSheet.addRow({
      type: TRANSACTION_TYPE_LABELS[item.type],
      count: item.count,
      amount: item.totalAmount,
    });

    row.getCell("amount").numFmt = '"_"₹"#,##0.00';
    row.getCell("count").alignment = { horizontal: "center" };

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
    });
  });

  // Sheet 2: Transactions
  const txSheet = workbook.addWorksheet("Transactions", {
    properties: { tabColor: { argb: COLORS.accent.slice(2) } },
  });

  txSheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Type", key: "type", width: 18 },
    { header: "Description", key: "description", width: 40 },
    { header: "Amount", key: "amount", width: 16 },
  ];

  const txHeaderRow = txSheet.getRow(1);
  txHeaderRow.font = { bold: true, color: { argb: COLORS.primaryText }, size: 10 };
  txHeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.primary },
  };
  txHeaderRow.height = 24;

  data.transactions.forEach((tx) => {
    const row = txSheet.addRow({
      date: formatDate(tx.date),
      type: TRANSACTION_TYPE_LABELS[tx.type],
      description: tx.description,
      amount: tx.amount,
    });

    row.getCell("amount").numFmt = '"_"₹"#,##0.00';
  });

  txSheet.views = [{ state: "frozen", ySplit: 1 }];
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function addSectionHeader(
  sheet: ExcelJS.Worksheet,
  title: string
): void {
  const row = sheet.addRow([title]);
  sheet.mergeCells(`A${row.number}:B${row.number}`);
  row.font = { bold: true, size: 12, color: { argb: COLORS.primary } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.lightGray },
  };
  row.height = 22;
  row.alignment = { vertical: "middle" };
}

function formatAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildFilename(
  filters: ReportFilters,
  data: ReportData
): string {
  const timestamp = new Date().toISOString().slice(0, 10);

  if (filters.scope === "karigar" && data.scope === "karigar") {
    const name = data.karigar.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return `ledger-${name}-${timestamp}.xlsx`;
  }

  if (filters.scope === "all-karigars") {
    return `all-karigars-${timestamp}.xlsx`;
  }

  if (filters.scope === "by-type") {
    const type = filters.type ? `-${filters.type.toLowerCase()}` : "";
    return `type-report${type}-${timestamp}.xlsx`;
  }

  return `report-${timestamp}.xlsx`;
}