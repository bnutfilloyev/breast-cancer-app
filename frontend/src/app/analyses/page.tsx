"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileImage, Search, Calendar, User, TrendingUp, Filter, Eye } from "lucide-react";
import { analysisAPI } from "@/lib/api";

type Analysis = {
  id: number;
  patient_id: number | null;
  status: string;
  total_findings: number;
  dominant_label: string | null;
  dominant_category: string | null;
  created_at: string;
  updated_at: string;
};

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const response = await analysisAPI.list();
      setAnalyses(response.items || []);
    } catch (error) {
      console.error("Failed to load analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch = 
      analysis.dominant_label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || analysis.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30";
      case "PENDING":
        return "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30";
      case "PROCESSING":
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30";
      default:
        return "bg-slate-100 dark:bg-gray-500/20 text-slate-600 dark:text-gray-300 border-slate-300 dark:border-gray-500/30";
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "malignant":
        return "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30";
      case "benign":
        return "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30";
      case "normal":
        return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30";
      default:
        return "bg-slate-100 dark:bg-gray-500/20 text-slate-600 dark:text-gray-300 border-slate-300 dark:border-gray-500/30";
    }
  };

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
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-500/20 dark:to-blue-500/20 border-2 border-purple-200 dark:border-purple-500/30 shadow-lg"
            >
              <FileImage className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
              Tahlillar
            </h1>
          </div>
          <p className="text-slate-700 dark:text-neutral-400 ml-16">Barcha tekshiruvlar va natijalar</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-neutral-500 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              placeholder="Tahlil ID yoki natija bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-neutral-900/50 border-2 border-slate-200 dark:border-neutral-800 rounded-xl focus:border-purple-400 dark:focus:border-purple-500/50 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/20 outline-none transition-all backdrop-blur-sm text-slate-900 dark:text-white shadow-lg"
            />
          </div>

          {/* Status Filter */}
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-neutral-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-12 pr-8 py-3 bg-white/80 dark:bg-neutral-900/50 border-2 border-slate-200 dark:border-neutral-800 rounded-xl focus:border-blue-400 dark:focus:border-blue-500/50 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm appearance-none cursor-pointer text-slate-900 dark:text-white shadow-lg"
            >
              <option value="all">Barcha statuslar</option>
              <option value="COMPLETED">Bajarilgan</option>
              <option value="PENDING">Kutilmoqda</option>
              <option value="PROCESSING">Jarayonda</option>
            </select>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Jami", value: analyses.length, color: "from-purple-500 to-blue-500", icon: FileImage },
            { label: "Bajarilgan", value: analyses.filter(a => a.status === "COMPLETED").length, color: "from-emerald-500 to-teal-500", icon: Eye },
            { label: "Kutilmoqda", value: analyses.filter(a => a.status === "PENDING").length, color: "from-amber-500 to-orange-500", icon: Calendar },
            { label: "O'rtacha topilmalar", value: Math.round(analyses.reduce((acc, a) => acc + a.total_findings, 0) / analyses.length) || 0, color: "from-pink-500 to-rose-500", icon: TrendingUp },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.08, y: -10, rotate: 1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-30 group-hover:opacity-60 blur-xl transition-all duration-300" 
                   style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}></div>
              <div className={`relative p-6 rounded-2xl bg-white/90 dark:bg-neutral-900/50 border-2 border-slate-200 dark:border-white/10 backdrop-blur-sm shadow-xl group-hover:shadow-2xl transition-all`}>
                <div className="flex items-center justify-between mb-2">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-5 h-5 text-slate-600 dark:text-white/70" />
                  </motion.div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform`}>
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-neutral-400 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Analyses List */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/60 dark:bg-neutral-900/50 rounded-2xl animate-pulse border-2 border-slate-200 dark:border-neutral-800"></div>
            ))}
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FileImage className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-neutral-600" />
            </motion.div>
            <p className="text-slate-600 dark:text-neutral-500 text-lg font-medium">Tahlillar topilmadi</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAnalyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200/0 via-purple-200/50 to-blue-200/0 dark:from-purple-500/0 dark:via-purple-500/5 dark:to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl"></div>
                <div className="relative p-6 bg-white/90 dark:bg-neutral-900/50 border-2 border-slate-200 dark:border-neutral-800 group-hover:border-purple-300 dark:group-hover:border-purple-500/50 rounded-2xl backdrop-blur-sm transition-all shadow-lg group-hover:shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                        className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-500/20 dark:to-blue-500/20 border-2 border-purple-200 dark:border-purple-500/30 shadow-md"
                      >
                        <FileImage className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Tahlil #{analysis.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(analysis.status)}`}>
                            {analysis.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-neutral-400">
                          {analysis.patient_id && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Bemor #{analysis.patient_id}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(analysis.created_at).toLocaleDateString("uz-UZ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{analysis.total_findings}</div>
                        <div className="text-xs text-slate-500 dark:text-neutral-500 font-medium">Topilmalar</div>
                      </div>
                      {analysis.dominant_label && (
                        <div className={`px-4 py-2 rounded-lg border-2 ${getCategoryColor(analysis.dominant_category)} font-medium`}>
                          <div className="text-sm">{analysis.dominant_label}</div>
                        </div>
                      )}
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20 border-2 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all shadow-md"
                      >
                        <Eye className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
