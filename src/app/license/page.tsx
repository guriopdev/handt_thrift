import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function License() {
  return (
    <div className="min-h-screen bg-beige p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-purple/10">
        <Link href="/" className="inline-flex items-center gap-2 text-purple font-bold mb-8 hover:text-lavender transition-colors">
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple/10 rounded-2xl flex items-center justify-center text-purple">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">Platform License</h1>
        </div>
        
        <div className="space-y-6 text-gray-600 leading-relaxed text-lg pb-12">
          <p>Effective Date: March 2026</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Permitted Use</h2>
          <p>HandT Thrift grants you a personal, non-exclusive, non-transferable, limited privilege to enter and use the Site specifically for the NIT Hamirpur community. This platform is provided strictly for academic, community-driven, and local thrifting purposes.</p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Intellectual Property</h2>
          <p>All content included on this site, such as text, graphics, logos, images, and software, is the property of HandT Thrift or its content suppliers and protected by international copyright laws. Unwarranted scraping, copying, or redistribution of the UI, codebase, or assets is strictly prohibited.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Open Source & Third Party</h2>
          <p>This platform acknowledges the use of several open-source libraries, including React, Next.js, TailwindCSS, and Lucide React. These are governed by their respective MIT/Apache licenses.</p>
        </div>
      </div>
    </div>
  );
}
