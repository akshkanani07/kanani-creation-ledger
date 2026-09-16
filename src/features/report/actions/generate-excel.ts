"use server";

/**
 * Generate Excel — Server Action (Premium)
 * 
 * FEATURES:
 * - Multi-sheet workbook (Summary + Transactions)
 * - Web logo from /icons/logo.png
 * - Brand colors (Slate-900)
 * - Column-wise Credit/Debit split
 * - Running Balance column
 * - Auto-width columns
 * - Formatted amounts (₹ Indian format)
 * 
 * USAGE:
 *   const result = await generateReportExcel({ scope: "karigar", karigarId });
 */

import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
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
  primary: "FF0F172A",       // Slate-900
  primaryText: "FFFFFFFF",
  accent: "FF1E40AF",        // Blue-800
  success: "FF10B981",       // Emerald-500
  successBg: "FFD1FAE5",     // Emerald-100
  warning: "FFF59E0B",       // Amber-500
  warningBg: "FFFEF3C7",     // Amber-100
  danger: "FFEF4444",        // Red-500
  dangerBg: "FFFEE2E2",      // Red-100
  lightGray: "FFF1F5F9",     // Slate-100
  bgMuted: "FFF8FAFC",       // Slate-50
  border: "FFE2E8F0",        // Slate-200
  text: "FF0F172A",          // Slate-900
  textMuted: "FF64748B",     // Slate-500
  white: "FFFFFFFF",
};

// ═══════════════════════════════════════════════════════════
// LOGO PATH
// ═══════════════════════════════════════════════════════════

function getLogoPath(): string | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "icons", "logo.png");
    if (fs.existsSync(logoPath)) {
      return logoPath;
    }
    return null;
  } catch {
    return null;
  }
}

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
        await buildKarigarSheets(workbook, reportData);
        break;

      case "all-karigars":
        await buildAllKarigarsSheet(workbook, reportData);
        break;

      case "by-type":
        await buildByTypeSheets(workbook, reportData);
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
// KARIGAR SHEETS — SUMMARY + TRANSACTIONS
// ═══════════════════════════════════════════════════════════

