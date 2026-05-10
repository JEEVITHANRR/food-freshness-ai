"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Camera, 
  Package, 
  BarChart2, 
  History, 
  Settings, 
  Bell, 
  Search,
  Plus,
  LogOut,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Upload,
  RefreshCw,
  ExternalLink,
  Bot,
  Zap,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Apple,
  Leaf,
  ShoppingBag,
  MoreVertical,
  Calendar,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  User,
  Menu,
  X
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import SectionReveal from "@/components/SectionReveal";
import ScanningEffect from "@/components/ScanningEffect";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type HealthData = { status: string; modules: Record<string, boolean>; endpoints: string[] };

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | any>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [method, setMethod] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data states for tabs
  const [inventory, setInventory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    try { setLoading(true); const r = await fetch(`${API}/api/inventory/1`); const d = await r.json(); if(d.success) setInventory(d.data.items||[]); } catch(e){} finally { setLoading(false); }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try { setLoading(true); const r = await fetch(`${API}/api/analytics/1`); const d = await r.json(); if(d.success) setAnalytics(d.data); } catch(e){} finally { setLoading(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    try { setLoading(true); const r = await fetch(`${API}/api/history/1`); const d = await r.json(); if(d.success) setHistory(d.data.scans||[]); } catch(e){} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if(activeTab === "Inventory") fetchInventory();
    if(activeTab === "Analytics") fetchAnalytics();
    if(activeTab === "History") fetchHistory();
  }, [activeTab, fetchInventory, fetchAnalytics, fetchHistory]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("method", method);
    formData.append("scan_type", "Full Scan");
    if (apiKey) formData.append("api_key", apiKey);

    try {
      const response = await fetch(`${API}/api/scan`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setScanResult(result.data);
      } else {
        setError(result.error || "Scan failed. Please try again.");
      }
    } catch (err) {
      setError("Could not connect to the AI server. Make sure the backend is running.");
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { icon: <Camera size={20} />, label: "Scan Food" },
    { icon: <Package size={20} />, label: "Inventory" },
    { icon: <BarChart2 size={20} />, label: "Analytics" },
    { icon: <History size={20} />, label: "History" },
    { icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0e1511] text-[#e0e3e0] selection:bg-[#4edea3]/30 font-sans">
      {/* Sidebar Overlay for mobile */}
      {!sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(true)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111a15] border-r border-[#1a211d] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4edea3] to-[#2dd4bf] flex items-center justify-center shadow-lg shadow-[#4edea3]/20">
              <Leaf className="text-[#0e1511]" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-heading">FreshAI</span>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group ${
                  activeTab === item.label
                    ? "bg-[#4edea3] text-[#0e1511] shadow-xl shadow-[#4edea3]/10"
                    : "text-gray-400 hover:bg-[#1a211d] hover:text-[#4edea3]"
                }`}
              >
                <span className={`${activeTab === item.label ? "text-[#0e1511]" : "text-gray-500 group-hover:text-[#4edea3]"}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-[#1a211d] space-y-4">
             <div className="bg-[#1a211d]/50 rounded-2xl p-4 border border-[#1a211d]">
               <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 rounded-lg bg-[#4edea3]/10 flex items-center justify-center">
                    <ShieldCheck className="text-[#4edea3]" size={16} />
                 </div>
                 <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Premium Active</span>
               </div>
               <p className="text-[10px] text-gray-500 mb-3">All AI models unlocked including Gemini 1.5 Pro</p>
               <div className="h-1.5 bg-[#0e1511] rounded-full overflow-hidden">
                 <div className="h-full bg-[#4edea3] w-[85%]" />
               </div>
             </div>

             <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-400/10 transition-all">
                <LogOut size={20} />
                Logout
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0e1511]/80 backdrop-blur-xl border-b border-[#1a211d] px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">{activeTab}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Welcome back, Jeevithan</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-[#1a211d] border border-[#1a211d] rounded-full px-4 py-2 w-72 focus-within:border-[#4edea3]/50 transition-all">
              <Search className="text-gray-500" size={16} />
              <input type="text" placeholder="Quick search..." className="bg-transparent border-none text-sm text-gray-300 focus:outline-none w-full" />
              <span className="text-[10px] text-gray-600 bg-[#0e1511] px-1.5 py-0.5 rounded border border-[#1a211d]">⌘K</span>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2.5 rounded-xl bg-[#1a211d] text-gray-400 hover:text-[#4edea3] transition-all">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#4edea3] rounded-full border-2 border-[#0e1511]" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a211d] to-[#111a15] border border-[#1a211d] flex items-center justify-center text-[#4edea3] font-bold shadow-lg overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jeevithan" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {activeTab === "Dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Items Monitored", val: "124", icon: <Package />, trend: "+12%", color: "#4edea3" },
                    { label: "Average Freshness", val: "94.2%", icon: <Activity />, trend: "+2.4%", color: "#34d399" },
                    { label: "Expiring Items", val: "03", icon: <AlertTriangle />, color: "#fbbf24" },
                    { label: "AI Scans Done", val: "1.2k", icon: <Zap />, trend: "+84", color: "#8b5cf6" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#1a211d] border border-[#1a211d] rounded-3xl p-6 relative overflow-hidden group hover:border-[#4edea3]/30 transition-all">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#4edea3]/5 to-transparent rounded-full -mr-8 -mt-8" />
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0e1511] flex items-center justify-center text-[#4edea3] group-hover:scale-110 transition-transform">
                          {stat.icon}
                        </div>
                        {stat.trend && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#4edea3]/10 text-[#4edea3]">
                            {stat.trend}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-white tracking-tight">{stat.val}</h3>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Activity Feed */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold font-heading">Recent Activity</h3>
                      <button className="text-[#4edea3] text-sm font-medium hover:underline flex items-center gap-1">
                        View Log <ArrowUpRight size={14} />
                      </button>
                    </div>
                    
                    <div className="bg-[#1a211d] border border-[#1a211d] rounded-3xl overflow-hidden">
                       <table className="w-full text-left">
                         <thead>
                           <tr className="border-b border-[#0e1511]">
                             <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Item</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Added</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-[#0e1511]">
                           {[
                             { name: "Organic Blueberries", cat: "Fruit", status: "Fresh", date: "Today, 10:45 AM" },
                             { name: "Fresh Salmon", cat: "Protein", status: "Expiring", date: "Yesterday" },
                             { name: "Sourdough Bread", cat: "Bakery", status: "Fresh", date: "2 days ago" },
                             { name: "Whole Milk", cat: "Dairy", status: "Spoiled", date: "3 days ago" },
                           ].map((item, i) => (
                             <tr key={i} className="hover:bg-[#111a15] transition-colors group">
                               <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                   <div className="w-9 h-9 rounded-lg bg-[#0e1511] flex items-center justify-center text-[#4edea3]">
                                      <Package size={18} />
                                   </div>
                                   <div>
                                     <p className="text-sm font-bold text-white">{item.name}</p>
                                     <p className="text-[10px] text-gray-500">{item.cat}</p>
                                   </div>
                                 </div>
                               </td>
                               <td className="px-6 py-4">
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                    item.status === 'Fresh' ? 'bg-[#4edea3]/10 text-[#4edea3]' :
                                    item.status === 'Expiring' ? 'bg-amber-500/10 text-amber-400' :
                                    'bg-red-500/10 text-red-400'
                                  }`}>
                                    {item.status}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-xs text-gray-400">{item.date}</td>
                               <td className="px-6 py-4 text-right">
                                  <button className="p-2 text-gray-500 hover:text-[#4edea3] transition-all opacity-0 group-hover:opacity-100">
                                    <MoreVertical size={16} />
                                  </button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold font-heading">AI Insights</h3>
                    <div className="bg-[#1a211d] border border-[#1a211d] rounded-3xl p-6 space-y-6 relative overflow-hidden">
                       <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#4edea3]/5 rounded-full blur-3xl" />
                       
                       <div className="space-y-4">
                          <div className="flex items-start gap-3">
                             <div className="w-10 h-10 rounded-xl bg-[#4edea3]/10 flex items-center justify-center shrink-0">
                                <Bot className="text-[#4edea3]" size={20} />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-white">Stock Alert</p>
                               <p className="text-xs text-gray-500 mt-1 leading-relaxed">Your organic eggs are expiring in 2 days. Consider making a Frittata today!</p>
                             </div>
                          </div>

                          <div className="flex items-start gap-3 pt-4 border-t border-[#0e1511]">
                             <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Zap className="text-purple-400" size={20} />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-white">Efficiency Tip</p>
                               <p className="text-xs text-gray-500 mt-1 leading-relaxed">Storage at 4°C instead of 6°C could extend your leafy greens by 15%.</p>
                             </div>
                          </div>
                       </div>

                       <Button className="w-full bg-[#0e1511] text-[#4edea3] border border-[#1a211d] hover:bg-[#1a211d] py-6 rounded-2xl font-bold">
                          View Full Report
                       </Button>
                    </div>

                    <div className="bg-gradient-to-br from-[#4edea3] to-[#2dd4bf] rounded-3xl p-6 text-[#0e1511]">
                       <h4 className="text-lg font-bold mb-2">New Scan Ready?</h4>
                       <p className="text-sm opacity-80 mb-6">Our updated Gemini 1.5 Pro model is now 40% faster for kitchen inventory.</p>
                       <button onClick={() => setActiveTab("Scan Food")} className="bg-[#0e1511] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                          Start Analysis <ChevronRight size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Scan Food" && (
              <motion.div key="scan" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-5xl mx-auto space-y-10">
                <div className="bg-[#1a211d] border border-[#1a211d] rounded-[3rem] p-1.5 overflow-hidden relative min-h-[600px] flex flex-col items-center justify-center">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  
                  {!isScanning && !scanResult && !error && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                       <div className="w-24 h-24 rounded-3xl bg-[#0e1511] flex items-center justify-center mb-8 border border-[#4edea3]/20 shadow-2xl shadow-[#4edea3]/5 group hover:scale-110 transition-transform cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="text-[#4edea3]" size={32} />
                       </div>
                       
                       <div className="max-w-md space-y-3 mb-10">
                         <h2 className="text-3xl font-bold text-white font-heading tracking-tight">AI Vision Scanner</h2>
                         <p className="text-gray-500 leading-relaxed">Upload a clear photo of your food items. Our AI will automatically detect freshness, quantity, and spoilage patterns.</p>
                       </div>

                       <div className="flex flex-wrap gap-4 justify-center mb-10">
                          <button onClick={() => setMethod("gemini")} className={`px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 ${method === "gemini" ? "bg-[#4edea3]/10 border-[#4edea3] text-[#4edea3]" : "bg-[#0e1511] border-[#1a211d] text-gray-500"}`}>
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${method === 'gemini' ? 'bg-[#4edea3] text-[#0e1511]' : 'bg-[#1a211d]'}`}>
                               <Bot size={18} />
                             </div>
                             <div className="text-left">
                               <p className="text-xs font-bold uppercase tracking-widest">Gemini Pro</p>
                               <p className="text-[10px] opacity-60">High-Fidelity AI</p>
                             </div>
                          </button>

                          <button onClick={() => setMethod("yolo")} className={`px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 ${method === "yolo" ? "bg-[#4edea3]/10 border-[#4edea3] text-[#4edea3]" : "bg-[#0e1511] border-[#1a211d] text-gray-500"}`}>
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${method === 'yolo' ? 'bg-[#4edea3] text-[#0e1511]' : 'bg-[#1a211d]'}`}>
                               <Zap size={18} />
                             </div>
                             <div className="text-left">
                               <p className="text-xs font-bold uppercase tracking-widest">YOLOv8 Edge</p>
                               <p className="text-[10px] opacity-60">Real-time Detection</p>
                             </div>
                          </button>
                       </div>

                       <div className="flex gap-4">
                          <Button size="lg" className="rounded-2xl px-10 h-16 bg-[#4edea3] text-[#0e1511] hover:bg-[#4edea3]/90 font-bold text-base shadow-xl shadow-[#4edea3]/20" onClick={() => fileInputRef.current?.click()}>
                            Select Image
                          </Button>
                       </div>
                    </div>
                  )}

                  {isScanning && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0e1511]/90 backdrop-blur-md">
                      <ScanningEffect />
                      <div className="mt-20 space-y-4 text-center">
                         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a211d] border border-[#4edea3]/30">
                            <RefreshCw className="w-4 h-4 text-[#4edea3] animate-spin" />
                            <span className="text-xs font-bold text-[#4edea3] uppercase tracking-widest">Analyzing Food Structure...</span>
                         </div>
                         <p className="text-gray-500 text-sm animate-pulse">Consulting AI vision nodes for freshness metrics</p>
                      </div>
                    </div>
                  )}

                  {scanResult && !isScanning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full grid grid-cols-1 lg:grid-cols-2 h-full min-h-[600px]">
                       <div className="relative bg-[#0e1511] p-4 flex items-center justify-center overflow-hidden">
                          {imagePreview && (
                            <img src={imagePreview} alt="Scan" className="w-full h-full object-contain rounded-3xl" />
                          )}
                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0e1511]/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
                             <ShieldCheck className="text-[#4edea3]" size={16} />
                             <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Verified Analysis</span>
                          </div>
                       </div>
                       
                       <div className="p-10 space-y-8 bg-[#1a211d] overflow-y-auto max-h-[600px] custom-scrollbar">
                          <div className="flex items-center justify-between">
                             <div className="space-y-1">
                               <h3 className="text-2xl font-bold text-white font-heading">Scan Completed</h3>
                               <p className="text-xs text-gray-500 uppercase tracking-widest">Using {scanResult.model_used || method} Vision AI</p>
                             </div>
                             <button onClick={() => { setScanResult(null); setImagePreview(null); }} className="p-3 rounded-xl bg-[#0e1511] text-gray-400 hover:text-white transition-all">
                               <RefreshCw size={20} />
                             </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-[#0e1511] p-5 rounded-3xl border border-[#1a211d]">
                               <p className="text-xs text-gray-500 font-medium mb-1">Items Found</p>
                               <p className="text-3xl font-bold text-white">{scanResult.total_count || 0}</p>
                             </div>
                             <div className="bg-[#0e1511] p-5 rounded-3xl border border-[#1a211d]">
                               <p className="text-xs text-gray-500 font-medium mb-1">Freshness Avg</p>
                               <p className="text-3xl font-bold text-[#4edea3]">
                                 {scanResult.items?.length > 0 
                                   ? Math.round((scanResult.items.filter((i: any) => i.freshness !== 'Rotten').length / scanResult.items.length) * 100)
                                   : '—'
                                 }%
                               </p>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Detected Entities</h4>
                             <div className="space-y-3">
                                {scanResult.items?.map((item: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#0e1511]/50 border border-[#1a211d] hover:border-[#4edea3]/30 transition-all">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#1a211d] flex items-center justify-center text-[#4edea3]">
                                          <Package size={20} />
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-white capitalize">{item.name}</p>
                                          <p className="text-[10px] text-gray-500">{item.category || 'Food'}</p>
                                        </div>
                                     </div>
                                     <div className="flex flex-col items-end gap-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                                          item.freshness === 'Rotten' ? 'bg-red-500/10 text-red-400' :
                                          item.freshness === 'Slightly Aged' ? 'bg-amber-500/10 text-amber-400' :
                                          'bg-[#4edea3]/10 text-[#4edea3]'
                                        }`}>
                                          {item.freshness || 'Fresh'}
                                        </span>
                                        <p className="text-xs font-bold text-white">Qty: {item.count || 1}</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>

                          <div className="flex gap-4 pt-4 sticky bottom-0 bg-[#1a211d] py-4">
                             <Button className="flex-1 bg-[#4edea3] text-[#0e1511] h-14 rounded-2xl font-bold shadow-lg shadow-[#4edea3]/10 hover:bg-[#4edea3]/90">
                               Save to Inventory
                             </Button>
                             <Button variant="outline" className="flex-1 border-[#1a211d] bg-[#0e1511] h-14 rounded-2xl font-bold text-gray-400 hover:text-white" onClick={() => { setScanResult(null); setImagePreview(null); }}>
                               Discard
                             </Button>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {error && (
                    <div className="text-center space-y-6 p-12">
                       <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                          <XCircle className="text-red-400" size={32} />
                       </div>
                       <div className="space-y-2">
                         <h3 className="text-2xl font-bold text-white font-heading">Detection Error</h3>
                         <p className="text-gray-500 max-w-sm mx-auto">{error}</p>
                       </div>
                       <Button onClick={() => setError(null)} className="rounded-2xl px-10 h-14 bg-[#1a211d] border border-red-500/20 text-red-400 hover:bg-red-500/5 font-bold">
                         Try Scanning Again
                       </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-[#1a211d] border border-[#1a211d] rounded-3xl p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0e1511] flex items-center justify-center text-[#4edea3] shrink-0">
                         <ShieldCheck size={24} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">Privacy Guaranteed</h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed">Your images are processed securely and deleted from our buffers after 24 hours.</p>
                      </div>
                   </div>
                   <div className="bg-[#1a211d] border border-[#1a211d] rounded-3xl p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0e1511] flex items-center justify-center text-purple-400 shrink-0">
                         <Activity size={24} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">Neural Refresh</h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed">Models are retrained weekly on real-world grocery data for maximum precision.</p>
                      </div>
                   </div>
                   <div className="bg-[#1a211d] border border-[#1a211d] rounded-3xl p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0e1511] flex items-center justify-center text-[#2dd4bf] shrink-0">
                         <TrendingUp size={24} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">Smart Sorting</h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed">Detected items are automatically categorized into 12 primary food groups.</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* Inventory Tab */}
            {activeTab === "Inventory" && (
              <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{inventory.length} items currently in monitoring</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="bg-[#1a211d] border border-[#1a211d] rounded-xl px-4 py-2 flex items-center gap-2 text-xs text-gray-400">
                          <Filter size={14} /> Filter
                       </div>
                       <Button size="sm" className="rounded-xl bg-[#4edea3] text-[#0e1511] font-bold" onClick={fetchInventory}>
                          <RefreshCw size={14} className="mr-2" /> Refresh
                       </Button>
                    </div>
                 </div>

                 {loading && <div className="text-center py-20 text-gray-500 animate-pulse">Syncing with FreshVault...</div>}

                 {!loading && inventory.length === 0 && (
                   <div className="bg-[#1a211d] border border-[#1a211d] rounded-[3rem] p-20 text-center space-y-6">
                      <div className="w-24 h-24 rounded-full bg-[#0e1511] border border-[#1a211d] flex items-center justify-center mx-auto mb-4">
                         <Package className="text-gray-600" size={32} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white font-heading tracking-tight">Your Vault is Empty</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Start scanning your grocery hauls to build your intelligent kitchen inventory.</p>
                      </div>
                      <Button onClick={() => setActiveTab("Scan Food")} className="bg-[#4edea3] text-[#0e1511] rounded-2xl px-10 h-14 font-bold">
                         Scan First Item
                      </Button>
                   </div>
                 )}

                 {!loading && inventory.length > 0 && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {inventory.map((item, i) => (
                        <motion.div key={item.id || i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-[#1a211d] border border-[#1a211d] rounded-3xl p-6 group hover:border-[#4edea3]/30 transition-all relative overflow-hidden">
                           <div className="flex items-start justify-between mb-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
                                item.category === 'Fruit' ? 'bg-orange-500/10 text-orange-400' :
                                item.category === 'Vegetable' ? 'bg-emerald-500/10 text-emerald-400' :
                                'bg-blue-500/10 text-blue-400'
                              }`}>
                                 {item.category === 'Fruit' ? <Apple /> : item.category === 'Vegetable' ? <Leaf /> : <ShoppingBag />}
                              </div>
                              <div className="flex gap-1">
                                 <button onClick={() => {}} className="p-2 text-gray-500 hover:text-[#4edea3] transition-all">
                                    <MoreVertical size={16} />
                                 </button>
                              </div>
                           </div>
                           
                           <div className="space-y-1 mb-6">
                              <h4 className="text-lg font-bold text-white tracking-tight capitalize">{item.item_name}</h4>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                 <span>{item.category || 'Food Group'}</span>
                                 <span>•</span>
                                 <span>Qty: {item.quantity}</span>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div className="flex items-center justify-between text-xs">
                                 <span className="text-gray-500 font-medium">Freshness State</span>
                                 <span className={`font-bold ${
                                   item.freshness === 'Rotten' ? 'text-red-400' :
                                   item.freshness === 'Slightly Aged' ? 'text-amber-400' :
                                   'text-[#4edea3]'
                                 }`}>{item.freshness || 'Healthy'}</span>
                              </div>
                              <div className="h-2 bg-[#0e1511] rounded-full overflow-hidden">
                                 <div className={`h-full rounded-full transition-all duration-1000 ${
                                   item.freshness === 'Rotten' ? 'bg-red-400' :
                                   item.freshness === 'Slightly Aged' ? 'bg-amber-400' :
                                   'bg-[#4edea3]'
                                 }`} style={{ width: `${(item.freshness_score || 0.95) * 100}%` }} />
                              </div>
                              
                              <div className="flex items-center justify-between pt-4 border-t border-[#0e1511]">
                                 <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                    <Calendar size={12} />
                                    Added {new Date(item.added_at).toLocaleDateString()}
                                 </div>
                                 <button onClick={() => {}} className="text-[#4edea3] text-[10px] font-bold uppercase tracking-widest hover:underline">
                                    Full Details
                                 </button>
                              </div>
                           </div>
                        </motion.div>
                      ))}
                   </div>
                 )}
              </motion.div>
            )}

            {/* Analytics Tab */}
            {activeTab === "Analytics" && (
               <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 pb-20">
                  {loading && <div className="text-center py-20 text-gray-500 animate-pulse">Aggregating intelligence metrics...</div>}
                  
                  {!loading && analytics && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                          { label: "Total Analysis Run", val: analytics.stats?.total_scans || 0, icon: <Camera />, color: "#8b5cf6" },
                          { label: "Objects Identified", val: analytics.stats?.total_items_detected || 0, icon: <Eye />, color: "#3b82f6" },
                          { label: "Active Inventory", val: analytics.stats?.inventory_count || 0, icon: <Package />, color: "#10b981" },
                          { label: "Spoilage Prevented", val: "84%", icon: <ShieldCheck />, color: "#4edea3" },
                        ].map((s, i) => (
                          <div key={i} className="bg-[#1a211d] border border-[#1a211d] rounded-3xl p-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#0e1511] flex items-center justify-center mb-4" style={{ color: s.color }}>
                               {s.icon}
                            </div>
                            <p className="text-gray-500 text-sm font-medium mb-1">{s.label}</p>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{s.val}</h3>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="bg-[#1a211d] border border-[#1a211d] rounded-[2.5rem] p-8 space-y-8">
                            <div className="flex items-center justify-between">
                               <h3 className="text-xl font-bold font-heading">Freshness Distribution</h3>
                               <BarChart2 className="text-gray-600" size={20} />
                            </div>
                            
                            {analytics.stats?.freshness_breakdown && (
                              <div className="space-y-6">
                                 {Object.entries(analytics.stats.freshness_breakdown).map(([label, count]: [string, any], i) => {
                                   const total = Object.values(analytics.stats.freshness_breakdown as Record<string, number>).reduce((a, b) => a + b, 0);
                                   const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                   const color = label === 'Rotten' ? '#f87171' : label === 'Slightly Aged' ? '#fbbf24' : '#4edea3';
                                   return (
                                     <div key={i} className="space-y-2">
                                       <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                          <span className="text-gray-400">{label}</span>
                                          <span className="text-white">{count} items</span>
                                       </div>
                                       <div className="h-3 bg-[#0e1511] rounded-full overflow-hidden flex items-center px-1">
                                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className="h-1 rounded-full" style={{ backgroundColor: color }} />
                                       </div>
                                     </div>
                                   );
                                 })}
                              </div>
                            )}
                         </div>

                         <div className="bg-[#1a211d] border border-[#1a211d] rounded-[2.5rem] p-8 space-y-8">
                            <div className="flex items-center justify-between">
                               <h3 className="text-xl font-bold font-heading">Category Allocation</h3>
                               <PieChartIcon className="text-gray-600" size={20} />
                            </div>
                            
                            <div className="space-y-3">
                               {analytics.stats?.category_breakdown && Object.entries(analytics.stats.category_breakdown).map(([cat, count]: [string, any], i) => (
                                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#0e1511] border border-[#1a211d]">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-[#1a211d] flex items-center justify-center text-[#4edea3]">
                                          {cat === 'Fruit' ? <Apple size={18} /> : <ShoppingBag size={18} />}
                                       </div>
                                       <span className="font-bold text-sm text-white">{cat}</span>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-sm font-bold text-white">{count}</p>
                                       <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Captured</p>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      {analytics.expiring_items && analytics.expiring_items.length > 0 && (
                        <div className="bg-[#1a211d] border border-[#1a211d] rounded-[2.5rem] p-8">
                           <div className="flex items-center gap-3 mb-8">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                 <AlertTriangle size={20} />
                              </div>
                              <h3 className="text-xl font-bold font-heading text-white">Critical Expiry Watchlist</h3>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {analytics.expiring_items.map((item: any, i: number) => (
                                <div key={i} className="bg-[#0e1511] p-5 rounded-2xl border border-amber-500/10 border-l-4 border-l-amber-400">
                                   <p className="text-sm font-bold text-white mb-1 capitalize">{item.item_name}</p>
                                   <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">
                                      {item.days_until_expiry <= 0 ? 'Expiring Today' : `In ${item.days_until_expiry} Days`}
                                   </p>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                    </>
                  )}
               </motion.div>
            )}

            {/* History Tab */}
            {activeTab === "History" && (
               <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-20">
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-bold font-heading text-white">Vision Logs</h3>
                     <Button size="sm" className="rounded-xl bg-[#1a211d] text-gray-400 border border-[#1a211d] hover:text-white" onClick={fetchHistory}>
                        <RefreshCw size={14} className="mr-2" /> Refresh Stream
                     </Button>
                  </div>

                  {!loading && history.length === 0 && (
                    <div className="bg-[#1a211d] border border-[#1a211d] rounded-[3rem] p-20 text-center space-y-4">
                       <History className="text-gray-600 mx-auto" size={48} />
                       <h3 className="text-xl font-bold text-white">No vision history found</h3>
                       <p className="text-gray-500">All your scan results and AI analyses will be logged here.</p>
                    </div>
                  )}

                  {!loading && history.length > 0 && (
                    <div className="space-y-4">
                       {history.map((scan, i) => (
                         <div key={i} className="bg-[#1a211d] border border-[#1a211d] rounded-3xl p-6 flex flex-wrap items-center justify-between gap-6 hover:border-[#4edea3]/20 transition-all group">
                            <div className="flex items-center gap-6">
                               <div className="w-16 h-16 rounded-2xl bg-[#0e1511] flex items-center justify-center text-[#4edea3] overflow-hidden">
                                  {scan.image_path ? (
                                    <img src={`${API}${scan.image_path}`} alt="Scan" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                  ) : (
                                    <Camera size={24} />
                                  )}
                               </div>
                               <div>
                                 <h4 className="font-bold text-white mb-1 uppercase tracking-tight text-sm">{scan.scan_type || 'Full AI Analysis'}</h4>
                                 <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><Bot size={10} /> {scan.detection_method}</span>
                                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(scan.scanned_at).toLocaleDateString()}</span>
                                 </div>
                               </div>
                            </div>

                            <div className="flex items-center gap-8">
                               <div className="text-center">
                                  <p className="text-lg font-bold text-white">{scan.item_count || 0}</p>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Items</p>
                               </div>
                               <button className="w-10 h-10 rounded-xl bg-[#0e1511] flex items-center justify-center text-gray-500 hover:text-[#4edea3] transition-all">
                                  <ChevronRight size={20} />
                                </button>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "Settings" && (
               <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-3xl mx-auto space-y-8">
                  <div className="bg-[#1a211d] border border-[#1a211d] rounded-[2.5rem] p-10 space-y-10">
                     <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-white font-heading">AI Engine Configuration</h3>
                        <p className="text-gray-500 text-sm">Fine-tune how FreshAI processes your kitchen environment.</p>
                     </div>

                     <div className="space-y-8">
                        <div className="space-y-4">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gemini Vision Key</label>
                           <div className="relative">
                              <input 
                                type="password" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..." 
                                className="w-full bg-[#0e1511] border border-[#1a211d] rounded-2xl px-6 py-4 text-sm text-[#4edea3] focus:outline-none focus:border-[#4edea3]/50" 
                              />
                              <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                           </div>
                           <p className="text-[10px] text-gray-600 leading-relaxed">Providing your own API key enables deep visual reasoning for exact spoilage identification. Keys are encrypted and stored locally.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detection Sensitivity</label>
                              <div className="bg-[#0e1511] p-1 rounded-2xl flex border border-[#1a211d]">
                                 <button className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-[#1a211d] text-[#4edea3]">High</button>
                                 <button className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl text-gray-500">Medium</button>
                                 <button className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl text-gray-500">Low</button>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notification Radius</label>
                              <div className="bg-[#0e1511] p-1 rounded-2xl flex border border-[#1a211d]">
                                 <button className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl text-gray-500">Push</button>
                                 <button className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-[#1a211d] text-[#4edea3]">Email</button>
                                 <button className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl text-gray-500">Both</button>
                              </div>
                           </div>
                        </div>

                        <div className="pt-6 border-t border-[#0e1511]">
                           <Button className="w-full bg-[#4edea3] text-[#0e1511] h-16 rounded-2xl font-bold text-base shadow-xl shadow-[#4edea3]/10">
                              Save AI Configurations
                           </Button>
                        </div>
                     </div>
                  </div>

                  <div className="bg-[#1a211d] border border-[#1a211d] rounded-[2.5rem] p-10 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                           <Trash2 size={24} />
                        </div>
                        <div>
                           <h4 className="text-white font-bold text-sm mb-1">Clear Vault Data</h4>
                           <p className="text-[10px] text-gray-500">Permanently delete all inventory and scan history.</p>
                        </div>
                     </div>
                     <button className="px-6 py-3 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/5 transition-all">
                        Reset System
                     </button>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0e1511;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a211d;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4edea340;
        }
        @font-face {
          font-family: 'Geist';
          src: url('https://fonts.googleapis.com/css2?family=Geist:wght@600;700&display=swap');
        }
      `}</style>
    </div>
  );
}

function PieChartIcon({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
