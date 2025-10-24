"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, PieChart, Activity, Calendar, AlertCircle, CheckCircle, Clock, Users, FileText, Image as ImageIcon, RefreshCw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { statisticsAPI } from "@/lib/api";

type Statistics = {
  total_patients: number;
  total_analyses: number;
  completed_analyses: number;
  pending_analyses: number;
  processing_analyses: number;
  failed_analyses: number;
  total_findings: number;
  total_images: number;
};

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [trends, setTrends] = useState<any>(null);
  const [findings, setFindings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "trends" | "findings">("overview");
  const [trendDays, setTrendDays] = useState<number>(30);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (days: number = trendDays) => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, trendsData, findingsData] = await Promise.all([
        statisticsAPI.get(),
        statisticsAPI.trends(days),
        statisticsAPI.findings()
      ]);
      setStats(statsData);
      setTrends(trendsData);
      setFindings(findingsData);
    } catch (error: any) {
      console.error("Failed to load statistics:", error);
      setError(error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDaysChange = (days: number) => {
    setTrendDays(days);
    loadData(days);
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

  const statCards = stats ? [
    { label: "Jami Bemorlar", value: stats.total_patients, icon: Activity, color: "from-blue-500 to-indigo-500", change: "+12%" },
    { label: "Jami Tahlillar", value: stats.total_analyses, icon: BarChart3, color: "from-purple-500 to-pink-500", change: "+8%" },
    { label: "Bajarilgan", value: stats.completed_analyses, icon: CheckCircle, color: "from-emerald-500 to-teal-500", change: "+15%" },
    { label: "Kutilmoqda", value: stats.pending_analyses, icon: Clock, color: "from-amber-500 to-orange-500", change: "-3%" },
    { label: "Xatoliklar", value: stats.failed_analyses, icon: AlertCircle, color: "from-red-500 to-rose-500", change: "-5%" },
    { label: "Topilmalar", value: stats.total_findings, icon: TrendingUp, color: "from-cyan-500 to-blue-500", change: "+20%" },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-neutral-950 dark:via-purple-950/10 dark:to-neutral-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-300 dark:bg-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-blue-500/20 dark:to-purple-500/20 border-2 border-indigo-200 dark:border-blue-500/30 shadow-lg"
              >
                <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-blue-400" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Statistika
                </h1>
                <p className="text-slate-600 dark:text-neutral-400">Tizim ko'rsatkichlari va tahlillar</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => loadData()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-neutral-800/80 border-2 border-indigo-200 dark:border-neutral-700 text-slate-700 dark:text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Yangilash
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 p-2 bg-white/80 dark:bg-neutral-900/50 border-2 border-indigo-200 dark:border-neutral-800 rounded-xl backdrop-blur-sm shadow-lg w-fit"
        >
          {[
            { id: "overview", label: "Umumiy", icon: Activity },
            { id: "trends", label: "Trendlar", icon: TrendingUp },
            { id: "findings", label: "Topilmalar", icon: PieChart },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg"
                  : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-neutral-800/50"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-white/60 dark:bg-neutral-900/50 rounded-2xl border-2 border-indigo-100 dark:border-neutral-800 animate-pulse shadow-lg"></div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="p-6 rounded-2xl bg-rose-100 dark:bg-rose-500/20 border-2 border-rose-300 dark:border-rose-500/30 mb-6">
              <AlertCircle className="w-16 h-16 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Xatolik yuz berdi</h3>
            <p className="text-slate-600 dark:text-neutral-400 mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => loadData()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Qayta urinish
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stat Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {statCards.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative group"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-20 blur-xl transition-opacity group-hover:opacity-40 rounded-2xl`}></div>
                      <div className="relative p-6 rounded-2xl bg-white/90 dark:bg-neutral-900/50 border-2 border-indigo-100 dark:border-white/10 backdrop-blur-sm shadow-xl">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            stat.change.startsWith('+') 
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-rose-100 dark:bg-red-500/20 text-rose-600 dark:text-red-400'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                        <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {(stat.value || 0).toLocaleString()}
                        </div>
                        <div className="text-sm font-medium text-slate-600 dark:text-neutral-400">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Distribution */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-2xl bg-white/90 dark:bg-neutral-900/50 border-2 border-indigo-100 dark:border-neutral-800 backdrop-blur-sm shadow-xl"
                  >
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                        <PieChart className="w-5 h-5 text-white" />
                      </div>
                      Tahlil Statuslari
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RePieChart>
                        <Pie
                          data={[
                            { name: "Bajarilgan", value: stats?.completed_analyses || 0 },
                            { name: "Kutilmoqda", value: stats?.pending_analyses || 0 },
                            { name: "Jarayonda", value: stats?.processing_analyses || 0 },
                            { name: "Xato", value: stats?.failed_analyses || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-6 rounded-2xl bg-white/90 dark:bg-neutral-900/50 border-2 border-indigo-100 dark:border-neutral-800 backdrop-blur-sm shadow-xl"
                  >
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      Tezkor Ma'lumotlar
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: "O'rtacha tahlillar/bemor", value: stats ? (stats.total_analyses / stats.total_patients || 0).toFixed(1) : "0", color: "from-blue-500 to-cyan-500" },
                        { label: "O'rtacha topilmalar/tahlil", value: stats ? (stats.total_findings / stats.total_analyses || 0).toFixed(1) : "0", color: "from-purple-500 to-pink-500" },
                        { label: "Muvaffaqiyat darajasi", value: stats ? `${((stats.completed_analyses / stats.total_analyses || 0) * 100).toFixed(1)}%` : "0%", color: "from-emerald-500 to-teal-500" },
                        { label: "Jami rasmlar", value: stats?.total_images ? stats.total_images.toLocaleString() : "0", color: "from-amber-500 to-orange-500" },
                      ].map((item, index) => (
                        <motion.div 
                          key={item.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-neutral-800/50 dark:to-neutral-800/50 border-2 border-indigo-100 dark:border-neutral-700/50 shadow-md hover:shadow-lg transition-shadow"
                        >
                          <span className="text-sm font-medium text-slate-700 dark:text-neutral-400">{item.label}</span>
                          <span className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                            {item.value}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Trends Tab */}
            {activeTab === "trends" && trends && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/90 dark:bg-neutral-900/50 border-2 border-indigo-100 dark:border-neutral-800 backdrop-blur-sm shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    {trendDays} Kunlik Trend
                  </h3>
                  <div className="flex gap-2">
                    {[7, 14, 30, 60, 90].map((days) => (
                      <motion.button
                        key={days}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDaysChange(days)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          trendDays === days
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                            : "bg-indigo-50 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-indigo-100 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {days}d
                      </motion.button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trends.labels?.map((label: string, index: number) => ({
                    date: label,
                    analyses: trends.analyses?.[index] || 0,
                    findings: trends.findings?.[index] || 0,
                  })) || []}>
                    <defs>
                      <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorFindings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" className="dark:stroke-neutral-700" />
                    <XAxis dataKey="date" stroke="#64748b" className="dark:stroke-neutral-400" />
                    <YAxis stroke="#64748b" className="dark:stroke-neutral-400" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #e0e7ff',
                        borderRadius: '0.75rem',
                        color: '#1e293b',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ color: '#1e293b' }}
                    />
                    <Legend wrapperStyle={{ color: '#64748b' }} />
                    <Area type="monotone" dataKey="analyses" stroke="#6366f1" fillOpacity={1} fill="url(#colorAnalyses)" strokeWidth={3} />
                    <Area type="monotone" dataKey="findings" stroke="#ec4899" fillOpacity={1} fill="url(#colorFindings)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Findings Tab */}
            {activeTab === "findings" && findings && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Bar Chart */}
                <div className="p-6 rounded-2xl bg-white/90 dark:bg-neutral-900/50 border-2 border-indigo-100 dark:border-neutral-800 backdrop-blur-sm shadow-xl">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    Kategoriya bo'yicha Tahlillar
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={[
                      { category: "Normal", count: findings.normal || 0, color: "#10b981" },
                      { category: "Benign", count: findings.benign || 0, color: "#f59e0b" },
                      { category: "Malignant", count: findings.malignant || 0, color: "#ef4444" },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" className="dark:stroke-neutral-700" />
                      <XAxis dataKey="category" stroke="#64748b" className="dark:stroke-neutral-400" />
                      <YAxis stroke="#64748b" className="dark:stroke-neutral-400" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '2px solid #e0e7ff',
                          borderRadius: '0.75rem',
                          color: '#1e293b',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: '#1e293b' }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {[
                          { category: "Normal", count: findings.normal || 0, color: "#10b981" },
                          { category: "Benign", count: findings.benign || 0, color: "#f59e0b" },
                          { category: "Malignant", count: findings.malignant || 0, color: "#ef4444" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="p-6 rounded-2xl bg-white/90 dark:bg-neutral-900/50 border-2 border-indigo-100 dark:border-neutral-800 backdrop-blur-sm shadow-xl">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    Foiz Taqsimoti
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <RePieChart>
                        <Pie
                          data={[
                            { name: "Normal", value: findings.normal || 0, color: "#10b981" },
                            { name: "Benign", value: findings.benign || 0, color: "#f59e0b" },
                            { name: "Malignant", value: findings.malignant || 0, color: "#ef4444" },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {[
                            { name: "Normal", value: findings.normal || 0, color: "#10b981" },
                            { name: "Benign", value: findings.benign || 0, color: "#f59e0b" },
                            { name: "Malignant", value: findings.malignant || 0, color: "#ef4444" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>

                    {/* Stats Cards */}
                    <div className="space-y-3">
                      {[
                        { label: "Normal", count: findings.normal || 0, color: "from-emerald-500 to-green-500", icon: CheckCircle },
                        { label: "Benign (Yaxshi xil)", count: findings.benign || 0, color: "from-amber-500 to-orange-500", icon: AlertCircle },
                        { label: "Malignant (Yomon xil)", count: findings.malignant || 0, color: "from-red-500 to-rose-500", icon: AlertCircle },
                      ].map((item, index) => {
                        const total = (findings.normal || 0) + (findings.benign || 0) + (findings.malignant || 0);
                        const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
                        return (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className={`p-4 rounded-xl bg-gradient-to-r ${item.color} bg-opacity-10 border-2 border-white/20 shadow-lg`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>
                                  <item.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-slate-600 dark:text-neutral-400">{item.label}</div>
                                  <div className="text-2xl font-bold text-slate-800 dark:text-white">{item.count}</div>
                                </div>
                              </div>
                              <div className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                                {percentage}%
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
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
