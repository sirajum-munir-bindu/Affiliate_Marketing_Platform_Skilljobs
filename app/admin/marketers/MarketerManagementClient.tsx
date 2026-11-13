"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MockMarketerProfile } from "@/lib/db/mock-data";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  X,
  Loader2,
  Copy,
  Check,
  ShieldAlert,
  CreditCard,
  Briefcase,
  Share2
} from "lucide-react";

export interface EnrichedMarketer extends MockMarketerProfile {
  userName: string;
  userEmail: string;
  userPhone: string;
}

interface MarketerManagementClientProps {
  initialMarketers: EnrichedMarketer[];
}

interface MarketerFormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  referralCode: string;
  status: MockMarketerProfile["status"];
  payoutMethod: MockMarketerProfile["payoutMethod"];
  payoutAccountNo: string;
  occupation: string;
  channels: string;
  experience: string;
  whyJoin: string;
  currentBalance: number;
  pendingBalance: number;
  paidEarnings: number;
  lifetimeEarnings: number;
}

const DEFAULT_FORM: MarketerFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  referralCode: "",
  status: "APPROVED",
  payoutMethod: "BKASH",
  payoutAccountNo: "",
  occupation: "ডিজিটাল মার্কেটার",
  channels: "",
  experience: "",
  whyJoin: "",
  currentBalance: 0,
  pendingBalance: 0,
  paidEarnings: 0,
  lifetimeEarnings: 0,
};

