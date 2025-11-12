"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, RefreshCw, Sparkles, UploadCloud } from "lucide-react";

import { AnalysisResult } from "@/components/analysis/AnalysisResult";
import { DetectionOverlay } from "@/components/analysis/DetectionOverlay";
import { ImageViewer } from "@/components/analysis/ImageViewer";
import { usePatientsList } from "@/hooks/usePatients";
import { analysisService } from "@/services/analyses";
import type { AnalysisDetail, AnalysisImage } from "@/types/analysis";
import type { PatientListResponse } from "@/types/patient";
import { API_BASE_URL } from "@/lib/api";

const VIEWS = [
  { key: "lcc", label: "LCC (Left CC)" },
  { key: "rcc", label: "RCC (Right CC)" },
  { key: "lmlo", label: "LMLO (Left MLO)" },
  { key: "rmlo", label: "RMLO (Right MLO)" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

type Detection = {
  label: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
};

const PATIENTS_LIMIT = 100;

export default function UploadMultiPage() {
  const [files, setFiles] = useState<Record<ViewKey, File | null>>({
    lcc: null,
    rcc: null,
    lmlo: null,
    rmlo: null,
  });
  const [previews, setPreviews] = useState<Record<ViewKey, string | null>>({
    lcc: null,
    rcc: null,
    lmlo: null,
    rmlo: null,
  });
  const [patientId, setPatientId] = useState<number | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisDetail, setAnalysisDetail] = useState<AnalysisDetail | null>(null);

  const patientsQuery = usePatientsList({ limit: PATIENTS_LIMIT, skip: 0 }) as {
    data: PatientListResponse | undefined;
    isLoading: boolean;
  };

  // Cleanup object URLs when component unmounts or preview changes
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const handleFileChange = (view: ViewKey, file: File | null) => {
    setFiles((prev) => ({ ...prev, [view]: file }));
    setError(null);

    setPreviews((prev) => {
      const previousUrl = prev[view];
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
      return { ...prev, [view]: file ? URL.createObjectURL(file) : null };
    });
  };

  const handleReset = () => {
    setFiles({ lcc: null, rcc: null, lmlo: null, rmlo: null });
    setPreviews({ lcc: null, rcc: null, lmlo: null, rmlo: null });
    setError(null);
    setAnalysisDetail(null);
  };

  const allSelected = useMemo(
    () => VIEWS.every((view) => files[view.key]),
    [files],
  );

  const detectionViews = useMemo(() => {
    if (!analysisDetail?.images) return [];
    return analysisDetail.images.map((image) => ({
      id: image.id,
      src: resolveImageUrl(image),
      detections: normaliseDetections(image),
      viewType: image.view_type,
      filename: image.original_filename,
      width: image.width ?? 1280,
      height: image.height ?? 1024,
    }));
  }, [analysisDetail?.images]);

  const handleSubmit = async () => {
    if (!allSelected) {
      setError("Barcha to'rtta rasmni yuklang.");
      return;
    }

    const payload = {
      lcc: files.lcc as File,
      rcc: files.rcc as File,
      lmlo: files.lmlo as File,
      rmlo: files.rmlo as File,
    };

    try {
      setIsUploading(true);
      setError(null);
      setAnalysisDetail(null);

      const response = await analysisService.createMulti(payload, patientId);
      const analysisId = Number(response.analysis_id);

      if (!Number.isFinite(analysisId)) {
        throw new Error("Server analysis identifikatorini qaytarmadi.");
      }

      const detail = await analysisService.get(analysisId);
      setAnalysisDetail(detail);
    } catch (uploadError) {
      console.error("Multi upload failed:", uploadError);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Yuklashda xatolik yuz berdi.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-6 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-4 py-2 text-xs font-medium text-purple-600 shadow-sm dark:border-purple-500/30 dark:bg-slate-900/60 dark:text-purple-300">
              <Sparkles className="h-4 w-4" />
              Multi-view AI tahlil
            </span>
            <div className="flex gap-2">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Single-view rejim
              </Link>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
              >
                <RefreshCw className="h-4 w-4" />
                Tozalash
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Mammografiya to'plamini yuklash
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            YOLO modeli to'rtta rakurs bo'yicha natijalarni bir vaqtning o'zida aniqlaydi. Fayllar tartibi LCC, RCC, LMLO va RMLO ko'rinishlariga mos kelishi kerak.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {VIEWS.map((view) => (
              <div
                key={view.key}
                className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{view.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      JPG, PNG yoki DICOM formatidagi rasmni tanlang.
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                    <UploadCloud className="h-4 w-4" />
                    Fayl tanlash
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        handleFileChange(view.key, event.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </div>
                {previews[view.key] ? (
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    <Image
                      src={previews[view.key] as string}
                      alt={`${view.label} preview`}
                      width={600}
                      height={400}
                      className="h-60 w-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    Rasm tanlanmagan
                  </div>
                )}
              </div>
            ))}
          </div>

          <aside className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Bemor bilan bog'lash (ixtiyoriy)
              </p>
              <select
                value={patientId ?? ""}
                onChange={(event) =>
                  setPatientId(event.target.value ? Number(event.target.value) : undefined)
                }
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-purple-400"
              >
                <option value="">Bemor biriktirilmagan</option>
                {patientsQuery.data?.items.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    #{patient.id} • {patient.full_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI tahlilni ishga tushirish
                </>
              )}
            </button>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            )}
          </aside>
        </section>

        {analysisDetail && (
          <section className="space-y-6">
            <AnalysisResult analysis={analysisDetail} />

            <div className="grid gap-6 md:grid-cols-2">
              {detectionViews.map((view) => (
                <figure key={view.id} className="space-y-2">
                  <ImageViewer
                    src={view.src}
                    alt={view.filename ?? view.viewType}
                    overlay={
                      view.detections.length > 0 ? (
                        <DetectionOverlay
                          detections={view.detections}
                          imageWidth={view.width}
                          imageHeight={view.height}
                        />
                      ) : undefined
                    }
                  />
                  <figcaption className="text-xs text-slate-500 dark:text-slate-400">
                    {view.viewType} • {view.filename}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function resolveImageUrl(image: AnalysisImage): string {
  const candidates = [image.thumbnail_path, image.relative_path];
  for (const path of candidates) {
    if (!path) continue;
    if (/^https?:\/\//.test(path)) return path;
    const normalised = path.replace(/^\/+/, "");
    const prefixed = normalised.startsWith("files/") ? normalised : `files/${normalised}`;
    return `${API_BASE_URL}/${prefixed}`;
  }
  return "/placeholder.svg";
}

function normaliseDetections(image: AnalysisImage): Detection[] {
  const raw = image.detections_data;
  if (!raw || typeof raw !== "object") return [];
  const detections = Array.isArray((raw as any).detections) ? (raw as any).detections : [];

  return detections
    .map((detection: any): Detection | null => {
      const bbox = detection.bbox;
      if (!bbox || typeof bbox !== "object") return null;

      // Backend sends {x1, y1, x2, y2} format in pixels
      const x1 = typeof bbox.x1 === "number" ? bbox.x1 : 0;
      const y1 = typeof bbox.y1 === "number" ? bbox.y1 : 0;
      const x2 = typeof bbox.x2 === "number" ? bbox.x2 : 0;
      const y2 = typeof bbox.y2 === "number" ? bbox.y2 : 0;

      return {
        label: detection.label ?? "Finding",
        confidence: detection.confidence ?? 0,
        bbox: { x1, y1, x2, y2 },
      };
    })
    .filter((value: Detection | null): value is Detection => value !== null);
}

