"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Bike,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  UserCheck,
  Edit2,
  DollarSign,
  MapPin,
  Truck,
  Building,
  Trash2,
  Archive,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RiderRecord {
  id: string;
  userId: string;
  riderId: string;
  name: string;
  phone: string;
  email: string;
  zone: string;
  hub: string;
  vehicleType: string;
  nidMasked: string;
  hasNid: boolean;
  nidVerificationStatus: string;
  nidVerifiedAt?: string | null;
  nidVerifiedBy?: string | null;
  approvalStatus: string;
  status: string;
  isActive: boolean;
  cashInHand: number;
  activeAssignments: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<RiderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRiderDropdownId, setSelectedRiderDropdownId] = useState<string>("");

  // Edit / Verification Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<RiderRecord | null>(null);
  const [editFormData, setEditFormData] = useState({
    hub: "",
    zone: "INSIDE_DHAKA",
    vehicleType: "BIKE",
    approvalStatus: "PENDING",
    status: "AVAILABLE",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Soft Delete & View Modes
  const [viewMode, setViewMode] = useState<"active" | "deleted">("active");
  const [counts, setCounts] = useState({ active: 0, deleted: 0 });
  const [deleteConfirmRider, setDeleteConfirmRider] = useState<RiderRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRiders = useCallback(async (mode: "active" | "deleted" = viewMode) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/riders?deleted=${mode === "deleted"}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRiders(data.data);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Error loading riders", err);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    loadRiders(viewMode);
  }, [loadRiders, viewMode]);

  const toggleStatus = async (riderId: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/riders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId, isActive: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        await loadRiders();
      }
    } catch {
      alert("Error toggling rider status");
    }
  };

  const handleApproveQuick = async (riderId: string) => {
    try {
      const res = await fetch("/api/admin/riders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderId,
          approvalStatus: "APPROVED",
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadRiders(viewMode);
      }
    } catch {
      alert("Error approving rider");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmRider) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/riders?id=${deleteConfirmRider.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmRider(null);
        await loadRiders(viewMode);
      } else {
        alert(data.error?.message || "Failed to delete rider");
      }
    } catch {
      alert("Error deleting rider");
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (rider: RiderRecord) => {
    setEditingRider(rider);
    setEditFormData({
      hub: rider.hub || "Inside Dhaka Hub",
      zone: rider.zone || "INSIDE_DHAKA",
      vehicleType: rider.vehicleType || "BIKE",
      approvalStatus: rider.approvalStatus || "PENDING",
      status: rider.status || "AVAILABLE",
    });
    setEditModalOpen(true);
  };

  const handleSaveRiderEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRider) return;
    setSavingEdit(true);

    try {
      const res = await fetch("/api/admin/riders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderId: editingRider.id,
          hub: editFormData.hub,
          currentZone: editFormData.zone,
          vehicleType: editFormData.vehicleType,
          approvalStatus: editFormData.approvalStatus,
          status: editFormData.status,
          isActive: editFormData.approvalStatus === "APPROVED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditModalOpen(false);
        await loadRiders();
      }
    } catch {
      alert("Error updating rider profile");
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredRiders = riders.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.riderId.toLowerCase().includes(search.toLowerCase()) ||
      r.hub?.toLowerCase().includes(search.toLowerCase());
    const matchesDropdown =
      !selectedRiderDropdownId || r.id === selectedRiderDropdownId;
    return matchesSearch && matchesDropdown;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Bike className="w-6 h-6 text-purple-600 mr-2.5" /> Fleet & Field Delivery Agents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage field agents, active tasks, cash-in-hand reconciliation, and operational hubs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Deleted Riders Toggle Button */}
          <button
            type="button"
            onClick={() => {
              const nextMode = viewMode === "active" ? "deleted" : "active";
              setViewMode(nextMode);
              setSelectedRiderDropdownId("");
              loadRiders(nextMode);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shadow-sm ${
              viewMode === "deleted"
                ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {viewMode === "deleted" ? (
              <>
                <Bike className="w-3.5 h-3.5" />
                <span>Active Riders ({counts.active})</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5 text-slate-500" />
                <span>Deleted Riders ({counts.deleted})</span>
              </>
            )}
          </button>

          {/* Real Registered Riders Dropdown Selector */}
          <div className="relative">
            <select
              value={selectedRiderDropdownId}
              onChange={(e) => setSelectedRiderDropdownId(e.target.value)}
              className="pl-3 pr-8 py-2 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm appearance-none cursor-pointer"
            >
              <option value="">
                {viewMode === "deleted" ? "All Deleted Riders" : "All Registered Riders"} ({riders.length})
              </option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} | {r.riderId} | {r.phone} ({r.approvalStatus === "APPROVED" ? (r.isActive ? "Available" : "Offline") : r.approvalStatus})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-purple-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rider by name, phone, hub..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>
        </div>
      </div>

      {/* Riders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="p-12 text-center">
            <Bike className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">No riders found</h3>
            <p className="text-xs text-slate-500 mt-1">No rider accounts match your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Agent Details</th>
                  <th className="py-3.5 px-6">Operating Hub & Zone</th>
                  <th className="py-3.5 px-6">Active Tasks</th>
                  <th className="py-3.5 px-6">Cash in Hand</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Action</th>
                  <th className="py-3.5 px-6 text-right">Dispatch Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRiders.map((r) => {
                  const isApproved = r.approvalStatus === "APPROVED";
                  const isPending = r.approvalStatus === "PENDING";

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6">
                        <div
                          onClick={() => openEditModal(r)}
                          className="flex items-center space-x-3 cursor-pointer group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-purple-100 transition">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-purple-700 transition flex items-center gap-1.5">
                              <span>{r.name}</span>
                              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {r.riderId}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500 font-mono">{r.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-xs font-semibold text-slate-800">{r.hub || "Central Hub"}</p>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 mt-0.5">
                          {r.zone?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-blue-600">
                        {r.activeAssignments} active parcels
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(r.cashInHand)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending Approval
                          </span>
                        ) : r.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            On Duty
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            Offline
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(r)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          {viewMode === "active" && (
                            <>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmRider(r)}
                                className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline transition flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleApproveQuick(r.id)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                          >
                            Approve Agent
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleStatus(r.id, r.isActive)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              r.isActive
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            {r.isActive ? "Deactivate" : "Activate Duty"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RIDER EDIT & SECURE NID VERIFICATION MODAL */}
      {editModalOpen && editingRider && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  <span>Rider Profile & Verification</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {editingRider.riderId} • DB ID: {editingRider.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Read-only Agent Details from DB */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200/80">
              <div>
                <span className="text-slate-500 block">Full Name</span>
                <span className="font-bold text-slate-900">{editingRider.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone Number</span>
                <span className="font-bold text-slate-900 font-mono">{editingRider.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Email Address</span>
                <span className="font-medium text-slate-800">{editingRider.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Cash in Hand</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {formatCurrency(editingRider.cashInHand)}
                </span>
              </div>
            </div>

            {/* NID Verification Section (Read-Only) */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>National ID (NID) Status</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    NID: {editingRider.nidMasked}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    editingRider.nidVerificationStatus === "VERIFIED"
                      ? "bg-emerald-100 text-emerald-800"
                      : editingRider.nidVerificationStatus === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {editingRider.nidVerificationStatus}
                </span>
              </div>

              {editingRider.nidVerifiedAt && (
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                  <span>Verified Date:</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(editingRider.nidVerifiedAt).toLocaleDateString()}
                    {editingRider.nidVerifiedBy ? ` (${editingRider.nidVerifiedBy})` : ""}
                  </span>
                </div>
              )}
            </div>

            {/* Editable Rider Fleet Fields */}
            <form onSubmit={handleSaveRiderEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating Hub
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.hub}
                    onChange={(e) => setEditFormData({ ...editFormData, hub: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating Zone
                  </label>
                  <select
                    value={editFormData.zone}
                    onChange={(e) => setEditFormData({ ...editFormData, zone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="INSIDE_DHAKA">Inside Dhaka</option>
                    <option value="DHAKA_SUBURB">Dhaka Suburb</option>
                    <option value="OUTSIDE_DHAKA">Outside Dhaka</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={editFormData.vehicleType}
                    onChange={(e) => setEditFormData({ ...editFormData, vehicleType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="BIKE">Motorcycle / Bike</option>
                    <option value="CYCLE">Bicycle</option>
                    <option value="VAN">Delivery Van</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editFormData.approvalStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, approvalStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="PENDING">PENDING (Awaiting Approval)</option>
                    <option value="APPROVED">APPROVED (Authorized)</option>
                    <option value="REJECTED">REJECTED (Declined)</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Availability State
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                >
                  <option value="AVAILABLE">AVAILABLE (On Duty)</option>
                  <option value="BUSY">BUSY (Active Delivery Run)</option>
                  <option value="OFFLINE">OFFLINE (Off Duty)</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm transition"
                >
                  {savingEdit ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Dialog */}
      {deleteConfirmRider && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete this rider?</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {deleteConfirmRider.name} ({deleteConfirmRider.riderId})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Deleting will remove the rider from active riders and disable their login. Their historical information will remain available under <strong>Deleted Riders</strong>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmRider(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Rider</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
