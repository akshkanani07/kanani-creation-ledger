/**
 * Ledger PDF Template — @react-pdf/renderer
 * 
 * Generates PDF for all 3 report scopes:
 * - karigar: Single karigar statement
 * - all-karigars: Summary table
 * - by-type: Type distribution
 * 
 * FONT: Helvetica (default) — Rupee shown as "Rs."
 * LOGO: Master Logo via /icons/logo.png
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { TRANSACTION_TYPE_LABELS } from "@/config/constants";
import type { ReportData } from "../types";

// ═══════════════════════════════════════════════════════════
// BRAND COLORS
// ═══════════════════════════════════════════════════════════

const COLORS = {
  primary: "#0f172a",
  secondary: "#1e293b",
  accent: "#1e40af",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  bgLight: "#f8fafc",
  bgMuted: "#f1f5f9",
  white: "#ffffff",
};

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // PAGE
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },

  // HEADER
  header: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    borderBottomStyle: "solid",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: "hidden",
  },
  logoImage: {
    width: 44,
    height: 44,
    objectFit: "cover",
  },
  logoText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  brandInfo: {
    flex: 1,
    marginLeft: 12,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  brandTagline: {
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  reportBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: COLORS.bgMuted,
    borderRadius: 6,
  },
  reportBadgeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  headerMetaText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  headerMetaValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.textSecondary,
  },

  // SUMMARY
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.bgLight,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  summaryCardSuccess: {
    borderLeftColor: COLORS.success,
  },
  summaryCardWarning: {
    borderLeftColor: COLORS.warning,
  },
  summaryCardDark: {
    backgroundColor: COLORS.primary,
    borderLeftColor: COLORS.accent,
  },
  summaryLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
    fontWeight: "bold",
  },
  summaryLabelDark: {
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  summaryValueDark: {
    color: COLORS.white,
  },
  summaryValueSuccess: {
    color: COLORS.success,
  },
  summaryValueWarning: {
    color: COLORS.warning,
  },
  summaryDescription: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 8,
  },

  // TABLE
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableHeaderText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderBottomStyle: "solid",
  },
  tableRowAlt: {
    backgroundColor: COLORS.bgLight,
  },
  tableCell: {
    fontSize: 8,
    color: COLORS.textPrimary,
  },
  tableCellBold: {
    fontWeight: "bold",
  },
  tableCellCredit: {
    color: COLORS.success,
    fontWeight: "bold",
  },
  tableCellDebit: {
    color: COLORS.warning,
    fontWeight: "bold",
  },

  // Column Widths
  colDate: { width: "12%" },
  colType: { width: "14%" },
  colDescription: { width: "32%" },
  colQty: { width: "8%", textAlign: "right" },
  colRate: { width: "10%", textAlign: "right" },
  colAmount: { width: "12%", textAlign: "right" },
  colBalance: { width: "12%", textAlign: "right" },

  colIndex: { width: "5%" },
  colName: { width: "22%" },
  colPhone: { width: "15%" },
  colCount: { width: "10%", textAlign: "center" },
  colCredit: { width: "13%", textAlign: "right" },
  colDebit: { width: "13%", textAlign: "right" },
  colBalance2: { width: "13%", textAlign: "right" },
  colStatus: { width: "9%", textAlign: "center" },

  // TOTALS
  totalsRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  totalsCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.white,
  },

  // BADGE
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  badgeCredit: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  badgeDebit: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  badgeSettled: {
    backgroundColor: COLORS.bgMuted,
    color: COLORS.textSecondary,
  },

  // EMPTY
  emptyState: {
    padding: 40,
    alignItems: "center",
    backgroundColor: COLORS.bgLight,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: "center",
  },

  // FOOTER
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderTopStyle: "solid",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted,
  },
  footerPage: {
    fontSize: 7,
    color: COLORS.textSecondary,
    fontWeight: "bold",
  },

  // KARIGAR INFO
  karigarInfo: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.bgLight,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  karigarInfoItem: {
    flex: 1,
  },
  karigarInfoLabel: {
    fontSize: 7,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
    fontWeight: "bold",
  },
  karigarInfoValue: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
});

// ═══════════════════════════════════════════════════════════
// HELPERS — Logo URL
// ═══════════════════════════════════════════════════════════

function getLogoUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/icons/logo.png`;
}

// ═══════════════════════════════════════════════════════════
// HELPERS — Formatters ("Rs." for rupee)
// ═══════════════════════════════════════════════════════════

function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);
  return `Rs. ${formatted}`;
}

function formatAmountWithSign(
  amount: number,
  direction: "CREDIT" | "DEBIT"
): string {
  const sign = direction === "CREDIT" ? "+" : "−";
  return `${sign}${formatAmount(amount)}`;
}

function formatBalanceWithDirection(balance: number): string {
  if (Math.abs(balance) < 0.01) return "Settled";
  const abs = Math.abs(balance);
  const label = balance > 0 ? "Cr" : "Dr";
  return `${formatAmount(abs)} ${label}`;
}

function formatBalanceAmountOnly(balance: number): string {
  if (Math.abs(balance) < 0.01) return "Settled";
  return formatAmount(Math.abs(balance));
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

// ═══════════════════════════════════════════════════════════
// MAIN TEMPLATE
// ═══════════════════════════════════════════════════════════

interface LedgerPdfTemplateProps {
  data: ReportData;
}

export function LedgerPdfTemplate({ data }: LedgerPdfTemplateProps) {
  return (
    <Document
      title={`Ledger Report — ${data.metadata.companyName}`}
      author={data.metadata.companyName}
      subject="Ledger Report"
      creator="Kanani Creation Ledger"
    >
      {data.scope === "karigar" && <KarigarReportPage data={data} />}
      {data.scope === "all-karigars" && <AllKarigarsReportPage data={data} />}
      {data.scope === "by-type" && <ByTypeReportPage data={data} />}
    </Document>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE 1 — KARIGAR STATEMENT
// ═══════════════════════════════════════════════════════════

function KarigarReportPage({
  data,
}: {
  data: Extract<ReportData, { scope: "karigar" }>;
}) {
  const { metadata, karigar, transactions } = data;
  const hasTransactions = transactions.length > 0;
  const balanceAbs = Math.abs(karigar.closingBalance);
  const isCredit = karigar.closingBalance > 0;
  const isSettled = balanceAbs < 0.01;

  return (
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.logoBadge}>
              <Image src={getLogoUrl()} style={styles.logoImage} />
            </View>
            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>{metadata.companyName}</Text>
              <Text style={styles.brandTagline}>
                {metadata.companyIndustry}
              </Text>
            </View>
          </View>
          <View style={styles.reportBadge}>
            <Text style={styles.reportBadgeText}>Ledger Statement</Text>
          </View>
        </View>

        <View style={styles.headerMeta}>
          <Text style={styles.headerMetaText}>
            Period:{" "}
            <Text style={styles.headerMetaValue}>{metadata.period.label}</Text>
          </Text>
          <Text style={styles.headerMetaText}>
            Generated:{" "}
            <Text style={styles.headerMetaValue}>
              {formatDateTime(metadata.generatedAt)}
            </Text>
          </Text>
        </View>
      </View>

      {/* KARIGAR INFO */}
      <View style={styles.karigarInfo}>
        <View style={styles.karigarInfoItem}>
          <Text style={styles.karigarInfoLabel}>Karigar</Text>
          <Text style={styles.karigarInfoValue}>{karigar.name}</Text>
        </View>
        <View style={styles.karigarInfoItem}>
          <Text style={styles.karigarInfoLabel}>Phone</Text>
          <Text style={styles.karigarInfoValue}>{karigar.phone}</Text>
        </View>
        {karigar.address && (
          <View style={styles.karigarInfoItem}>
            <Text style={styles.karigarInfoLabel}>Address</Text>
            <Text style={styles.karigarInfoValue}>{karigar.address}</Text>
          </View>
        )}
      </View>

      {/* SUMMARY */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Opening</Text>
          <Text style={styles.summaryValue}>
            {formatBalanceWithDirection(karigar.openingBalance)}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardSuccess]}>
          <Text style={styles.summaryLabel}>Total Credit</Text>
          <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
            {formatAmount(karigar.totalCredit)}
          </Text>
          <Text style={styles.summaryDescription}>Work + Opening</Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardWarning]}>
          <Text style={styles.summaryLabel}>Total Debit</Text>
          <Text style={[styles.summaryValue, styles.summaryValueWarning]}>
            {formatAmount(karigar.totalDebit)}
          </Text>
          <Text style={styles.summaryDescription}>Payments + Advances</Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardDark]}>
          <Text style={[styles.summaryLabel, styles.summaryLabelDark]}>
            Closing Balance
          </Text>
          <Text style={[styles.summaryValue, styles.summaryValueDark]}>
            {isSettled ? "Settled" : formatAmount(balanceAbs)}
          </Text>
          <Text style={styles.summaryDescription}>
            {isSettled
              ? "No pending"
              : isCredit
                ? "CREDIT (we owe)"
                : "DEBIT (owes us)"}
          </Text>
        </View>
      </View>

      {/* TRANSACTIONS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        <View style={styles.sectionLine} />
        <Text style={styles.headerMetaText}>
          {transactions.length}{" "}
          {transactions.length === 1 ? "entry" : "entries"}
        </Text>
      </View>

      {hasTransactions ? (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
            <Text style={[styles.tableHeaderText, styles.colType]}>Type</Text>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>
              Amount
            </Text>
            <Text style={[styles.tableHeaderText, styles.colBalance]}>
              Balance
            </Text>
          </View>

          {transactions.map((tx, index) => {
            const isTxCredit = tx.direction === "CREDIT";
            const alt = index % 2 === 1;

            return (
              <View
                key={tx.id}
                style={[styles.tableRow, alt && styles.tableRowAlt]}
                wrap={false}
              >
                <Text style={[styles.tableCell, styles.colDate]}>
                  {formatDate(tx.date)}
                </Text>
                <Text style={[styles.tableCell, styles.colType]}>
                  {TRANSACTION_TYPE_LABELS[tx.type]}
                </Text>
                <Text style={[styles.tableCell, styles.colDescription]}>
                  {tx.description}
                </Text>
                <Text style={[styles.tableCell, styles.colQty]}>
                  {tx.quantity ?? "—"}
                </Text>
                <Text style={[styles.tableCell, styles.colRate]}>
                  {tx.rate ? formatAmount(tx.rate) : "—"}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colAmount,
                    isTxCredit
                      ? styles.tableCellCredit
                      : styles.tableCellDebit,
                  ]}
                >
                  {formatAmountWithSign(tx.amount, tx.direction)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colBalance,
                    styles.tableCellBold,
                  ]}
                >
                  {formatBalanceWithDirection(tx.runningBalance)}
                </Text>
              </View>
            );
          })}

          <View style={styles.totalsRow}>
            <Text style={[styles.totalsCell, styles.colDate]}>Total</Text>
            <Text style={[styles.totalsCell, styles.colType]} />
            <Text style={[styles.totalsCell, styles.colDescription]}>
              {transactions.length}{" "}
              {transactions.length === 1 ? "entry" : "entries"}
            </Text>
            <Text style={[styles.totalsCell, styles.colQty]} />
            <Text style={[styles.totalsCell, styles.colRate]} />
            <Text style={[styles.totalsCell, styles.colAmount]}>
              {formatAmount(karigar.totalCredit + karigar.totalDebit)}
            </Text>
            <Text style={[styles.totalsCell, styles.colBalance]}>
              {isSettled ? "Settled" : formatAmount(balanceAbs)}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No transactions in the selected period.
          </Text>
        </View>
      )}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          {metadata.companyName} • Ledger Statement
        </Text>
        <Text
          style={styles.footerPage}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE 2 — ALL KARIGARS
// ═══════════════════════════════════════════════════════════

function AllKarigarsReportPage({
  data,
}: {
  data: Extract<ReportData, { scope: "all-karigars" }>;
}) {
  const { metadata, karigars, totals } = data;

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.logoBadge}>
              <Image src={getLogoUrl()} style={styles.logoImage} />
            </View>
            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>{metadata.companyName}</Text>
              <Text style={styles.brandTagline}>
                {metadata.companyIndustry}
              </Text>
            </View>
          </View>
          <View style={styles.reportBadge}>
            <Text style={styles.reportBadgeText}>All Karigars</Text>
          </View>
        </View>

        <View style={styles.headerMeta}>
          <Text style={styles.headerMetaText}>
            Period:{" "}
            <Text style={styles.headerMetaValue}>{metadata.period.label}</Text>
          </Text>
          <Text style={styles.headerMetaText}>
            Generated:{" "}
            <Text style={styles.headerMetaValue}>
              {formatDateTime(metadata.generatedAt)}
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Karigars</Text>
          <Text style={styles.summaryValue}>{totals.totalKarigars}</Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardSuccess]}>
          <Text style={styles.summaryLabel}>Total Credit</Text>
          <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
            {formatAmount(totals.totalCredit)}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardWarning]}>
          <Text style={styles.summaryLabel}>Total Debit</Text>
          <Text style={[styles.summaryValue, styles.summaryValueWarning]}>
            {formatAmount(totals.totalDebit)}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardDark]}>
          <Text style={[styles.summaryLabel, styles.summaryLabelDark]}>
            Closing Balance
          </Text>
          <Text style={[styles.summaryValue, styles.summaryValueDark]}>
            {formatAmount(Math.abs(totals.totalClosing))}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colIndex]}>#</Text>
          <Text style={[styles.tableHeaderText, styles.colName]}>Name</Text>
          <Text style={[styles.tableHeaderText, styles.colPhone]}>Phone</Text>
          <Text style={[styles.tableHeaderText, styles.colCount]}>Txns</Text>
          <Text style={[styles.tableHeaderText, styles.colCredit]}>
            Credit
          </Text>
          <Text style={[styles.tableHeaderText, styles.colDebit]}>Debit</Text>
          <Text style={[styles.tableHeaderText, styles.colBalance2]}>
            Balance
          </Text>
          <Text style={[styles.tableHeaderText, styles.colStatus]}>
            Status
          </Text>
        </View>

        {karigars.map((k, index) => {
          const isCredit = k.closingBalance > 0.01;
          const isDebit = k.closingBalance < -0.01;
          const isSettled = !isCredit && !isDebit;
          const alt = index % 2 === 1;

          return (
            <View
              key={k.id}
              style={[styles.tableRow, alt && styles.tableRowAlt]}
              wrap={false}
            >
              <Text style={[styles.tableCell, styles.colIndex]}>
                {index + 1}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.colName,
                  styles.tableCellBold,
                ]}
              >
                {k.name}
              </Text>
              <Text style={[styles.tableCell, styles.colPhone]}>
                {k.phone}
              </Text>
              <Text style={[styles.tableCell, styles.colCount]}>
                {k.transactionCount}
              </Text>
              <Text style={[styles.tableCell, styles.colCredit]}>
                {k.totalCredit > 0 ? formatAmount(k.totalCredit) : "—"}
              </Text>
              <Text style={[styles.tableCell, styles.colDebit]}>
                {k.totalDebit > 0 ? formatAmount(k.totalDebit) : "—"}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.colBalance2,
                  styles.tableCellBold,
                ]}
              >
                {formatBalanceAmountOnly(k.closingBalance)}
              </Text>
              <View style={styles.colStatus}>
                <Text
                  style={[
                    styles.badge,
                    isCredit && styles.badgeCredit,
                    isDebit && styles.badgeDebit,
                    isSettled && styles.badgeSettled,
                  ]}
                >
                  {isCredit ? "CREDIT" : isDebit ? "DEBIT" : "Settled"}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.totalsRow}>
          <Text style={[styles.totalsCell, styles.colIndex]} />
          <Text style={[styles.totalsCell, styles.colName]}>TOTAL</Text>
          <Text style={[styles.totalsCell, styles.colPhone]}>
            {totals.totalKarigars} karigars
          </Text>
          <Text style={[styles.totalsCell, styles.colCount]} />
          <Text style={[styles.totalsCell, styles.colCredit]}>
            {formatAmount(totals.totalCredit)}
          </Text>
          <Text style={[styles.totalsCell, styles.colDebit]}>
            {formatAmount(totals.totalDebit)}
          </Text>
          <Text style={[styles.totalsCell, styles.colBalance2]}>
            {formatAmount(Math.abs(totals.totalClosing))}
          </Text>
          <Text style={[styles.totalsCell, styles.colStatus]} />
        </View>
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          {metadata.companyName} • All Karigars Report
        </Text>
        <Text
          style={styles.footerPage}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE 3 — BY TYPE
// ═══════════════════════════════════════════════════════════

function ByTypeReportPage({
  data,
}: {
  data: Extract<ReportData, { scope: "by-type" }>;
}) {
  const { metadata, distribution } = data;

  const totalCount = distribution.reduce((sum, d) => sum + d.count, 0);
  const totalAmount = distribution.reduce((sum, d) => sum + d.totalAmount, 0);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.logoBadge}>
              <Image src={getLogoUrl()} style={styles.logoImage} />
            </View>
            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>{metadata.companyName}</Text>
              <Text style={styles.brandTagline}>
                {metadata.companyIndustry}
              </Text>
            </View>
          </View>
          <View style={styles.reportBadge}>
            <Text style={styles.reportBadgeText}>Type Report</Text>
          </View>
        </View>

        <View style={styles.headerMeta}>
          <Text style={styles.headerMetaText}>
            Period:{" "}
            <Text style={styles.headerMetaValue}>{metadata.period.label}</Text>
          </Text>
          <Text style={styles.headerMetaText}>
            Generated:{" "}
            <Text style={styles.headerMetaValue}>
              {formatDateTime(metadata.generatedAt)}
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Types</Text>
          <Text style={styles.summaryValue}>{distribution.length}</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardSuccess]}>
          <Text style={styles.summaryLabel}>Total Entries</Text>
          <Text style={styles.summaryValue}>{totalCount}</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardDark]}>
          <Text style={[styles.summaryLabel, styles.summaryLabelDark]}>
            Total Amount
          </Text>
          <Text style={[styles.summaryValue, styles.summaryValueDark]}>
            {formatAmount(totalAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Type Distribution</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDescription]}>
            Type
          </Text>
          <Text style={[styles.tableHeaderText, styles.colCount]}>Count</Text>
          <Text style={[styles.tableHeaderText, styles.colBalance2]}>
            Total Amount
          </Text>
        </View>

        {distribution.map((item, index) => {
          const alt = index % 2 === 1;
          return (
            <View
              key={item.type}
              style={[styles.tableRow, alt && styles.tableRowAlt]}
              wrap={false}
            >
              <Text
                style={[
                  styles.tableCell,
                  styles.colDescription,
                  styles.tableCellBold,
                ]}
              >
                {TRANSACTION_TYPE_LABELS[item.type]}
              </Text>
              <Text style={[styles.tableCell, styles.colCount]}>
                {item.count}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.colBalance2,
                  styles.tableCellBold,
                ]}
              >
                {formatAmount(item.totalAmount)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          {metadata.companyName} • Type Report
        </Text>
        <Text
          style={styles.footerPage}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </Page>
  );
}