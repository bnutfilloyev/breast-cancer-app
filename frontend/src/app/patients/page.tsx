"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, Users, Calendar, Phone, Mail, MapPin, Eye, Sparkles } from "lucide-react";
import { patientAPI } from "@/lib/api";

type Patient = {
  id: number;
  full_name: string;
  medical_record_number?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
};

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPatients();
  }, [page, search]);

  async function fetchPatients() {
    setLoading(true);
    try {
      const data = await patientAPI.list({
        skip: (page - 1) * 20,
        limit: 20,
        search: search || undefined,
      });
      setPatients(data.items || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu bemorni o'chirmoqchimisiz?")) return;
    
    try {
      setDeletingId(id);
      await patientAPI.delete(id);
      fetchPatients();
    } catch (error) {
      console.error("Failed to delete patient:", error);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-300 dark:bg-emerald-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-teal-300 dark:bg-teal-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-300 dark:bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                whileHover={{ scale: 1.15, rotate: 360 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/20 border-2 border-emerald-200 dark:border-emerald-500/30 shadow-lg hover:shadow-emerald-300/50 dark:hover:shadow-emerald-500/30 transition-all duration-300"
              >
                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </motion.div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Bemorlar
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Barcha bemorlar ma'lumotlari</p>
              </div>
            </div>

            <motion.button
              onClick={() => router.push("/patients/new")}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-6 py-3 rounded-xl font-semibold overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 transition-transform group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>Yangi Bemor</span>
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 relative group"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors group-focus-within:scale-110" />
          <input
            type="text"
            placeholder="Bemor nomi yoki tibbiy kartasi bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-slate-800/70 border-2 border-cyan-200 dark:border-slate-600 rounded-xl focus:border-emerald-400 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-500/20 outline-none transition-all backdrop-blur-sm text-lg text-slate-900 dark:text-white shadow-md focus:shadow-xl"
          />
        </motion.div>

        {/* Patients Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gradient-to-br from-cyan-100 to-emerald-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl animate-pulse shadow-md"></div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Users className="w-20 h-20 mx-auto mb-6 text-slate-400 dark:text-slate-600" />
            <p className="text-slate-600 dark:text-slate-400 text-xl mb-2 font-semibold">Bemorlar topilmadi</p>
            <p className="text-slate-500 dark:text-slate-500">Yangi bemor qo'shishdan boshlang</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {patients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -10, scale: 1.03, rotate: 1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/30 via-cyan-200/30 to-teal-200/30 dark:from-emerald-500/0 dark:via-emerald-500/5 dark:to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl"></div>
                  
                  <div className="relative p-6 bg-white/80 dark:bg-slate-800/80 border-2 border-cyan-200 dark:border-slate-600 group-hover:border-emerald-300 dark:group-hover:border-emerald-500/50 rounded-2xl backdrop-blur-xl transition-all duration-300 shadow-lg hover:shadow-2xl">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md"
                        >
                          {patient.full_name.charAt(0).toUpperCase()}
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {patient.full_name}
                          </h3>
                          {patient.medical_record_number && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">MRN: {patient.medical_record_number}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4 text-sm">
                      {patient.date_of_birth && (
                        <motion.div 
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span>{new Date(patient.date_of_birth).toLocaleDateString("uz-UZ")}</span>
                        </motion.div>
                      )}
                      {patient.phone && (
                        <motion.div 
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Phone className="w-4 h-4 text-cyan-500" />
                          <span>{patient.phone}</span>
                        </motion.div>
                      )}
                      {patient.email && (
                        <motion.div 
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span className="truncate">{patient.email}</span>
                        </motion.div>
                      )}
                      {patient.gender && (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 text-cyan-700 dark:text-cyan-300 border-2 border-cyan-200 dark:border-cyan-500/30 font-medium">
                            {patient.gender}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-cyan-100 dark:border-slate-700">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Qo'shilgan: {new Date(patient.created_at).toLocaleDateString("uz-UZ")}
                      </span>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/patients/${patient.id}`)}
                          className="p-2 rounded-lg bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 border-2 border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 hover:from-cyan-200 hover:to-blue-200 dark:hover:from-cyan-500/30 dark:hover:to-blue-500/30 transition-all shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/patients/${patient.id}/edit`)}
                          className="p-2 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/20 border-2 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-500/30 dark:hover:to-teal-500/30 transition-all shadow-md"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(patient.id)}
                          disabled={deletingId === patient.id}
                          className="p-2 rounded-lg bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-500/20 dark:to-pink-500/20 border-2 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 hover:from-rose-200 hover:to-pink-200 dark:hover:from-rose-500/30 dark:hover:to-pink-500/30 transition-all disabled:opacity-50 shadow-md"
                        >
                          {deletingId === patient.id ? (
                            <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-white hover:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Oldingi
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      page === pageNum
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                        : "bg-neutral-900/50 border border-neutral-800 text-neutral-400 hover:border-emerald-500/50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-white hover:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Keyingi
            </button>
          </motion.div>
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
