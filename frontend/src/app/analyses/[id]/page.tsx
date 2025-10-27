"use client";

import { useState, useEffect, useRef, SyntheticEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileImage,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Share2,
  Layers,
  Trash2,
  FileText,
  Printer,
  Loader2,
} from "lucide-react";
import { analysisAPI, API_BASE_URL } from "@/lib/api";
import jsPDF from "jspdf";

type Detection = {
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  confidence: number;
  label: string;
  category?: string;
  traffic_light?: string;
};

type AnalysisImage = {
  id: number;
  analysis_id: number;
  view_type: string;
  file_id: string;
  filename: string;
  original_filename: string;
  relative_path: string;
  thumbnail_path: string | null;
  file_size: number;
  width: number | null;
  height: number | null;
  detections_count: number;
  detections_data: {
    detections: Detection[];
  } | null;
  created_at: string;
};

type Analysis = {
  id: number;
  patient_id: number | null;
  mode: string;
  status: string;
  total_findings: number;
  dominant_label: string | null;
  dominant_category: string | null;
  summary: Record<string, any>;
  created_at: string;
  completed_at: string | null;
  findings_description: string | null;
  recommendations: string | null;
  updated_at: string | null;
  images: AnalysisImage[];
};

const IMAGE_PLACEHOLDER = "/analysis-placeholder.svg";

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<AnalysisImage | null>(null);
  const [showDetections, setShowDetections] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAnalysis();
  }, [params.id]);

  useEffect(() => {
    if (selectedImage && imageLoaded) {
      drawDetections();
    }
  }, [selectedImage, showDetections, zoom, imageLoaded]);

  useEffect(() => {
    // Redraw multi-view canvases when showDetections changes
    if (analysis && analysis.mode === "multi") {
      analysis.images.forEach((img) => {
        const imgElement = document.getElementById(`multiview-img-${img.id}`) as HTMLImageElement;
        if (imgElement && imgElement.complete) {
          // Trigger onLoad manually to redraw
          const event = new Event('load');
          imgElement.dispatchEvent(event);
        }
      });
    }
  }, [showDetections, analysis]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const data = await analysisAPI.get(Number(params.id));
      setAnalysis(data);
      if (data.images.length > 0) {
        setSelectedImage(data.images[0]);
      }
    } catch (error) {
      console.error("Failed to load analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await analysisAPI.delete(Number(params.id));
      router.push("/analyses");
    } catch (error: any) {
      console.error("Failed to delete analysis:", error);
      alert("Oʼchirishda xatolik: " + (error.message || "Unknown error"));
    }
  };


  const handleExportPDF = async () => {
    if (!analysis) return;

    const loadImageForExport = async (url: string) => {
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) {
        throw new Error(`Rasmni yuklab boʼlmadi (kod: ${response.status})`);
      }

      const blob = await response.blob();
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const objectUrl = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(image);
        };
        image.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Rasmni qayta ishlashda xatolik"));
        };
        image.src = objectUrl;
      });
    };

    try {
      setExporting(true);

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const horizontalMargin = 20;
      let yPosition = 20;

      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 0, pageWidth, 16, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("Koʼkrak Saratoni Tahlili", horizontalMargin, 11);

      yPosition = 28;
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Tahlil #${analysis.id} · ${new Date(analysis.created_at).toLocaleDateString("uz-UZ")}`, horizontalMargin, yPosition);

      yPosition += 12;
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text("Umumiy maʼlumot", horizontalMargin, yPosition);

      const detailLines = [
        `Status: ${analysis.status}`,
        `Jami topilmalar: ${analysis.total_findings}`,
        `Asosiy kategoriya: ${analysis.dominant_category || "Nomaʼlum"}`,
        `Asosiy label: ${analysis.dominant_label || "Nomaʼlum"}`,
      ];

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      detailLines.forEach((line) => {
        yPosition += 6;
        pdf.text(line, horizontalMargin + 4, yPosition);
      });

      yPosition += 14;
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text("Rasmlar va topilmalar", horizontalMargin, yPosition);

      if (analysis.images.length === 0) {
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text("Ushbu tahlil uchun rasm maʼlumotlari mavjud emas.", horizontalMargin, yPosition);
      }

      for (const img of analysis.images) {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 24;
        }

        yPosition += 8;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(79, 70, 229);
        pdf.text(img.view_type.toUpperCase(), horizontalMargin, yPosition);

        yPosition += 6;
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(55, 65, 81);
        pdf.text(`Topilmalar: ${img.detections_count}`, horizontalMargin, yPosition);

        try {
          const assetUrl = getImageAssetUrl(img);
          if (!assetUrl) {
            console.warn(`No asset URL available for image ${img.id}`);
            continue;
          }

          const imageElement = await loadImageForExport(assetUrl);
          const originalWidth = imageElement.width || 1;
          const originalHeight = imageElement.height || 1;
          const maxCanvasWidth = 1100;
          const scale = Math.min(1, maxCanvasWidth / originalWidth);
          const canvasWidth = Math.max(Math.round(originalWidth * scale), 1);
          const canvasHeight = Math.max(Math.round(originalHeight * scale), 1);

          const canvas = document.createElement("canvas");
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            throw new Error("Canvas tayyorlashda xatolik");
          }

          ctx.drawImage(imageElement, 0, 0, canvasWidth, canvasHeight);

          if (img.detections_data?.detections?.length) {
            const accentBackground = "rgba(15, 23, 42, 0.85)";
            const paddingX = 6;
            const labelHeight = 22;

            img.detections_data.detections.forEach((det: Detection) => {
              const { x1, y1, x2, y2 } = det.bbox;
              const scaledX1 = x1 * scale;
              const scaledY1 = y1 * scale;
              const scaledX2 = x2 * scale;
              const scaledY2 = y2 * scale;
              const color = getCategoryColor(det.label);

              ctx.strokeStyle = color;
              ctx.lineWidth = 3;
              ctx.strokeRect(scaledX1, scaledY1, Math.max(scaledX2 - scaledX1, 1), Math.max(scaledY2 - scaledY1, 1));

              const labelText = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
              ctx.font = "600 15px 'Helvetica Neue', Helvetica, Arial, sans-serif";
              const metrics = ctx.measureText(labelText);
              const backgroundY = Math.max(scaledY1 - labelHeight - 2, 0);

              ctx.fillStyle = color;
              ctx.fillRect(scaledX1, backgroundY, 6, labelHeight);
              ctx.fillStyle = accentBackground;
              ctx.fillRect(scaledX1 + 6, backgroundY, metrics.width + paddingX * 2, labelHeight);

              ctx.fillStyle = "#f8fafc";
              ctx.fillText(labelText, scaledX1 + paddingX + 8, backgroundY + labelHeight - 6);
            });
          }

          const imgWidth = pageWidth - horizontalMargin * 2;
          const imgHeight = (canvasHeight * imgWidth) / canvasWidth;
          yPosition += 8;

          if (yPosition + imgHeight > pageHeight - 24) {
            pdf.addPage();
            yPosition = 24;
          }

          const imgData = canvas.toDataURL("image/jpeg", 0.92);
          pdf.addImage(imgData, "JPEG", horizontalMargin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 6;

          if (img.detections_data?.detections?.length) {
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(31, 41, 55);
            pdf.text("Topilmalar roʼyxati:", horizontalMargin, yPosition);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);

            for (const [index, det] of img.detections_data.detections.entries()) {
              if (yPosition > pageHeight - 18) {
                pdf.addPage();
                yPosition = 24;
              }
              yPosition += 5;
              pdf.text(`${index + 1}. ${det.label} · ${(det.confidence * 100).toFixed(1)}%`, horizontalMargin + 4, yPosition);
            }
          }
        } catch (error) {
          console.error(`Failed to prepare image ${img.id}:`, error);
          yPosition += 10;
          pdf.setFontSize(10);
          pdf.setTextColor(220, 38, 38);
          pdf.text("Rasmni eksport qilishda xatolik", horizontalMargin, yPosition);
          pdf.setTextColor(31, 41, 55);
        }

        yPosition += 10;
      }

      const totalPages = pdf.getNumberOfPages();
      for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
        pdf.setPage(pageIndex);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text("Koʼkrak saratoni AI diagnostika tizimi", pageWidth / 2, pageHeight - 11, { align: "center" });
        pdf.text(`Sahifa ${pageIndex} / ${totalPages} · ${new Date().toLocaleDateString("uz-UZ")}`, pageWidth / 2, pageHeight - 6, { align: "center" });
      }

      pdf.save(`tahlil_${analysis.id}_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert(`PDF yaratishda xatolik yuz berdi: ${(error as Error).message}`);
    } finally {
      setExporting(false);
    }
  };


  const drawDetections = () => {
    if (!canvasRef.current || !imageRef.current || !selectedImage) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image display size
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showDetections || !selectedImage.detections_data?.detections) return;

    const detections = selectedImage.detections_data.detections;
    const scaleX = rect.width / (selectedImage.width || rect.width);
    const scaleY = rect.height / (selectedImage.height || rect.height);

    detections.forEach((detection, index) => {
      const { x1, y1, x2, y2 } = detection.bbox;
      const w = x2 - x1;
      const h = y2 - y1;

      // Scale coordinates
      const scaledX = x1 * scaleX;
      const scaledY = y1 * scaleY;
      const scaledW = w * scaleX;
      const scaledH = h * scaleY;

      // Draw bounding box
      ctx.strokeStyle = getCategoryColor(detection.label);
      ctx.lineWidth = 3;
      ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);

      // Draw label background
      const labelText = `${detection.label} (${(detection.confidence * 100).toFixed(1)}%)`;
      ctx.font = "bold 14px sans-serif";
      const textMetrics = ctx.measureText(labelText);
      const textHeight = 20;

      ctx.fillStyle = getCategoryColor(detection.label);
      ctx.fillRect(scaledX, scaledY - textHeight, textMetrics.width + 10, textHeight);

      // Draw label text
      ctx.fillStyle = "white";
      ctx.fillText(labelText, scaledX + 5, scaledY - 5);
    });
  };

  const getCategoryColor = (label: string): string => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("malignant") || lowerLabel.includes("mass")) {
      return "#ef4444"; // red
    } else if (lowerLabel.includes("calcification")) {
      return "#f59e0b"; // amber
    } else if (lowerLabel.includes("benign")) {
      return "#3b82f6"; // blue
    }
    return "#10b981"; // emerald
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30";
      case "PENDING":
        return "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30";
      case "PROCESSING":
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30";
      case "FAILED":
        return "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30";
      default:
        return "bg-slate-100 dark:bg-gray-500/20 text-slate-600 dark:text-gray-300 border-slate-300 dark:border-gray-500/30";
    }
  };

  const buildFileUrl = (path?: string | null) => {
    if (!path) {
      return null;
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const trimmed = path.replace(/^\/+/, "");
    const encoded = trimmed
      .split("/")
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    return `${API_BASE_URL}/files/${encoded}`;
  };

  const getImageAssetUrl = (image: AnalysisImage) => {
    return buildFileUrl(image.thumbnail_path) ?? buildFileUrl(image.relative_path);
  };

  const getImageUrl = (image: AnalysisImage) => {
    return getImageAssetUrl(image) ?? IMAGE_PLACEHOLDER;
  };

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    if (target.dataset.fallbackApplied === "true") {
      return;
    }

    target.dataset.fallbackApplied = "true";
    target.src = IMAGE_PLACEHOLDER;

    if (target === imageRef.current) {
      setImageLoaded(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-neutral-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Tahlil topilmadi</h2>
          <button
            onClick={() => router.push("/analyses")}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Orqaga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-cyan-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push("/analyses")}
            className="flex items-center gap-2 text-slate-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Orqaga</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 border-2 border-indigo-200 dark:border-indigo-500/30 shadow-lg"
              >
                <FileImage className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Tahlil #{analysis.id}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(analysis.status)}`}>
                    {analysis.status}
                  </span>
                  {analysis.patient_id && (
                    <span className="text-sm text-slate-600 dark:text-neutral-400 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Bemor #{analysis.patient_id}
                    </span>
                  )}
                  <span className="text-sm text-slate-600 dark:text-neutral-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(analysis.created_at).toLocaleDateString("uz-UZ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border-2 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    PDF Export
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 border-2 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
                Oʼchirish
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Multi-view 4-Grid Layout */}
        {analysis.mode === "multi" && analysis.images.length === 4 ? (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Layers className="w-6 h-6 text-indigo-600" />
                  Koʼp Koʼrinishli Tahlil
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetections(!showDetections)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showDetections
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {showDetections ? "Detections ON" : "Detections OFF"}
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {["lcc", "rcc", "lmlo", "rmlo"].map((viewType) => {
                  const img = analysis.images.find((i) => i.view_type.toLowerCase() === viewType);
                  if (!img) return null;

                  return (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-b-2 border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                          {viewType.toUpperCase()}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {img.detections_count} topilma
                        </p>
                      </div>
                      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                        <img
                          id={`multiview-img-${img.id}`}
                          src={getImageUrl(img)}
                          alt={viewType.toUpperCase()}
                          className="w-full h-full object-contain"
                          crossOrigin="anonymous"
                          onError={handleImageError}
                          onLoad={(e) => {
                            const imgElement = e.target as HTMLImageElement;
                            const canvasId = `multiview-canvas-${img.id}`;
                            const overlayCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
                            
                            if (!overlayCanvas) return;

                            const rect = imgElement.getBoundingClientRect();
                            overlayCanvas.width = rect.width;
                            overlayCanvas.height = rect.height;
                            
                            const ctx = overlayCanvas.getContext("2d");
                            if (!ctx) return;

                            ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

                            if (!showDetections || !img.detections_data?.detections || img.detections_data.detections.length === 0) return;

                            const scaleX = rect.width / (img.width || rect.width);
                            const scaleY = rect.height / (img.height || rect.height);

                            img.detections_data.detections.forEach((det: Detection) => {
                              const { x1, y1, x2, y2 } = det.bbox;

                              // Scale coordinates to display size
                              const scaledX = x1 * scaleX;
                              const scaledY = y1 * scaleY;
                              const scaledW = (x2 - x1) * scaleX;
                              const scaledH = (y2 - y1) * scaleY;

                              // Draw bounding box
                              ctx.strokeStyle = "#ef4444";
                              ctx.lineWidth = 3;
                              ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);

                              // Draw label background
                              const labelText = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
                              ctx.font = "bold 14px sans-serif";
                              const textMetrics = ctx.measureText(labelText);
                              const textHeight = 20;

                              ctx.fillStyle = "#ef4444";
                              ctx.fillRect(scaledX, scaledY - textHeight, textMetrics.width + 8, textHeight);

                              // Draw label text
                              ctx.fillStyle = "#ffffff";
                              ctx.fillText(labelText, scaledX + 4, scaledY - 5);
                            });
                          }}
                        />
                        <canvas 
                          id={`multiview-canvas-${img.id}`}
                          className="absolute top-0 left-0 w-full h-full pointer-events-none" 
                        />
                      </div>
                      <div className="p-3 space-y-1 max-h-32 overflow-y-auto">
                        {img.detections_data?.detections?.map((det: Detection, idx: number) => (
                          <div
                            key={idx}
                            className="text-xs flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700"
                          >
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {det.label}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {(det.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Multi-view Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-4 gap-4"
            >
              {["lcc", "rcc", "lmlo", "rmlo"].map((viewType) => {
                const img = analysis.images.find((i) => i.view_type.toLowerCase() === viewType);
                return (
                  <div
                    key={viewType}
                    className="bg-white/90 dark:bg-slate-900/50 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 text-center"
                  >
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                      {viewType.toUpperCase()}
                    </h4>
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {img?.detections_count || 0}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">topilma</div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Image Viewer */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                {/* Image Controls */}
                <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedImage?.original_filename || "Rasm"}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      ({selectedImage?.detections_count || 0} topilma)
                    </span>
                  </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowDetections(!showDetections)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      showDetections
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {showDetections ? "Detections ON" : "Detections OFF"}
                  </motion.button>
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                      className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setZoom(1)}
                      className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Image Container */}
              <div className="relative bg-slate-100 dark:bg-slate-800 overflow-auto" style={{ height: "600px" }}>
                {selectedImage && (
                  <div className="relative inline-block" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
                    <img
                      ref={imageRef}
                      src={getImageUrl(selectedImage)}
                      alt={selectedImage.original_filename}
                      crossOrigin="anonymous"
                      onError={handleImageError}
                      onLoad={() => {
                        setImageLoaded(true);
                        drawDetections();
                      }}
                      className="max-w-full h-auto"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 pointer-events-none"
                    />
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {analysis.images.length > 1 && (
                <div className="p-4 border-t-2 border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2 overflow-x-auto">
                    {analysis.images.map((img) => (
                      <motion.button
                        key={img.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedImage(img);
                          setImageLoaded(false);
                        }}
                        className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage?.id === img.id
                            ? "border-indigo-600 ring-2 ring-indigo-300"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt={img.original_filename}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onError={handleImageError}
                        />
                        {img.detections_count > 0 && (
                          <div className="absolute top-1 right-1 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {img.detections_count}
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar - Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <div className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Xulosa
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Jami topilmalar</div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {analysis.total_findings}
                  </div>
                </div>

                {analysis.dominant_label && (
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Asosiy kategoriya</div>
                    <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-white font-medium">
                      {analysis.dominant_label}
                    </div>
                  </div>
                )}

                {analysis.dominant_category && (
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Xavf darajasi</div>
                    <div className={`px-3 py-2 rounded-lg font-bold border-2 ${
                      analysis.dominant_category === "malignant"
                        ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300"
                        : analysis.dominant_category === "benign"
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300"
                        : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                    }`}>
                      {analysis.dominant_category.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detections List */}
            {selectedImage?.detections_data?.detections && selectedImage.detections_data.detections.length > 0 && (
              <div className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                  Aniqlangan Topilmalar
                </h3>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedImage.detections_data.detections.map((detection, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {detection.label}
                        </span>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: `${getCategoryColor(detection.label)}20`,
                            color: getCategoryColor(detection.label),
                            border: `2px solid ${getCategoryColor(detection.label)}`,
                          }}
                        >
                          {(detection.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Position: [{detection.bbox.x1.toFixed(0)}, {detection.bbox.y1.toFixed(0)}] 
                        Size: {(detection.bbox.x2 - detection.bbox.x1).toFixed(0)} × {(detection.bbox.y2 - detection.bbox.y1).toFixed(0)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Vaqt chizigʼi
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-white">Yaratildi</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {new Date(analysis.created_at).toLocaleString("uz-UZ")}
                    </div>
                  </div>
                </div>

                {analysis.completed_at && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-white">Tugallandi</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(analysis.completed_at).toLocaleString("uz-UZ")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-rose-200 dark:border-rose-500/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-500/20">
                  <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Tahlilni Oʼchirish</h3>
              </div>

              <p className="text-slate-600 dark:text-neutral-400 mb-6">
                Haqiqatan ham <strong>Tahlil #{analysis.id}</strong> ni oʼchirmoqchimisiz? Bu amalni bekor qilib boʼlmaydi va
                barcha rasmlar ham oʼchiriladi.
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Ha, Oʼchirish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300 font-bold hover:bg-slate-300 dark:hover:bg-neutral-600 transition-all"
                >
                  Bekor qilish
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
