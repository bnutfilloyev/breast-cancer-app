"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, PieChart, Activity, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
  const [activeTab, setActiveTab] = useState<"overview" | "trends" | "findings">("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, trendsData, findingsData] = await Promise.all([
        statisticsAPI.get(),
        statisticsAPI.trends(30),
        statisticsAPI.findings()
      ]);
      setStats(statsData);
      setTrends(trendsData);
      setFindings(findingsData);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-purple-950/10 to-neutral-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Statistika
            </h1>
          </div>
          <p className="text-neutral-400 ml-16">Tizim ko'rsatkichlari va tahlillar</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 p-2 bg-neutral-900/50 border border-neutral-800 rounded-xl backdrop-blur-sm w-fit"
        >
          {[
            { id: "overview", label: "Umumiy", icon: Activity },
            { id: "trends", label: "Trendlar", icon: TrendingUp },
            { id: "findings", label: "Topilmalar", icon: PieChart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-neutral-900/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
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
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-20 blur-xl transition-opacity group-hover:opacity-40 rounded-xl`}></div>
                      <div className={`relative p-6 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 border border-white/10 backdrop-blur-sm`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            stat.change.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                        <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {(stat.value || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-neutral-400">{stat.label}</div>
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
                    className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm"
                  >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-400" />
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
                    className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm"
                  >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-400" />
                      Tezkor Ma'lumotlar
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: "O'rtacha tahlillar/bemor", value: stats ? (stats.total_analyses / stats.total_patients || 0).toFixed(1) : "0", color: "from-blue-500 to-cyan-500" },
                        { label: "O'rtacha topilmalar/tahlil", value: stats ? (stats.total_findings / stats.total_analyses || 0).toFixed(1) : "0", color: "from-purple-500 to-pink-500" },
                        { label: "Muvaffaqiyat darajasi", value: stats ? `${((stats.completed_analyses / stats.total_analyses || 0) * 100).toFixed(1)}%` : "0%", color: "from-emerald-500 to-teal-500" },
                        { label: "Jami rasmlar", value: stats?.total_images ? stats.total_images.toLocaleString() : "0", color: "from-amber-500 to-orange-500" },
                      ].map((item, index) => (
                        <div key={item.label} className="flex items-center justify-between p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                          <span className="text-neutral-400">{item.label}</span>
                          <span className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                            {item.value}
                          </span>
                        </div>
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
                className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  30 Kunlik Trend
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trends.labels?.map((label: string, index: number) => ({
                    date: label,
                    analyses: trends.analyses?.[index] || 0,
                    findings: trends.findings?.[index] || 0,
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="analyses" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="findings" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Findings Tab */}
            {activeTab === "findings" && findings && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-pink-400" />
                  Topilmalar Taqsimoti
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={findings.labels?.map((label: string, index: number) => ({
                    label,
                    count: findings.counts?.[index] || 0,
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="label" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                      {findings.labels?.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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
