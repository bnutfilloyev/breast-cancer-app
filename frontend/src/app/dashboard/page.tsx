"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Activity, Clock, AlertCircle, TrendingUp, Brain, Zap, Star, ArrowUpRight } from "lucide-react";
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

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await statisticsAPI.get();
      setStats(data);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gradient-to-r from-cyan-200 to-blue-200 dark:from-slate-700 dark:to-slate-600 rounded-xl w-1/3 animate-shimmer"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: "Jami Bemorlar", 
      value: stats?.total_patients || 0, 
      icon: Users, 
      color: "from-cyan-400 to-blue-500",
      bgGlow: "from-cyan-400/20 to-blue-500/20",
      change: "+12.5%",
      trend: "up"
    },
    { 
      label: "Jami Tahlillar", 
      value: stats?.total_analyses || 0, 
      icon: Activity, 
      color: "from-emerald-400 to-teal-500",
      bgGlow: "from-emerald-400/20 to-teal-500/20",
      change: "+8.3%",
      trend: "up"
    },
    { 
      label: "Kutilmoqda", 
      value: stats?.pending_analyses || 0, 
      icon: Clock, 
      color: "from-amber-400 to-orange-500",
      bgGlow: "from-amber-400/20 to-orange-500/20",
      change: "-3.2%",
      trend: "down"
    },
    { 
      label: "Xatoliklar", 
      value: stats?.failed_analyses || 0, 
      icon: AlertCircle, 
      color: "from-rose-400 to-pink-500",
      bgGlow: "from-rose-400/20 to-pink-500/20",
      change: "-15.4%",
      trend: "down"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-300 dark:bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-300 dark:bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              whileHover={{ scale: 1.1, rotate: 360 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 border-2 border-cyan-200 dark:border-cyan-500/30 backdrop-blur-sm shadow-lg hover:shadow-cyan-300/50 dark:hover:shadow-cyan-500/30 transition-all duration-300"
            >
              <Brain className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">AI-powered tibbiy tahlil platformasi</p>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 text-sm"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-500/10 dark:to-teal-500/10 border-2 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full"
              ></motion.div>
              <span className="font-medium">Tizim faol</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-500/10 dark:to-blue-500/10 border-2 border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="font-medium">Real-time monitoring</span>
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 * index, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.08, y: -10, rotate: 1 }}
              className="group relative"
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.bgGlow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>
              
              {/* Card Content */}
              <div className={`relative p-6 rounded-2xl bg-gradient-to-br from-white to-cyan-50/30 dark:from-slate-800 dark:to-slate-700 border-2 border-cyan-200 dark:border-slate-600 group-hover:border-cyan-300 dark:group-hover:border-cyan-500/50 backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300`}>
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-5 dark:opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                  }}></div>
                </div>

                {/* Icon and Change Badge */}
                <div className="relative flex items-start justify-between mb-4">
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                      stat.trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-500/30' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-2 border-rose-300 dark:border-rose-500/30'
                    }`}
                  >
                    <ArrowUpRight className={`w-3 h-3 ${stat.trend === 'down' ? 'rotate-90' : ''}`} />
                    {stat.change}
                  </motion.div>
                </div>

                {/* Value */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                  className={`text-5xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {(stat.value || 0).toLocaleString()}
                </motion.div>

                {/* Label */}
                <div className="text-sm text-slate-700 dark:text-slate-300 font-semibold">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 border-2 border-cyan-200 dark:border-slate-600 backdrop-blur-xl relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 via-cyan-100/30 to-blue-100/30 dark:from-purple-500/5 dark:via-cyan-500/5 dark:to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-500/20 dark:to-blue-500/20 shadow-md"
                >
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Tezkor Ma'lumotlar</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Bajarilgan", value: stats?.completed_analyses || 0, color: "from-emerald-400 to-teal-500", icon: Activity },
                  { label: "Jarayonda", value: stats?.processing_analyses || 0, color: "from-cyan-400 to-blue-500", icon: Clock },
                  { label: "Topilmalar", value: stats?.total_findings || 0, color: "from-purple-400 to-pink-500", icon: Star },
                  { label: "Rasmlar", value: stats?.total_images || 0, color: "from-amber-400 to-orange-500", icon: Activity },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="relative p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-2 border-cyan-200 dark:border-slate-500/50 group/item overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover/item:opacity-20 transition-opacity duration-300`}></div>
                    <div className="relative">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <item.icon className="w-5 h-5 text-slate-600 dark:text-slate-400 mb-2" />
                      </motion.div>
                      <p className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>
                        {(item.value || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* System Status - Takes 1 column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 border-2 border-emerald-200 dark:border-slate-600 backdrop-blur-xl relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 dark:from-emerald-500/5 dark:to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/20 shadow-md"
                >
                  <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Tizim Holati</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: "API Server", status: "Faol", color: "emerald" },
                  { label: "Ma'lumotlar bazasi", status: "Faol", color: "emerald" },
                  { label: "AI Model", status: "Tayyor", color: "emerald" },
                  { label: "File Storage", status: "Faol", color: "emerald" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-600 border-2 border-emerald-200 dark:border-slate-500/50 group/status hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300 shadow-md"
                  >
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                        className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50"
                      ></motion.div>
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-bold border-2 border-emerald-300 dark:border-emerald-500/30">
                        {item.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
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
