"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, Brain, Zap, User, CheckCircle2, AlertCircle, X, ArrowLeft, Layers } from 'lucide-react';
import { patientAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import axios from "axios";

type Patient = {
  id: number;
  full_name: string;
  medical_record_number?: string | null;
};

type ViewType = "lcc" | "rcc" | "lmlo" | "rmlo";

export default function MultiUploadPage() {
  const router = useRouter();
  const [views, setViews] = useState<Record<ViewType, File | null>>({
    lcc: null,
    rcc: null,
    lmlo: null,
    rmlo: null,
  });
  const [previews, setPreviews] = useState<Record<ViewType, string | null>>({
    lcc: null,
    rcc: null,
    lmlo: null,
    rmlo: null,
  });
  const [draggingView, setDraggingView] = useState<ViewType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientAPI.list({ limit: 100 });
      setPatients(data.items || []);
    } catch (error) {
      console.error("Failed to load patients:", error);
    }
  };

  const handleFileSelect = (view: ViewType, file: File) => {
    setViews({ ...views, [view]: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews({ ...previews, [view]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (view: ViewType, e: React.DragEvent) => {
    e.preventDefault();
    setDraggingView(null);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(view, file);
    }
  };

  const handleUpload = async () => {
    if (!views.lcc || !views.rcc || !views.lmlo || !views.rmlo) {
      setUploadError("Barcha 4 ta rasmni yuklang (LCC, RCC, LMLO, RMLO)");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("lcc", views.lcc);
      formData.append("rcc", views.rcc);
      formData.append("lmlo", views.lmlo);
      formData.append("rmlo", views.rmlo);
      
      if (selectedPatientId) {
        formData.append("patient_id", selectedPatientId.toString());
      }

      setUploadProgress(50);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.post(`${baseUrl}/infer/multi`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadProgress(100);
      setUploadResult(response.data);
      setUploadSuccess(true);

      setTimeout(() => {
        setViews({ lcc: null, rcc: null, lmlo: null, rmlo: null });
        setPreviews({ lcc: null, rcc: null, lmlo: null, rmlo: null });
        setUploadProgress(0);
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.detail || "Yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
    }
  };

  const viewLabels = {
    lcc: { title: "LCC", subtitle: "Left Craniocaudal", color: "from-blue-500 to-cyan-500" },
    rcc: { title: "RCC", subtitle: "Right Craniocaudal", color: "from-purple-500 to-pink-500" },
    lmlo: { title: "LMLO", subtitle: "Left Mediolateral Oblique", color: "from-emerald-500 to-teal-500" },
    rmlo: { title: "RMLO", subtitle: "Right Mediolateral Oblique", color: "from-amber-500 to-orange-500" },
  };

  const allViewsFilled = views.lcc && views.rcc && views.lmlo && views.rmlo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push("/upload")}
            className="flex items-center gap-2 text-slate-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Single Upload'ga qaytish</span>
          </button>

          <div className="flex items-center gap-4 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 border-2 border-indigo-200 dark:border-indigo-500/30 shadow-lg"
            >
              <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Multi-View Upload
              </h1>
              <p className="text-slate-600 dark:text-neutral-400">4 ta anatomik ko'rinish yuklash</p>
            </div>
          </div>
        </motion.div>

        {/* Patient Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Bemor tanlash (ixtiyoriy)
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
              <select
                value={selectedPatientId || ""}
                onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : null)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-slate-800/80 border-2 border-indigo-200 dark:border-slate-600 rounded-xl focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 outline-none transition-all text-slate-900 dark:text-white shadow-lg"
              >
                <option value="">Bemorni tanlash</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name} {patient.medical_record_number && `(${patient.medical_record_number})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* 4 View Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {(["lcc", "rcc", "lmlo", "rmlo"] as ViewType[]).map((view, index) => {
            const label = viewLabels[view];
            const file = views[view];
            const preview = previews[view];

            return (
              <motion.div
                key={view}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="relative"
              >
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDraggingView(view);
                  }}
                  onDragLeave={() => setDraggingView(null)}
                  onDrop={(e) => handleDrop(view, e)}
                  className={`relative rounded-2xl border-4 transition-all ${
                    draggingView === view
                      ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 scale-105"
                      : file
                      ? "border-emerald-300 dark:border-emerald-500/30 bg-white/90 dark:bg-slate-800/80"
                      : "border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 border-dashed"
                  } shadow-xl overflow-hidden`}
                  style={{ minHeight: "320px" }}
                >
                  {/* Label */}
                  <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-r ${label.color} bg-opacity-90 backdrop-blur-sm`}>
                    <h3 className="font-bold text-white text-lg">{label.title}</h3>
                    <p className="text-white/80 text-sm">{label.subtitle}</p>
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-24">
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt={view} className="w-full h-48 object-cover rounded-lg" />
                        <button
                          onClick={() => {
                            setViews({ ...views, [view]: null });
                            setPreviews({ ...previews, [view]: null });
                          }}
                          className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="mt-2 text-center">
                          <p className="text-sm font-medium text-slate-800 dark:text-white">{file?.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{(file!.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(view, file);
                          }}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center text-center h-48">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Upload className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3" />
                          </motion.div>
                          <p className="text-slate-600 dark:text-slate-400 font-medium">Click yoki sudrab tashlang</p>
                          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">PNG, JPG yoki JPEG</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Upload Button */}
        <AnimatePresence>
          {allViewsFilled && !uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex justify-center"
            >
              <motion.button
                onClick={handleUpload}
                disabled={uploading}
                whileHover={{ scale: uploading ? 1 : 1.05 }}
                whileTap={{ scale: uploading ? 1 : 0.95 }}
                className="px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
              >
                <div className="flex items-center gap-3">
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Yuklanmoqda... {uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-6 h-6" />
                      <span>4-View AI Tahlilini Boshlash</span>
                      <Zap className="w-6 h-6" />
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 max-w-2xl mx-auto"
            >
              <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 border-2 border-indigo-200 dark:border-slate-600 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Yuklanish jarayoni</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{uploadProgress}%</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mt-8 max-w-2xl mx-auto"
            >
              <div className="p-6 rounded-2xl bg-rose-100 dark:bg-rose-500/20 border-2 border-rose-300 dark:border-rose-500/30 backdrop-blur-xl shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-rose-200 dark:bg-rose-500/30">
                    <AlertCircle className="w-6 h-6 text-rose-700 dark:text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-rose-800 dark:text-rose-300 mb-1">Xatolik yuz berdi</h3>
                    <p className="text-rose-700 dark:text-rose-400">{uploadError}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setUploadError(null)}
                    className="p-2 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-rose-700 dark:text-rose-400" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {uploadSuccess && uploadResult && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mt-8 max-w-2xl mx-auto"
            >
              <div className="p-6 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-300 dark:border-emerald-500/30 backdrop-blur-xl shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 rounded-lg bg-emerald-200 dark:bg-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-1">Muvaffaqiyatli yuklandi!</h3>
                    <p className="text-emerald-700 dark:text-emerald-400">4 ta rasm AI tahlilidan o'tdi</p>
                  </div>
                </div>

                <div className="p-4 bg-white/50 dark:bg-slate-700/50 rounded-lg border-2 border-emerald-200 dark:border-emerald-500/20 mb-4">
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Tahlil #{uploadResult.analysis_id}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(uploadResult.views).map(([view, data]: [string, any]) => (
                      <div key={view} className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400 capitalize">{view}:</span>
                        <span className="font-bold text-slate-800 dark:text-white">{data.detections?.length || 0} topilma</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/analyses/${uploadResult.analysis_id}`)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Tahlilni Ko'rish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setUploadSuccess(false);
                      setUploadResult(null);
                    }}
                    className="px-4 py-3 rounded-xl bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-bold border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                  >
                    Yangi Yuklash
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
