export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string; // bcrypt hash for "Password@123456", admin is "Admin@123456"
  role: "ADMIN" | "AFFILIATE" | "STUDENT";
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  avatarUrl?: string;
  createdAt: string;
}

export interface MockMarketerProfile {
  id: string;
  userId: string;
  referralCode: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  occupation: string;
  experience: string;
  channels: string;
  whyJoin: string;
  totalClicks: number;
  totalConversions: number;
  lifetimeEarnings: number;
  currentBalance: number;
  pendingBalance: number;
  paidEarnings: number;
  payoutMethod: "BKASH" | "NAGAD" | "BANK_TRANSFER";
  payoutAccountNo: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface MockInstructor {
  name: string;
  avatar: string;
  designation: string;
  instructorType: "LEAD" | "CO";
  instructorTypeBn: string;
  description: string;
}

export interface MockCourseCategory {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  createdAt: string;
}

export interface MockPlatformSettings {
  video: {
    title: string;
    subtitle: string;
    videoUrl: string;
    embedUrl: string;
    durationText: string;
    buttonText: string;
    thumbnailUrl: string;
    isEnabled: boolean;
  };
  stats: {
    isManual: boolean;
    manualAffiliates: number;
    manualSales: number;
    manualCommissionPaid: number;
    manualAvailableCourses: number;
  };
  dashboardAnalytics?: {
    isManual: boolean;
    totalClicks: number;
    totalConversions: number;
    summaryTurnover7d: number;
    summaryPayout7d: number;
    summaryOrders7d: number;
  };
}

export interface MockCourse {
  id: string;
  title: string;
  titleBn: string;
  slug: string;
  summaryBn: string;
  descriptionBn: string;
  thumbnail: string;
  previewVideoUrl?: string;
  price: number;
  originalPrice: number;
  commissionRate: number; // percentage, e.g. 25
  isAffiliateEligible: boolean;
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
  categorySlug: string;
  categoryNameBn: string;
  duration: string;
  totalLessons: number;
  difficulty: string;
  featured: boolean;
  learningOutcomes?: string[];
  instructions?: string[];
  instructor?: MockInstructor;
  instructors?: MockInstructor[];
  modules: {
    id: string;
    titleBn: string;
    lessons: {
      id: string;
      titleBn: string;
      duration: string;
      content: string;
      videoUrl?: string;
      isFreePreview: boolean;
    }[];
  }[];
}

export const DEFAULT_LEARNING_OUTCOMES: string[] = [
  "বাস্তব প্রজেক্টের মাধ্যমে হ্যান্ডস-অন কোডিং ও ডিজাইন",
  "আন্তর্জাতিক মার্কেটপ্লেসের রিয়েল লাইফ ফ্রিল্যান্সিং গাইডলাইন",
  "ইন্ডাস্ট্রি স্ট্যান্ডার্ড বেস্ট প্র্যাকটিস ও আর্কিটেকচার",
  "প্রোডাকশন লেভেলে ডেপ্লয়মেন্ট ও পারফরম্যান্স অপ্টিমাইজেশন",
  "লাইফটাইম সাপোর্ট কমিউনিটি ও নিয়মিত আপডেট",
  "কোর্স কমপ্লিশন সার্টিফিকেট ও সিভি তৈরির গাইড",
];

export const DEFAULT_INSTRUCTOR: MockInstructor = {
  name: "মাহমুদুর রহমান",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  designation: "লিড সফটওয়্যার ইঞ্জিনিয়ার",
  instructorType: "LEAD",
  instructorTypeBn: "লিড ইন্সট্রাক্টর",
  description:
    "৮+ বছরের ইন্ডাস্ট্রিয়াল অভিজ্ঞতা সম্পন্ন সফটওয়্যার ইঞ্জিনিয়ার। শীর্ষস্থানীয় গ্লোবাল টেক কোম্পানিতে Next.js, React ও ক্লাউড আর্কিটেকচারে কাজ করার পাশাপাশি ১০,০০০+ শিক্ষার্থীকে সফলভাবে ওয়েব ডেভেলপমেন্ট প্রশিক্ষণ দিয়েছেন।",
};

export interface MockOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  marketerId?: string;
  marketerCode?: string;
  marketerName?: string;
  courseId: string;
  courseTitleBn: string;
  price: number;
  commissionRate: number;
  commissionAmount: number;
  status: "PENDING_PAYMENT" | "PAYMENT_REVIEW" | "PAID" | "CANCELLED" | "REFUNDED";
  createdAt: string;
}

