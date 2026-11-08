"use client";

import { useState } from "react";
import { MockCourse } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";
import { X, CheckCircle2, ShieldCheck, Copy, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CourseEnrollModalProps {
  course: MockCourse;
  isOpen: boolean;
  onClose: () => void;
  bkashReceiverNumber?: string;
}

export function CourseEnrollModal({
  course,
  isOpen,
  onClose,
  bkashReceiverNumber = "01712345678",
}: CourseEnrollModalProps) {
  const [step, setStep] = useState<"ORDER_CREATE" | "PAYMENT_SUBMIT" | "SUCCESS">("ORDER_CREATE");
  const [order, setOrder] = useState<any>(null);
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyBkash = () => {
    navigator.clipboard.writeText(bkashReceiverNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateOrder = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const refCode = urlParams?.get("ref") || undefined;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, refCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/login?redirect=/courses/${course.slug}?checkout=true`;
          return;
        }
        throw new Error(data.message || "অর্ডার তৈরি করা সম্ভব হয়নি");
      }
      setOrder(data.order);
      setStep("PAYMENT_SUBMIT");
    } catch (err: any) {
      setErrorMessage(err.message || "ত্রুটি হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          senderNumber,
          transactionId,
          customerNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "পেমেন্ট তথ্য জমায় ত্রুটি");
      }
      setStep("SUCCESS");
    } catch (err: any) {
      setErrorMessage(err.message || "পেমেন্ট জমায় ত্রুটি");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-[#172033] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E53945]" />
            <h3 className="font-bold text-sm sm:text-base">কোর্স এনরোলমেন্ট ও পেমেন্ট</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: ORDER SUMMARY */}
          {step === "ORDER_CREATE" && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <img
                  src={course.thumbnail}
                  alt={course.titleBn}
                  className="w-16 h-12 object-cover rounded-lg shrink-0"
                />
                <div>
                  <h4 className="font-bold text-sm text-[#172033] line-clamp-1">{course.titleBn}</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">{course.categoryNameBn}</p>
                  <p className="text-base font-black text-[#E53945] mt-1">{formatBDT(course.price)}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#475569]">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>কোর্স ফি:</span>
                  <span className="font-bold text-[#172033]">{formatBDT(course.price)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>পেমেন্ট মাধ্যম:</span>
                  <span className="font-bold text-[#2563EB]">ম্যানুয়াল bKash ভেরিফিকেশন</span>
                </div>
                <div className="flex justify-between py-1 text-sm font-extrabold text-[#172033]">
                  <span>মোট প্রদেয়:</span>
                  <span className="text-[#E53945]">{formatBDT(course.price)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? "অর্ডার তৈরি হচ্ছে..." : "পেমেন্ট নির্দেশনায় এগিয়ে যান"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: BKASH MANUAL PAYMENT INSTRUCTIONS & TRXID SUBMISSION */}
          {step === "PAYMENT_SUBMIT" && (
            <form onSubmit={handleSubmitPayment} className="space-y-5">
              
              {/* Payment Instruction Box */}
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E53945]">অর্ডার নং: {order?.orderNumber}</span>
                  <span className="text-xs font-black text-[#172033]">{formatBDT(course.price)}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-red-200/60 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#64748B]">বিকাশ মার্চেন্ট / পার্সোনাল নম্বর:</div>
                    <div className="font-mono text-base font-extrabold text-[#172033]">{bkashReceiverNumber}</div>
                  </div>
                  <button
                    type="button"
                    onClick={copyBkash}
                    className="p-2 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "কপি হয়েছে!" : "কপি"}
                  </button>
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  বিকাশ অ্যাপ থেকে <strong>{formatBDT(course.price)}</strong> টাকা পাঠনোর পর প্রাপ্ত ট্রানজেকশন আইডি (TrxID) ও সেন্ডার নম্বর নিচে দিন।
                </p>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    যে bKash নম্বর থেকে টাকা পাঠিয়েছেন (Sender Mobile):
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="যেমন: 01712345678"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    বিকাশ ট্রানজেকশন আইডি (TrxID):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 9BL7K2M19A"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1">
                    অতিরিক্ত নোট (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    placeholder="কোনো বিশেষ মন্তব্য থাকলে লিখুন"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md transition-all"
              >
                {isLoading ? "পেমেন্ট ভেরিফিকেশন জমা হচ্ছে..." : "পেমেন্ট তথ্য সাবমিট করুন"}
              </button>
            </form>
          )}

          {/* STEP 3: SUBMITTED SUCCESS */}
          {step === "SUCCESS" && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-[#172033]">পেমেন্ট তথ্য গৃহীত হয়েছে!</h4>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                  আপনার bKash TrxID টি আমাদের এডমিন প্যানেলে পর্যালোচনায় রয়েছে। সাধারণত ১৫-৩০ মিনিটের মধ্যে ভেরিফাই হয়ে আপনার কোর্স চালু হয়ে যাবে।
                </p>
              </div>
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  href="/student/dashboard"
                  className="w-full py-3 px-4 rounded-xl bg-[#172033] hover:bg-slate-800 text-white font-bold text-xs"
                >
                  স্টুডেন্ট ড্যাশবোর্ডে যান
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs text-[#64748B] hover:text-[#172033]"
                >
                  উইন্ডো বন্ধ করুন
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
