import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "পূর্ণ নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  email: z.string().email("সঠিক ইমেইল অ্যাড্রেস প্রদান করুন"),
  phone: z
    .string()
    .regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন (যেমন: 01712345678)"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
  confirmPassword: z.string().min(6, "পাসওয়ার্ড নিশ্চিত করুন"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "উভয় পাসওয়ার্ড এক হতে হবে",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  identifier: z.string().min(3, "ইমেইল বা ফোন নম্বর দিন"),
  password: z.string().min(1, "পাসওয়ার্ড প্রয়োজন"),
});

export const AffiliateApplySchema = z.object({
  fullName: z.string().min(2, "পূর্ণ নাম আবশ্যক"),
  phone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "সঠিক মোবাইল নম্বর আবশ্যক"),
  email: z.string().email("সঠিক ইমেইল আবশ্যক"),
  occupation: z.string().min(2, "পেশা উল্লেখ করুন"),
  channels: z.string().min(5, "আপনার প্রচারের চ্যানেল বা সোশ্যাল মিডিয়া লিংক দিন"),
  marketingExperience: z.string().min(5, "আপনার মার্কেটিং অভিজ্ঞতা সম্পর্কে লিখুন"),
  whyJoin: z.string().min(10, "কেন আমাদের অ্যাফিলিয়েট প্রোগ্রামে যোগ দিতে চান লিখুন"),
});

export const PaymentSubmitSchema = z.object({
  orderId: z.string().min(1, "অর্ডার আইডি আবশ্যক"),
  senderNumber: z
    .string()
    .regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "সঠিক bKash সেন্ডার নম্বর প্রদান করুন"),
  transactionId: z
    .string()
    .min(8, "সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করুন")
    .max(16, "সঠিক ট্রানজেকশন আইডি প্রদান করুন")
    .transform((val) => val.trim().toUpperCase()),
  customerNote: z.string().optional(),
});

export const PayoutRequestSchema = z.object({
  amount: z.number().positive("সঠিক পরিমাণ প্রদান করুন"),
  method: z.enum(["BKASH", "NAGAD", "BANK_TRANSFER"]),
  destinationNumber: z.string().min(5, "পেমেন্ট পাওয়ার সঠিক নম্বর বা একাউন্ট তথ্য দিন"),
});
