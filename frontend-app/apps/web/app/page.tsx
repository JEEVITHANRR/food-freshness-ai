"use client";

import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import FoodScene from "@/components/FoodScene";
import SectionReveal from "@/components/SectionReveal";
import ScanningEffect from "@/components/ScanningEffect";
import { 
  Camera, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ArrowRight, 
  Apple, 
  Bot, 
  Layers 
} from "lucide-react";
import Tilt from "react-parallax-tilt";

export default function Page() {
  return (
    <div className="relative min-h-screen selection:bg-primary/30">
      <FoodScene />
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass px-6 py-3 rounded-full border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              F
            </div>
            <span className="font-bold text-lg tracking-tight">FreshAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/70">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#technology" className="hover:text-primary transition-colors">Technology</a>
            <a href="#dashboard" className="hover:text-primary transition-colors">Dashboard</a>
          </div>
          <Button size="sm" className="rounded-full px-6">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <SectionReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
                <Bot className="w-3 h-3" /> Powered by Gemini & YOLOv8
              </div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-gradient">
                Intelligent <br /> <span className="text-primary">Food</span> Care.
              </h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-lg leading-relaxed">
                Experience the future of kitchen management. FreshAI uses advanced computer vision to monitor freshness, detect spoilage, and optimize your inventory in real-time.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <a href="/dashboard">
                  <Button size="lg" className="rounded-full px-8 h-14 text-lg">
                    Launch App <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg bg-transparent border-white/10 hover:bg-white/5 transition-all">
                  Watch Demo
                </Button>
              </div>
            </SectionReveal>
          </div>
          
          <SectionReveal delay={0.2} direction="right">
            <div className="relative aspect-square max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
              <Tilt
                tiltMaxAngleX={5}
                tiltMaxAngleY={5}
                glareEnable={true}
                glareMaxOpacity={0.1}
                glareColor="#ffffff"
                glarePosition="all"
                className="h-full w-full"
              >
                <div className="glass-card relative h-full w-full p-2 group cursor-crosshair">
                  <ScanningEffect />
                  <div className="absolute bottom-6 left-6 right-6 p-6 glass rounded-2xl border-white/5 space-y-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-primary uppercase tracking-widest">Analysis Result</span>
                      <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">98% FRESH</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold">Honeycrisp Apple</h3>
                      <p className="text-xs text-muted-foreground">Optimal freshness. Best consumed within 5 days.</p>
                    </div>
                  </div>
                </div>
              </Tilt>
            </div>
          </SectionReveal>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-black/5 dark:bg-white/5 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto">
          <SectionReveal className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Precision Food Intelligence</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Our multi-layered AI stack provides unprecedented insight into your food supply chain, from detection to predictive analytics.
            </p>
          </SectionReveal>


          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Camera className="w-6 h-6 text-primary" />,
                title: "Real-time Scanning",
                desc: "Instant item detection and counting using YOLOv8 optimized for mobile and desktop."
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-primary" />,
                title: "Freshness Analysis",
                desc: "Deep Learning models evaluate visual cues to determine precise freshness levels."
              },
              {
                icon: <Bot className="w-6 h-6 text-primary" />,
                title: "Gemini Vision AI",
                desc: "Leverage Google's most capable models for complex scene understanding and detailed insights."
              },
              {
                icon: <Layers className="w-6 h-6 text-primary" />,
                title: "Inventory Sync",
                desc: "Automatically track items from camera to database with intelligent categorization."
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-primary" />,
                title: "Smart Analytics",
                desc: "Visualize consumption patterns and freshness trends with beautiful, interactive reports."
              },
              {
                icon: <Zap className="w-6 h-6 text-primary" />,
                title: "Expiry Alerts",
                desc: "Proactive notifications before items spoil, significantly reducing food waste."
              }
            ].map((feature, i) => (
              <SectionReveal key={i} delay={i * 0.1}>
                <Tilt
                  tiltMaxAngleX={10}
                  tiltMaxAngleY={10}
                  perspective={1000}
                  scale={1.02}
                  transitionSpeed={1500}
                  gyroscope={true}
                  className="h-full"
                >
                  <div className="glass-card p-8 h-full flex flex-col items-start gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </Tilt>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionReveal className="glass-card bg-black/40 border-white/5 p-4 md:p-8 rounded-[2rem] overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 mb-8 items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">The Command Center</h2>
                <p className="text-muted-foreground">Manage your entire kitchen from a single, beautiful dashboard.</p>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Scans", val: "1,284", delta: "+12%" },
                { label: "Fresh Items", val: "84%", delta: "+3%" },
                { label: "Alerts", val: "2", delta: "Normal", color: "text-primary" },
                { label: "Saved Waste", val: "$42.50", delta: "This Month" }
              ].map((stat, i) => (
                <div key={i} className="glass p-6 rounded-2xl border-white/5">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.val}</p>
                  <p className={`text-[10px] mt-1 ${stat.color || "text-muted-foreground"}`}>{stat.delta}</p>
                </div>
              ))}
            </div>

            <div className="aspect-[16/9] glass rounded-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2/3 h-2/3 glass rounded-xl border-white/10 flex items-center justify-center">
                    <BarChart3 className="w-16 h-16 text-primary/20 animate-pulse" />
                 </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <SectionReveal>
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight">Ready to eliminate <br /> <span className="text-primary">food waste?</span></h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Join thousands of households and restaurants using FreshAI to optimize their food inventory and save money.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-12 h-16 text-xl shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                Start Free Trial
              </Button>
              <Button size="lg" variant="ghost" className="w-full sm:w-auto rounded-full px-12 h-16 text-xl">
                Contact Sales
              </Button>
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-primary font-bold text-xs">
              F
            </div>
            <span className="font-bold text-foreground">FreshAI</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">API</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
          <p>© 2024 FreshAI Inc. Built with Next.js & Gemini Vision.</p>
        </div>
      </footer>
    </div>
  );
}
