"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AnalysisResult } from "@/components/analysis/AnalysisResult";
import { DetectionOverlay } from "@/components/analysis/DetectionOverlay";
import { ImageViewer } from "@/components/analysis/ImageViewer";
import { useAnalysisDetail, useAnalysesList } from "@/hooks/useAnalyses";
import { API_BASE_URL } from "@/lib/api";
import type { AnalysisListResponse } from "@/types/analysis";

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

export default function AnalysisDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const analysisId = Number(params?.id);
  const {
    data: analysis,
    isLoading,
    isError,
    error,
    refetch,
  } = useAnalysisDetail(Number.isFinite(analysisId) ? analysisId : undefined);

  const relatedParams = analysis?.patient_id
    ? { patient_id: analysis.patient_id, limit: 10 }
    : undefined;

  const { data: relatedAnalyses } = useAnalysesList(relatedParams, {
    enabled: Boolean(relatedParams),
  }) as { data: AnalysisListResponse | undefined };

  const detectionViews = useMemo(
    () => {
      const images = analysis?.images ?? [];
      return images.map((image) => ({
        id: image.id,
        src: buildImageUrl(image.thumbnail_path ?? image.relative_path),
        detections: normaliseDetections(image.detections_data),
        viewType: image.view_type,
        filename: image.original_filename,
        width: image.width ?? 1280,
        height: image.height ?? 1024,
      }));
    },
    [analysis?.images]
  );

  if (!analysisId || Number.isNaN(analysisId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 px-6 py-4 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Notoʼgʼri tahlil identifikatori.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError || !analysis) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-center dark:bg-slate-950">
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 px-6 py-4 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Tahlil yuklanmadi: {error instanceof Error ? error.message : "nomaʼlum xatolik"}.
        </div>
        <button
          onClick={() => router.push("/analyses")}
          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Roʼyxatga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-6 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Ortga
          </button>
          <button
            onClick={() => refetch()}
            className="rounded-xl border border-indigo-200 px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
          >
            Yangilash
          </button>
        </div>

        <AnalysisResult analysis={analysis} />

        {detectionViews.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Tasvirlar
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
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

        {analysis.patient_id && relatedAnalyses && relatedAnalyses.items && relatedAnalyses.items.length > 0 ? (
          <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Shu bemorning boshqa tahlillari
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              {relatedAnalyses.items
                .filter((item) => item.id !== analysis.id)
                .slice(0, 5)
                .map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => router.push(`/analyses/${item.id}`)}
                      className="text-indigo-600 hover:underline dark:text-indigo-300"
                    >
                      #{item.id} — {item.status} —{" "}
                      {new Date(item.created_at).toLocaleString("uz-UZ")}
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function buildImageUrl(path?: string | null) {
  if (!path) return "/placeholder.svg";
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  const withFiles = clean.startsWith("files/") ? clean : `files/${clean}`;
  return `${API_BASE_URL}/${withFiles}`;
}

function normaliseDetections(raw: unknown): Detection[] {
  if (!raw || typeof raw !== "object") return [];
  const detections = (raw as { detections?: unknown[] }).detections;
  if (!Array.isArray(detections)) return [];

  return detections
    .map((detection: any) => {
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
    .filter((d): d is Detection => Boolean(d));
}

function clamp01(value: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
