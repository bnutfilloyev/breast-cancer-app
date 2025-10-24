"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileImage, Loader2, Brain, Zap, Trash2, User, CheckCircle2, AlertCircle, X, Sparkles, Check, ImageIcon } from 'lucide-react';
import { patientAPI, analysisAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

type Patient = {
  id: number;
  full_name: string;
  medical_record_number?: string | null;
};

type UploadResult = {
  analysis_id: number;
  mode: string;
  views: Record<string, any>;
  model: {
    name: string;
    version: string;
  };
};

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const data = await patientAPI.list({ limit: 100 });
      setPatients(data.items || []);
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadError("Iltimos, kamida bitta rasm yuklang");
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadResults([]);

    try {
      const results: UploadResult[] = [];
      
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        // Progress calculation
        setUploadProgress(Math.round(((i) / files.length) * 90));
        
        try {
          const result = await analysisAPI.create(files[i], selectedPatientId || undefined);
          results.push(result);
        } catch (error: any) {
          console.error(`Failed to upload file ${files[i].name}:`, error);
          throw new Error(`${files[i].name} yuklashda xatolik: ${error.response?.data?.detail || error.message}`);
        }
      }
      
      setUploadProgress(100);
      setUploadResults(results);
      setUploadSuccess(true);
      
      // Clear files after 2 seconds and show results
      setTimeout(() => {
        setFiles([]);
        setPreviews([]);
        setUploadProgress(0);
      }, 2000);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || "Yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300 dark:bg-indigo-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Multi Upload Link */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/upload-multi")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <ImageIcon className="w-5 h-5" />
            <span>Multi-View Upload (4 ta rasm)</span>
          </motion.button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border-2 border-indigo-200 dark:border-indigo-500/30 backdrop-blur-sm shadow-lg"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <span className="text-indigo-700 dark:text-indigo-300 font-semibold">AI-Powered Analysis</span>
          </motion.div>
          
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Rasm Yuklash
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Tibbiy rasmlarni yuklang va sun'iy intellekt yordamida tahlil qiling
          </p>
        </motion.div>

        {/* Patient Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 border-2 border-indigo-200 dark:border-slate-600 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-500/20 dark:to-cyan-500/20 shadow-md"
              >
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Bemor Tanlash</h3>
            </div>
            
            {loadingPatients ? (
              <div className="h-12 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-slate-700 dark:to-slate-600 rounded-xl animate-pulse"></div>
            ) : (
              <select
                value={selectedPatientId || ""}
                onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-indigo-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 outline-none transition-all font-medium shadow-sm"
              >
                <option value="">Bemorni tanlang (ixtiyoriy)</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name} {patient.medical_record_number ? `(MRN: ${patient.medical_record_number})` : ""}
                  </option>
                ))}
              </select>
            )}
            
            {selectedPatientId && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2 font-medium"
              >
                <Check className="w-4 h-4" />
                Bemor tanlandi
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`relative group transition-all duration-300 ${
              isDragging ? 'scale-105' : ''
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-3xl blur-2xl transition-opacity duration-500 ${
              isDragging ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'
            }`}></div>
            
            <div className={`relative p-16 border-2 border-dashed rounded-3xl backdrop-blur-xl transition-all shadow-xl ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-500/20 scale-105' 
                : 'border-indigo-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/60 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-2xl'
            }`}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
                className="hidden"
                id="file-upload"
              />
              
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    animate={{ 
                      y: isDragging ? -10 : [0, -10, 0],
                      rotate: isDragging ? 5 : 0,
                      scale: isDragging ? 1.1 : 1
                    }}
                    transition={{ 
                      y: { repeat: Infinity, duration: 2 },
                      rotate: { duration: 0.3 },
                      scale: { duration: 0.3 }
                    }}
                    className={`p-6 rounded-2xl bg-gradient-to-br transition-all shadow-xl ${
                      isDragging 
                        ? 'from-indigo-200 to-purple-200 dark:from-indigo-500/40 dark:to-purple-500/40 border-4 border-indigo-500 scale-110' 
                        : 'from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 border-2 border-indigo-300 dark:border-indigo-500/30'
                    }`}
                  >
                    <Upload className={`w-16 h-16 transition-colors ${isDragging ? 'text-indigo-600 dark:text-indigo-300' : 'text-indigo-500 dark:text-indigo-400'}`} />
                  </motion.div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                      {isDragging ? "Rasmlarni tashlang" : "Rasmlarni yuklash"}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      Rasmlarni bu yerga sudrab olib keling yoki bosing
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                      PNG, JPG, JPEG (Maksimal 10MB)
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Preview Grid */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Yuklangan rasmlar ({files.length})
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setFiles([]); setPreviews([]); setUploadError(null); setUploadSuccess(false); }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-500/20 dark:to-pink-500/20 border-2 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 hover:from-rose-200 hover:to-pink-200 dark:hover:from-rose-500/30 dark:hover:to-pink-500/30 transition-all font-semibold shadow-md"
                >
                  Barchasini o'chirish
                </motion.button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-neutral-800 group-hover:border-indigo-500/50 transition-all">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/30 transition-all backdrop-blur-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      {/* File Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white truncate">{files[index].name}</p>
                        <p className="text-xs text-neutral-400">
                          {(files[index].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Button */}
        <AnimatePresence>
          {files.length > 0 && !uploadSuccess && (
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
                className="group relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-transform duration-300 group-hover:scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative flex items-center gap-3 text-white">
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Yuklanmoqda... {uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span>AI Tahlilini Boshlash</span>
                      <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
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
          {uploadSuccess && uploadResults.length > 0 && (
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
                    <p className="text-emerald-700 dark:text-emerald-400">{uploadResults.length} ta rasm AI tahlilidan o'tdi</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {uploadResults.map((result, index) => {
                    // Calculate total detections from all views
                    const totalDetections = Object.values(result.views).reduce((sum: number, view: any) => {
                      return sum + (view.detections?.length || 0);
                    }, 0);
                    
                    return (
                      <div key={result.analysis_id} className="p-3 rounded-lg bg-white/50 dark:bg-slate-700/50 border border-emerald-200 dark:border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tahlil #{result.analysis_id}</span>
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-200 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                            COMPLETED
                          </span>
                        </div>
                        {totalDetections > 0 && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {totalDetections} ta topilma aniqlandi
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/analyses')}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Tahlillarni Ko'rish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setUploadSuccess(false);
                      setUploadResults([]);
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

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