async function buildKarigarSheets(
  workbook: ExcelJS.Workbook,
  data: Extract<ReportData, { scope: "karigar" }>
) {
  // ═══════════════════════════════════════════
  // SHEET 1: SUMMARY
  // ═══════════════════════════════════════════
  const summarySheet = workbook.addWorksheet("Summary", {
    properties: { tabColor: { argb: COLORS.primary.slice(2) } },
    views: [{ showGridLines: false }],
  });

  summarySheet.columns = [
    { width: 3 },   // A - Margin
    { width: 25 },  // B - Label
    { width: 25 },  // C - Value
    { width: 3 },   // D - Margin
  ];

  // ─────────────────────────────────────────
  // LOGO + BRANDING
  // ─────────────────────────────────────────
  const logoPath = getLogoPath();

  // Row 1 - Logo (if available)
  if (logoPath) {
    const logoId = workbook.addImage({
      filename: logoPath,
      extension: "png",
    });
    summarySheet.addImage(logoId, {
      tl: { col: 0.1, row: 0.1 },
      ext: { width: 60, height: 60 },
    });
  }

  // Row 2-3 - Brand Name
  summarySheet.getRow(2).height = 24;
  summarySheet.getRow(3).height = 18;

  const brandNameCell = summarySheet.getCell("B2");
  brandNameCell.value = data.metadata.companyName;
  brandNameCell.font = { size: 18, bold: true, color: { argb: COLORS.primary } };

  const brandTaglineCell = summarySheet.getCell("B3");
  brandTaglineCell.value = data.metadata.companyIndustry.toUpperCase();
  brandTaglineCell.font = { size: 9, color: { argb: COLORS.textMuted }, bold: true };

  // Row 4-5 - Report Badge
  summarySheet.getRow(5).height = 20;
  const badgeCell = summarySheet.getCell("B5");
  badgeCell.value = "LEDGER STATEMENT";
  badgeCell.font = { size: 10, bold: true, color: { argb: COLORS.primaryText } };
  badgeCell.alignment = { horizontal: "center", vertical: "middle" };
  badgeCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.primary },
  };
  summarySheet.mergeCells("B5:C5");

  // Row 6 - Gap
  summarySheet.addRow([]);

  // ─────────────────────────────────────────
  // KARIGAR INFO
  // ─────────────────────────────────────────
  addSectionHeader(summarySheet, "Karigar Information", 7);

  summarySheet.addRow(["", "Name", data.karigar.name]);
  summarySheet.addRow(["", "Phone", data.karigar.phone]);
  if (data.karigar.address) {
    summarySheet.addRow(["", "Address", data.karigar.address]);
  }
  summarySheet.addRow(["", "Period", data.metadata.period.label]);
  summarySheet.addRow(["", "Generated", formatDateTime(data.metadata.generatedAt)]);

  // Style info rows
  styleInfoRows(summarySheet, 8, summarySheet.rowCount);

  // Row - Gap
  summarySheet.addRow([]);

  // ─────────────────────────────────────────
  // BALANCE SUMMARY
  // ─────────────────────────────────────────
  addSectionHeader(summarySheet, "Balance Summary", summarySheet.rowCount + 1);

  summarySheet.addRow(["", "Opening Balance", formatAmount(data.karigar.openingBalance)]);
  summarySheet.addRow(["", "Total Credit", formatAmount(data.karigar.totalCredit)]);
  summarySheet.addRow(["", "Total Debit", formatAmount(data.karigar.totalDebit)]);
  summarySheet.addRow(["", "Closing Balance", formatAmount(data.karigar.closingBalance)]);
  summarySheet.addRow(["", "Transactions", data.karigar.transactionCount]);

  // Style balance rows
  const balanceStartRow = summarySheet.rowCount - 4;
  styleInfoRows(summarySheet, balanceStartRow, summarySheet.rowCount);

  // Highlight Closing Balance
  const closingRow = summarySheet.rowCount - 1;
  const closingLabelCell = summarySheet.getCell(`B${closingRow}`);
  const closingValueCell = summarySheet.getCell(`C${closingRow}`);

  closingLabelCell.font = { size: 12, bold: true, color: { argb: COLORS.primary } };
  closingValueCell.font = { size: 14, bold: true, color: { argb: COLORS.primary } };
  closingValueCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.lightGray },
  };
  closingValueCell.border = {
    top: { style: "thin", color: { argb: COLORS.primary } },
    bottom: { style: "thin", color: { argb: COLORS.primary } },
    left: { style: "thin", color: { argb: COLORS.primary } },
    right: { style: "thin", color: { argb: COLORS.primary } },
  };

  // ─────────────────────────────────────────
  // SHEET 2: TRANSACTIONS
  // ─────────────────────────────────────────
  const txSheet = workbook.addWorksheet("Transactions", {
    properties: { tabColor: { argb: COLORS.accent.slice(2) } },
    views: [{ showGridLines: false }],
  });

  txSheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Type", key: "type", width: 16 },
    { header: "Description", key: "description", width: 45 },
    { header: "Amount", key: "amount", width: 16 },
    { header: "Credit", key: "credit", width: 16 },
    { header: "Debit", key: "debit", width: 16 },
    { header: "Balance", key: "balance", width: 18 },
  ];

  // Style Header
  const headerRow = txSheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { size: 10, bold: true, color: { argb: COLORS.primaryText } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.primary },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } },
    };
  });

  // ─────────────────────────────────────────
  // TRANSACTION ROWS
  // ─────────────────────────────────────────
  data.transactions.forEach((tx, index) => {
    const isCredit = tx.direction === "CREDIT";
    const alt = index % 2 === 1;

    const row = txSheet.addRow({
      date: formatDate(tx.date),
      type: TRANSACTION_TYPE_LABELS[tx.type],
      description: tx.description,
      amount: tx.amount,
      credit: isCredit ? tx.amount : null,
      debit: !isCredit ? tx.amount : null,
      balance: tx.runningBalance,
    });

    row.height = 22;

    // Border + Alternate BG
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: COLORS.border } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
      if (alt) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLORS.bgMuted },
        };
      }
    });

    // Date - center
    row.getCell("date").alignment = { horizontal: "center" };

    // Type - center
    row.getCell("type").alignment = { horizontal: "center" };

    // Amount formats
    row.getCell("amount").numFmt = '"_"₹"#,##0.00';
    row.getCell("amount").alignment = { horizontal: "right" };
    row.getCell("amount").font = { bold: true };

    // Credit
    row.getCell("credit").numFmt = '"_"₹"#,##0.00';
    row.getCell("credit").alignment = { horizontal: "right" };
    if (isCredit) {
      row.getCell("credit").font = { color: { argb: COLORS.success }, bold: true };
      row.getCell("credit").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.successBg },
      };
    }

    // Debit
    row.getCell("debit").numFmt = '"_"₹"#,##0.00';
    row.getCell("debit").alignment = { horizontal: "right" };
    if (!isCredit) {
      row.getCell("debit").font = { color: { argb: COLORS.warning }, bold: true };
      row.getCell("debit").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.warningBg },
      };
    }

    // Balance
    row.getCell("balance").numFmt = '"_"₹"#,##0.00';
    row.getCell("balance").alignment = { horizontal: "right" };
    row.getCell("balance").font = { bold: true };
  });

  // ─────────────────────────────────────────
  // TOTALS ROW
  // ─────────────────────────────────────────
  const totalsRow = txSheet.addRow({
    date: "TOTAL",
    type: "",
    description: `${data.transactions.length} entries`,
    amount: null,
    credit: data.karigar.totalCredit,
    debit: data.karigar.totalDebit,
    balance: data.karigar.closingBalance,
  });

  totalsRow.height = 26;
  totalsRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: COLORS.primaryText } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.primary },
    };
    cell.alignment = { horizontal: "right", vertical: "middle" };
    cell.border = {
      top: { style: "medium", color: { argb: COLORS.primary } },
      bottom: { style: "medium", color: { argb: COLORS.primary } },
      left: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } },
    };
  });
  totalsRow.getCell("date").alignment = { horizontal: "left" };
  totalsRow.getCell("description").alignment = { horizontal: "left" };

  // Freeze header
  txSheet.views = [{ state: "frozen", ySplit: 1 }];

  // Auto-filter
  txSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: data.transactions.length + 1, column: 7 },
  };
}

