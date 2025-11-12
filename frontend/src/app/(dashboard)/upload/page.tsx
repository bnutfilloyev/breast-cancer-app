"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

import { AnalysisUpload } from "@/components/analysis/AnalysisUpload";
import { AnalysisResult } from "@/components/analysis/AnalysisResult";
import { usePatientsList } from "@/hooks/usePatients";
import { analysisService } from "@/services/analyses";
import type { AnalysisDetail } from "@/types/analysis";
import type { PatientListResponse } from "@/types/patient";

const PAGE_LIMIT = 50;

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<number | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<AnalysisDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patientsQuery = usePatientsList({ limit: PAGE_LIMIT, skip: 0 }) as {
    data: PatientListResponse | undefined;
    isLoading: boolean;
  };
  const patientOptions = useMemo(
    () => patientsQuery.data?.items ?? [],
    [patientsQuery.data?.items]
  );

  const onFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Iltimos, tahlil uchun rasm tanlang.");
      return;
    }
    setIsUploading(true);
    setError(null);
    setResult(null);
    try {
      const createResponse = await analysisService.create(selectedFile, patientId);
      if (!("analysis_id" in createResponse) || typeof createResponse.analysis_id !== "number") {
        throw new Error("Yangi tahlil identifikatori olinmadi");
      }
      const detail = await analysisService.get(createResponse.analysis_id);
      setResult(detail);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-xs font-medium text-indigo-600 shadow-sm dark:border-indigo-500/30 dark:bg-slate-900/60 dark:text-indigo-300">
            <Sparkles className="h-4 w-4" />
            AI yordamida tezkor diagnostika
          </span>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Yangi tahlil yuklash
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Klinika suratlarini yuklab, YOLO modeli orqali natijalarni oling. Xohlasangiz tahlilni bemor profiliga bogʼlang.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/upload-multi"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Multi-view rejim
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <AnalysisUpload onSelect={onFileSelect} isUploading={isUploading} />

          <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Bemorni tanlash (ixtiyoriy)
            </label>
            <select
              value={patientId ?? ""}
              onChange={(event) =>
                setPatientId(event.target.value ? Number(event.target.value) : undefined)
              }
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-indigo-400"
            >
              <option value="">Bemor biriktirilmagan</option>
              {patientOptions.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  #{patient.id} • {patient.full_name}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
            >
              {isUploading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yuklanmoqda...
                </span>
              ) : (
                "Tahlilni boshlash"
              )}
            </button>
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            )}
          </div>
        </section>

        {preview && (
          <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Tanlangan rasm
            </h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <Image src={preview} alt="Preview" width={1024} height={768} className="w-full object-contain" />
            </div>
          </section>
        )}

        {result && (
          <section>
            <AnalysisResult analysis={result} />
          </section>
        )}
      </div>
    </div>
  );
}
