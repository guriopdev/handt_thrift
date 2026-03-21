import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-beige p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-purple/10">
        <Link href="/" className="inline-flex items-center gap-2 text-purple font-bold mb-8 hover:text-lavender transition-colors">
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple/10 rounded-2xl flex items-center justify-center text-purple">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">Terms & Conditions</h1>
        </div>
        
        <div className="space-y-6 text-gray-600 leading-relaxed text-lg pb-12">
          <p>Last modified: March 22, 2026</p>
          <p>Welcome to HandT Thrift. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Eligibility</h2>
          <p>Currently, the beta version of this application is rigorously restricted to the constituents of NIT Hamirpur. You must accurately represent your affiliation during the Identity Card creation process.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Prohibited Items</h2>
          <p>Users are strictly forbidden from selling illegal goods, counterfeits, hazardous materials, or explicit content. HandT Thrift reserves the right to immediately terminate the accounts of violating users without prior notice.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Offline Transactions</h2>
          <p>HandT Thrift acts merely as a connection platform. All final payments, negotiations, and physical hand-overs occur completely offline. HandT Thrift is not liable for scams, defective items, or any damages occurring during the physical meetup exchange.</p>

           <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Liability</h2>
          <p>We provide the platform "as-is" without any warranty. Users engage in physical commerce at their own localized risk.</p>
        </div>
      </div>
    </div>
  );
}
