import Link from "next/link";
import { Clock, FileText, TrendingUp } from "lucide-react";

import type { AnalysisSummary } from "@/types/analysis";

type RecentAnalysesProps = {
  analyses: AnalysisSummary[];
  isLoading?: boolean;
};

export function RecentAnalyses({ analyses, isLoading = false }: RecentAnalysesProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-2xl border border-slate-200/70 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60"
          />
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
        <FileText className="h-6 w-6" />
        Oxirgi 24 soatda yangi tahlil topilmadi.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {analyses.slice(0, 5).map((analysis) => (
        <li
          key={analysis.id}
          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700"
        >
          <div>
            <Link
              href={`/analyses/${analysis.id}`}
              className="text-sm font-semibold text-slate-900 hover:underline dark:text-slate-100"
            >
              Tahlil #{analysis.id}
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {analysis.dominant_label ? `Natija: ${analysis.dominant_label}` : "Natija kutilmoqda"}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDateTime(analysis.created_at)}
              </span>
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {analysis.total_findings ?? 0} topilma
              </span>
            </div>
          </div>

          <StatusBadge status={analysis.status} />
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: AnalysisSummary["status"] }) {
  const normalized = status.toLowerCase();
  const map: Record<
    string,
    { label: string; className: string }
  > = {
    completed: {
      label: "Bajarilgan",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    processing: {
      label: "Jarayonda",
      className:
        "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300",
    },
    pending: {
      label: "Navbatda",
      className:
        "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",
    },
    failed: {
      label: "Xato",
      className:
        "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300",
    },
  };

  const meta = map[normalized] ?? {
    label: status,
    className:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}
