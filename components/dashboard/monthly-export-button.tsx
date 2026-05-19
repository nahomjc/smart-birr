"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  periodLabel: string;
  year: number;
  month: number;
  variant?: "primary" | "secondary";
  className?: string;
};

export function MonthlyExportButton({
  periodLabel,
  year,
  month,
  variant = "secondary",
  className = "",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        year: String(year),
        month: String(month),
      });
      const res = await fetch(`/api/export/monthly-report?${params}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Export failed");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="([^"]+)"/);
      const filename =
        match?.[1] ??
        `smart-birr-report-${year}-${String(month).padStart(2, "0")}.xlsx`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not download report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant={variant}
        onClick={handleExport}
        disabled={loading}
        className="gap-2"
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden />
        {loading ? "Preparing…" : `Export ${periodLabel}`}
      </Button>
      {error ? (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
