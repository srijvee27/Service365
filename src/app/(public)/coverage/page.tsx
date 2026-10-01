"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BANGLADESH_DIVISIONS, BANGLADESH_DISTRICTS } from "@/lib/bangladesh-data";
import { Search, MapPin, Clock, Zap, CheckCircle2 } from "lucide-react";

export default function CoveragePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");

  const filteredDistricts = useMemo(() => {
    return BANGLADESH_DISTRICTS.filter((district) => {
      const matchesDivision = selectedDivision === "All" || district.division === selectedDivision;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        district.name.toLowerCase().includes(query) ||
        district.bnName.includes(query) ||
        district.division.toLowerCase().includes(query) ||
        district.areas.some((area) => area.toLowerCase().includes(query));
      return matchesDivision && matchesSearch;
    });
  }, [searchQuery, selectedDivision]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-3.5 py-1 rounded-full border border-emerald-400/20">
            64 Districts Nationwide Coverage
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Delivering to Every Corner of Bangladesh
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg">
            Search your recipient's district or thana below to view delivery lead times, hub locations, and express availability.
          </p>

          {/* Search Bar */}
          <div className="pt-6 max-w-xl mx-auto">
            <div className="relative flex items-center bg-white rounded-xl shadow-xl p-1.5 text-slate-800">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search district, thana, or area (e.g. Agrabad, Bogura, Sylhet)..."
                className="w-full bg-transparent text-sm px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        {/* Division Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedDivision("All")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedDivision === "All"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            All Divisions (64)
          </button>
          {BANGLADESH_DIVISIONS.map((div) => (
            <button
              key={div.name}
              type="button"
              onClick={() => setSelectedDivision(div.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedDivision === div.name
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {div.name} ({div.bnName})
            </button>
          ))}
        </div>

        {/* District Grid */}
        {filteredDistricts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Coverage Area Found</h3>
            <p className="text-xs text-slate-500">
              We couldn't find any district or area matching "{searchQuery}". Please check the spelling or select a division above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDistricts.map((district) => (
              <div
                key={district.name}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span>{district.name}</span>
                        <span className="text-xs font-semibold text-slate-400">({district.bnName})</span>
                      </h3>
                      <p className="text-xs text-blue-600 font-medium">{district.division} Division</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        district.zoneType === "INSIDE_DHAKA"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : district.zoneType === "DHAKA_SUBURB"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {district.zoneType.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Delivery time & features */}
                  <div className="flex items-center gap-4 text-xs text-slate-600 mb-4 pb-3 border-b border-slate-100">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ~{district.deliveryTimeHours}h Delivery
                    </span>
                    {district.zoneType === "INSIDE_DHAKA" && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600">
                        <Zap className="w-3.5 h-3.5" /> Express Ready
                      </span>
                    )}
                  </div>

                  {/* Supported Areas */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Key Thanas & Hubs ({district.areas.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {district.areas.map((area) => (
                        <span
                          key={area}
                          className="bg-slate-100 hover:bg-slate-200/80 transition text-slate-700 text-[11px] px-2 py-0.5 rounded-md font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Doorstep Active
                  </span>
                  <span className="font-mono text-[11px]">COD Supported</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
