"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Service365Logo } from "@/components/branding/Service365Logo";
import { Menu, X, ArrowRight, Search, ShieldCheck } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition">
          <Service365Logo size="md" showTagline />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/services" className="hover:text-blue-600 transition">
            Services
          </Link>
          <Link href="/pricing" className="hover:text-blue-600 transition">
            Pricing
          </Link>
          <Link href="/coverage" className="hover:text-blue-600 transition flex items-center gap-1">
            <span>Coverage</span>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              64 Districts
            </span>
          </Link>
          <Link href="/track" className="hover:text-blue-600 transition flex items-center gap-1.5">
            <Search className="w-4 h-4 text-slate-400" />
            Track Parcel
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition">
            About
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition">
            Contact
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition"
          >
            Sign In
          </Link>
          <Link
            href="/merchant/register"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 transition transform active:scale-95"
          >
            <span>Become a Merchant</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Services
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Pricing & Calculator
          </Link>
          <Link
            href="/coverage"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Nationwide Coverage (64 Districts)
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 bg-blue-50/50"
          >
            🔍 Track Your Parcel
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Contact & Support
          </Link>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 text-slate-700 font-semibold border border-slate-300 rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href="/merchant/register"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm"
            >
              Become a Merchant
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
