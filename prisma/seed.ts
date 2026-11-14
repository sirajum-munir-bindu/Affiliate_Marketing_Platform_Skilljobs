import { PrismaClient, UserRole, UserStatus, CourseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

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

  // 2. Create Categories
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

  // 5. Courses (Demo courses removed - add courses through Admin panel)

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

  // 7. Testimonials (Demo testimonials removed - add via Admin panel)

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
