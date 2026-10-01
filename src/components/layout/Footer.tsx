import React from "react";
import Link from "next/link";
import { Service365Logo } from "@/components/branding/Service365Logo";
import { MapPin, Phone, Mail, Clock, ShieldCheck, CreditCard, Truck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Upper Features Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">64 Districts Doorstep Reach</h4>
              <p className="text-xs text-slate-400 mt-0.5">Every thana, upazila, and metropolitan zone covered.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Guaranteed COD Settlements</h4>
              <p className="text-xs text-slate-400 mt-0.5">Automated 24-48h merchant bank & bKash payouts.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Seamless bKash Integration</h4>
              <p className="text-xs text-slate-400 mt-0.5">Prepaid parcel booking with instant transaction receipts.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Service365Logo theme="dark" size="lg" showTagline />
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed mt-3">
            Service365 is Bangladesh’s next-generation tech-driven parcel delivery and logistics network.
            Built to scale e-commerce merchants, SMEs, and enterprise retail with end-to-end transparency.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono text-[11px]">
              🇧🇩 Made for Bangladesh
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono text-[11px]">
              24/7 Operations
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm tracking-wide mb-4">Platform</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/services" className="hover:text-white transition">
                Courier Services
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-white transition">
                Delivery Pricing
              </Link>
            </li>
            <li>
              <Link href="/coverage" className="hover:text-white transition">
                Coverage Map
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-white transition">
                Track Consignment
              </Link>
            </li>
            <li>
              <Link href="/merchant/register" className="hover:text-white transition text-blue-400 font-medium">
                Merchant Sign Up
              </Link>
            </li>
          </ul>
        </div>

        {/* Company & Support */}
        <div>
          <h4 className="text-white font-semibold text-sm tracking-wide mb-4">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/about" className="hover:text-white transition">
                About Service365
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition">
                Contact & Hubs
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-white transition">
                Help & FAQs
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-white transition">
                Refund & COD Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Hotline */}
        <div>
          <h4 className="text-white font-semibold text-sm tracking-wide mb-4">Central Hub</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <span>Tejgaon Commercial Area, Dhaka-1208, Bangladesh</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>+880 9612-345365</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>support@service365.com.bd</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dispatch: Mon-Sun (365 Days)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Service365 Logistics Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-400 transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-400 transition">
              Privacy
            </Link>
            <Link href="/refund-policy" className="hover:text-slate-400 transition">
              Refunds
            </Link>
            <span>v1.0.0-production</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
