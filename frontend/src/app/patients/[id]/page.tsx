"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, User, Calendar, Phone, Mail, MapPin, FileText, Activity, Edit, Trash2, AlertCircle } from "lucide-react";
import { patientAPI } from "@/lib/api";

type Analysis = {
  id: number;
  status: string;
  total_findings: number;
  dominant_label: string | null;
  dominant_category: string | null;
  created_at: string;
};

type Patient = {
  id: number;
  full_name: string;
  medical_record_number?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = Number(params.id);
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.get(patientId);
      setPatient(data);
      // Load analyses for this patient (you'll need to add this API call)
      // setAnalyses(data.analyses || []);
    } catch (error) {
      console.error("Failed to load patient:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu bemorni o'chirmoqchimisiz?")) return;
    
    try {
      setDeleting(true);
      await patientAPI.delete(patientId);
      router.push("/patients");
    } catch (error) {
      console.error("Failed to delete patient:", error);
      alert("Bemorni o'chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-emerald-950/10 to-neutral-950 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-xl w-1/3"></div>
          <div className="h-64 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-emerald-950/10 to-neutral-950 p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <AlertCircle className="w-20 h-20 mx-auto mb-6 text-red-500" />
          <h2 className="text-3xl font-bold text-white mb-4">Bemor topilmadi</h2>
          <button
            onClick={() => router.push("/patients")}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Bemorlar ro'yxatiga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-emerald-950/10 to-neutral-950 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/patients")}
          className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Bemorlar ro'yxatiga qaytish</span>
        </motion.button>

        {/* Patient Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-3xl">
                {patient.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{patient.full_name}</h1>
                {patient.medical_record_number && (
                  <p className="text-neutral-400">MRN: {patient.medical_record_number}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/patients/${patientId}/edit`)}
                className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patient.date_of_birth && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-neutral-500">Tug'ilgan kun</p>
                  <p className="text-white">{new Date(patient.date_of_birth).toLocaleDateString("uz-UZ")}</p>
                </div>
              </div>
            )}
            
            {patient.gender && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                <User className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-neutral-500">Jinsi</p>
                  <p className="text-white">{patient.gender}</p>
                </div>
              </div>
            )}
            
            {patient.phone && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                <Phone className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs text-neutral-500">Telefon</p>
                  <p className="text-white">{patient.phone}</p>
                </div>
              </div>
            )}
            
            {patient.email && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                <Mail className="w-5 h-5 text-pink-400" />
                <div>
                  <p className="text-xs text-neutral-500">Email</p>
                  <p className="text-white truncate">{patient.email}</p>
                </div>
              </div>
            )}
            
            {patient.address && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50 md:col-span-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-neutral-500">Manzil</p>
                  <p className="text-white">{patient.address}</p>
                </div>
              </div>
            )}
          </div>

          {patient.notes && (
            <div className="mt-4 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <p className="text-sm font-semibold text-white">Eslatmalar</p>
              </div>
              <p className="text-neutral-300">{patient.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-6 pt-6 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span>Qo'shilgan: {new Date(patient.created_at).toLocaleString("uz-UZ")}</span>
            <span>Yangilangan: {new Date(patient.updated_at).toLocaleString("uz-UZ")}</span>
          </div>
        </motion.div>

        {/* Analyses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Tahlillar Tarixi</h2>
          </div>

          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
              <p className="text-neutral-500">Bu bemor uchun hali tahlillar yo'q</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Tahlil #{analysis.id}</h3>
                      <p className="text-sm text-neutral-400">
                        {new Date(analysis.created_at).toLocaleString("uz-UZ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-400">{analysis.total_findings}</p>
                      <p className="text-xs text-neutral-500">Topilmalar</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
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
      `}</style>
    </div>
  );
}
