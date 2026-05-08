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
  ShoppingBag
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import SectionReveal from "@/components/SectionReveal";
import ScanningEffect from "@/components/ScanningEffect";

const API = "http://localhost:8000";

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

  // Data states for tabs
  const [inventory, setInventory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [savedKey, setSavedKey] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");

  const fetchInventory = useCallback(async () => {
    try { setLoading(true); const r = await fetch(`${API}/api/inventory/1`); const d = await r.json(); if(d.success) setInventory(d.data.items||[]); } catch(e){} finally { setLoading(false); }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try { setLoading(true); const r = await fetch(`${API}/api/analytics/1`); const d = await r.json(); if(d.success) setAnalytics(d.data); } catch(e){} finally { setLoading(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    try { setLoading(true); const r = await fetch(`${API}/api/history/1`); const d = await r.json(); if(d.success) setHistory(d.data.scans||[]); } catch(e){} finally { setLoading(false); }
  }, []);

  const deleteItem = async (id: number) => {
    try { await fetch(`${API}/api/inventory/${id}`, {method:'DELETE'}); fetchInventory(); } catch(e){}
  };

  useEffect(() => {
    if(activeTab === "Inventory") fetchInventory();
    if(activeTab === "Analytics") fetchAnalytics();
    if(activeTab === "History") fetchHistory();
  }, [activeTab, fetchInventory, fetchAnalytics, fetchHistory]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
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
      const response = await fetch("http://localhost:8000/api/scan", {
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
    { icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { icon: <Camera size={18} />, label: "Scan Food" },
    { icon: <Package size={18} />, label: "Inventory" },
    { icon: <BarChart2 size={18} />, label: "Analytics" },
    { icon: <History size={18} />, label: "History" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col fixed h-full z-20 glass rounded-r-[2rem]">
        <div className="p-8 flex items-center gap-2">
           <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="font-bold text-lg tracking-tight">FreshAI</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 py-4">
          {navItems.map((item, i) => (
            <button 
              key={i} 
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.label
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-2 border-t border-white/5">
          <a href="http://localhost:8501" target="_blank" rel="noopener noreferrer">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-all">
              <ExternalLink size={18} /> Open Streamlit
            </button>
          </a>
          <button onClick={() => setActiveTab("Settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'Settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
            <Settings size={18} /> Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex items-center justify-between mb-10">
          <SectionReveal>
            <h1 className="text-3xl font-bold tracking-tight">
              {activeTab === "Dashboard" ? "Welcome back, Chef" : activeTab}
            </h1>
            <p className="text-muted-foreground">
              {activeTab === "Dashboard" 
                ? "Here's what's happening in your kitchen today."
                : `Manage your ${activeTab.toLowerCase()} with AI precision.`}
            </p>
          </SectionReveal>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Search items..." 
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
              />
            </div>
            <Button size="icon" variant="outline" className="rounded-full bg-white/5 border-white/10">
              <Bell size={18} />
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 border border-white/20" />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "Dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid md:grid-cols-4 gap-6 mb-10">
                {[
                  { label: "Total Items", val: "42", icon: <Package className="text-blue-400" /> },
                  { label: "Freshness Index", val: "94%", icon: <TrendingUp className="text-emerald-400" />, trend: "+2%" },
                  { label: "Expiring Soon", val: "3", icon: <AlertTriangle className="text-amber-400" />, color: "text-amber-400" },
                  { label: "Scans Today", val: "12", icon: <Camera className="text-purple-400" /> },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-6 border-white/5 bg-black/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        {stat.icon}
                      </div>
                      {stat.trend && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color || ""}`}>{stat.val}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card h-[400px] relative group overflow-hidden bg-black/40">
                  <ScanningEffect />
                  <div className="absolute top-6 left-6 z-30">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border-white/10 text-[10px] font-bold tracking-widest uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Live Vision Preview
                    </div>
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 z-30 flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white">Quick Scan</h3>
                      <p className="text-sm text-white/60">Ready for automated item detection</p>
                    </div>
                    <Button 
                      onClick={() => setActiveTab("Scan Food")}
                      size="lg" className="rounded-full px-8 shadow-xl shadow-primary/20"
                    >
                      Open Scanner
                    </Button>
                  </div>
                </div>

                <div className="glass-card h-full p-8 border-white/5 bg-black/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Recent Items</h3>
                    <button className="text-primary text-xs font-bold hover:underline">View All</button>
                  </div>
                  <div className="space-y-6">
                    {[
                      { name: "Organic Bananas", status: "Fresh", time: "2m ago", color: "text-emerald-400" },
                      { name: "Whole Milk", status: "Expiring", time: "1h ago", color: "text-amber-400" },
                      { name: "Avocado", status: "Fresh", time: "3h ago", color: "text-emerald-400" },
                      { name: "Strawberries", status: "Spoiled", time: "Yesterday", color: "text-red-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-primary/50 transition-all">
                          <Package size={20} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className={`text-[10px] font-bold uppercase tracking-widest ${item.color}`}>
                               {item.status}
                             </span>
                             <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                               <Clock size={10} /> {item.time}
                             </span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-8 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all py-6">
                    <Plus className="mr-2 w-4 h-4" /> Add Item Manually
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "Scan Food" && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="glass-card relative overflow-hidden flex flex-col items-center justify-center p-12 bg-black/40" style={{ minHeight: scanResult ? 'auto' : '60vh' }}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                
                {!isScanning && !scanResult && !error && (
                  <div className="text-center space-y-8 w-full max-w-2xl">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">Real-time Analysis</h2>
                      <p className="text-muted-foreground">Select a detection method and upload an image to begin.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setMethod("gemini")}
                         className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${method === "gemini" ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                       >
                         <p className="font-bold text-sm">Gemini Vision AI</p>
                         <p className="text-[10px] text-muted-foreground">High accuracy, multi-modal analysis</p>
                       </button>
                       <button 
                         onClick={() => setMethod("yolo")}
                         className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${method === "yolo" ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                       >
                         <p className="font-bold text-sm">YOLOv8 Edge</p>
                         <p className="text-[10px] text-muted-foreground">Ultra-fast real-time item detection</p>
                       </button>
                    </div>

                    {method === "gemini" && (
                       <div className="relative">
                          <input 
                            type="password"
                            placeholder="Paste Gemini API Key (optional)..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <p className="text-[10px] text-left mt-2 text-muted-foreground">Note: Providing an API key allows for much more accurate item counting and detailed analysis.</p>
                       </div>
                    )}

                    <div className="flex gap-4 justify-center pt-4">
                       <Button size="lg" className="rounded-full px-8 h-14" onClick={() => fileInputRef.current?.click()}>
                         <Camera className="mr-2" /> Take Photo
                       </Button>
                       <Button size="lg" variant="outline" className="rounded-full px-8 h-14 bg-white/5 border-white/10" onClick={() => fileInputRef.current?.click()}>
                         <Upload className="mr-2" /> Upload Image
                       </Button>
                    </div>
                  </div>
                )}

                {isScanning && (
                  <div className="absolute inset-0 z-50">
                    <ScanningEffect />
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full border-primary/20 flex items-center gap-3">
                       <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                       <span className="text-sm font-bold tracking-widest uppercase">Processing AI Vision Pipeline...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                      <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Scan Failed</h3>
                      <p className="text-red-400/80 max-w-sm mx-auto">{error}</p>
                    </div>
                    <Button onClick={() => setError(null)} className="rounded-full px-8">Try Again</Button>
                  </div>
                )}

                {scanResult && !isScanning && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="w-full max-w-2xl space-y-6"
                   >
                     {/* Full Image Preview */}
                     {imagePreview && (
                       <div className="glass-card overflow-hidden relative group rounded-2xl">
                          <img src={imagePreview} alt="Uploaded" className="w-full h-auto max-h-[500px] object-contain bg-black/60 group-hover:scale-[1.02] transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                             <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                               📸 Uploaded Image
                             </div>
                          </div>
                          <div className="absolute bottom-4 right-4">
                             <div className="px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] font-bold text-primary uppercase tracking-widest">
                               {scanResult.model_used || method}
                             </div>
                          </div>
                       </div>
                     )}

                     {/* Summary Stats Row */}
                     <div className="grid grid-cols-3 gap-3">
                       <div className="glass p-4 rounded-2xl border-white/5 text-center">
                         <p className="text-2xl font-bold text-primary">{scanResult.total_count || 0}</p>
                         <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Items Found</p>
                       </div>
                       <div className="glass p-4 rounded-2xl border-white/5 text-center">
                         <p className="text-2xl font-bold">
                           {scanResult.items?.length > 0 
                             ? Math.round((scanResult.items.filter((i: any) => i.freshness !== 'Rotten').length / scanResult.items.length) * 100)
                             : scanResult.freshness_analysis?.label === 'Fresh' ? 100 : scanResult.freshness_analysis ? 0 : '—'
                           }{scanResult.items?.length > 0 || scanResult.freshness_analysis ? '%' : ''}
                         </p>
                         <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Fresh Rate</p>
                       </div>
                       <div className="glass p-4 rounded-2xl border-white/5 text-center">
                         <p className="text-2xl font-bold">
                           {new Set(scanResult.items?.map((i: any) => i.category) || []).size || '—'}
                         </p>
                         <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Categories</p>
                       </div>
                     </div>

                     <div className="glass p-8 rounded-3xl border-primary/20 space-y-6">
                       {/* Header */}
                       <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold uppercase tracking-tight">Analysis Complete</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">{scanResult.model_used || 'AI Vision'} • {scanResult.scan_type || 'Full Scan'}</p>
                          </div>
                        </div>
                       </div>
                     
                       {/* Detected Items List */}
                       {scanResult.items && scanResult.items.length > 0 && (
                         <div className="space-y-4 pt-4 border-t border-white/5">
                           <div className="flex items-center justify-between">
                              <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Detected Items</span>
                              <span className="text-sm font-bold text-primary">{scanResult.total_count} Total</span>
                           </div>
                           <div className="space-y-2">
                              {scanResult.items.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                         <Package size={16} className="text-primary" />
                                      </div>
                                      <div>
                                        <span className="font-bold capitalize">{item.name}</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.category || 'Food'}</span>
                                          {item.observations && (
                                            <span className="text-[10px] text-muted-foreground">• {item.observations}</span>
                                          )}
                                        </div>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <span className="text-lg font-bold">×{item.count || 1}</span>
                                      </div>
                                      <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider ${
                                        item.freshness === 'Rotten' ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                        : item.freshness === 'Slightly Aged' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      }`}>
                                         {item.freshness || 'Fresh'}
                                         {item.freshness_confidence ? ` ${Math.round(item.freshness_confidence * 100)}%` : ''}
                                      </span>
                                   </div>
                                </div>
                              ))}
                           </div>
                         </div>
                       )}

                       {/* Freshness Fallback (when no items detected but ResNet ran) */}
                       {(!scanResult.items || scanResult.items.length === 0) && scanResult.freshness_analysis && (
                         <div className="space-y-4 pt-4 border-t border-white/5">
                           <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Freshness Analysis (ResNet)</p>
                           <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  scanResult.freshness_analysis.label === 'Fresh' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                                }`}>
                                  {scanResult.freshness_analysis.label === 'Fresh' 
                                    ? <CheckCircle2 size={18} className="text-emerald-400" />
                                    : <AlertTriangle size={18} className="text-red-400" />
                                  }
                                </div>
                                <div>
                                  <span className="font-bold">{scanResult.freshness_analysis.label}</span>
                                  <p className="text-[10px] text-muted-foreground">Confidence: {Math.round(scanResult.freshness_analysis.confidence * 100)}%</p>
                                </div>
                              </div>
                              <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${scanResult.freshness_analysis.label === 'Fresh' ? 'bg-emerald-400' : 'bg-red-400'}`}
                                  style={{ width: `${Math.round(scanResult.freshness_analysis.confidence * 100)}%` }}
                                />
                              </div>
                           </div>
                         </div>
                       )}

                       {/* OCR Results */}
                       {scanResult.ocr && scanResult.ocr.expiry_date && (
                         <div className="space-y-3 pt-4 border-t border-white/5">
                           <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Label Info (OCR)</p>
                           <div className="grid grid-cols-2 gap-3">
                             {scanResult.ocr.expiry_date && (
                               <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                 <p className="text-[10px] text-muted-foreground uppercase">Expiry Date</p>
                                 <p className="font-bold text-sm">{scanResult.ocr.expiry_date}</p>
                               </div>
                             )}
                             {scanResult.ocr.batch_number && (
                               <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                 <p className="text-[10px] text-muted-foreground uppercase">Batch Number</p>
                                 <p className="font-bold text-sm">{scanResult.ocr.batch_number}</p>
                               </div>
                             )}
                           </div>
                         </div>
                       )}

                       {/* Action Buttons */}
                       <div className="flex gap-4 pt-4">
                        <Button className="flex-1 rounded-xl py-6 font-bold" onClick={() => { setScanResult(null); setImagePreview(null); }}>
                          Scan New Item
                        </Button>
                        <Button variant="outline" className="flex-1 rounded-xl py-6 font-bold bg-white/5 border-white/10">
                          Save to Vault
                        </Button>
                       </div>
                     </div>
                   </motion.div>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 pb-20">
                 <div className="glass-card p-8 space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" /> Gemini Vision 1.5
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Leverage multimodal AI to detect complex spoilage patterns that conventional CV models might miss.
                    </p>
                 </div>
                 <div className="glass-card p-8 space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" /> Edge Detection
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Real-time YOLOv8 processing for instant item counting and categorization in busy scenes.
                    </p>
                 </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ INVENTORY TAB ═══════ */}
          {activeTab === "Inventory" && (
            <motion.div key="inventory" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{inventory.length} items in your vault</p>
                </div>
                <Button size="sm" className="rounded-full px-6" onClick={fetchInventory}>
                  <RefreshCw size={14} className="mr-2"/> Refresh
                </Button>
              </div>

              {loading && <div className="text-center py-12 text-muted-foreground animate-pulse">Loading inventory...</div>}

              {!loading && inventory.length === 0 && (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mx-auto">
                    <Package className="text-muted-foreground"/>
                  </div>
                  <h3 className="text-lg font-bold">No items yet</h3>
                  <p className="text-muted-foreground text-sm">Scan food to auto-populate your inventory.</p>
                  <Button className="rounded-full px-8" onClick={() => setActiveTab("Scan Food")}>Open Scanner</Button>
                </div>
              )}

              {!loading && inventory.length > 0 && (
                <div className="grid gap-3">
                  {inventory.map((item: any, i: number) => (
                    <motion.div key={item.id||i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                      className="glass-card flex items-center justify-between p-5 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          item.category === 'Fruit' ? 'bg-orange-500/10' : item.category === 'Vegetable' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                        }`}>
                          {item.category === 'Fruit' ? <Apple size={20} className="text-orange-400"/> :
                           item.category === 'Vegetable' ? <Leaf size={20} className="text-emerald-400"/> :
                           <ShoppingBag size={20} className="text-blue-400"/>}
                        </div>
                        <div>
                          <p className="font-bold capitalize">{item.item_name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.category || 'Other'}</span>
                            <span className="text-[10px] text-muted-foreground">Qty: {item.quantity}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={9}/> {new Date(item.added_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.freshness_score && (
                          <span className="text-xs text-muted-foreground">{Math.round(item.freshness_score*100)}%</span>
                        )}
                        <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider ${
                          item.freshness === 'Rotten' ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : item.freshness === 'Slightly Aged' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>{item.freshness || 'Unknown'}</span>
                        <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/10">
                          <Trash2 size={14} className="text-red-400"/>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════ ANALYTICS TAB ═══════ */}
          {activeTab === "Analytics" && (
            <motion.div key="analytics" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="space-y-8">
              {loading && <div className="text-center py-12 text-muted-foreground animate-pulse">Loading analytics...</div>}

              {!loading && analytics && (
                <>
                  {/* Stat Cards */}
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Scans", val: analytics.stats?.total_scans || 0, icon: <Camera className="text-purple-400"/>, color: "text-purple-400" },
                      { label: "Items Detected", val: analytics.stats?.total_items_detected || 0, icon: <Eye className="text-blue-400"/>, color: "text-blue-400" },
                      { label: "In Inventory", val: analytics.stats?.inventory_count || 0, icon: <Package className="text-emerald-400"/>, color: "text-emerald-400" },
                      { label: "Expiring Soon", val: analytics.expiring_count || 0, icon: <AlertTriangle className="text-amber-400"/>, color: "text-amber-400" },
                    ].map((s, i) => (
                      <motion.div key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
                        className="glass-card p-6 bg-black/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{s.icon}</div>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Freshness Breakdown */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="glass-card p-8 bg-black/20 space-y-6">
                      <h3 className="text-lg font-bold">Freshness Breakdown</h3>
                      {analytics.stats?.freshness_breakdown && Object.keys(analytics.stats.freshness_breakdown).length > 0 ? (
                        <div className="space-y-4">
                          {Object.entries(analytics.stats.freshness_breakdown).map(([label, count]: [string, any]) => {
                            const total = Object.values(analytics.stats.freshness_breakdown as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            const color = label === 'Rotten' ? 'bg-red-400' : label === 'Slightly Aged' ? 'bg-amber-400' : 'bg-emerald-400';
                            return (
                              <div key={label} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium capitalize">{label || 'Unknown'}</span>
                                  <span className="text-muted-foreground">{count} items ({pct}%)</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                  <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8, delay:0.2}} className={`h-full rounded-full ${color}`}/>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No freshness data yet. Scan some items!</p>
                      )}
                    </div>

                    <div className="glass-card p-8 bg-black/20 space-y-6">
                      <h3 className="text-lg font-bold">Category Distribution</h3>
                      {analytics.stats?.category_breakdown && Object.keys(analytics.stats.category_breakdown).length > 0 ? (
                        <div className="space-y-4">
                          {Object.entries(analytics.stats.category_breakdown).map(([cat, count]: [string, any]) => {
                            const total = Object.values(analytics.stats.category_breakdown as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                              <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    cat === 'Fruit' ? 'bg-orange-500/10' : cat === 'Vegetable' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                                  }`}>
                                    {cat === 'Fruit' ? <Apple size={14} className="text-orange-400"/> :
                                     cat === 'Vegetable' ? <Leaf size={14} className="text-emerald-400"/> :
                                     <ShoppingBag size={14} className="text-blue-400"/>}
                                  </div>
                                  <span className="font-medium">{cat}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold">{count}</span>
                                  <span className="text-[10px] text-muted-foreground">({pct}%)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No category data yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Expiring Items */}
                  {analytics.expiring_items && analytics.expiring_items.length > 0 && (
                    <div className="glass-card p-8 bg-black/20 space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <AlertTriangle className="text-amber-400" size={20}/> Expiring Soon
                      </h3>
                      <div className="space-y-2">
                        {analytics.expiring_items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <span className="font-medium">{item.item_name}</span>
                            <span className="text-amber-400 text-sm font-bold">
                              {item.days_until_expiry <= 0 ? 'EXPIRED' : `${item.days_until_expiry}d left`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {!loading && !analytics && (
                <div className="text-center py-20 space-y-4">
                  <BarChart2 size={48} className="text-muted-foreground mx-auto"/>
                  <h3 className="text-lg font-bold">No Analytics Data</h3>
                  <p className="text-muted-foreground text-sm">Start scanning food to build your analytics.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════ HISTORY TAB ═══════ */}
          {activeTab === "History" && (
            <motion.div key="history" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{history.length} scans recorded</p>
                <Button size="sm" className="rounded-full px-6" onClick={fetchHistory}>
                  <RefreshCw size={14} className="mr-2"/> Refresh
                </Button>
              </div>

              {loading && <div className="text-center py-12 text-muted-foreground animate-pulse">Loading history...</div>}

              {!loading && history.length === 0 && (
                <div className="text-center py-20 space-y-4">
                  <History size={48} className="text-muted-foreground mx-auto"/>
                  <h3 className="text-lg font-bold">No Scan History</h3>
                  <p className="text-muted-foreground text-sm">Your scan results will appear here.</p>
                  <Button className="rounded-full px-8" onClick={() => setActiveTab("Scan Food")}>Start Scanning</Button>
                </div>
              )}

              {!loading && history.length > 0 && (
                <div className="space-y-3">
                  {history.map((scan: any, i: number) => (
                    <motion.div key={scan.id||i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                      className="glass-card p-5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            scan.detection_method === 'gemini' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                          }`}>
                            {scan.detection_method === 'gemini' ? <Bot size={20} className="text-blue-400"/> : <Zap size={20} className="text-purple-400"/>}
                          </div>
                          <div>
                            <p className="font-bold">{scan.scan_type || 'Full Scan'}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{scan.detection_method || 'AI'}</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock size={9}/> {new Date(scan.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{scan.total_count || 0}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Items</p>
                          </div>
                          {scan.items_detected && scan.items_detected.length > 0 && (
                            <div className="hidden md:flex gap-1 flex-wrap max-w-[200px]">
                              {scan.items_detected.slice(0, 3).map((item: any, j: number) => (
                                <span key={j} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/5 capitalize">
                                  {typeof item === 'string' ? item : item.name}
                                </span>
                              ))}
                              {scan.items_detected.length > 3 && (
                                <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-muted-foreground">+{scan.items_detected.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════ SETTINGS TAB ═══════ */}
          {activeTab === "Settings" && (
            <motion.div key="settings" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="space-y-8 max-w-3xl">

              {/* API Key Section */}
              <div className="glass-card p-8 bg-black/20 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Bot size={20} className="text-primary"/></div>
                  <div>
                    <h3 className="text-lg font-bold">Gemini API Key</h3>
                    <p className="text-xs text-muted-foreground">Used for AI-powered food detection and analysis</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input type="password" placeholder="AIzaSy..." value={savedKey} onChange={e => setSavedKey(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"/>
                  <Button className="rounded-xl px-6" onClick={() => { setApiKey(savedKey); setSettingsMsg("API key saved for this session!"); setTimeout(() => setSettingsMsg(""), 3000); }}>
                    Save Key
                  </Button>
                </div>
                {settingsMsg && <p className="text-xs text-emerald-400 font-medium">{settingsMsg}</p>}
                <p className="text-[10px] text-muted-foreground">Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary hover:underline">Google AI Studio</a>. Key is stored in memory only.</p>
              </div>

              {/* Backend Health */}
              <div className="glass-card p-8 bg-black/20 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Zap size={20} className="text-emerald-400"/></div>
                    <div>
                      <h3 className="text-lg font-bold">Backend Status</h3>
                      <p className="text-xs text-muted-foreground">FastAPI server health & loaded modules</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full bg-white/5 border-white/10" onClick={async () => {
                    try { const r = await fetch(`${API}/api/health`); const d = await r.json(); if(d.success) setHealth(d.data); } catch(e) { setHealth(null); }
                  }}>
                    <RefreshCw size={14} className="mr-2"/> Check
                  </Button>
                </div>
                {health ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${health.status === 'healthy' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}/>
                      <span className="text-sm font-bold capitalize">{health.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(health.modules).map(([mod, ok]) => (
                        <div key={mod} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`}/>
                          <span className="text-sm capitalize">{mod.replace(/_/g, ' ')}</span>
                          <span className={`ml-auto text-[10px] font-bold uppercase ${ok ? 'text-emerald-400' : 'text-red-400'}`}>{ok ? 'Ready' : 'Off'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Click "Check" to test backend connection.</p>
                )}
              </div>

              {/* Preferences */}
              <div className="glass-card p-8 bg-black/20 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Settings size={20} className="text-blue-400"/></div>
                  <div>
                    <h3 className="text-lg font-bold">Preferences</h3>
                    <p className="text-xs text-muted-foreground">Default scan settings</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="font-medium text-sm">Default Detection Method</p>
                      <p className="text-[10px] text-muted-foreground">Method used when opening the scanner</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setMethod('gemini')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${method === 'gemini' ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}>Gemini</button>
                      <button onClick={() => setMethod('yolo')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${method === 'yolo' ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}>YOLO</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="font-medium text-sm">Default Scan Type</p>
                      <p className="text-[10px] text-muted-foreground">Analysis depth when scanning</p>
                    </div>
                    <span className="px-4 py-2 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">Full Scan</span>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="glass-card p-8 bg-black/20 space-y-3">
                <h3 className="text-lg font-bold">About FreshAI</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Version</span><p className="font-bold">2.0.0</p></div>
                  <div><span className="text-muted-foreground">Backend</span><p className="font-bold">FastAPI + Uvicorn</p></div>
                  <div><span className="text-muted-foreground">AI Models</span><p className="font-bold">Gemini 2.5 + YOLOv8 + ResNet18</p></div>
                  <div><span className="text-muted-foreground">Frontend</span><p className="font-bold">Next.js 16 + Framer Motion</p></div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
