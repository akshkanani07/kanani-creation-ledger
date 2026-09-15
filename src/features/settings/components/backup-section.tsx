"use client";

/**
 * Backup Export Button — Download JSON Backup
 * 
 * FEATURES:
 * - Server Action: exportBackup()
 * - Base64/Blob → Auto-download
 * - Loading state
 * - Toast notifications
 */

import { useState } from "react";
import { Download, Loader2, FileJson } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportBackup } from "../actions/export-backup";

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function BackupExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const result = await exportBackup();

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const json = JSON.stringify(result.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `kanani-backup-${timestamp}.json`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Backup downloaded successfully");
    } catch (error) {
      console.error("[BackupExport] Error:", error);
      toast.error("Failed to generate backup");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating backup...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download JSON Backup
          <FileJson className="w-3.5 h-3.5 ml-2 opacity-70" />
        </>
      )}
    </Button>
  );
}