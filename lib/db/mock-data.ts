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
  instructor?: MockInstructor;
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
    {
      id: "usr_affiliate_1",
      name: "তানভীর আহমেদ (Top Affiliate)",
      email: "marketer@skilljobs.com",
      phone: "01722000000",
      passwordHash: "$2a$10$hL6w2Wv82XqMh1.J3rF90e6B9bU8aE.kF6N0N.o.tGZ1fC2vU6B1O",
      role: "AFFILIATE",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr_student_1",
      name: "রাকিবুল হাসান",
      email: "student@skilljobs.com",
      phone: "01833000000",
      passwordHash: "$2a$10$hL6w2Wv82XqMh1.J3rF90e6B9bU8aE.kF6N0N.o.tGZ1fC2vU6B1O",
      role: "STUDENT",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
  ];

  marketers: MockMarketerProfile[] = [
    {
      id: "mkt_1",
      userId: "usr_affiliate_1",
      referralCode: "TANVIR50",
      status: "APPROVED",
      occupation: "কন্টেন্ট ক্রিয়েটর ও ডিজিটাল মার্কেটার",
      experience: "৩ বছরের বেশি ফেসবুক ও ইউটিউব অ্যাফিলিয়েট মার্কেটিং",
      channels: "Facebook Page (50k followers), YouTube Channel (25k subscribers)",
      whyJoin: "মানসম্মত বাংলা কোর্সের প্রচার করে ভালো কমিশন আয় করতে চাই।",
      payoutMethod: "BKASH",
      payoutAccountNo: "01722000000",
      totalClicks: 420,
      totalConversions: 28,
      lifetimeEarnings: 15400,
      currentBalance: 3200,
      pendingBalance: 1200,
      paidEarnings: 11000,
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  applications: MockAffiliateApplication[] = [
    {
      id: "app_1",
      userId: "usr_student_1",
      fullName: "রাকিবুল হাসান",
      phone: "01833000000",
      email: "student@skilljobs.com",
      occupation: "শিক্ষার্থী ও ফ্রিল্যান্সার",
      channels: "ফেসবুক প্রোফাইল ও লিঙ্কডইন নেটওয়ার্ক",
      marketingExperience: "কলেজ ও বিশ্ববিদ্যালয়ের গ্রুপগুলোতে স্টুডেন্ট কমিউনিটি মেন্টর হিসেবে কাজ করেছি।",
      whyJoin: "স্কিলজবসের কোর্সগুলো প্র্যাকটিক্যাল এবং আমার পরিচিত অনেকের এই কোর্সগুলো প্রয়োজন।",
      status: "PENDING",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  categories: MockCourseCategory[] = [...DEFAULT_COURSE_CATEGORIES];

  courses: MockCourse[] = [
    {
      id: "crs_1",
      title: "Full Stack Web Development Mastery",
      titleBn: "ফুলস্ট্যাক ওয়েব ডেভেলপমেন্ট মাস্টারি (MERN & Next.js)",
      slug: "full-stack-web-development-mastery",
      summaryBn: "জিরো থেকে অ্যাডভান্সড লেভেলে রিয়েল লাইফ প্রজেক্ট তৈরি করে আন্তর্জাতিক রিমোট জবের প্রস্তুতি নিন।",
      descriptionBn: "এই কোর্সে আপনি শিখবেন কীভাবে আধুনিক টেকনোলজিতে ফুলস্ট্যাক ওয়েব অ্যাপ্লিকেশন তৈরি করতে হয়। ডাটাবেজ মডেলিং থেকে শুরু করে সার্ভার ডেপ্লয়মেন্ট পর্যন্ত প্রতিটি ধাপ হ্যান্ডস-অন প্রজেক্টের মাধ্যমে শেখানো হয়েছে।",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      price: 3500,
      originalPrice: 6000,
      commissionRate: 25,
      isAffiliateEligible: true,
      status: "PUBLISHED",
      categorySlug: "web-development",
      categoryNameBn: "ওয়েব ডেভেলপমেন্ট",
      duration: "৪০+ ঘণ্টা",
      totalLessons: 64,
      difficulty: "শিক্ষানবিস থেকে দক্ষ",
      featured: true,
      instructor: {
        name: "মাহমুদুর রহমান",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        designation: "লিড সফটওয়্যার ইঞ্জিনিয়ার",
        instructorType: "LEAD",
        instructorTypeBn: "লিড ইন্সট্রাক্টর",
        description: "৮+ বছরের ইন্ডাস্ট্রিয়াল অভিজ্ঞতা সম্পন্ন সফটওয়্যার ইঞ্জিনিয়ার। শীর্ষস্থানীয় গ্লোবাল টেক কোম্পানিতে Next.js, React ও ক্লাউড আর্কিটেকচারে কাজ করার পাশাপাশি ১০,০০০+ শিক্ষার্থীকে সফলভাবে ওয়েব ডেভেলপমেন্ট প্রশিক্ষণ দিয়েছেন।",
      },
      modules: [
        {
          id: "mod_1",
          titleBn: "মডিউল ১: আধুনিক ওয়েব আর্কিটেকচার ও সেটআপ",
          lessons: [
            {
              id: "lsn_1",
              titleBn: "কোর্স পরিচিতি ও রোডম্যাপ গাইড",
              duration: "১৫ মিনিট",
              content: "কোর্সের গাইডলাইন এবং স্টাডি রুটিন কীভাবে অনুসরণ করবেন।",
              isFreePreview: true,
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
              id: "lsn_2",
              titleBn: "ডেভেলপমেন্ট টুলস ও গিট গিটহাব কনফিগারেশন",
              duration: "২৫ মিনিট",
              content: "VS Code, Git, Node.js এবং প্রফেশনাল এক্সটেনশন সেটআপ।",
              isFreePreview: false,
            },
          ],
        },
        {
          id: "mod_2",
          titleBn: "মডিউল ২: Next.js অ্যাপ রাউটার ও ডাটাবেজ আর্কিটেকচার",
          lessons: [
            {
              id: "lsn_3",
              titleBn: "সার্ভার এবং ক্লায়েন্ট কম্পোনেন্টের বাস্তব প্রয়োগ",
              duration: "৩০ মিনিট",
              content: "পারফরম্যান্স ও এসইও অপ্টিমাইজড আর্কিটেকচার তৈরির নিয়ম।",
              isFreePreview: true,
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
          ],
        },
      ],
    },
    {
      id: "crs_2",
      title: "Digital Marketing & High-ROI Ads Blueprint",
      titleBn: "ডিজিটাল মার্কেটিং ও হাই-কনভার্সন অ্যাড ব্লুপ্রিন্ট",
      slug: "digital-marketing-growth-hacking",
      summaryBn: "কম বাজেটে সর্বোচ্চ সেলস ও লিড জেনারেশনের প্র্যাকটিক্যাল গাইডলাইন।",
      descriptionBn: "ফেসবুক, ইনস্টাগ্রাম এবং গুগল বিজ্ঞাপনে সফল প্রচারণার পূর্ণাঙ্গ স্ট্র্যাটেজি। ডাটা-ড্রিভেন মার্কেটিং ও রি-টার্গেটিং ফানেল তৈরির বাস্তব প্রজেক্ট।",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
      price: 2500,
      originalPrice: 4500,
      commissionRate: 30,
      isAffiliateEligible: true,
      status: "PUBLISHED",
      categorySlug: "digital-marketing",
      categoryNameBn: "ডিজিটাল মার্কেটিং",
      duration: "২৮+ ঘণ্টা",
      totalLessons: 42,
      difficulty: "সকল স্তরের জন্য",
      featured: true,
      instructor: {
        name: "তানজিলা আক্তার",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        designation: "গ্রোথ মার্কেটিং স্পেশালিস্ট",
        instructorType: "LEAD",
        instructorTypeBn: "লিড ইন্সট্রাক্টর",
        description: "মেটা ও গুগল সার্টিফাইড ডিজিটাল মার্কেটার। দেশি ও আন্তর্জাতিক ই-কমার্স এবং বিটুবি ব্র্যান্ডের জন্য ৫ কোটি+ টাকার অ্যাড বাজেট সফলভাবে হ্যান্ডেল করার বাস্তব অভিজ্ঞতা রয়েছে।",
      },
      modules: [
        {
          id: "mod_2_1",
          titleBn: "মডিউল ১: মেটা অ্যাডস ম্যানেজার ও পিক্সেল ইন্টিগ্রেশন",
          lessons: [
            {
              id: "lsn_2_1",
              titleBn: "বিজনেস ম্যানেজার ও ডোমেন ভেরিফিকেশন",
              duration: "২০ মিনিট",
              content: "মেটা বিজনেস সুট সেটআপের পূর্ণাঙ্গ ধাপ।",
              isFreePreview: true,
            },
          ],
        },
      ],
    },
    {
      id: "crs_3",
      title: "UI/UX Design Masterclass with Figma",
      titleBn: "ফিগোমা দিয়ে আন্তর্জাতিক মানের ইউআই/ইউএক্স ডিজাইন",
      slug: "ui-ux-design-with-figma",
      summaryBn: "রিসার্চ থেকে শুরু করে হাই-ফিডেলিটি মোবাইল এবং ওয়েব ইউআই ডিজাইন।",
      descriptionBn: "আন্তর্জাতিক ক্লায়েন্টদের জন্য প্রফেশনাল ডিজাইন প্রজেক্ট তৈরি করুন। অটো-লেআউট, কম্পোনেন্ট ভ্যারিয়েন্টস এবং প্রোটোটাইপিং এর পূর্ণাঙ্গ প্রশিক্ষণ।",
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
      price: 2800,
      originalPrice: 5000,
      commissionRate: 20,
      isAffiliateEligible: true,
      status: "PUBLISHED",
      categorySlug: "graphics-uiux",
      categoryNameBn: "গ্রাফিক্স ও ইউআই/ইউএক্স",
      duration: "৩২+ ঘণ্টা",
      totalLessons: 50,
      difficulty: "শিক্ষানবিস থেকে দক্ষ",
      featured: true,
      instructor: {
        name: "শাকিল মাহমুদ",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        designation: "প্রিন্সিপাল প্রোডাক্ট ডিজাইনার",
        instructorType: "LEAD",
        instructorTypeBn: "লিড ইন্সট্রাক্টর",
        description: "আন্তর্জাতিক ফিনটেক ও সাস প্রোডাক্টে ইউজার এক্সপেরিয়েন্স ডিজাইনার হিসেবে ৭+ বছরের অভিজ্ঞতা। ফিগমা ও ডিজাইন সিস্টেমে আন্তর্জাতিক ক্লায়েন্টদের সাথে কাজের বাস্তব অভিজ্ঞতা রয়েছে।",
      },
      modules: [],
    },
    {
      id: "crs_4",
      title: "Spoken English & Corporate Communication",
      titleBn: "স্পোকেন ইংলিশ ও প্রফেশনাল কর্পোরেট কমিউনিকেশন",
      slug: "spoken-english-corporate-communication",
      summaryBn: "ভয় কাটিয়ে স্পষ্ট ও অনর্গল ইংরেজি বলার প্র্যাকটিক্যাল টেকনিক।",
      descriptionBn: "রিমোট জব ও ফ্রিল্যান্সিংয়ে ক্লায়েন্টের সাথে নেগোশিয়েশন ও যোগাযোগ দক্ষতা বৃদ্ধি করুন।",
      thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
      price: 1800,
      originalPrice: 3200,
      commissionRate: 20,
      isAffiliateEligible: true,
      status: "PUBLISHED",
      categorySlug: "career-freelancing",
      categoryNameBn: "ক্যারিয়ার ও ফ্রিল্যান্সিং",
      duration: "২২+ ঘণ্টা",
      totalLessons: 36,
      difficulty: "সকল স্তরের জন্য",
      featured: false,
      instructor: {
        name: "নুসরাত জাহান",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
        designation: "কর্পোরেট কমিউনিকেশন ট্রেইনার",
        instructorType: "CO",
        instructorTypeBn: "কো-ইন্সট্রাক্টর",
        description: "কর্পোরেট লিডারশিপ ও প্রফেশনাল ইংলিশ কমিউনিকেশন ট্রেইনার। মাল্টিন্যাশনাল কোম্পানি ও রিমোট ফ্রিল্যান্সারদের সফল যোগাযোগ দক্ষতা অর্জনে ৯+ বছর ধরে সফলভাবে প্রশিক্ষণ দিচ্ছেন।",
      },
      modules: [],
    },
  ];

  orders: MockOrder[] = [
    {
      id: "ord_101",
      orderNumber: "SKILL-2026-101",
      customerId: "usr_student_1",
      customerName: "রাকিবুল হাসান",
      customerEmail: "student@skilljobs.com",
      customerPhone: "01833000000",
      marketerId: "mkt_1",
      marketerCode: "TANVIR50",
      marketerName: "তানভীর আহমেদ",
      courseId: "crs_1",
      courseTitleBn: "ফুলস্ট্যাক ওয়েব ডেভেলপমেন্ট মাস্টারি (MERN & Next.js)",
      price: 3500,
      commissionRate: 25,
      commissionAmount: 875,
      status: "PAID",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "ord_102",
      orderNumber: "SKILL-2026-102",
      customerId: "usr_student_1",
      customerName: "রাকিবুল হাসান",
      customerEmail: "student@skilljobs.com",
      customerPhone: "01833000000",
      marketerId: "mkt_1",
      marketerCode: "TANVIR50",
      marketerName: "তানভীর আহমেদ",
      courseId: "crs_2",
      courseTitleBn: "ডিজিটাল মার্কেটিং ও হাই-কনভার্সন অ্যাড ব্লুপ্রিন্ট",
      price: 2500,
      commissionRate: 30,
      commissionAmount: 750,
      status: "PAYMENT_REVIEW",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ];

  payments: MockPayment[] = [
    {
      id: "pay_101",
      orderId: "ord_101",
      orderNumber: "SKILL-2026-101",
      customerName: "রাকিবুল হাসান",
      courseTitleBn: "ফুলস্ট্যাক ওয়েব ডেভেলপমেন্ট মাস্টারি (MERN & Next.js)",
      marketerId: "mkt_1",
      marketerCode: "TANVIR50",
      marketerName: "তানভীর আহমেদ",
      commissionAmount: 875,
      commissionRate: 25,
      amount: 3500,
      paymentMethod: "BKASH_MANUAL",
      senderNumber: "01833000000",
      transactionId: "9BL7K2M19A",
      status: "APPROVED",
      reviewedById: "usr_admin_1",
      reviewedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "pay_102",
      orderId: "ord_102",
      orderNumber: "SKILL-2026-102",
      customerName: "রাকিবুল হাসান",
      courseTitleBn: "ডিজিটাল মার্কেটিং ও হাই-কনভার্সন অ্যাড ব্লুপ্রিন্ট",
      marketerId: "mkt_1",
      marketerCode: "TANVIR50",
      marketerName: "তানভীর আহমেদ",
      commissionAmount: 750,
      commissionRate: 30,
      amount: 2500,
      paymentMethod: "BKASH_MANUAL",
      senderNumber: "01833000000",
      transactionId: "BK82910XYZ",
      status: "SUBMITTED",
      customerNote: "বিকাশ অ্যাপের সেন্ড মানি অপশন ব্যবহার করেছি।",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ];

  enrollments: { customerId: string; courseId: string; enrolledAt: string }[] = [
    {
      customerId: "usr_student_1",
      courseId: "crs_1",
      enrolledAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  commissions: MockCommission[] = [
    {
      id: "com_1",
      orderId: "ord_101",
      orderNumber: "SKILL-2026-101",
      marketerId: "mkt_1",
      courseId: "crs_1",
      courseTitleBn: "ফুলস্ট্যাক ওয়েব ডেভেলপমেন্ট মাস্টারি (MERN & Next.js)",
      amount: 875,
      rate: 25,
      status: "APPROVED",
      approvedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  payouts: MockPayout[] = [
    {
      id: "po_1",
      payoutNumber: "PO-2026-001",
      marketerId: "mkt_1",
      marketerName: "তানভীর আহমেদ",
      amount: 5000,
      method: "BKASH",
      destinationNumber: "01722000000",
      status: "PAID",
      transactionReference: "BKASH-TRX-7890123",
      adminNotes: "সফলভাবে bKash মার্চেন্ট থেকে পাঠানো হয়েছে।",
      requestedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      processedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
  ];

  clicks: { id: string; marketerId: string; courseId?: string; landingPage: string; createdAt: string }[] = [
    { id: "clk_1", marketerId: "mkt_1", courseId: "crs_1", landingPage: "/courses/full-stack-web-development-mastery", createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: "clk_2", marketerId: "mkt_1", courseId: "crs_2", landingPage: "/courses/digital-marketing-growth-hacking", createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
    { id: "clk_3", marketerId: "mkt_1", courseId: "crs_1", landingPage: "/courses/full-stack-web-development-mastery", createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  ];

  auditLogs: MockAuditLog[] = [
    {
      id: "aud_1",
      actorEmail: "admin@skilljobs.com",
      action: "PAYMENT_APPROVED",
      entity: "Payment",
      entityId: "pay_101",
      details: "অর্ডার SKILL-2026-101 এর bKash পেমেন্ট অনুমোদন করা হয়েছে। কোর্স এক্সেস ও ৮৭৫ টাকা কমিশন কার্যকর করা হয়েছে।",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

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

  testimonials: MockTestimonial[] = [
    {
      id: "t_1",
      name: "ফারহান চৌধুরী",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
      roleBn: "সোশ্যাল মিডিয়া মার্কেটার",
      quoteBn: "স্কিলজবসের অ্যাফিলিয়েট সিস্টেমে সবচেয়ে ভালো লেগেছে এদের দ্রুত ট্র্যাকিং এবং স্বচ্ছ bKash পেমেন্ট প্রক্রিয়া। গত ৩ মাসে আমি ৭০,০০০+ টাকার কোর্স সেল করে ১৮,০০০+ টাকা কমিশন তুলেছি।",
      earningsText: "১৮,৫০০+ টাকা উত্তোলিত",
      rating: 5,
    },
    {
      id: "t_2",
      name: "নাসরিন সুলতানা",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      roleBn: "ফেসবুক গ্রুপ ও কমিউনিটি লিডার",
      quoteBn: "আমার গ্রুপের মেম্বারদের জন্য মানসম্মত স্কিল কোর্স শেয়ার করতে পেরে ভালো লাগে। প্রতিটি সেলের বিস্তারিত ড্যাশবোর্ডে ক্লিয়ার দেখা যায়। কোনো জটিলতা নেই!",
      earningsText: "১২,৩০০+ টাকা উত্তোলিত",
      rating: 5,
    },
    {
      id: "t_3",
      name: "আরিফুল ইসলাম",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      roleBn: "ইউটিউব কনটেন্ট ক্রিয়েটর",
      quoteBn: "১০ মিনিট স্কুলের মতো প্রফেশনাল অনুভূতি দেয় এই প্ল্যাটফর্ম। রিয়েল টাইম ক্লিক ও কনভার্সন ট্র্যাকিং নিখুঁত কাজ করে। একজন মার্কেটার হিসেবে এটি সেরা প্ল্যাটফর্ম।",
      earningsText: "২৫,৭০০+ টাকা উত্তোলিত",
      rating: 5,
    },
  ];
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