export function MarketerManagementClient({
  initialMarketers,
}: MarketerManagementClientProps) {
  const router = useRouter();
  const [marketers, setMarketers] = useState<EnrichedMarketer[]>(initialMarketers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Create/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMarketer, setEditingMarketer] = useState<EnrichedMarketer | null>(null);
  const [formData, setFormData] = useState<MarketerFormState>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View details modal
  const [viewingMarketer, setViewingMarketer] = useState<EnrichedMarketer | null>(null);

  // Delete confirmation modal
  const [marketerToDelete, setMarketerToDelete] = useState<EnrichedMarketer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy referral code feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toast feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filtered marketers
  const filteredMarketers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return marketers.filter((m) => {
      const matchesSearch =
        !q ||
        m.userName.toLowerCase().includes(q) ||
        m.userEmail.toLowerCase().includes(q) ||
        m.userPhone.toLowerCase().includes(q) ||
        m.referralCode.toLowerCase().includes(q) ||
        (m.payoutAccountNo || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [marketers, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const approved = marketers.filter((m) => m.status === "APPROVED").length;
    const pendingOrSuspended = marketers.filter(
      (m) => m.status === "PENDING" || m.status === "SUSPENDED"
    ).length;
    const totalBalance = marketers.reduce((sum, m) => sum + (m.currentBalance || 0), 0);
    return {
      total: marketers.length,
      approved,
      pendingOrSuspended,
      totalBalance,
    };
  }, [marketers]);

  const handleOpenCreate = () => {
    setEditingMarketer(null);
    setFormData({ ...DEFAULT_FORM });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: EnrichedMarketer) => {
    setEditingMarketer(m);
    setFormData({
      name: m.userName,
      email: m.userEmail,
      phone: m.userPhone,
      password: "",
      referralCode: m.referralCode,
      status: m.status,
      payoutMethod: m.payoutMethod,
      payoutAccountNo: m.payoutAccountNo || m.userPhone,
      occupation: m.occupation || "",
      channels: m.channels || "",
      experience: m.experience || "",
      whyJoin: m.whyJoin || "",
      currentBalance: m.currentBalance,
      pendingBalance: m.pendingBalance,
      paidEarnings: m.paidEarnings,
      lifetimeEarnings: m.lifetimeEarnings,
    });
    setIsModalOpen(true);
  };

  const handleSaveMarketer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showToast("error", "দয়া করে মার্কেটারের নাম, ইমেইল এবং ফোন নম্বর দিন।");
      return;
    }

    setIsSubmitting(true);
    try {
      const method = editingMarketer ? "PUT" : "POST";
      const payload = editingMarketer
        ? {
            id: editingMarketer.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            referralCode: formData.referralCode,
            status: formData.status,
            payoutMethod: formData.payoutMethod,
            payoutAccountNo: formData.payoutAccountNo,
            occupation: formData.occupation,
            channels: formData.channels,
            experience: formData.experience,
            whyJoin: formData.whyJoin,
            currentBalance: Number(formData.currentBalance),
            pendingBalance: Number(formData.pendingBalance),
            paidEarnings: Number(formData.paidEarnings),
            lifetimeEarnings: Number(formData.lifetimeEarnings),
          }
        : {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password || undefined,
            referralCode: formData.referralCode || undefined,
            status: formData.status,
            payoutMethod: formData.payoutMethod,
            payoutAccountNo: formData.payoutAccountNo || formData.phone,
            occupation: formData.occupation,
            channels: formData.channels,
            experience: formData.experience,
            whyJoin: formData.whyJoin,
            currentBalance: Number(formData.currentBalance) || 0,
          };

      const res = await fetch("/api/admin/marketers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "অপারেশন ব্যর্থ হয়েছে");
      }

      if (editingMarketer) {
        setMarketers((prev) =>
          prev.map((m) => (m.id === editingMarketer.id ? data.data : m))
        );
        showToast("success", "মার্কেটারের তথ্য সফলভাবে আপডেট করা হয়েছে!");
      } else {
        setMarketers((prev) => [data.data, ...prev]);
        showToast("success", "নতুন অ্যাফিলিয়েট মার্কেটার সফলভাবে যুক্ত করা হয়েছে!");
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (
    marketer: EnrichedMarketer,
    newStatus: MockMarketerProfile["status"]
  ) => {
    try {
      const res = await fetch("/api/admin/marketers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: marketer.id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setMarketers((prev) => prev.map((m) => (m.id === marketer.id ? data.data : m)));
      showToast("success", `মার্কেটার স্ট্যাটাস "${newStatus}" করা হয়েছে।`);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "স্ট্যাটাস পরিবর্তন করা যায়নি");
    }
  };

  const handleConfirmDelete = async () => {
    if (!marketerToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/marketers?id=${marketerToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setMarketers((prev) => prev.filter((m) => m.id !== marketerToDelete.id));
      showToast("success", `"${marketerToDelete.userName}" তালিকা থেকে ডিলিট করা হয়েছে।`);
      setMarketerToDelete(null);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "ডিলিট ব্যর্থ হয়েছে");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCode = (m: EnrichedMarketer) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(m.referralCode);
      setCopiedId(m.id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const getStatusBadge = (status: MockMarketerProfile["status"]) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SUSPENDED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "REJECTED":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-in slide-in-from-bottom-5 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-900 text-white border-emerald-700"
              : "bg-rose-900 text-white border-rose-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header + Add New Marketer Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
            <span>অ্যাফিলিয়েট মার্কেটার তালিকা</span>
            <span className="text-xs font-extrabold bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-full">
              {formatBnNumber(marketers.length)} জন
            </span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            নতুন মার্কেটার যুক্ত করুন, পারফরম্যান্স ও রেফারেল কোড দেখুন এবং তথ্য এডিট বা ডিলিট করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E53945] to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-red-500/25 hover:scale-[1.02] transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>নতুন মার্কেটার যোগ করুন</span>
        </button>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">মোট মার্কেটার</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {formatBnNumber(stats.total)} জন
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">সক্রিয় / অনুমোদিত</p>
            <p className="text-xl font-black text-emerald-600 mt-0.5">
              {formatBnNumber(stats.approved)} জন
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">অপেক্ষমাণ / স্থগিত</p>
            <p className="text-xl font-black text-amber-600 mt-0.5">
              {formatBnNumber(stats.pendingOrSuspended)} জন
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">মোট বর্তমান ব্যালেন্স</p>
            <p className="text-xl font-black text-blue-600 mt-0.5">
              {formatBDT(stats.totalBalance)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ইমেইল, ফোন বা রেফারেল কোড দিয়ে সার্চ করুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">সকল স্ট্যাটাস</option>
            <option value="APPROVED">অনুমোদিত (Approved)</option>
            <option value="PENDING">অপেক্ষমাণ (Pending)</option>
            <option value="SUSPENDED">স্থগিত (Suspended)</option>
            <option value="REJECTED">বাতিল (Rejected)</option>
          </select>
        </div>
      </div>

      {/* Marketers Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full text-left border-collapse text-xs min-w-[760px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">মার্কেটার</th>
                <th className="py-3.5 px-4">রেফারেল কোড</th>
                <th className="py-3.5 px-4">ক্লিক ও কনভার্সন</th>
                <th className="py-3.5 px-4">বর্তমান ব্যালেন্স</th>
                <th className="py-3.5 px-4">লাইফটাইম আর্নিং</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {filteredMarketers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-slate-700">কোনো মার্কেটার পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400 mt-1">
                      সার্চ ফিল্টার পরিবর্তন করুন অথবা নতুন মার্কেটার যোগ করুন।
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMarketers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-900">{m.userName}</p>
                      <p className="text-[11px] text-slate-500">{m.userEmail}</p>
                      <p className="text-[11px] font-mono text-slate-500">
                        {m.payoutAccountNo || m.userPhone}{" "}
                        <span className="text-[10px] font-sans font-semibold text-slate-400">
                          ({m.payoutMethod})
                        </span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(m)}
                        title="কোড কপি করুন"
                        className="inline-flex items-center gap-1.5 font-mono font-extrabold text-[#2563EB] bg-blue-50/80 hover:bg-blue-100/80 border border-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <span>{m.referralCode}</span>
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-blue-400" />
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">
                        {formatBnNumber(m.totalClicks)} ক্লিক
                      </div>
                      <div className="text-[11px] font-bold text-[#E53945]">
                        {formatBnNumber(m.totalConversions)} টি সেল
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-black text-[#16A34A] text-sm">
                        {formatBDT(m.currentBalance)}
                      </div>
                      {m.pendingBalance > 0 && (
                        <div className="text-[10px] font-semibold text-amber-600">
                          পেন্ডিং: {formatBDT(m.pendingBalance)}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 text-sm">
                        {formatBDT(m.lifetimeEarnings)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        উত্তোলিত: {formatBDT(m.paidEarnings)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={m.status}
                        onChange={(e) =>
                          handleQuickStatusChange(
                            m,
                            e.target.value as MockMarketerProfile["status"]
                          )
                        }
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border cursor-pointer focus:outline-hidden ${getStatusBadge(
                          m.status
                        )}`}
                      >
                        <option value="APPROVED">অনুমোদিত</option>
                        <option value="PENDING">অপেক্ষমাণ</option>
                        <option value="SUSPENDED">স্থগিত</option>
                        <option value="REJECTED">বাতিল</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingMarketer(m)}
                          title="বিস্তারিত দেখুন"
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(m)}
                          title="মার্কেটার এডিট করুন"
                          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setMarketerToDelete(m)}
                          title="মার্কেটার ডিলিট করুন"
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E53945] flex items-center justify-center">
                  {editingMarketer ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {editingMarketer
                      ? "মার্কেটারের তথ্য আপডেট করুন"
                      : "নতুন মার্কেটার যুক্ত করুন"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    মার্কেটারের অ্যাকাউন্ট তথ্য, রেফারেল কোড, পে-আউট মাধ্যম এবং স্ট্যাটাস নির্ধারণ করুন।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveMarketer}
              className="flex-1 flex flex-col overflow-hidden text-xs"
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Identity Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      পূর্ণ নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="যেমন: তানভীর আহমেদ"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      ইমেইল <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="marketer@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      ফোন নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="01712345678"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-mono"
                    />
                  </div>

                  {!editingMarketer ? (
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">
                        পাসওয়ার্ড (ঐচ্ছিক)
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="খালি রাখলে: Password@123456"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">পেশা (Occupation)</label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="কন্টেন্ট ক্রিয়েটর / মার্কেটার"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Referral Code & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      রেফারেল কোড {editingMarketer ? "*" : "(খালি রাখলে অটো তৈরি হবে)"}
                    </label>
                    <input
                      type="text"
                      value={formData.referralCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referralCode: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="e.g. TANVIR50"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-mono uppercase font-bold text-blue-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">স্ট্যাটাস</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as MockMarketerProfile["status"],
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-bold"
                    >
                      <option value="APPROVED">অনুমোদিত (Approved)</option>
                      <option value="PENDING">অপেক্ষমাণ (Pending)</option>
                      <option value="SUSPENDED">স্থগিত (Suspended)</option>
                      <option value="REJECTED">বাতিল (Rejected)</option>
                    </select>
                  </div>
                </div>

                {/* Payout Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">পে-আউট মাধ্যম</label>
                    <select
                      value={formData.payoutMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payoutMethod: e.target.value as MockMarketerProfile["payoutMethod"],
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-white font-bold"
                    >
                      <option value="BKASH">bKash</option>
                      <option value="NAGAD">Nagad</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">পে-আউট একাউন্ট নম্বর</label>
                    <input
                      type="text"
                      value={formData.payoutAccountNo}
                      onChange={(e) =>
                        setFormData({ ...formData, payoutAccountNo: e.target.value })
                      }
                      placeholder="01712345678"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Balance Adjustments when editing (or initial balance on create) */}
                {editingMarketer ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">বর্তমান ব্যালেন্স (৳)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.currentBalance}
                        onChange={(e) =>
                          setFormData({ ...formData, currentBalance: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-emerald-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">পেন্ডিং (৳)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.pendingBalance}
                        onChange={(e) =>
                          setFormData({ ...formData, pendingBalance: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-amber-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">উত্তোলিত (৳)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.paidEarnings}
                        onChange={(e) =>
                          setFormData({ ...formData, paidEarnings: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-blue-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">লাইফটাইম (৳)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.lifetimeEarnings}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lifetimeEarnings: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-slate-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">পেশা (Occupation)</label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="ডিজিটাল মার্কেটার"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">প্রারম্ভিক ব্যালেন্স (৳)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.currentBalance}
                        onChange={(e) =>
                          setFormData({ ...formData, currentBalance: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-bold text-emerald-700"
                      />
                    </div>
                  </div>
                )}

                {/* Channels & Experience */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">প্রচার মাধ্যম (Channels)</label>
                  <input
                    type="text"
                    value={formData.channels}
                    onChange={(e) => setFormData({ ...formData, channels: e.target.value })}
                    placeholder="যেমন: Facebook Page, YouTube Channel, Blog..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">মার্কেটিং অভিজ্ঞতা</label>
                  <textarea
                    rows={2}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="মার্কেটারের পূর্ব অভিজ্ঞতার বিবরণ..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E53945] hover:bg-red-700 text-white font-black shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {editingMarketer ? "পরিবর্তন সেভ করুন" : "মার্কেটার যুক্ত করুন"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingMarketer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => setViewingMarketer(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {viewingMarketer.userName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {viewingMarketer.userEmail} • {viewingMarketer.userPhone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingMarketer(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <p className="text-[10px] font-bold text-slate-500">রেফারেল কোড</p>
                  <p className="font-mono font-black text-sm text-blue-700 mt-0.5">
                    {viewingMarketer.referralCode}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <p className="text-[10px] font-bold text-slate-500">বর্তমান ব্যালেন্স</p>
                  <p className="font-black text-sm text-emerald-700 mt-0.5">
                    {formatBDT(viewingMarketer.currentBalance)}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-700">পে-আউট তথ্য</p>
                    <p className="text-slate-600">
                      {viewingMarketer.payoutMethod} —{" "}
                      <span className="font-mono">
                        {viewingMarketer.payoutAccountNo || viewingMarketer.userPhone}
                      </span>
                    </p>
                  </div>
                </div>

                {viewingMarketer.occupation && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-700">পেশা</p>
                      <p className="text-slate-600">{viewingMarketer.occupation}</p>
                    </div>
                  </div>
                )}

                {viewingMarketer.channels && (
                  <div className="flex items-start gap-2">
                    <Share2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-700">প্রচার মাধ্যম</p>
                      <p className="text-slate-600">{viewingMarketer.channels}</p>
                    </div>
                  </div>
                )}

                {viewingMarketer.experience && (
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-700">অভিজ্ঞতা</p>
                      <p className="text-slate-600">{viewingMarketer.experience}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingMarketer;
                    setViewingMarketer(null);
                    handleOpenEdit(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>এডিট করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingMarketer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {marketerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isDeleting && setMarketerToDelete(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  মার্কেটারকে ডিলিট করতে চান?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে{" "}
                  <strong className="text-slate-800">"{marketerToDelete.userName}"</strong>{" "}
                  ({marketerToDelete.referralCode}) কে অ্যাফিলিয়েট তালিকা থেকে মুছে ফেলতে চান?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setMarketerToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>হ্যাঁ, ডিলিট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