export interface MockPayment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  courseTitleBn: string;
  marketerId?: string;
  marketerCode?: string;
  marketerName?: string;
  commissionAmount?: number;
  commissionRate?: number;
  amount: number;
  paymentMethod: "BKASH_MANUAL" | "NAGAD_MANUAL" | "BANK_TRANSFER";
  senderNumber: string;
  transactionId: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED";
  customerNote?: string;
  rejectionReason?: string;
  reviewedById?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface MockCommission {
  id: string;
  orderId: string;
  orderNumber: string;
  marketerId: string;
  courseId: string;
  courseTitleBn: string;
  amount: number;
  rate: number;
  status: "APPROVED" | "PENDING" | "PAID" | "REVERSED";
  approvedAt: string;
  createdAt: string;
}

export interface MockPayout {
  id: string;
  payoutNumber: string;
  marketerId: string;
  marketerName: string;
  amount: number;
  method: "BKASH" | "NAGAD" | "BANK_TRANSFER";
  destinationNumber: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "PROCESSING" | "PAID";
  transactionReference?: string;
  adminNotes?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface MockAffiliateApplication {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  occupation: string;
  channels: string;
  marketingExperience: string;
  whyJoin: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  createdAt: string;
}

export interface MockAffiliateClick {
  id: string;
  marketerId: string;
  courseId?: string;
  courseTitleBn?: string;
  landingPage: string;
  ipHash?: string;
  userAgent?: string;
  deviceType?: string;
  referer?: string;
  createdAt: string;
}

export interface MockAuditLog {
  id: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  createdAt: string;
}

export interface MockTestimonial {
  id: string;
  name: string;
  avatar: string;
  roleBn: string;
  quoteBn: string;
  earningsText?: string;
  rating: number;
  isPublished?: boolean;
  sortOrder?: number;
}

export const DEFAULT_COURSE_CATEGORIES: MockCourseCategory[] = [
  {
    id: "cat_1",
    name: "Web Development",
    nameBn: "ওয়েব ডেভেলপমেন্ট",
    slug: "web-development",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "cat_2",
    name: "Digital Marketing",
    nameBn: "ডিজিটাল মার্কেটিং",
    slug: "digital-marketing",
    createdAt: new Date(Date.now() - 86400000 * 29).toISOString(),
  },
  {
    id: "cat_3",
    name: "Graphics & UI/UX",
    nameBn: "গ্রাফিক্স ও ইউআই/ইউএক্স",
    slug: "graphics-uiux",
    createdAt: new Date(Date.now() - 86400000 * 28).toISOString(),
  },
  {
    id: "cat_4",
    name: "Career & Freelancing",
    nameBn: "ক্যারিয়ার ও ফ্রিল্যান্সিং",
    slug: "career-freelancing",
    createdAt: new Date(Date.now() - 86400000 * 27).toISOString(),
  },
  {
    id: "cat_5",
    name: "Video Editing & Motion",
    nameBn: "ভিডিও এডিটিং ও মোশন",
    slug: "video-editing",
    createdAt: new Date(Date.now() - 86400000 * 26).toISOString(),
  },
  {
    id: "cat_6",
    name: "Data Science & AI",
    nameBn: "ডাটা সায়েন্স ও এআই",
    slug: "data-science",
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
];

// Initial In-Memory State
class MockDatabase {
  users: MockUser[] = [
    {
      id: "usr_admin_1",
      name: "Super Admin",
      email: "admin@skilljobs.com",
      phone: "01711000000",
      // Bcrypt hash for "Admin@123456"
      passwordHash: "$2a$10$hL6w2Wv82XqMh1.J3rF90e6B9bU8aE.kF6N0N.o.tGZ1fC2vU6B1O",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
  ];

  marketers: MockMarketerProfile[] = [];

  applications: MockAffiliateApplication[] = [];

  categories: MockCourseCategory[] = [...DEFAULT_COURSE_CATEGORIES];

  courses: MockCourse[] = [];

  orders: MockOrder[] = [];

  payments: MockPayment[] = [];

  enrollments: { customerId: string; courseId: string; enrolledAt: string }[] = [];

  commissions: MockCommission[] = [];

  payouts: MockPayout[] = [];

  clicks: MockAffiliateClick[] = [];

  auditLogs: MockAuditLog[] = [];

  faqs = [
    {
      id: "faq_1",
      questionBn: "স্কিলজবস অ্যাফিলিয়েট প্রোগ্রাম কী এবং কীভাবে কাজ করে?",
      answerBn: "এটি একটি নির্ভরযোগ্য পারফরম্যান্স-ভিত্তিক ইনকাম মডেল। আপনি আমাদের প্ল্যাটফর্মে একজন অনুমোদিত অ্যাফিলিয়েট মার্কেটার হিসেবে যুক্ত হয়ে প্রতিটি কোর্সের ইউনিক রেফারেল লিংক পাবেন। আপনার লিংক দিয়ে কোনো শিক্ষার্থী কোর্স কিনলে এবং তা bKash ভেরিফিকেশনে নিশ্চিত হলে আপনি স্বয়ংক্রিয়ভাবে ২০% থেকে ৩৫% কমিশন পাবেন।",
    },
    {
      id: "faq_2",
      questionBn: "রেজিস্ট্রেশনের পর অ্যাফিলিয়েট অনুমোদন হতে কত সময় লাগে?",
      answerBn: "সাধারণত ২৪ ঘণ্টার মধ্যে আমাদের টিম আপনার প্রোফাইল ও প্রচারের মাধ্যমগুলো যাচাই করে একাউন্ট অনুমোদন করে। অনুমোদিত হওয়ার সাথে সাথে আপনার ড্যাশবোর্ডে লিংক জেনারেটর এবং লাইভ অ্যানালিটিক্স অ্যাক্টিভ হয়ে যাবে।",
    },
    {
      id: "faq_3",
      questionBn: "কমিশন উত্তোলনের (Payout) নিয়ম কী?",
      answerBn: "আপনার অ্যাফিলিয়েট ব্যালেন্সে ন্যূনতম ৫০০ টাকা জমা হলেই আপনি bKash বা ব্যাংক ট্রান্সফারের মাধ্যমে পেমেন্ট রিকোয়েস্ট পাঠাতে পারবেন। আমাদের এডমিন টিম দ্রুত bKash এর মাধ্যমে পেমেন্ট সম্পন্ন করে।",
    },
    {
      id: "faq_4",
      questionBn: "রেফারেল কুকি কতদিন স্থায়ী থাকে?",
      answerBn: "আমাদের ট্র্যাকিং সিস্টেমে ৩০ দিনের (30-day attribution window) কুকি মেয়াদ রয়েছে। কোনো শিক্ষার্থী আপনার লিংকে ক্লিক করে ৩০ দিনের মধ্যে কোর্স কিনলেই আপনি কমিশন পাবেন (লাস্ট-ক্লিক অ্যাট্রিবিউশন অনুসারে)।",
    },
    {
      id: "faq_5",
      questionBn: "আমি কি নিজের লিংকে নিজে কিনে কমিশন পেতে পারি?",
      answerBn: "না, আত্ম-রেফারেল (Self-referral) সম্পূর্ণ নিষিদ্ধ। আমাদের সিকিউরিটি ইঞ্জিন আইপি এবং ইউজার আইডি ট্র্যাক করে স্ব-রেফারেল বাতিল করে দেয়।",
    },
  ];

  testimonials: MockTestimonial[] = [];

  settings: MockPlatformSettings = {
    video: {
      title: "স্কিলজবস অ্যাফিলিয়েশন প্রোগ্রাম",
      subtitle: "অফিসিয়াল ভিডিও গাইড",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
      durationText: "ভিডিও ওভারভিউ • ২:৪৯ মিনিট",
      buttonText: "এখনই দেখুন",
      thumbnailUrl: "/images/video-preview.jpg",
      isEnabled: true,
    },
    stats: {
      isManual: false,
      manualAffiliates: 0,
      manualSales: 0,
      manualCommissionPaid: 0,
      manualAvailableCourses: 0,
    },
    dashboardAnalytics: {
      isManual: false,
      totalClicks: 0,
      totalConversions: 0,
      summaryTurnover7d: 0,
      summaryPayout7d: 0,
      summaryOrders7d: 0,
    },
  };

  analyticsHistory = {
    "7d": [
      { label: "শনি", revenue: 0, commission: 0, orders: 0 },
      { label: "রবি", revenue: 0, commission: 0, orders: 0 },
      { label: "সোম", revenue: 0, commission: 0, orders: 0 },
      { label: "মঙ্গল", revenue: 0, commission: 0, orders: 0 },
      { label: "বুধ", revenue: 0, commission: 0, orders: 0 },
      { label: "বৃহস্পতি", revenue: 0, commission: 0, orders: 0 },
      { label: "শুক্র", revenue: 0, commission: 0, orders: 0 },
    ],
  };
}

// Global singleton in dev
declare global {
  // eslint-disable-next-line no-var
  var __mockDb: MockDatabase | undefined;
}

export const mockDb = global.__mockDb || new MockDatabase();
if (process.env.NODE_ENV !== "production") {
  global.__mockDb = mockDb;
}