// ═══════════════════════════════════════════════════════════
// ALL KARIGARS SHEET
// ═══════════════════════════════════════════════════════════

async function buildAllKarigarsSheet(
  workbook: ExcelJS.Workbook,
  data: Extract<ReportData, { scope: "all-karigars" }>
) {
  const sheet = workbook.addWorksheet("All Karigars", {
    properties: { tabColor: { argb: COLORS.primary.slice(2) } },
    views: [{ showGridLines: false }],
  });

  sheet.columns = [
    { header: "#", key: "index", width: 6 },
    { header: "Name", key: "name", width: 28 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Address", key: "address", width: 30 },
    { header: "Txns", key: "count", width: 8 },
    { header: "Credit", key: "credit", width: 16 },
    { header: "Debit", key: "debit", width: 16 },
    { header: "Balance", key: "balance", width: 18 },
    { header: "Status", key: "status", width: 12 },
  ];

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10, color: { argb: COLORS.primaryText } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.primary },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } },
    };
  });

  // Data rows
  data.karigars.forEach((karigar, index) => {
    const isCredit = karigar.closingBalance > 0.01;
    const isDebit = karigar.closingBalance < -0.01;
    const isSettled = !isCredit && !isDebit;
    const alt = index % 2 === 1;

    const row = sheet.addRow({
      index: index + 1,
      name: karigar.name,
      phone: karigar.phone,
      address: karigar.address ?? "",
      count: karigar.transactionCount,
      credit: karigar.totalCredit,
      debit: karigar.totalDebit,
      balance: karigar.closingBalance,
      status: isCredit ? "CREDIT" : isDebit ? "DEBIT" : "SETTLED",
    });

    row.height = 20;

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: COLORS.border } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
      if (alt) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLORS.bgMuted },
        };
      }
    });

    // Center align
    row.getCell("index").alignment = { horizontal: "center" };
    row.getCell("count").alignment = { horizontal: "center" };
    row.getCell("status").alignment = { horizontal: "center" };

    // Currency formats
    row.getCell("credit").numFmt = '"_"₹"#,##0.00';
    row.getCell("debit").numFmt = '"_"₹"#,##0.00';
    row.getCell("balance").numFmt = '"_"₹"#,##0.00';
    row.getCell("credit").alignment = { horizontal: "right" };
    row.getCell("debit").alignment = { horizontal: "right" };
    row.getCell("balance").alignment = { horizontal: "right" };

    // Status styling
    const statusCell = row.getCell("status");
    if (isCredit) {
      statusCell.font = { color: { argb: COLORS.success }, bold: true };
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.successBg },
      };
    } else if (isDebit) {
      statusCell.font = { color: { argb: COLORS.warning }, bold: true };
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.warningBg },
      };
    } else {
      statusCell.font = { color: { argb: COLORS.textMuted }, bold: true };
    }
  });

  // Totals row
  const totalsRow = sheet.addRow({
    index: "",
    name: "TOTAL",
    phone: `${data.totals.totalKarigars} karigars`,
    address: "",
    count: "",
    credit: data.totals.totalCredit,
    debit: data.totals.totalDebit,
    balance: data.totals.totalClosing,
    status: "",
  });

  totalsRow.height = 24;
  totalsRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: COLORS.primaryText } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.primary },
    };
    cell.alignment = { horizontal: "right", vertical: "middle" };
  });
  totalsRow.getCell("name").alignment = { horizontal: "left" };
  totalsRow.getCell("credit").numFmt = '"_"₹"#,##0.00';
  totalsRow.getCell("debit").numFmt = '"_"₹"#,##0.00';
  totalsRow.getCell("balance").numFmt = '"_"₹"#,##0.00';

  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

