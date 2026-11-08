import { PrismaClient, UserRole, UserStatus, AffiliateStatus, CourseStatus, PayoutMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Password@123456", 10);
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);

  // 1. Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@skilljobs.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@skilljobs.com",
      phone: "01711000000",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log("Admin created:", admin.email);

  // 2. Create Sample Affiliate Marketer
  const affiliateUser = await prisma.user.upsert({
    where: { email: "marketer@skilljobs.com" },
    update: {},
    create: {
      name: "তানভীর আহমেদ (Top Affiliate)",
      email: "marketer@skilljobs.com",
      phone: "01722000000",
      passwordHash: passwordHash,
      role: UserRole.AFFILIATE,
      status: UserStatus.ACTIVE,
      marketerProfile: {
        create: {
          referralCode: "TANVIR50",
          status: AffiliateStatus.APPROVED,
          occupation: "কন্টেন্ট ক্রিয়েটর ও ডিজিটাল মার্কেটার",
          experience: "৩ বছরের বেশি ফেসবুক ও ইউটিউব অ্যাফিলিয়েট মার্কেটিং",
          channels: "Facebook Page (50k followers), YouTube Channel (25k subscribers)",
          whyJoin: "মানসম্মত বাংলা কোর্সের প্রচার করে ভালো কমিশন আয় করতে চাই।",
          payoutMethod: PayoutMethod.BKASH,
          payoutAccountNo: "01722000000",
          lifetimeEarnings: 15400.00,
          currentBalance: 3200.00,
          pendingBalance: 1200.00,
          paidEarnings: 11000.00,
          totalClicks: 420,
          totalConversions: 28,
        },
      },
    },
  });
  console.log("Affiliate created:", affiliateUser.email);

  // 3. Create Sample Student
  const student = await prisma.user.upsert({
    where: { email: "student@skilljobs.com" },
    update: {},
    create: {
      name: "রাকিবুল হাসান",
      email: "student@skilljobs.com",
      phone: "01833000000",
      passwordHash: passwordHash,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });
  console.log("Student created:", student.email);

  // 4. Create Categories
  const catWeb = await prisma.courseCategory.upsert({
    where: { slug: "web-development" },
    update: {},
    create: {
      name: "Web Development",
      nameBn: "ওয়েব ডেভেলপমেন্ট",
      slug: "web-development",
      description: "ফ্রন্টএন্ড, ব্যাকএন্ড ও ফুলস্ট্যাক ওয়েব অ্যাপ্লিকেশন ডেভেলপমেন্ট",
      icon: "Code",
      sortOrder: 1,
    },
  });

  const catMarketing = await prisma.courseCategory.upsert({
    where: { slug: "digital-marketing" },
    update: {},
    create: {
      name: "Digital Marketing",
      nameBn: "ডিজিটাল মার্কেটিং",
      slug: "digital-marketing",
      description: "ফেসবুক বিজ্ঞাপন, গুগল এসইও এবং কনভার্সন ফানেল",
      icon: "TrendingUp",
      sortOrder: 2,
    },
  });

  const catDesign = await prisma.courseCategory.upsert({
    where: { slug: "graphics-uiux" },
    update: {},
    create: {
      name: "Graphics & UI/UX",
      nameBn: "গ্রাফিক্স ও ইউআই/ইউএক্স",
      slug: "graphics-uiux",
      description: "প্রফেশনাল গ্রাফিক্স ডিজাইন ও আধুনিক ডিজিটাল প্রোডাক্ট ইন্টারফেস",
      icon: "Palette",
      sortOrder: 3,
    },
  });

  const catCareer = await prisma.courseCategory.upsert({
    where: { slug: "career-freelancing" },
    update: {},
    create: {
      name: "Career & Freelancing",
      nameBn: "ক্যারিয়ার ও ফ্রিল্যান্সিং",
      slug: "career-freelancing",
      description: "আন্তর্জাতিক মার্কেটপ্লেস ও কর্পোরেট সফট স্কিলস",
      icon: "Briefcase",
      sortOrder: 4,
    },
  });

  // 5. Create Courses
  const course1 = await prisma.course.upsert({
    where: { slug: "full-stack-web-development-mastery" },
    update: {},
    create: {
      title: "Full Stack Web Development Mastery",
      titleBn: "ফুলস্ট্যাক ওয়েব ডেভেলপমেন্ট মাস্টারি (MERN & Next.js)",
      slug: "full-stack-web-development-mastery",
      summary: "React, Next.js, Node.js এবং PostgreSQL দিয়ে প্রোডাকশন-রেডি প্রজেক্ট তৈরি করুন।",
      summaryBn: "জিরো থেকে অ্যাডভান্সড লেভেলে রিয়েল লাইফ প্রজেক্ট তৈরি করে আন্তর্জাতিক রিমোট জবের প্রস্তুতি নিন।",
      description: "এই কোর্সে আপনি শিখবেন কীভাবে আধুনিক টেকনোলজিতে ফুলস্ট্যাক ওয়েব অ্যাপ্লিকেশন তৈরি করতে হয়। ডাটাবেজ মডেলিং থেকে শুরু করে সার্ভার ডেপ্লয়মেন্ট পর্যন্ত প্রতিটি ধাপ হ্যান্ডস-অন প্রজেক্টের মাধ্যমে শেখানো হয়েছে।",
      descriptionBn: "এই কোর্সে আপনি শিখবেন কীভাবে আধুনিক টেকনোলজিতে ফুলস্ট্যাক ওয়েব অ্যাপ্লিকেশন তৈরি করতে হয়। ডাটাবেজ মডেলিং থেকে শুরু করে সার্ভার ডেপ্লয়মেন্ট পর্যন্ত প্রতিটি ধাপ হ্যান্ডস-অন প্রজেক্টের মাধ্যমে শেখানো হয়েছে।",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      previewVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      price: 3500.00,
      originalPrice: 6000.00,
      commissionRate: 25.00,
      isAffiliateEligible: true,
      status: CourseStatus.PUBLISHED,
      categoryId: catWeb.id,
      duration: "৪০+ ঘণ্টা",
      totalLessons: 64,
      difficulty: "শিক্ষানবিস থেকে দক্ষ",
      featured: true,
      modules: {
        create: [
          {
            title: "Module 1: Introduction to Modern Web",
            titleBn: "মডিউল ১: আধুনিক ওয়েব আর্কিটেকচার ও সেটআপ",
            sortOrder: 1,
            lessons: {
              create: [
                {
                  title: "Welcome & RoadMap",
                  titleBn: "কোর্স পরিচিতি ও রোডম্যাপ গাইড",
                  duration: "১৫ মিনিট",
                  content: "কোর্সের গাইডলাইন এবং স্টাডি রুটিন কীভাবে অনুসরণ করবেন।",
                  isFreePreview: true,
                  sortOrder: 1,
                },
                {
                  title: "Developer Environment Setup",
                  titleBn: "ডেভেলপমেন্ট টুলস ও গিট গিটহাব কনফিগারেশন",
                  duration: "২৫ মিনিট",
                  content: "VS Code, Git, Node.js এবং প্রফেশনাল এক্সটেনশন সেটআপ।",
                  isFreePreview: false,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            title: "Module 2: Next.js & PostgreSQL Deep Dive",
            titleBn: "মডিউল ২: Next.js অ্যাপ রাউটার ও ডাটাবেজ আর্কিটেকচার",
            sortOrder: 2,
            lessons: {
              create: [
                {
                  title: "Server Components vs Client Components",
                  titleBn: "সার্ভার এবং ক্লায়েন্ট কম্পোনেন্টের বাস্তব প্রয়োগ",
                  duration: "৩০ মিনিট",
                  content: "পারফরম্যান্স ও এসইও অপ্টিমাইজড আর্কিটেকচার তৈরির নিয়ম।",
                  isFreePreview: true,
                  sortOrder: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "digital-marketing-growth-hacking" },
    update: {},
    create: {
      title: "Digital Marketing & High-ROI Ads Blueprint",
      titleBn: "ডিজিটাল মার্কেটিং ও হাই-কনভার্সন অ্যাড ব্লুপ্রিন্ট",
      slug: "digital-marketing-growth-hacking",
      summary: "মেটা ও গুগল অ্যাডের মাধ্যমে ১০ গুণ সেলস বৃদ্ধি করার প্রমাণিত টেকনিক।",
      summaryBn: "কম বাজেটে সর্বোচ্চ সেলস ও লিড জেনারেশনের প্র্যাকটিক্যাল গাইডলাইন।",
      description: "ফেসবুক, ইনস্টাগ্রাম এবং গুগল বিজ্ঞাপনে সফল প্রচারণার পূর্ণাঙ্গ স্ট্র্যাটেজি।",
      descriptionBn: "ফেসবুক, ইনস্টাগ্রাম এবং গুগল বিজ্ঞাপনে সফল প্রচারণার পূর্ণাঙ্গ স্ট্র্যাটেজি।",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
      price: 2500.00,
      originalPrice: 4500.00,
      commissionRate: 30.00,
      isAffiliateEligible: true,
      status: CourseStatus.PUBLISHED,
      categoryId: catMarketing.id,
      duration: "২৮+ ঘণ্টা",
      totalLessons: 42,
      difficulty: "সকল স্তরের জন্য",
      featured: true,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { slug: "ui-ux-design-with-figma" },
    update: {},
    create: {
      title: "UI/UX Design Masterclass with Figma",
      titleBn: "ফিগোমা দিয়ে আন্তর্জাতিক মানের ইউআই/ইউএক্স ডিজাইন",
      slug: "ui-ux-design-with-figma",
      summary: "ডিজাইন সিস্টেম, ওয়্যারফ্রেম এবং ইন্টারেক্টিভ প্রোটোটাইপিং।",
      summaryBn: "রিসার্চ থেকে শুরু করে হাই-ফিডেলিটি মোবাইল এবং ওয়েব ইউআই ডিজাইন।",
      description: "আন্তর্জাতিক ক্লায়েন্টদের জন্য প্রফেশনাল ডিজাইন প্রজেক্ট তৈরি করুন।",
      descriptionBn: "আন্তর্জাতিক ক্লায়েন্টদের জন্য প্রফেশনাল ডিজাইন প্রজেক্ট তৈরি করুন।",
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
      price: 2800.00,
      originalPrice: 5000.00,
      commissionRate: 20.00,
      isAffiliateEligible: true,
      status: CourseStatus.PUBLISHED,
      categoryId: catDesign.id,
      duration: "৩২+ ঘণ্টা",
      totalLessons: 50,
      difficulty: "শিক্ষানবিস থেকে দক্ষ",
      featured: true,
    },
  });

  const course4 = await prisma.course.upsert({
    where: { slug: "spoken-english-corporate-communication" },
    update: {},
    create: {
      title: "Spoken English & Corporate Communication",
      titleBn: "স্পোকেন ইংলিশ ও প্রফেশনাল কর্পোরেট কমিউনিকেশন",
      slug: "spoken-english-corporate-communication",
      summary: "আন্তর্জাতিক ক্লায়েন্ট ইন্টারভিউ এবং আত্মবিশ্বাসের সাথে ইংরেজি বলার সিক্রেট।",
      summaryBn: "ভয় কাটিয়ে স্পষ্ট ও অনর্গল ইংরেজি বলার প্র্যাকটিক্যাল টেকনিক।",
      description: "রিমোট জব ও ফ্রিল্যান্সিংয়ে ক্লায়েন্টের সাথে নেগোশিয়েশন ও যোগাযোগ দক্ষতা বৃদ্ধি করুন।",
      descriptionBn: "রিমোট জব ও ফ্রিল্যান্সিংয়ে ক্লায়েন্টের সাথে নেগোশিয়েশন ও যোগাযোগ দক্ষতা বৃদ্ধি করুন।",
      thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
      price: 1800.00,
      originalPrice: 3200.00,
      commissionRate: 20.00,
      isAffiliateEligible: true,
      status: CourseStatus.PUBLISHED,
      categoryId: catCareer.id,
      duration: "২২+ ঘণ্টা",
      totalLessons: 36,
      difficulty: "সকল স্তরের জন্য",
      featured: false,
    },
  });

  // 6. Seed FAQs
  const faqs = [
    {
      questionBn: "স্কিলজবস অ্যাফিলিয়েট প্রোগ্রাম কী এবং কীভাবে কাজ করে?",
      answerBn: "এটি একটি নির্ভরযোগ্য পারফরম্যান্স-ভিত্তিক ইনকাম মডেল। আপনি আমাদের প্ল্যাটফর্মে একজন অনুমোদিত অ্যাফিলিয়েট মার্কেটার হিসেবে যুক্ত হয়ে প্রতিটি কোর্সের ইউনিক রেফারেল লিংক পাবেন। আপনার লিংক দিয়ে কোনো শিক্ষার্থী কোর্স কিনলে এবং তা bKash ভেরিফিকেশনে নিশ্চিত হলে আপনি স্বয়ংক্রিয়ভাবে নির্ধারিত শতাংশ কমিশন পাবেন।",
      sortOrder: 1,
    },
    {
      questionBn: "রেজিস্ট্রেশনের পর অ্যাফিলিয়েট অনুমোদন হতে কত সময় লাগে?",
      answerBn: "সাধারণত ২৪ ঘণ্টার মধ্যে আমাদের টিম আপনার প্রোফাইল ও প্রচারের মাধ্যমগুলো যাচাই করে একাউন্ট অনুমোদন করে। অনুমোদিত হওয়ার সাথে সাথে আপনার ড্যাশবোর্ডে লিংক জেনারেটর এবং অ্যানালিটিক্স অ্যাক্টিভ হয়ে যাবে।",
      sortOrder: 2,
    },
    {
      questionBn: "কমিশন উত্তোলনের (Payout) নিয়ম কী?",
      answerBn: "আপনার অ্যাফিলিয়েট ব্যালেন্সে ন্যূনতম ৫০০ টাকা জমা হলেই আপনি bKash বা ব্যাংক ট্রান্সফারের মাধ্যমে পেমেন্ট রিকোয়েস্ট পাঠাতে পারবেন। আমাদের এডমিন টিম প্রতি সপ্তাহে নির্ধারিত দিনে দ্রুত পেমেন্ট সম্পন্ন করে।",
      sortOrder: 3,
    },
    {
      questionBn: "রেফারেল কুকি কতদিন স্থায়ী থাকে?",
      answerBn: "আমাদের ট্র্যাকিং সিস্টেমে ৩০ দিনের (30-day attribution window) কুকি মেয়াদ রয়েছে। কোনো শিক্ষার্থী আপনার লিংকে ক্লিক করে ৩০ দিনের মধ্যে কোর্স কিনলেই আপনি কমিশন পাবেন (লাস্ট-ক্লিক অ্যাট্রিবিউশন অনুসারে)।",
      sortOrder: 4,
    },
    {
      questionBn: "আমি কি নিজের লিংকে নিজে কিনে কমিশন পেতে পারি?",
      answerBn: "না, আত্ম-রেফারেল (Self-referral) সম্পূর্ণ নিষিদ্ধ। আমাদের সিকিউরিটি ইঞ্জিন আইপি এবং ইউজার আইডি ট্র্যাক করে স্ব-রেফারেল বাতিল করে দেয়।",
      sortOrder: 5,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: faq,
    });
  }

  // 7. Seed Testimonials
  const testimonials = [
    {
      name: "ফারহান চৌধুরী",
      roleBn: "সোশ্যাল মিডিয়া মার্কেটার",
      quoteBn: "স্কিলজবসের অ্যাফিলিয়েট সিস্টেমে সবচেয়ে ভালো লেগেছে এদের দ্রুত ট্র্যাকিং এবং স্বচ্ছ bKash পেমেন্ট প্রক্রিয়া। গত ৩ মাসে আমি ৭০,০০০+ টাকার কোর্স সেল করে ১৮,০০০+ টাকা কমিশন তুলেছি।",
      earningsText: "১৮,৫০০+ টাকা উত্তোলিত",
      rating: 5,
      sortOrder: 1,
    },
    {
      name: "নাসরিন সুলতানা",
      roleBn: "ফেসবুক গ্রুপ ও কমিউনিটি লিডার",
      quoteBn: "আমার গ্রুপের মেম্বারদের জন্য মানসম্মত স্কিল কোর্স শেয়ার করতে পেরে ভালো লাগে। প্রতিটি সেলের বিস্তারিত ড্যাশবোর্ডে ক্লিয়ার দেখা যায়। কোনো জটিলতা নেই!",
      earningsText: "১২,৩০০+ টাকা উত্তোলিত",
      rating: 5,
      sortOrder: 2,
    },
    {
      name: "আরিফুল ইসলাম",
      roleBn: "ইউটিউব কনটেন্ট ক্রিয়েটর",
      quoteBn: "১০ মিনিট স্কুলের মতো প্রফেশনাল অনুভূতি দেয় এই প্ল্যাটফর্ম। রিয়েল টাইম ক্লিক ও কনভার্সন ট্র্যাকিং নিখুঁত কাজ করে। একজন মার্কেটার হিসেবে এটি সেরা প্ল্যাটফর্ম।",
      earningsText: "২৫,৭০০+ টাকা উত্তোলিত",
      rating: 5,
      sortOrder: 3,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: t,
    });
  }

  // 8. Seed Platform Settings
  const settings = [
    { key: "SITE_NAME", value: "Skilljobs Affiliate", type: "string" },
    { key: "SITE_TAGLINE", value: "বাংলাদেশের প্রিমিয়াম এডুকেশনাল অ্যাফিলিয়েট প্ল্যাটফর্ম", type: "string" },
    { key: "HERO_HEADLINE", value: "আপনার পরিচিতির নেটওয়ার্কই হতে পারে আয়ের নতুন সুযোগ!", type: "string" },
    { key: "HERO_SUBTITLE", value: "মানসম্মত কোর্স মানুষের কাছে পৌঁছে দিন এবং আপনার রেফারেলের মাধ্যমে সফল প্রতিটি বিক্রয়ে সর্বোচ্চ ৩৫% পর্যন্ত নিশ্চিত কমিশন অর্জন করুন।", type: "string" },
    { key: "BKASH_RECEIVER_NUMBER", value: "01712345678", type: "string" },
    { key: "DEFAULT_COMMISSION_RATE", value: "20.00", type: "number" },
    { key: "MIN_PAYOUT_AMOUNT", value: "500.00", type: "number" },
  ];

  for (const s of settings) {
    await prisma.platformSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
