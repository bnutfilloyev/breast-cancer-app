"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import { PatientDetailCard } from "@/components/patients/PatientDetail";
import { useAnalysesList } from "@/hooks/useAnalyses";
import { usePatientDetail } from "@/hooks/usePatients";
import type { AnalysisListResponse } from "@/types/analysis";

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const patientId = useMemo(() => Number(params?.id), [params?.id]);
  const {
    data: patient,
    isLoading,
    isError,
    refetch,
    error,
  } = usePatientDetail(Number.isFinite(patientId) ? patientId : undefined);

  const analysesParams = useMemo(() => {
    if (!patient?.id) return undefined;
    return { patient_id: patient.id, limit: 25 } as const;
  }, [patient?.id]);

  const { data: patientAnalyses, isLoading: analysesLoading } = useAnalysesList(
    analysesParams,
    { enabled: Boolean(analysesParams) }
  ) as { data: AnalysisListResponse | undefined; isLoading: boolean };

  useEffect(() => {
    if (patient) {
      console.debug("Patient detail loaded:", patient);
    }
  }, [patient]);

  useEffect(() => {
    console.debug("Patient analyses response:", patientAnalyses);
  }, [patientAnalyses]);

  if (!patientId || Number.isNaN(patientId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 px-6 py-4 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Notoʼgʼri bemor identifikatori.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-center dark:bg-slate-950">
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 px-6 py-4 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Bemor maʼlumotlari yuklanmadi: {error instanceof Error ? error.message : "nomaʼlum xatolik"}.
        </div>
        <button
          onClick={() => router.push("/patients")}
          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Roʼyxatga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Ortga
          </button>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 px-4 py-2 text-xs font-semibold text-cyan-600 transition hover:bg-cyan-50 dark:border-cyan-500/30 dark:text-cyan-300 dark:hover:bg-cyan-500/10"
          >
            <RefreshCw className="h-4 w-4" />
            Yangilash
          </button>
        </div>

        <PatientDetailCard
          patient={patient}
          analyses={patientAnalyses?.items}
          analysesLoading={analysesLoading}
          onEdit={() => router.push(`/patients/${patient.id}/edit`)}
        />
      </div>
    </div>
  );
}
