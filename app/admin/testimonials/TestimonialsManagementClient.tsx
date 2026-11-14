"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MockTestimonial } from "@/lib/db/mock-data";
import {
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Quote,
  Eye,
  Loader2,
  Sparkles,
  Check,
  User,
  Search,
  MessageSquareQuote,
  ShieldCheck,
} from "lucide-react";

interface TestimonialsManagementClientProps {
  initialTestimonials: MockTestimonial[];
}

const PRESET_AVATARS = [
  {
    label: "মার্কেটার ১ (পুরুষ)",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
  },
  {
    label: "মার্কেটার ২ (নারী)",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  },
  {
    label: "মার্কেটার ৩ (পুরুষ)",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  },
  {
    label: "মার্কেটার ৪ (নারী)",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
  },
  {
    label: "মার্কেটার ৫ (পুরুষ)",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  },
  {
    label: "মার্কেটার ৬ (নারী)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
];

const DEFAULT_FORM: Partial<MockTestimonial> = {
  name: "",
  roleBn: "",
  quoteBn: "",
  avatar: PRESET_AVATARS[0].url,
  earningsText: "১৫,০০০+ টাকা উত্তোলিত",
  rating: 5,
  isPublished: true,
  sortOrder: 1,
};

export function TestimonialsManagementClient({
  initialTestimonials,
}: TestimonialsManagementClientProps) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<MockTestimonial[]>(initialTestimonials);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "preview">("list");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<MockTestimonial>>(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setEditingId(null);
    setFormData({
      ...DEFAULT_FORM,
      sortOrder: testimonials.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MockTestimonial) => {
    setModalMode("edit");
    setEditingId(item.id);
    setFormData({
      name: item.name,
      roleBn: item.roleBn,
      quoteBn: item.quoteBn,
      avatar: item.avatar,
      earningsText: item.earningsText || "",
      rating: item.rating,
      isPublished: item.isPublished !== false,
      sortOrder: item.sortOrder || 1,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.roleBn?.trim() || !formData.quoteBn?.trim()) {
      showNotification("error", "দয়া করে নাম, পরিচয় ও মন্তব্য পূরণ করুন।");
      return;
    }

    setLoading(true);
    try {
      if (modalMode === "add") {
        const res = await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.message);

        setTestimonials((prev) => [result.data, ...prev]);
        showNotification("success", "নতুন রিভিউ সফলভাবে যুক্ত করা হয়েছে!");
      } else if (modalMode === "edit" && editingId) {
        const res = await fetch("/api/admin/testimonials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.message);

        setTestimonials((prev) =>
          prev.map((t) => (t.id === editingId ? result.data : t))
        );
        showNotification("success", "রিভিউ সফলভাবে আপডেট করা হয়েছে!");
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      showNotification("error", err.message || "সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      showNotification("success", "রিভিউ সফলভাবে মুছে ফেলা হয়েছে!");
      setDeletingId(null);
      router.refresh();
    } catch (err: any) {
      showNotification("error", err.message || "ডিলিট করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (item: MockTestimonial) => {
    const nextStatus = item.isPublished === false;
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isPublished: nextStatus }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, isPublished: nextStatus } : t))
      );
      showNotification(
        "success",
        nextStatus ? "রিভিউটি হোমপেজে প্রকাশ করা হয়েছে।" : "রিভিউটি হাইড (লুকিয়ে) রাখা হয়েছে।"
      );
      router.refresh();
    } catch (err: any) {
      showNotification("error", err.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।");
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.roleBn.toLowerCase().includes(q) ||
      t.quoteBn.toLowerCase().includes(q) ||
      (t.earningsText && t.earningsText.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold transition-all animate-in slide-in-from-bottom-5 ${
            notification.type === "success"
              ? "bg-emerald-900/95 text-emerald-100 border-emerald-500/40 shadow-emerald-950/40"
              : "bg-rose-900/95 text-rose-100 border-rose-500/40 shadow-rose-950/40"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-red-50 text-[#E53945]">
              <MessageSquareQuote className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              হোমপেজ সেকশন কন্ট্রোল
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            আমাদের টপ অ্যাফিলিয়েটদের অভিজ্ঞতা (টেস্টিমোনিয়াল)
          </h1>
          <p className="mt-1 text-sm text-[#475569]">
            হোমপেজের 'আমাদের টপ অ্যাফিলিয়েটদের অভিজ্ঞতা' সেকশনে প্রদর্শিত রিভিউ ও ফিডব্যাকগুলো পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/#testimonials"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>হোমপেজে দেখুন</span>
          </Link>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন রিভিউ যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">মোট রিভিউ সংখ্যা</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{testimonials.length} টি</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">হোমপেজে লাইভ</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {testimonials.filter((t) => t.isPublished !== false).length} টি
          </p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">৫-স্টার রেটিং</p>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {testimonials.filter((t) => t.rating === 5).length} টি
          </p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">আয় হাইলাইট সহ</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {testimonials.filter((t) => !!t.earningsText).length} টি
          </p>
        </div>
      </div>

      {/* Control Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/60 max-w-fit">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "list"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ম্যানেজমেন্ট গ্রিড ({testimonials.length})
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "bg-white text-[#2563EB] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>হোমপেজ লাইভ প্রিভিউ</span>
          </button>
        </div>

        {activeTab === "list" && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, পরিচয় বা মন্তব্য সার্চ করুন..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Management Grid */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {filteredTestimonials.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200">
              <Quote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">কোনো রিভিউ পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                নতুন রিভিউ যুক্ত করতে উপরে থাকা "নতুন রিভিউ যোগ করুন" বাটনে ক্লিক করুন।
              </p>
              <button
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-[#E53945] hover:bg-red-100 text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>রিভিউ তৈরি করুন</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTestimonials.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group ${
                    item.isPublished === false ? "border-amber-200 bg-amber-50/30 opacity-80" : "border-slate-200/90"
                  }`}
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        title={item.isPublished === false ? "হোমপেজে দেখাতে ক্লিক করুন" : "হাইড করতে ক্লিক করুন"}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          item.isPublished === false
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        }`}
                      >
                        {item.isPublished === false ? "হাইড (লুকানো)" : "লাইভ"}
                      </button>
                    </div>
                  </div>

                  {/* Quote Body */}
                  <div className="relative">
                    <Quote className="absolute -top-1 -right-1 w-6 h-6 text-slate-200 pointer-events-none" />
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic pr-4">
                      "{item.quoteBn}"
                    </p>
                  </div>

                  {/* Author & Earnings */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{item.roleBn}</p>
                        </div>
                      </div>

                      {item.earningsText && (
                        <span className="text-[10px] font-extrabold text-[#16A34A] bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 shrink-0">
                          {item.earningsText}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>এডিট করুন</span>
                      </button>
                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Homepage Live Preview */}
      {activeTab === "preview" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-12 shadow-sm space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              হোমপেজে ঠিক এভাবে প্রদর্শিত হচ্ছে
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              আমাদের টপ অ্যাফিলিয়েটদের অভিজ্ঞতা
            </h2>
            <p className="text-sm sm:text-base text-[#475569]">
              দেখুন কীভাবে সোশ্যাল মিডিয়া ও স্টুডেন্ট নেটওয়ার্ক কাজে লাগিয়ে আমাদের মার্কেটাররা ঘরে বসেই নিশ্চিত আয় করছেন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials
              .filter((t) => t.isPublished !== false)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative"
                >
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-200 pointer-events-none" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-sm text-[#475569] leading-relaxed italic">
                      "{item.quoteBn}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#172033] truncate">{item.name}</h4>
                        <p className="text-xs text-[#64748B] truncate">{item.roleBn}</p>
                      </div>
                    </div>
                    {item.earningsText && (
                      <span className="text-[11px] font-extrabold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 shrink-0 whitespace-nowrap">
                        {item.earningsText}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-7 max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-50 text-[#E53945]">
                  <MessageSquareQuote className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {modalMode === "add" ? "নতুন রিভিউ যুক্ত করুন" : "রিভিউ এডিট করুন"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মার্কেটার / শিক্ষার্থীর নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: ফারহান চৌধুরী"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পরিচয় / প্লাটফর্ম (Role) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roleBn || ""}
                    onChange={(e) => setFormData({ ...formData, roleBn: e.target.value })}
                    placeholder="যেমন: সোশ্যাল মিডিয়া মার্কেটার"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Earnings Badge & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আয় / উত্তোলিত ব্যাজ (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formData.earningsText || ""}
                    onChange={(e) => setFormData({ ...formData, earningsText: e.target.value })}
                    placeholder="যেমন: ১৮,৫০০+ টাকা উত্তোলিত"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    রেটিং (স্টার)
                  </label>
                  <select
                    value={formData.rating || 5}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (৫ স্টার)</option>
                    <option value={4}>⭐⭐⭐⭐ (৪ স্টার)</option>
                    <option value={3}>⭐⭐⭐ (৩ স্টার)</option>
                  </select>
                </div>
              </div>

              {/* Avatar Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  প্রোফাইল ছবি (Avatar) নির্বাচন করুন
                </label>
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {PRESET_AVATARS.map((preset, idx) => {
                    const isSelected = formData.avatar === preset.url;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormData({ ...formData, avatar: preset.url })}
                        className={`relative rounded-full aspect-square overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected ? "border-[#2563EB] scale-105 shadow-md" : "border-slate-200 hover:border-slate-400"
                        }`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        {isSelected && (
                          <span className="absolute inset-0 bg-[#2563EB]/40 flex items-center justify-center text-white">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="url"
                  value={formData.avatar || ""}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="অথবা কাস্টম ছবির লিংক দিন (https://...)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-slate-600"
                />
              </div>

              {/* Quote Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  রিভিউ / অভিজ্ঞতা বক্তব্য (Quote) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.quoteBn || ""}
                  onChange={(e) => setFormData({ ...formData, quoteBn: e.target.value })}
                  placeholder="মার্কেটারের অনুভূতি ও অভিজ্ঞতা বাংলায় লিখুন..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Publish Toggle & Sort Order */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isPublished !== false}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-[#2563EB] rounded focus:ring-blue-500"
                  />
                  <span>হোমপেজে লাইভ প্রকাশ করুন</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">ক্রম (Sort):</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.sortOrder || 1}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-200 text-center font-bold"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-60 transition-all"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{modalMode === "add" ? "রিভিউ যোগ করুন" : "পরিবর্তন সংরক্ষণ করুন"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">রিভিউটি ডিলিট করতে চান?</h3>
              <p className="text-xs text-slate-500 mt-1">
                এটি মুছে ফেললে হোমপেজের টেস্টিমোনিয়াল সেকশন থেকে স্থায়ীভাবে রিমুভ হয়ে যাবে।
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 disabled:opacity-60 transition-all"
              >
                {loading ? "মুছে ফেলা হচ্ছে..." : "হ্যাঁ, ডিলিট করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
