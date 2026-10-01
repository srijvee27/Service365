"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { MapPin, Search, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminLocationsPage() {
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadLocations = async () => {
    try {
      const res = await fetch("/api/admin/locations");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDistricts(data.data);
      }
    } catch (err) {
      console.error("Error loading districts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const toggleActive = async (district: any) => {
    setUpdatingId(district.id);
    try {
      const res = await fetch("/api/admin/locations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: district.id,
          active: !district.active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadLocations();
      }
    } catch (err) {
      alert("Error updating district status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredDistricts = districts.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.bnName?.includes(search) ||
      d.division?.toLowerCase().includes(search.toLowerCase());
    const matchesZone = zoneFilter === "ALL" || d.zoneType === zoneFilter;
    return matchesSearch && matchesZone;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <MapPin className="w-6 h-6 text-blue-600 mr-2.5" /> 64 Districts & Geographic Coverage
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Toggle delivery service availability, zone categorization, and lead times across Bangladesh.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search district or division..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Zones</option>
            <option value="INSIDE_DHAKA">Inside Dhaka</option>
            <option value="DHAKA_SUBURB">Dhaka Suburbs</option>
            <option value="OUTSIDE_DHAKA">Outside Dhaka</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        ) : filteredDistricts.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">No districts match</h3>
            <p className="text-xs text-slate-500 mt-1">Try another search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-6">District Name</th>
                  <th className="py-3.5 px-6">Division</th>
                  <th className="py-3.5 px-6">Pricing Zone</th>
                  <th className="py-3.5 px-6">Standard Lead Time</th>
                  <th className="py-3.5 px-6">Service Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDistricts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{d.name}</p>
                      <p className="text-xs text-slate-400 font-serif">{d.bnName}</p>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-700">
                      {d.division} Division
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                          d.zoneType === "INSIDE_DHAKA"
                            ? "bg-blue-100 text-blue-800"
                            : d.zoneType === "DHAKA_SUBURB"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {d.zoneType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        <span>{d.deliveryTimeHours} Hours</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          d.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {d.active ? "Coverage Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => toggleActive(d)}
                        disabled={updatingId === d.id}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          d.active
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {d.active ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
