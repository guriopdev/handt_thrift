"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Recycle, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  Instagram, 
  Mail,
  User,
  Play,
  X,
  Sparkles,
  Leaf,
  HeartHandshake,
  CheckCircle2,
  MessageSquare
} from "lucide-react";

export default function Home() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-beige selection:bg-purple selection:text-white pb-0">
      {/* Sticky Navbar (Glassmorphism) */}
      <nav className="sticky top-0 z-50 bg-beige/70 backdrop-blur-xl border-b border-purple/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Generated Aesthetic Logo */}
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
              <div className="relative overflow-hidden rounded-[1rem] shadow-sm border border-purple/10 group-hover:scale-105 transition-transform duration-500">
                <Image src="/logo.png" alt="HandT Thrift Logo" width={48} height={48} className="object-cover" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-gray-800">
                HandT Thrift
              </span>
            </div>

            <div className="flex items-center gap-6 font-medium text-sm">
              <Link href="/dashboard" className="hidden md:block text-gray-600 hover:text-purple transition-colors">Shop</Link>
              <Link href="/dashboard" className="hidden md:block text-gray-600 hover:text-purple transition-colors">Sell</Link>
              <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
              <Link href="/login" className="btn btn-primary flex items-center gap-2 !py-2.5 !px-5 !rounded-full shadow-purple/20 shadow-lg">
                <User size={18} />
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Modern Hero Section */}
        <section className="relative pt-24 pb-24 lg:pt-32 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue/30 rounded-full blur-[120px] -z-10"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-lavender/40 rounded-full blur-[100px] -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 fade-in relative z-10">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 border border-purple/20 backdrop-blur-md mb-8 text-sm font-bold text-purple shadow-sm">
                <Leaf size={16} />
                <span>Sustainable Style in Hamirpur</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-foreground leading-[1.05] mb-6">
                Premium Fashion, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple to-blue">Earth Friendly.</span>
              </h1>
              <p className="text-lg lg:text-xl leading-relaxed text-gray-600 mb-10 max-w-xl font-medium">
                The trusted marketplace to declutter your wardrobe and discover curated pre-loved clothing at affordable prices.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Link href="/dashboard" className="w-full sm:w-auto btn btn-primary flex items-center justify-center gap-2 !py-4 !px-8 text-lg !rounded-full shadow-xl shadow-purple/30 hover:shadow-purple/50">
                  Explore Collection <ArrowRight size={20} />
                </Link>
                
                <button 
                  onClick={() => setIsVideoOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-gray-700 bg-white/60 border border-transparent hover:bg-white hover:border-purple/20 hover:text-purple shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue text-white shadow-inner pl-0.5">
                    <Play size={14} fill="currentColor" />
                  </div>
                  Watch Live Demo
                </button>
              </div>
            </div>

            {/* Video/Image Showcase */}
            <div className="w-full lg:w-1/2 fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue/30 group cursor-pointer border-[8px] border-white/60 bg-white" onClick={() => setIsVideoOpen(true)}>
                <div className="absolute inset-0 bg-gradient-to-tr from-lavender/80 via-purple/40 to-blue/40 flex flex-col items-center justify-center z-10 transition-transform duration-700 group-hover:scale-105">
                  <div className="w-20 h-20 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-purple shadow-[0_0_40px_rgba(155,142,199,0.5)] group-hover:scale-110 group-hover:bg-purple group-hover:text-white transition-all duration-300 pl-1.5">
                    <Play size={32} fill="currentColor" />
                  </div>
                  <p className="mt-5 font-bold text-white tracking-widest text-sm drop-shadow-md">PLATFORM TOUR</p>
                </div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 mix-blend-overlay scale-105 group-hover:scale-110 transition-transform duration-1000"></div>
              </div>
            </div>
          </div>
        </section>

        {/* What is Thrifting Section */}
        <section className="py-24 bg-[#FDFAF6] border-y border-purple/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="w-full md:w-1/2 fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="relative aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue/30 to-lavender/30 rounded-[3rem] rotate-6"></div>
                  <div className="absolute inset-0 bg-white p-3 rounded-[3rem] shadow-xl -rotate-3 transition-transform hover:rotate-0 duration-500">
                    <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-beige/50 relative">
                       <img 
                        src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80" 
                        alt="Stack of neat recycled clothing"
                        className="w-full h-full object-cover mix-blend-multiply opacity-80"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue/20 text-blue font-bold text-sm mb-6">
                  <HeartHandshake size={16} />
                  <span>The Movement</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
                  What is <span className="text-purple">Thrifting?</span>
                </h2>
                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    <strong>Thrifting is conscious shopping.</strong> Instead of buying newly manufactured clothes built for fast fashion, thrifting allows you to buy pre-owned, high-quality, and often vintage pieces at a fraction of their original price.
                  </p>
                  <p>
                    By choosing to purchase or sell second-hand clothing, you are directly preventing textile waste from entering land-fills and significantly reducing the carbon footprint associated with manufacturing new garments. 
                  </p>
                  <p className="font-semibold text-purple">
                    It&apos;s a beautiful cycle: you save money, discover completely unique styles, and help protect our planet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Bento) */}
        <section className="py-24 bg-white/40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
             <div className="text-center mb-16 fade-in" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                A streamlined experience to keep the fashion loop moving smoothly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
              <div className="card !p-8 !rounded-[2rem] flex flex-col justify-between fade-in md:col-span-2 group" style={{ animationDelay: "0.2s" }}>
                <div className="w-16 h-16 bg-blue/20 rounded-2xl flex items-center justify-center text-blue group-hover:bg-blue group-hover:text-white transition-all duration-300">
                  <Recycle size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground mb-3 mt-6">1. Relove & List</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Clear out your closet. Snap a photo of clothes you no longer wear and easily list them on our seamless dashboard. Complete the cycle.
                  </p>
                </div>
              </div>

              <div className="card !p-8 !rounded-[2rem] bg-gradient-to-br from-lavender to-purple !border-none !text-white flex flex-col justify-between fade-in group shadow-xl shadow-purple/20" style={{ animationDelay: "0.3s" }}>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-3 mt-6">2. Verified</h3>
                  <p className="text-white/85 text-lg leading-relaxed">
                    Our team quality-checks every single submission. Only the best items make it to the feed.
                  </p>
                </div>
              </div>

              <div className="card !p-8 !rounded-[2rem] md:col-span-3 flex flex-col md:flex-row items-center justify-between gap-8 fade-in group" style={{ animationDelay: "0.4s" }}>
                <div className="flex-1">
                   <div className="w-16 h-16 bg-purple/10 rounded-2xl flex items-center justify-center text-purple mb-6">
                    <Tag size={32} />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-3">3. Shop & Connect</h3>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                    Buyers can effortlessly browse curated Vintage Tees, Outerwear, and Accessories. Found something you love? Connect instantly to arrange a safe purchase offline or online.
                  </p>
                </div>
                <div className="hidden md:flex gap-4">
                  {/* Visual UI Elements decor */}
                  <div className="h-32 w-24 rounded-2xl bg-blue/10 animate-pulse"></div>
                  <div className="h-32 w-24 rounded-2xl bg-lavender/20 animate-pulse delay-75"></div>
                  <div className="h-32 w-24 rounded-2xl bg-purple/10 animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Workflow Section */}
        <section className="py-24 bg-beige border-t border-purple/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
             <div className="text-center mb-16 fade-in" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                The Secure Marketplace Workflow
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                No complex online checkouts. Pure campus connectivity directly through HandT.
              </p>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-purple/10 fade-in relative" style={{ animationDelay: "0.2s" }}>
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-[44%] left-[10%] right-[10%] h-1 bg-gray-100 z-0"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                {[
                  { title: "1. Lock Profile", desc: "GPS ties you to NIT", icon: <User size={32}/> },
                  { title: "2. Explore", desc: "Browse curated collections", icon: <Tag size={32}/> },
                  { title: "3. Make Offer", desc: "Send a Counter Price", icon: <MessageSquare size={32}/> },
                  { title: "4. Handshake", desc: "Seller Approves Deal", icon: <CheckCircle2 size={32}/> },
                  { title: "5. Exchange", desc: "Meet safely in person", icon: <HeartHandshake size={32}/> }
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center p-4 w-full md:w-auto mt-4 md:mt-0 group bg-white hover:-translate-y-2 transition-transform duration-300 rounded-[2rem]">
                    <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-5 shadow-sm border-2 transition-colors
                      ${idx === 0 ? 'bg-orange-50 text-orange-500 border-orange-100 group-hover:bg-orange-500 group-hover:text-white' : 
                        idx === 1 ? 'bg-blue/10 text-blue border-blue/20 group-hover:bg-blue group-hover:text-white' : 
                        idx === 2 ? 'bg-purple/10 text-purple border-purple/20 group-hover:bg-purple group-hover:text-white' : 
                        idx === 3 ? 'bg-green-50 text-green-500 border-green-100 group-hover:bg-green-500 group-hover:text-white' : 
                        'bg-red-50 text-red-500 border-red-100 group-hover:bg-red-500 group-hover:text-white'}`}>
                      {step.icon}
                    </div>
                    <h4 className="font-black text-gray-900 text-lg">{step.title}</h4>
                    <p className="text-sm text-gray-500 text-center mt-1 max-w-[120px] font-medium leading-snug">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Website Rules Section */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] h-[300px] bg-blue/10 rounded-full blur-[80px]"></div>
          
          <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16 fade-in">
              <span className="text-purple font-bold tracking-wider uppercase text-sm mb-2 block">Community Guidelines</span>
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
                Platform Rules & Values
              </h2>
              <p className="mt-4 text-gray-500 text-lg">Maintaining a safe, trustworthy environment for everyone.</p>
            </div>

            <div className="space-y-4">
              {[
                { title: "Transparency & Accuracy", desc: "All items must be physically washed and accurately described. Mention any flaws or wear-and-tear upfront." },
                { title: "Zero Counterfeits", desc: "We strictly prohibit unauthorized replicas, fakes, or pirated goods. Selling counterfeits will result in a permanent ban." },
                { title: "Respectful Interactions", desc: "Treat buyers and sellers with utmost respect. Any harassment or abusive language in DMs will not be tolerated." },
                { title: "Final Sales", desc: "Unless explicitly misrepresented by the seller, all thrift purchases are considered final once completed." }
              ].map((rule, idx) => (
                <div key={idx} className="fade-in p-6 rounded-3xl bg-beige/30 border border-purple/10 flex gap-5 hover:bg-beige/50 transition-colors" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                  <div className="mt-1">
                    <CheckCircle2 className="text-purple h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-1">{rule.title}</h4>
                    <p className="text-gray-600 leading-relaxed text-[1.05rem]">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="rounded-[1rem] overflow-hidden shadow-sm border border-purple/10">
                <Image src="/logo.png" alt="HandT Thrift Logo" width={40} height={40} className="object-cover" />
              </div>
              <span className="font-black text-2xl text-foreground">HandT Thrift</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://mail.google.com/mail/?view=cm&to=thrifthamirpur@gmail.com&su=Query%20or%20Complaint%20related%20to%20the%20HandT%20website" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center gap-2 px-5 py-3 rounded-2xl bg-beige text-purple hover:bg-purple hover:text-white transition-all shadow-sm font-bold hover:-translate-y-1">
                <Mail size={18} /> Contact Us
              </a>
              <a href="https://www.instagram.com/hamirpur_thrift_hub?igsh=cWIxNXFjcWVndmVl" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center gap-2 px-5 py-3 rounded-2xl bg-beige text-purple hover:bg-purple hover:text-white transition-all shadow-sm font-bold hover:-translate-y-1">
                <Instagram size={18} /> Follow Us
              </a>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm font-medium">
              © {new Date().getFullYear()} HandT Thrift Platform. Designed for Hamirpur.
            </p>
            <div className="flex gap-6 text-sm text-gray-400 font-medium">
              <Link href="/license" className="hover:text-purple transition-colors">License</Link>
              <Link href="/terms" className="hover:text-purple transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsVideoOpen(false)}></div>
          
          <div className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl shadow-purple/20 border border-white/10 z-10 animate-in zoom-in duration-300">
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-20 w-12 h-12 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="relative pt-[56.25%] bg-zinc-900 border-2 border-white/10 flex items-center justify-center">
              <img 
                src="/handt_demo.webp" 
                alt="HandT Authenticated Live Dashboard Walkthrough" 
                className="absolute inset-0 w-full h-full object-contain bg-black"
                loading="lazy"
              />
            </div>
            
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
              <div className="flex items-center gap-3 mb-2">
                <div className="px-2 py-1 bg-purple rounded text-xs font-bold text-white tracking-wider">LIVE</div>
                <p className="text-white font-bold tracking-tight text-xl drop-shadow-md">Platform Walkthrough Demo</p>
              </div>
              <p className="text-white/80 font-medium drop-shadow-md">Watch how easy it is to buy and sell pre-loved clothing.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
