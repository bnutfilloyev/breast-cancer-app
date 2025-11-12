import Link from "next/link";
import { Clock } from "lucide-react";

import type { AnalysisSummary } from "@/types/analysis";

type AnalysisHistoryProps = {
  analyses: AnalysisSummary[];
};

export function AnalysisHistory({ analyses }: AnalysisHistoryProps) {
  if (analyses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
        Tarix boʼsh.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {analyses.map((analysis) => (
        <li key={analysis.id} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div>
            <Link href={`/analyses/${analysis.id}`} className="font-semibold text-slate-800 hover:underline dark:text-slate-200">
              Tahlil #{analysis.id}
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(analysis.created_at).toLocaleString("uz-UZ")}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <Clock className="h-4 w-4" /> {analysis.status}
          </div>
        </li>
      ))}
    </ul>
  );
}