// ═══════════════════════════════════════════════════════════
// BY TYPE SHEETS
// ═══════════════════════════════════════════════════════════

async function buildByTypeSheets(
  workbook: ExcelJS.Workbook,
  data: Extract<ReportData, { scope: "by-type" }>
) {
  // Distribution sheet
  const distSheet = workbook.addWorksheet("Distribution", {
    properties: { tabColor: { argb: COLORS.primary.slice(2) } },
    views: [{ showGridLines: false }],
  });

  distSheet.columns = [
    { header: "Type", key: "type", width: 22 },
    { header: "Count", key: "count", width: 12 },
    { header: "Total Amount", key: "amount", width: 20 },
  ];

  const headerRow = distSheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10, color: { argb: COLORS.primaryText } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.primary },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  data.distribution.forEach((item, index) => {
    const alt = index % 2 === 1;
    const row = distSheet.addRow({
      type: TRANSACTION_TYPE_LABELS[item.type],
      count: item.count,
      amount: item.totalAmount,
    });

    row.height = 22;
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: COLORS.border } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
      if (alt) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLORS.bgMuted },
        };
      }
    });

    row.getCell("count").alignment = { horizontal: "center" };
    row.getCell("amount").numFmt = '"_"₹"#,##0.00';
    row.getCell("amount").alignment = { horizontal: "right" };
    row.getCell("amount").font = { bold: true };
  });

  // Transactions sheet
  const txSheet = workbook.addWorksheet("Transactions", {
    properties: { tabColor: { argb: COLORS.accent.slice(2) } },
    views: [{ showGridLines: false }],
  });

  txSheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Type", key: "type", width: 16 },
    { header: "Description", key: "description", width: 45 },
    { header: "Amount", key: "amount", width: 18 },
  ];

  const txHeaderRow = txSheet.getRow(1);
  txHeaderRow.height = 28;
  txHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10, color: { argb: COLORS.primaryText } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.primary },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  data.transactions.forEach((tx, index) => {
    const alt = index % 2 === 1;
    const row = txSheet.addRow({
      date: formatDate(tx.date),
      type: TRANSACTION_TYPE_LABELS[tx.type],
      description: tx.description,
      amount: tx.amount,
    });

    row.height = 20;
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: COLORS.border } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
      if (alt) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLORS.bgMuted },
        };
      }
    });

    row.getCell("date").alignment = { horizontal: "center" };
    row.getCell("type").alignment = { horizontal: "center" };
    row.getCell("amount").numFmt = '"_"₹"#,##0.00';
    row.getCell("amount").alignment = { horizontal: "right" };
  });

  txSheet.views = [{ state: "frozen", ySplit: 1 }];
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function addSectionHeader(
  sheet: ExcelJS.Worksheet,
  title: string,
  rowNumber: number
): void {
  const row = sheet.getRow(rowNumber);
  const cell = row.getCell("B");
  cell.value = title.toUpperCase();
  cell.font = { bold: true, size: 10, color: { argb: COLORS.primaryText } };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.primary },
  };
  cell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.mergeCells(`B${rowNumber}:C${rowNumber}`);
  row.height = 20;
}

function styleInfoRows(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number
): void {
  for (let i = startRow; i <= endRow; i++) {
    const row = sheet.getRow(i);
    row.getCell("B").font = {
      bold: true,
      size: 10,
      color: { argb: COLORS.textMuted },
    };
    row.getCell("C").font = { size: 11, color: { argb: COLORS.text } };
    row.getCell("C").alignment = { horizontal: "right" };
    row.height = 20;
  }
}

function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  const sign = amount < 0 ? "-" : "";
  return `${sign}₹${formatted}`;
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