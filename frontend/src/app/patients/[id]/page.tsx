"use client";"use client";"use client";"use client";"use client";



import { useState, useEffect } from "react";

import { useParams, useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";import { useState, useEffect } from "react";

import {

  User, Calendar, FileText, Activity, Edit2, Trash2, ArrowLeft,import { useParams, useRouter } from "next/navigation";

  Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle, XCircle,

  Eye, Loader2import { motion, AnimatePresence } from "framer-motion";import { useState, useEffect } from "react";

} from "lucide-react";

import { patientAPI, analysisAPI } from "@/lib/api";import {



type Patient = {  User,import { useParams, useRouter } from "next/navigation";

  id: number;

  full_name: string;  Calendar,

  date_of_birth?: string;

  medical_record_number?: string;  FileText,import { motion } from "framer-motion";import { useState, useEffect } from "react";import { useState, useEffect } from "react";

  contact_phone?: string;

  contact_email?: string;  Activity,

  address?: string;

  created_at: string;  Edit2,import {

  updated_at: string;

  total_analyses?: number;  Trash2,

  completed_analyses?: number;

  pending_analyses?: number;  ArrowLeft,  ArrowLeft,import { useParams, useRouter } from "next/navigation";import { useRouter, useParams } from "next/navigation";

  total_findings?: number;

};  Phone,



type Analysis = {  Mail,  User,

  id: number;

  patient_id: number;  MapPin,

  mode: string;

  status: string;  Clock,  Calendar,import { motion, AnimatePresence } from "framer-motion";import { motion } from "framer-motion";

  total_findings: number;

  dominant_label?: string;  CheckCircle,

  dominant_category?: string;

  created_at: string;  AlertCircle,  Phone,

  completed_at?: string;

};  XCircle,



export default function PatientDetailPage() {  Eye,  Mail,import {import { ArrowLeft, User, Calendar, Phone, Mail, MapPin, FileText, Activity, Edit, Trash2, AlertCircle } from "lucide-react";

  const params = useParams();

  const router = useRouter();  Loader2,

  const patientId = Number(params.id);

} from "lucide-react";  MapPin,

  const [patient, setPatient] = useState<Patient | null>(null);

  const [analyses, setAnalyses] = useState<Analysis[]>([]);import { patientAPI, analysisAPI } from "@/lib/api";

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);  FileText,  ArrowLeft,import { patientAPI } from "@/lib/api";

  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);type Patient = {

  const [editForm, setEditForm] = useState({

    full_name: "",  id: number;  Edit,

    date_of_birth: "",

    medical_record_number: "",  full_name: string;

    contact_phone: "",

    contact_email: "",  date_of_birth?: string;  Trash2,  User,

    address: "",

  });  medical_record_number?: string;



  useEffect(() => {  contact_phone?: string;  Activity,

    loadPatientData();

  }, [patientId]);  contact_email?: string;



  const loadPatientData = async () => {  address?: string;  CheckCircle2,  Calendar,type Analysis = {

    try {

      setLoading(true);  created_at: string;

      setError(null);

  updated_at: string;  Clock,

      const [patientData, analysesData] = await Promise.all([

        patientAPI.get(patientId),  total_analyses?: number;

        analysisAPI.list({ patient_id: patientId, limit: 100 }),

      ]);  completed_analyses?: number;  FileImage,  Phone,  id: number;



      setPatient(patientData);  pending_analyses?: number;

      setAnalyses(analysesData.items || []);

  total_findings?: number;  AlertCircle,

      setEditForm({

        full_name: patientData.full_name || "",};

        date_of_birth: patientData.date_of_birth || "",

        medical_record_number: patientData.medical_record_number || "",} from "lucide-react";  Mail,  status: string;

        contact_phone: patientData.contact_phone || "",

        contact_email: patientData.contact_email || "",type Analysis = {

        address: patientData.address || "",

      });  id: number;import { patientAPI } from "@/lib/api";

    } catch (error: any) {

      console.error("Failed to load patient:", error);  patient_id: number;

      setError(error.message || "Ma'lumotlarni yuklashda xatolik");

    } finally {  mode: string;  MapPin,  total_findings: number;

      setLoading(false);

    }  status: string;

  };

  total_findings: number;export default function PatientDetailPage() {

  const handleEdit = async () => {

    try {  dominant_label?: string;

      const updated = await patientAPI.update(patientId, editForm);

      setPatient(updated);  dominant_category?: string;  const params = useParams();  FileText,  dominant_label: string | null;

      setShowEditModal(false);

    } catch (error: any) {  created_at: string;

      console.error("Failed to update patient:", error);

      alert("Tahrirlashda xatolik: " + (error.message || "Unknown error"));  completed_at?: string;  const router = useRouter();

    }

  };};



  const handleDelete = async () => {  const [patient, setPatient] = useState<any>(null);  Edit,  dominant_category: string | null;

    try {

      await patientAPI.delete(patientId);export default function PatientDetailPage() {

      router.push("/patients");

    } catch (error: any) {  const params = useParams();  const [loading, setLoading] = useState(true);

      console.error("Failed to delete patient:", error);

      alert("O'chirishda xatolik: " + (error.message || "Unknown error"));  const router = useRouter();

    }

  };  const patientId = Number(params.id);  Trash2,  created_at: string;



  const getStatusIcon = (status: string) => {

    switch (status) {

      case "COMPLETED":  const [patient, setPatient] = useState<Patient | null>(null);  useEffect(() => {

        return <CheckCircle className="w-5 h-5 text-emerald-500" />;

      case "PROCESSING":  const [analyses, setAnalyses] = useState<Analysis[]>([]);

        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;

      case "FAILED":  const [loading, setLoading] = useState(true);    loadPatient();  Activity,};

        return <XCircle className="w-5 h-5 text-rose-500" />;

      default:  const [error, setError] = useState<string | null>(null);

        return <Clock className="w-5 h-5 text-amber-500" />;

    }  const [showEditModal, setShowEditModal] = useState(false);  }, []);

  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getCategoryBadge = (category?: string) => {

    if (!category) return null;  const [editForm, setEditForm] = useState({  TrendingUp,

    

    const colors: Record<string, string> = {    full_name: "",

      normal: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",

      benign: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",    date_of_birth: "",  const loadPatient = async () => {

      malignant: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",

    };    medical_record_number: "",



    return (    contact_phone: "",    try {  AlertCircle,type Patient = {

      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[category] || "bg-slate-100 text-slate-700"}`}>

        {category}    contact_email: "",

      </span>

    );    address: "",      const data = await patientAPI.get(Number(params.id));

  };

  });

  if (loading) {

    return (      setPatient(data);  CheckCircle2,  id: number;

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">

        <div className="text-center">  useEffect(() => {

          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />

          <p className="text-slate-600 dark:text-neutral-400">Yuklanmoqda...</p>    loadPatientData();    } catch (error) {

        </div>

      </div>  }, [patientId]);

    );

  }      console.error("Error:", error);  Clock,  full_name: string;



  if (error || !patient) {  const loadPatientData = async () => {

    return (

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">    try {    } finally {

        <div className="text-center">

          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />      setLoading(true);

          <p className="text-slate-800 dark:text-white text-xl font-bold mb-2">Xatolik yuz berdi</p>

          <p className="text-slate-600 dark:text-neutral-400 mb-6">{error || "Bemor topilmadi"}</p>      setError(null);      setLoading(false);  FileImage,  medical_record_number?: string | null;

          <button

            onClick={() => router.push("/patients")}

            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg"

          >      const [patientData, analysesData] = await Promise.all([    }

            Bemorlar ro'yxatiga qaytish

          </button>        patientAPI.get(patientId),

        </div>

      </div>        analysisAPI.list({ patient_id: patientId, limit: 100 }),  };  X,  date_of_birth?: string | null;

    );

  }      ]);



  return (

    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-neutral-950 dark:to-neutral-900">

      {/* Animated Background */}      setPatient(patientData);

      <div className="fixed inset-0 overflow-hidden pointer-events-none">

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>      setAnalyses(analysesData.items || []);  if (loading) {} from "lucide-react";  gender?: string | null;

        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>

        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>

      </div>

      setEditForm({    return (

      <div className="relative z-10 p-8 max-w-7xl mx-auto">

        {/* Header */}        full_name: patientData.full_name || "",

        <motion.div

          initial={{ opacity: 0, y: -20 }}        date_of_birth: patientData.date_of_birth || "",      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">import { patientAPI } from "@/lib/api";  phone?: string | null;

          animate={{ opacity: 1, y: 0 }}

          className="mb-6"        medical_record_number: patientData.medical_record_number || "",

        >

          <button        contact_phone: patientData.contact_phone || "",        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>

            onClick={() => router.push("/patients")}

            className="flex items-center gap-2 text-slate-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"        contact_email: patientData.contact_email || "",

          >

            <ArrowLeft className="w-5 h-5" />        address: patientData.address || "",      </div>  email?: string | null;

            <span className="font-medium">Bemorlar ro'yxatiga qaytish</span>

          </button>      });



          <div className="flex items-center justify-between">    } catch (error: any) {    );

            <div className="flex items-center gap-4">

              <motion.div      console.error("Failed to load patient:", error);

                animate={{ rotate: 360 }}

                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}      setError(error.message || "Ma'lumotlarni yuklashda xatolik");  }type Analysis = {  address?: string | null;

                className="p-4 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 border-2 border-indigo-200 dark:border-indigo-500/30 shadow-lg"

              >    } finally {

                <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />

              </motion.div>      setLoading(false);

              <div>

                <h1 className="text-4xl font-bold text-slate-800 dark:text-white">{patient.full_name}</h1>    }

                <p className="text-slate-600 dark:text-neutral-400">

                  {patient.medical_record_number ? `MRN: ${patient.medical_record_number}` : "Bemor ma'lumotlari"}  };  if (!patient) {  id: number;  notes?: string | null;

                </p>

              </div>

            </div>

  const handleEdit = async () => {    return (

            <div className="flex gap-3">

              <motion.button    try {

                whileHover={{ scale: 1.05 }}

                whileTap={{ scale: 0.95 }}      const updated = await patientAPI.update(patientId, editForm);      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">  mode: string;  created_at: string;

                onClick={() => setShowEditModal(true)}

                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-neutral-800/80 border-2 border-indigo-200 dark:border-neutral-700 text-slate-700 dark:text-white font-medium shadow-lg hover:shadow-xl transition-all"      setPatient(updated);

              >

                <Edit2 className="w-5 h-5" />      setShowEditModal(false);        <div className="text-center">

                Tahrirlash

              </motion.button>    } catch (error: any) {

              <motion.button

                whileHover={{ scale: 1.05 }}      console.error("Failed to update patient:", error);          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />  status: string;  updated_at: string;

                whileTap={{ scale: 0.95 }}

                onClick={() => setShowDeleteModal(true)}      alert("Tahrirlashda xatolik: " + (error.message || "Unknown error"));

                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 border-2 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 font-medium shadow-lg hover:shadow-xl transition-all"

              >    }          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Bemor topilmadi</h2>

                <Trash2 className="w-5 h-5" />

                O'chirish  };

              </motion.button>

            </div>          <button onClick={() => router.push("/patients")} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg">  total_findings: number;};

          </div>

        </motion.div>  const handleDelete = async () => {



        {/* Rest of the component continues in next file... */}    try {            Orqaga

      </div>

    </div>      await patientAPI.delete(patientId);

  );

}      router.push("/patients");          </button>  dominant_label: string | null;


    } catch (error: any) {

      console.error("Failed to delete patient:", error);        </div>

      alert("O'chirishda xatolik: " + (error.message || "Unknown error"));

    }      </div>  dominant_category: string | null;export default function PatientDetailPage() {

  };

    );

  const getStatusIcon = (status: string) => {

    switch (status) {  }  created_at: string;  const router = useRouter();

      case "COMPLETED":

        return <CheckCircle className="w-5 h-5 text-emerald-500" />;

      case "PROCESSING":

        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;  const stats = {  completed_at: string | null;  const params = useParams();

      case "FAILED":

        return <XCircle className="w-5 h-5 text-rose-500" />;    total: patient.analyses.length,

      default:

        return <Clock className="w-5 h-5 text-amber-500" />;    completed: patient.analyses.filter((a: any) => a.status === "completed").length,};  const patientId = Number(params.id);

    }

  };    pending: patient.analyses.filter((a: any) => a.status === "pending" || a.status === "processing").length,



  const getCategoryBadge = (category?: string) => {    totalFindings: patient.analyses.reduce((sum: number, a: any) => sum + a.total_findings, 0),  

    if (!category) return null;

      };

    const colors = {

      normal: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",type Patient = {  const [patient, setPatient] = useState<Patient | null>(null);

      benign: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",

      malignant: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",  return (

    };

    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-8">  id: number;  const [analyses, setAnalyses] = useState<Analysis[]>([]);

    return (

      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[category as keyof typeof colors] || "bg-slate-100 text-slate-700"}`}>      {/* Header */}

        {category}

      </span>      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">  full_name: string;  const [loading, setLoading] = useState(true);

    );

  };        <button onClick={() => router.push("/patients")} className="flex items-center gap-2 text-slate-600 dark:text-neutral-400 hover:text-indigo-600 mb-4">



  if (loading) {          <ArrowLeft className="w-5 h-5" />  medical_record_number: string | null;  const [deleting, setDeleting] = useState(false);

    return (

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">          Orqaga

        <div className="text-center">

          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />        </button>  date_of_birth: string | null;

          <p className="text-slate-600 dark:text-neutral-400">Yuklanmoqda...</p>

        </div>

      </div>

    );        <div className="flex items-center justify-between">  gender: string | null;  useEffect(() => {

  }

          <div className="flex items-center gap-4">

  if (error || !patient) {

    return (            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-100 to-indigo-100 dark:from-cyan-500/20 dark:to-indigo-500/20 border-2 border-cyan-200 dark:border-cyan-500/30 shadow-lg">  phone: string | null;    if (patientId) {

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">

        <div className="text-center">              <User className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />

          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />

          <p className="text-slate-800 dark:text-white text-xl font-bold mb-2">Xatolik yuz berdi</p>            </div>  email: string | null;      loadPatient();

          <p className="text-slate-600 dark:text-neutral-400 mb-6">{error || "Bemor topilmadi"}</p>

          <button            <div>

            onClick={() => router.push("/patients")}

            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg"              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{patient.full_name}</h1>  address: string | null;    }

          >

            Bemorlar ro'yxatiga qaytish              <div className="flex items-center gap-4 mt-2">

          </button>

        </div>                {patient.medical_record_number && (  notes: string | null;  }, [patientId]);

      </div>

    );                  <span className="text-sm text-slate-600 dark:text-neutral-400">MRN: {patient.medical_record_number}</span>

  }

                )}  is_active: boolean;

  return (

    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-neutral-950 dark:to-neutral-900">                <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${

      {/* Animated Background */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">                  patient.is_active  created_at: string;  const loadPatient = async () => {

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>

        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300"

        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>

      </div>                    : "bg-slate-100 text-slate-600 border-slate-300"  updated_at: string | null;    try {



      <div className="relative z-10 p-8 max-w-7xl mx-auto">                }`}>

        {/* Header */}

        <motion.div                  {patient.is_active ? "Faol" : "Nofaol"}  analyses: Analysis[];      setLoading(true);

          initial={{ opacity: 0, y: -20 }}

          animate={{ opacity: 1, y: 0 }}                </span>

          className="mb-6"

        >              </div>};      const data = await patientAPI.get(patientId);

          <button

            onClick={() => router.push("/patients")}            </div>

            className="flex items-center gap-2 text-slate-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"

          >          </div>      setPatient(data);

            <ArrowLeft className="w-5 h-5" />

            <span className="font-medium">Bemorlar ro'yxatiga qaytish</span>

          </button>

          <button onClick={() => router.push("/patients")} className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg">export default function PatientDetailPage() {      // Load analyses for this patient (you'll need to add this API call)

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">            <Edit className="w-5 h-5 inline mr-2" />

              <motion.div

                animate={{ rotate: 360 }}            Tahrirlash  const params = useParams();      // setAnalyses(data.analyses || []);

                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}

                className="p-4 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 border-2 border-indigo-200 dark:border-indigo-500/30 shadow-lg"          </button>

              >

                <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />        </div>  const router = useRouter();    } catch (error) {

              </motion.div>

              <div>      </motion.div>

                <h1 className="text-4xl font-bold text-slate-800 dark:text-white">{patient.full_name}</h1>

                <p className="text-slate-600 dark:text-neutral-400">      console.error("Failed to load patient:", error);

                  {patient.medical_record_number ? `MRN: ${patient.medical_record_number}` : "Bemor ma'lumotlari"}

                </p>      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              </div>

            </div>        {/* Stats */}  const [patient, setPatient] = useState<Patient | null>(null);    } finally {



            <div className="flex gap-3">        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

              <motion.button

                whileHover={{ scale: 1.05 }}          <div className="grid grid-cols-2 gap-4">  const [loading, setLoading] = useState(true);      setLoading(false);

                whileTap={{ scale: 0.95 }}

                onClick={() => setShowEditModal(true)}            {[

                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-neutral-800/80 border-2 border-indigo-200 dark:border-neutral-700 text-slate-700 dark:text-white font-medium shadow-lg hover:shadow-xl transition-all"

              >              { label: "Jami", value: stats.total, color: "from-purple-500 to-blue-500", icon: FileImage },  const [showEditModal, setShowEditModal] = useState(false);    }

                <Edit2 className="w-5 h-5" />

                Tahrirlash              { label: "Tugallangan", value: stats.completed, color: "from-emerald-500 to-teal-500", icon: CheckCircle2 },

              </motion.button>

              <motion.button              { label: "Kutilmoqda", value: stats.pending, color: "from-amber-500 to-orange-500", icon: Clock },  const [showDeleteModal, setShowDeleteModal] = useState(false);  };

                whileHover={{ scale: 1.05 }}

                whileTap={{ scale: 0.95 }}              { label: "Topilmalar", value: stats.totalFindings, color: "from-rose-500 to-pink-500", icon: Activity },

                onClick={() => setShowDeleteModal(true)}

                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 border-2 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 font-medium shadow-lg hover:shadow-xl transition-all"            ].map((stat) => (  const [editForm, setEditForm] = useState({

              >

                <Trash2 className="w-5 h-5" />              <div key={stat.label} className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-4">

                O'chirish

              </motion.button>                <div className="flex items-center justify-between mb-2">    full_name: "",  const handleDelete = async () => {

            </div>

          </div>                  <stat.icon className="w-5 h-5 text-slate-600" />

        </motion.div>

                  <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>    medical_record_number: "",    if (!confirm("Bu bemorni o'chirmoqchimisiz?")) return;

        {/* Stats Cards */}

        <motion.div                </div>

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}                <div className="text-xs text-slate-600 font-medium">{stat.label}</div>    date_of_birth: "",    

          transition={{ delay: 0.1 }}

          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"              </div>

        >

          {[            ))}    gender: "",    try {

            {

              label: "Jami Tahlillar",          </div>

              value: patient.total_analyses || 0,

              icon: FileText,    phone: "",      setDeleting(true);

              color: "from-blue-500 to-cyan-500",

            },          {/* Info */}

            {

              label: "Bajarilgan",          <div className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-6">    email: "",      await patientAPI.delete(patientId);

              value: patient.completed_analyses || 0,

              icon: CheckCircle,            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Ma'lumotlar</h3>

              color: "from-emerald-500 to-teal-500",

            },            <div className="space-y-3">    address: "",      router.push("/patients");

            {

              label: "Kutilmoqda",              {patient.date_of_birth && (

              value: patient.pending_analyses || 0,

              icon: Clock,                <div className="flex items-start gap-3">    notes: "",    } catch (error) {

              color: "from-amber-500 to-orange-500",

            },                  <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />

            {

              label: "Topilmalar",                  <div>  });      console.error("Failed to delete patient:", error);

              value: patient.total_findings || 0,

              icon: Activity,                    <div className="text-xs text-slate-500">Tug'ilgan sana</div>

              color: "from-purple-500 to-pink-500",

            },                    <div className="text-sm font-medium text-slate-800 dark:text-white">{new Date(patient.date_of_birth).toLocaleDateString("uz-UZ")}</div>      alert("Bemorni o'chirishda xatolik yuz berdi");

          ].map((stat, index) => (

            <motion.div                  </div>

              key={stat.label}

              initial={{ opacity: 0, scale: 0.9 }}                </div>  useEffect(() => {    } finally {

              animate={{ opacity: 1, scale: 1 }}

              transition={{ delay: 0.2 + index * 0.1 }}              )}

              whileHover={{ scale: 1.05, y: -5 }}

              className="relative group"              {patient.gender && (    loadPatient();      setDeleting(false);

            >

              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-20 blur-xl transition-opacity group-hover:opacity-40 rounded-2xl`}></div>                <div className="flex items-start gap-3">

              <div className="relative p-6 rounded-2xl bg-white/90 dark:bg-neutral-900/50 border-2 border-indigo-100 dark:border-white/10 backdrop-blur-sm shadow-xl">

                <div className="flex items-center justify-between mb-3">                  <User className="w-5 h-5 text-slate-500 mt-0.5" />  }, [params.id]);    }

                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>

                    <stat.icon className="w-6 h-6 text-white" />                  <div>

                  </div>

                </div>                    <div className="text-xs text-slate-500">Jinsi</div>  };

                <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>

                  {stat.value}                    <div className="text-sm font-medium text-slate-800 dark:text-white">{patient.gender === "male" ? "Erkak" : "Ayol"}</div>

                </div>

                <div className="text-sm font-medium text-slate-600 dark:text-neutral-400">{stat.label}</div>                  </div>  const loadPatient = async () => {

              </div>

            </motion.div>                </div>

          ))}

        </motion.div>              )}    try {  if (loading) {



        {/* Patient Info & Analyses */}              {patient.phone && (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Patient Info */}                <div className="flex items-start gap-3">      setLoading(true);    return (

          <motion.div

            initial={{ opacity: 0, x: -20 }}                  <Phone className="w-5 h-5 text-slate-500 mt-0.5" />

            animate={{ opacity: 1, x: 0 }}

            transition={{ delay: 0.3 }}                  <div>      const data = await patientAPI.get(Number(params.id));      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-emerald-950/10 to-neutral-950 p-8">

            className="lg:col-span-1"

          >                    <div className="text-xs text-slate-500">Telefon</div>

            <div className="p-6 rounded-2xl bg-white/90 dark:bg-neutral-900/50 border-2 border-indigo-100 dark:border-neutral-800 backdrop-blur-sm shadow-xl">

              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">                    <div className="text-sm font-medium text-slate-800 dark:text-white">{patient.phone}</div>      setPatient(data);        <div className="animate-pulse space-y-6">

                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />

                Bemor Ma'lumotlari                  </div>

              </h3>

              <div className="space-y-4">                </div>      setEditForm({          <div className="h-12 bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-xl w-1/3"></div>

                {patient.date_of_birth && (

                  <div className="flex items-start gap-3">              )}

                    <Calendar className="w-5 h-5 text-slate-500 dark:text-neutral-400 mt-0.5" />

                    <div>              {patient.email && (        full_name: data.full_name,          <div className="h-64 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl"></div>

                      <div className="text-xs text-slate-500 dark:text-neutral-500">Tug'ilgan kun</div>

                      <div className="text-sm font-medium text-slate-800 dark:text-white">                <div className="flex items-start gap-3">

                        {new Date(patient.date_of_birth).toLocaleDateString("uz-UZ")}

                      </div>                  <Mail className="w-5 h-5 text-slate-500 mt-0.5" />        medical_record_number: data.medical_record_number || "",        </div>

                    </div>

                  </div>                  <div>

                )}

                {patient.contact_phone && (                    <div className="text-xs text-slate-500">Email</div>        date_of_birth: data.date_of_birth ? data.date_of_birth.split("T")[0] : "",      </div>

                  <div className="flex items-start gap-3">

                    <Phone className="w-5 h-5 text-slate-500 dark:text-neutral-400 mt-0.5" />                    <div className="text-sm font-medium text-slate-800 dark:text-white">{patient.email}</div>

                    <div>

                      <div className="text-xs text-slate-500 dark:text-neutral-500">Telefon</div>                  </div>        gender: data.gender || "",    );

                      <div className="text-sm font-medium text-slate-800 dark:text-white">{patient.contact_phone}</div>

                    </div>                </div>

                  </div>

                )}              )}        phone: data.phone || "",  }

                {patient.contact_email && (

                  <div className="flex items-start gap-3">              {patient.address && (

                    <Mail className="w-5 h-5 text-slate-500 dark:text-neutral-400 mt-0.5" />

                    <div>                <div className="flex items-start gap-3">        email: data.email || "",

                      <div className="text-xs text-slate-500 dark:text-neutral-500">Email</div>

                      <div className="text-sm font-medium text-slate-800 dark:text-white">{patient.contact_email}</div>                  <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />

                    </div>

                  </div>                  <div>        address: data.address || "",  if (!patient) {

                )}

                {patient.address && (                    <div className="text-xs text-slate-500">Manzil</div>

                  <div className="flex items-start gap-3">

                    <MapPin className="w-5 h-5 text-slate-500 dark:text-neutral-400 mt-0.5" />                    <div className="text-sm font-medium text-slate-800 dark:text-white">{patient.address}</div>        notes: data.notes || "",    return (

                    <div>

                      <div className="text-xs text-slate-500 dark:text-neutral-500">Manzil</div>                  </div>

                      <div className="text-sm font-medium text-slate-800 dark:text-white">{patient.address}</div>

                    </div>                </div>      });      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-emerald-950/10 to-neutral-950 p-8">

                  </div>

                )}              )}

                <div className="pt-4 border-t border-slate-200 dark:border-neutral-700">

                  <div className="text-xs text-slate-500 dark:text-neutral-500 mb-1">Ro'yxatga olingan</div>            </div>    } catch (error) {        <div className="max-w-4xl mx-auto text-center py-20">

                  <div className="text-sm font-medium text-slate-800 dark:text-white">

                    {new Date(patient.created_at).toLocaleDateString("uz-UZ", {          </div>

                      year: "numeric",

                      month: "long",      console.error("Failed to load patient:", error);          <AlertCircle className="w-20 h-20 mx-auto mb-6 text-red-500" />

                      day: "numeric",

                    })}          {patient.notes && (

                  </div>

                </div>            <div className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-6">    } finally {          <h2 className="text-3xl font-bold text-white mb-4">Bemor topilmadi</h2>

              </div>

            </div>              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">

          </motion.div>

                <FileText className="w-5 h-5 text-indigo-600" />      setLoading(false);          <button

          {/* Analyses List */}

          <motion.div                Izohlar

            initial={{ opacity: 0, x: 20 }}

            animate={{ opacity: 1, x: 0 }}              </h3>    }            onClick={() => router.push("/patients")}

            transition={{ delay: 0.4 }}

            className="lg:col-span-2"              <p className="text-sm text-slate-600 dark:text-slate-400">{patient.notes}</p>

          >

            <div className="p-6 rounded-2xl bg-white/90 dark:bg-neutral-900/50 border-2 border-indigo-100 dark:border-neutral-800 backdrop-blur-sm shadow-xl">            </div>  };            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform"

              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">

                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />          )}

                Tahlillar Tarixi

              </h3>        </motion.div>          >



              {analyses.length === 0 ? (

                <div className="text-center py-12">

                  <FileText className="w-12 h-12 text-slate-400 dark:text-neutral-600 mx-auto mb-3" />        {/* Analyses */}  const handleEdit = async (e: React.FormEvent) => {            Bemorlar ro'yxatiga qaytish

                  <p className="text-slate-600 dark:text-neutral-400">Hozircha tahlillar yo'q</p>

                </div>        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">

              ) : (

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">          <div className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-6">    e.preventDefault();          </button>

                  {analyses.map((analysis, index) => (

                    <motion.div            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Tahlillar Tarixi</h3>

                      key={analysis.id}

                      initial={{ opacity: 0, y: 20 }}    try {        </div>

                      animate={{ opacity: 1, y: 0 }}

                      transition={{ delay: 0.5 + index * 0.05 }}            {patient.analyses.length === 0 ? (

                      whileHover={{ scale: 1.02 }}

                      className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-neutral-800/50 dark:to-neutral-800/50 border-2 border-indigo-100 dark:border-neutral-700 shadow-md hover:shadow-lg transition-all cursor-pointer"              <div className="text-center py-12">      await patientAPI.update(Number(params.id), {      </div>

                      onClick={() => router.push(`/analyses/${analysis.id}`)}

                    >                <FileImage className="w-16 h-16 text-slate-400 mx-auto mb-4" />

                      <div className="flex items-center justify-between mb-2">

                        <div className="flex items-center gap-2">                <p className="text-slate-600">Hali tahlillar mavjud emas</p>        ...editForm,    );

                          <span className="text-sm font-bold text-slate-800 dark:text-white">

                            Tahlil #{analysis.id}              </div>

                          </span>

                          {getStatusIcon(analysis.status)}            ) : (        date_of_birth: editForm.date_of_birth || null,  }

                          <span className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300">

                            {analysis.mode}              <div className="space-y-4 max-h-[600px] overflow-y-auto">

                          </span>

                        </div>                {patient.analyses.map((analysis: any) => (      });

                        {analysis.dominant_category && getCategoryBadge(analysis.dominant_category)}

                      </div>                  <div



                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400">                    key={analysis.id}      await loadPatient();  return (

                        <span>Topilmalar: {analysis.total_findings}</span>

                        <span>{new Date(analysis.created_at).toLocaleDateString("uz-UZ")}</span>                    onClick={() => router.push(`/analyses/${analysis.id}`)}

                      </div>

                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-300 transition-all"      setShowEditModal(false);    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-emerald-950/10 to-neutral-950 overflow-hidden">

                      <div className="mt-3 flex justify-end">

                        <button                  >

                          onClick={(e) => {

                            e.stopPropagation();                    <div className="flex items-center justify-between mb-2">    } catch (error) {      {/* Animated Background */}

                            router.push(`/analyses/${analysis.id}`);

                          }}                      <div className="flex items-center gap-3">

                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"

                        >                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">      console.error("Failed to update patient:", error);      <div className="fixed inset-0 overflow-hidden pointer-events-none">

                          <Eye className="w-4 h-4" />

                          Ko'rish                          <FileImage className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />

                        </button>

                      </div>                        </div>      alert("Bemorni yangilashda xatolik yuz berdi");        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>

                    </motion.div>

                  ))}                        <div>

                </div>

              )}                          <h4 className="font-semibold text-slate-800 dark:text-white">Tahlil #{analysis.id}</h4>    }        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            </div>

          </motion.div>                          <p className="text-xs text-slate-600 dark:text-slate-400">

        </div>

      </div>                            {new Date(analysis.created_at).toLocaleDateString("uz-UZ")} • {new Date(analysis.created_at).toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' })}  };      </div>



      {/* Edit Modal */}                          </p>

      <AnimatePresence>

        {showEditModal && (                        </div>

          <motion.div

            initial={{ opacity: 0 }}                      </div>

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border-2 border-emerald-300">  const handleDelete = async () => {      <div className="relative z-10 p-8 max-w-6xl mx-auto">

            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"

            onClick={() => setShowEditModal(false)}                        {analysis.status.toUpperCase()}

          >

            <motion.div                      </span>    try {        {/* Back Button */}

              initial={{ scale: 0.9, opacity: 0 }}

              animate={{ scale: 1, opacity: 1 }}                    </div>

              exit={{ scale: 0.9, opacity: 0 }}

              onClick={(e) => e.stopPropagation()}      await patientAPI.delete(Number(params.id));        <motion.button

              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl border-2 border-indigo-200 dark:border-neutral-700"

            >                    <div className="flex items-center gap-4 mt-3">

              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Bemorni Tahrirlash</h3>

                      <div className="text-sm">      router.push("/patients");          initial={{ opacity: 0, x: -20 }}

              <div className="space-y-4">

                <div>                        <span className="text-slate-600">Topilmalar: </span>

                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">

                    To'liq ismi *                        <span className="font-bold text-slate-800 dark:text-white">{analysis.total_findings}</span>    } catch (error) {          animate={{ opacity: 1, x: 0 }}

                  </label>

                  <input                      </div>

                    type="text"

                    value={editForm.full_name}                      {analysis.dominant_label && (      console.error("Failed to delete patient:", error);          onClick={() => router.push("/patients")}

                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}

                    className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 outline-none transition-all"                        <div className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-medium">{analysis.dominant_label}</div>

                  />

                </div>                      )}      alert("Bemorni o'chirishda xatolik yuz berdi");          className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                    </div>

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">                  </div>    }        >

                      Tug'ilgan kun

                    </label>                ))}

                    <input

                      type="date"              </div>  };          <ArrowLeft className="w-5 h-5" />

                      value={editForm.date_of_birth}

                      onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}            )}

                      className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 outline-none transition-all"

                    />          </div>          <span>Bemorlar ro'yxatiga qaytish</span>

                  </div>

        </motion.div>

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">      </div>  const getStatusColor = (status: string) => {        </motion.button>

                      MRN

                    </label>    </div>

                    <input

                      type="text"  );    switch (status) {

                      value={editForm.medical_record_number}

                      onChange={(e) => setEditForm({ ...editForm, medical_record_number: e.target.value })}}

                      className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 outline-none transition-all"

                    />      case "completed":        {/* Patient Info Card */}

                  </div>

                </div>        return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30";        <motion.div



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">      case "pending":          initial={{ opacity: 0, y: 20 }}

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">        return "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30";          animate={{ opacity: 1, y: 0 }}

                      Telefon

                    </label>      case "processing":          className="mb-8 p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm"

                    <input

                      type="tel"        return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30";        >

                      value={editForm.contact_phone}

                      onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}      case "failed":          <div className="flex items-start justify-between mb-6">

                      className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 outline-none transition-all"

                    />        return "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30";            <div className="flex items-center gap-4">

                  </div>

      default:              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-3xl">

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">        return "bg-slate-100 dark:bg-gray-500/20 text-slate-600 dark:text-gray-300 border-slate-300 dark:border-gray-500/30";                {patient.full_name.charAt(0).toUpperCase()}

                      Email

                    </label>    }              </div>

                    <input

                      type="email"  };              <div>

                      value={editForm.contact_email}

                      onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}                <h1 className="text-4xl font-bold text-white mb-2">{patient.full_name}</h1>

                      className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 outline-none transition-all"

                    />  const calculateStats = () => {                {patient.medical_record_number && (

                  </div>

                </div>    if (!patient) return { total: 0, completed: 0, pending: 0, totalFindings: 0 };                  <p className="text-neutral-400">MRN: {patient.medical_record_number}</p>



                <div>                    )}

                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">

                    Manzil    return {              </div>

                  </label>

                  <textarea      total: patient.analyses.length,            </div>

                    value={editForm.address}

                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}      completed: patient.analyses.filter(a => a.status === "completed").length,            

                    rows={3}

                    className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 outline-none transition-all resize-none"      pending: patient.analyses.filter(a => a.status === "pending" || a.status === "processing").length,            <div className="flex items-center gap-2">

                  />

                </div>      totalFindings: patient.analyses.reduce((sum, a) => sum + a.total_findings, 0),              <button

              </div>

    };                onClick={() => router.push(`/patients/${patientId}/edit`)}

              <div className="flex gap-3 mt-6">

                <motion.button  };                className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors"

                  whileHover={{ scale: 1.05 }}

                  whileTap={{ scale: 0.95 }}              >

                  onClick={handleEdit}

                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"  if (loading) {                <Edit className="w-5 h-5" />

                >

                  Saqlash    return (              </button>

                </motion.button>

                <motion.button      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">              <button

                  whileHover={{ scale: 1.05 }}

                  whileTap={{ scale: 0.95 }}        <div className="text-center">                onClick={handleDelete}

                  onClick={() => setShowEditModal(false)}

                  className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300 font-bold hover:bg-slate-300 dark:hover:bg-neutral-600 transition-all"          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>                disabled={deleting}

                >

                  Bekor qilish          <p className="text-slate-600 dark:text-neutral-400">Yuklanmoqda...</p>                className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"

                </motion.button>

              </div>        </div>              >

            </motion.div>

          </motion.div>      </div>                {deleting ? (

        )}

      </AnimatePresence>    );                  <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>



      {/* Delete Confirmation Modal */}  }                ) : (

      <AnimatePresence>

        {showDeleteModal && (                  <Trash2 className="w-5 h-5" />

          <motion.div

            initial={{ opacity: 0 }}  if (!patient) {                )}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}    return (              </button>

            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"

            onClick={() => setShowDeleteModal(false)}      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">            </div>

          >

            <motion.div        <div className="text-center">          </div>

              initial={{ scale: 0.9, opacity: 0 }}

              animate={{ scale: 1, opacity: 1 }}          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />

              exit={{ scale: 0.9, opacity: 0 }}

              onClick={(e) => e.stopPropagation()}          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Bemor topilmadi</h2>          {/* Patient Details Grid */}

              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-rose-200 dark:border-rose-500/30"

            >          <button          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="flex items-center gap-3 mb-4">

                <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-500/20">            onClick={() => router.push("/patients")}            {patient.date_of_birth && (

                  <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />

                </div>            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"              <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">

                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Bemorni O'chirish</h3>

              </div>          >                <Calendar className="w-5 h-5 text-emerald-400" />



              <p className="text-slate-600 dark:text-neutral-400 mb-6">            Orqaga                <div>

                Haqiqatan ham <strong>{patient.full_name}</strong> bemorini o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi va

                barcha tahlillar ham o'chiriladi.          </button>                  <p className="text-xs text-neutral-500">Tug'ilgan kun</p>

              </p>

        </div>                  <p className="text-white">{new Date(patient.date_of_birth).toLocaleDateString("uz-UZ")}</p>

              <div className="flex gap-3">

                <motion.button      </div>                </div>

                  whileHover={{ scale: 1.05 }}

                  whileTap={{ scale: 0.95 }}    );              </div>

                  onClick={handleDelete}

                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"  }            )}

                >

                  Ha, O'chirish            

                </motion.button>

                <motion.button  const stats = calculateStats();            {patient.gender && (

                  whileHover={{ scale: 1.05 }}

                  whileTap={{ scale: 0.95 }}              <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">

                  onClick={() => setShowDeleteModal(false)}

                  className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300 font-bold hover:bg-slate-300 dark:hover:bg-neutral-600 transition-all"  return (                <User className="w-5 h-5 text-blue-400" />

                >

                  Bekor qilish    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">                <div>

                </motion.button>

              </div>      {/* Animated Background */}                  <p className="text-xs text-neutral-500">Jinsi</p>

            </motion.div>

          </motion.div>      <div className="fixed inset-0 overflow-hidden pointer-events-none">                  <p className="text-white">{patient.gender}</p>

        )}

      </AnimatePresence>        <div className="absolute top-0 -left-4 w-96 h-96 bg-cyan-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>                </div>



      <style jsx global>{`        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>              </div>

        @keyframes blob {

          0%, 100% { transform: translate(0, 0) scale(1); }        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>            )}

          33% { transform: translate(30px, -50px) scale(1.1); }

          66% { transform: translate(-20px, 20px) scale(0.9); }      </div>            

        }

        .animate-blob {            {patient.phone && (

          animation: blob 7s infinite;

        }      <div className="relative z-10 p-8">              <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">

        .animation-delay-2000 {

          animation-delay: 2s;        {/* Header */}                <Phone className="w-5 h-5 text-purple-400" />

        }

        .animation-delay-4000 {        <motion.div                <div>

          animation-delay: 4s;

        }          initial={{ opacity: 0, y: -20 }}                  <p className="text-xs text-neutral-500">Telefon</p>

      `}</style>

    </div>          animate={{ opacity: 1, y: 0 }}                  <p className="text-white">{patient.phone}</p>

  );

}          className="mb-6"                </div>


        >              </div>

          <button            )}

            onClick={() => router.push("/patients")}            

            className="flex items-center gap-2 text-slate-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"            {patient.email && (

          >              <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">

            <ArrowLeft className="w-5 h-5" />                <Mail className="w-5 h-5 text-pink-400" />

            <span className="font-medium">Orqaga</span>                <div>

          </button>                  <p className="text-xs text-neutral-500">Email</p>

                  <p className="text-white truncate">{patient.email}</p>

          <div className="flex items-center justify-between">                </div>

            <div className="flex items-center gap-4">              </div>

              <motion.div            )}

                whileHover={{ rotate: 360, scale: 1.1 }}            

                transition={{ duration: 0.5 }}            {patient.address && (

                className="p-4 rounded-2xl bg-gradient-to-br from-cyan-100 to-indigo-100 dark:from-cyan-500/20 dark:to-indigo-500/20 border-2 border-cyan-200 dark:border-cyan-500/30 shadow-lg"              <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50 md:col-span-2">

              >                <MapPin className="w-5 h-5 text-amber-400" />

                <User className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />                <div>

              </motion.div>                  <p className="text-xs text-neutral-500">Manzil</p>

              <div>                  <p className="text-white">{patient.address}</p>

                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">                </div>

                  {patient.full_name}              </div>

                </h1>            )}

                <div className="flex items-center gap-4 mt-2">          </div>

                  {patient.medical_record_number && (

                    <span className="text-sm text-slate-600 dark:text-neutral-400">          {patient.notes && (

                      MRN: {patient.medical_record_number}            <div className="mt-4 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">

                    </span>              <div className="flex items-center gap-2 mb-2">

                  )}                <FileText className="w-5 h-5 text-cyan-400" />

                  <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${                <p className="text-sm font-semibold text-white">Eslatmalar</p>

                    patient.is_active              </div>

                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300"              <p className="text-neutral-300">{patient.notes}</p>

                      : "bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-300 border-slate-300"            </div>

                  }`}>          )}

                    {patient.is_active ? "Faol" : "Nofaol"}

                  </span>          {/* Timestamps */}

                </div>          <div className="mt-6 pt-6 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">

              </div>            <span>Qo'shilgan: {new Date(patient.created_at).toLocaleString("uz-UZ")}</span>

            </div>            <span>Yangilangan: {new Date(patient.updated_at).toLocaleString("uz-UZ")}</span>

          </div>

            <div className="flex gap-2">        </motion.div>

              <motion.button

                whileHover={{ scale: 1.05 }}        {/* Analyses Section */}

                whileTap={{ scale: 0.95 }}        <motion.div

                onClick={() => setShowEditModal(true)}          initial={{ opacity: 0, y: 20 }}

                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg"          animate={{ opacity: 1, y: 0 }}

              >          transition={{ delay: 0.2 }}

                <Edit className="w-5 h-5" />          className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm"

                Tahrirlash        >

              </motion.button>          <div className="flex items-center gap-3 mb-6">

              <motion.button            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">

                whileHover={{ scale: 1.05 }}              <Activity className="w-5 h-5 text-purple-400" />

                whileTap={{ scale: 0.95 }}            </div>

                onClick={() => setShowDeleteModal(true)}            <h2 className="text-2xl font-bold text-white">Tahlillar Tarixi</h2>

                className="p-3 rounded-xl bg-rose-100 dark:bg-rose-500/20 border-2 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors shadow-lg"          </div>

              >

                <Trash2 className="w-5 h-5" />          {analyses.length === 0 ? (

              </motion.button>            <div className="text-center py-12">

            </div>              <Activity className="w-16 h-16 mx-auto mb-4 text-neutral-600" />

          </div>              <p className="text-neutral-500">Bu bemor uchun hali tahlillar yo'q</p>

        </motion.div>            </div>

          ) : (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">            <div className="space-y-4">

          {/* Left Column - Patient Info */}              {analyses.map((analysis) => (

          <motion.div                <div

            initial={{ opacity: 0, x: -20 }}                  key={analysis.id}

            animate={{ opacity: 1, x: 0 }}                  className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-purple-500/50 transition-all"

            className="space-y-6"                >

          >                  <div className="flex items-center justify-between">

            {/* Stats Cards */}                    <div>

            <div className="grid grid-cols-2 gap-4">                      <h3 className="text-lg font-semibold text-white mb-1">Tahlil #{analysis.id}</h3>

              {[                      <p className="text-sm text-neutral-400">

                { label: "Jami tahlillar", value: stats.total, color: "from-purple-500 to-blue-500", icon: FileImage },                        {new Date(analysis.created_at).toLocaleString("uz-UZ")}

                { label: "Tugallangan", value: stats.completed, color: "from-emerald-500 to-teal-500", icon: CheckCircle2 },                      </p>

                { label: "Kutilmoqda", value: stats.pending, color: "from-amber-500 to-orange-500", icon: Clock },                    </div>

                { label: "Topilmalar", value: stats.totalFindings, color: "from-rose-500 to-pink-500", icon: Activity },                    <div className="text-right">

              ].map((stat, index) => (                      <p className="text-2xl font-bold text-purple-400">{analysis.total_findings}</p>

                <motion.div                      <p className="text-xs text-neutral-500">Topilmalar</p>

                  key={stat.label}                    </div>

                  initial={{ opacity: 0, scale: 0.9 }}                  </div>

                  animate={{ opacity: 1, scale: 1 }}                </div>

                  transition={{ delay: 0.1 + index * 0.05 }}              ))}

                  whileHover={{ scale: 1.05, y: -5 }}            </div>

                  className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-4"          )}

                >        </motion.div>

                  <div className="flex items-center justify-between mb-2">      </div>

                    <stat.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />

                    <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>      <style jsx global>{`

                      {stat.value}        @keyframes blob {

                    </div>          0%, 100% { transform: translate(0, 0) scale(1); }

                  </div>          33% { transform: translate(30px, -50px) scale(1.1); }

                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>          66% { transform: translate(-20px, 20px) scale(0.9); }

                </motion.div>        }

              ))}        .animate-blob {

            </div>          animation: blob 7s infinite;

        }

            {/* Personal Info Card */}        .animation-delay-2000 {

            <div className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-6">          animation-delay: 2s;

              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">        }

                <User className="w-5 h-5 text-indigo-600" />      `}</style>

                Shaxsiy Ma'lumotlar    </div>

              </h3>  );

}

              <div className="space-y-3">
                {patient.date_of_birth && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Tug'ilgan sana</div>
                      <div className="text-sm font-medium text-slate-800 dark:text-white">
                        {new Date(patient.date_of_birth).toLocaleDateString("uz-UZ")}
                      </div>
                    </div>
                  </div>
                )}

                {patient.gender && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Jinsi</div>
                      <div className="text-sm font-medium text-slate-800 dark:text-white">
                        {patient.gender === "male" ? "Erkak" : patient.gender === "female" ? "Ayol" : patient.gender}
                      </div>
                    </div>
                  </div>
                )}

                {patient.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Telefon</div>
                      <div className="text-sm font-medium text-slate-800 dark:text-white">{patient.phone}</div>
                    </div>
                  </div>
                )}

                {patient.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                      <div className="text-sm font-medium text-slate-800 dark:text-white">{patient.email}</div>
                    </div>
                  </div>
                )}

                {patient.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Manzil</div>
                      <div className="text-sm font-medium text-slate-800 dark:text-white">{patient.address}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Card */}
            {patient.notes && (
              <div className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Izohlar
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{patient.notes}</p>
              </div>
            )}
          </motion.div>

          {/* Right Column - Analyses History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/90 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Tahlillar Tarixi
              </h3>

              {patient.analyses.length === 0 ? (
                <div className="text-center py-12">
                  <FileImage className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">Hali tahlillar mavjud emas</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {patient.analyses.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  ).map((analysis, index) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() => router.push(`/analyses/${analysis.id}`)}
                      className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                            <FileImage className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">
                              Tahlil #{analysis.id}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {new Date(analysis.created_at).toLocaleDateString("uz-UZ")} • {new Date(analysis.created_at).toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(analysis.status)}`}>
                          {analysis.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Topilmalar: </span>
                          <span className="font-bold text-slate-800 dark:text-white">{analysis.total_findings}</span>
                        </div>
                        {analysis.dominant_label && (
                          <div className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-white">
                            {analysis.dominant_label}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Modal - continues in next message due to length... */}
    </div>
  );
}
