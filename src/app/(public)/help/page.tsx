import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, CheckCircle, AlertTriangle, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/20">
            Resource Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Merchant Help Center & Guide</h1>
          <p className="text-slate-300 max-w-xl mx-auto text-xs sm:text-sm">
            Everything you need to know about preparing parcels, printing shipping labels, and avoiding transit delays.
          </p>
        </div>
      </section>

      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Guide Card 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-900">How to Package & Seal Your Consignment</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Proper packaging ensures your goods arrive undamaged and helps prevent customer rejections.
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Use standard corrugated courier boxes or bubble-lined poly mailer bags.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Fragile items (cosmetics, glass, electronics) must have at least 2 inches of cushioning.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Affix the printable 4x6 shipping label firmly on a flat surface without folding the barcode.</span>
            </li>
          </ul>
        </div>

        {/* Guide Card 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-900">Prohibited & Hazardous Goods</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In accordance with Bangladesh postal regulations, the following items cannot be shipped through Service365:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">• Combustible liquids & chemicals</div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">• Counterfeit or unauthorized goods</div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">• Currency notes, bullion, or jewelry</div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">• Perishable livestock or meats</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
