import {
  mockDb,
  DEFAULT_COURSE_CATEGORIES,
  MockCourse,
  MockCourseCategory,
  MockMarketerProfile,
  MockOrder,
  MockPayment,
  MockCommission,
  MockPayout,
  MockPlatformSettings,
  MockInstructor,
  MockTestimonial,
} from "../db/mock-data";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "../affiliate/tracking";

export interface AdminChartPoint {
  label: string;
  revenue: number;
  commission: number;
  orders: number;
}

export interface AdminTimeframeData {
  summaryTurnover: number;
  summaryPayout: number;
  summaryOrders: number;
  growthText?: string;
  payoutNote?: string;
  conversionRateText?: string;
  points: AdminChartPoint[];
}

export interface TopCourseItem {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface AdminAnalyticsData {
  chartDatasets: {
    "7d": AdminTimeframeData;
    "30d": AdminTimeframeData;
    year: AdminTimeframeData;
  };
  topCourses: TopCourseItem[];
  bestPerformer: {
    title: string;
    sales: number;
    affiliateShare: number;
  };
  totalClicks: number;
  totalConversions: number;
  conversionRate: string;
}

export class DataService {
  // --- AUTH & USERS ---
  static async findUserById(id: string) {
    return mockDb.users.find((u) => u.id === id) || null;
  }

  static async findUserByEmailOrPhone(identifier: string) {
    const trimmed = identifier.trim().toLowerCase();
    return (
      mockDb.users.find(
        (u) => u.email.toLowerCase() === trimmed || u.phone === identifier.trim()
      ) || null
    );
  }

  static async registerUser(data: { name: string; email: string; phone: string; password: string }) {
    const existing = await this.findUserByEmailOrPhone(data.email);
    if (existing) {
      throw new Error("এই ইমেইল দিয়ে ইতিমধ্যে একটি একাউন্ট খোলা আছে।");
    }
    const existingPhone = await this.findUserByEmailOrPhone(data.phone);
    if (existingPhone) {
      throw new Error("এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি একাউন্ট খোলা আছে।");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const newUser = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      passwordHash,
      role: "STUDENT" as const,
      status: "ACTIVE" as const,
      createdAt: new Date().toISOString(),
    };

    mockDb.users.push(newUser);
    return newUser;
  }

  // --- COURSE CATEGORIES ---
  private static ensureCategories(): MockCourseCategory[] {
    if (!Array.isArray(mockDb.categories)) {
      mockDb.categories = [...DEFAULT_COURSE_CATEGORIES];
    }
    return mockDb.categories;
  }

  private static sanitizeCategorySlug(raw: string): string {
    return raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  static async getCategories(): Promise<MockCourseCategory[]> {
    const categories = this.ensureCategories();
    // Ensure any category present on existing courses is also represented dynamically
    const existingSlugs = new Set(categories.map((c) => c.slug));
    for (const course of mockDb.courses) {
      if (course.categorySlug && !existingSlugs.has(course.categorySlug)) {
        categories.push({
          id: `cat_${course.categorySlug}`,
          name: course.categorySlug.replace(/-/g, " "),
          nameBn: course.categoryNameBn || course.categorySlug,
          slug: course.categorySlug,
          createdAt: new Date().toISOString(),
        });
        existingSlugs.add(course.categorySlug);
      }
    }
    return [...categories];
  }

  static async createCategory(
    data: { name?: string; nameBn: string; slug?: string },
    adminEmail?: string
  ): Promise<MockCourseCategory> {
    const categories = this.ensureCategories();
    const nameBn = data.nameBn?.trim() || data.name?.trim();
    if (!nameBn) {
      throw new Error("ক্যাটাগরির নাম প্রদান করুন।");
    }

    const name = data.name?.trim() || nameBn;
    let slug = this.sanitizeCategorySlug(data.slug || data.name || "");
    if (!slug) {
      slug = `category-${Date.now().toString(36)}`;
    }

    const duplicateName = categories.some(
      (c) => c.nameBn.trim().toLowerCase() === nameBn.toLowerCase()
    );
    if (duplicateName) {
      throw new Error("এই নামে একটি ক্যাটাগরি ইতিমধ্যে রয়েছে।");
    }

    const duplicateSlug = categories.some((c) => c.slug === slug);
    if (duplicateSlug) {
      if (data.slug?.trim()) {
        throw new Error("এই স্লাগ (Slug) দিয়ে একটি ক্যাটাগরি ইতিমধ্যে রয়েছে।");
      }
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    const newCategory: MockCourseCategory = {
      id: `cat_${Date.now()}`,
      name,
      nameBn,
      slug,
      createdAt: new Date().toISOString(),
    };

    categories.push(newCategory);

    if (adminEmail) {
      mockDb.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorEmail: adminEmail,
        action: "CATEGORY_CREATED",
        entity: "CourseCategory",
        entityId: newCategory.id,
        details: `Created course category: ${newCategory.nameBn} (${newCategory.slug})`,
        createdAt: new Date().toISOString(),
      });
    }

    return newCategory;
  }

  static async updateCategory(
    id: string,
    data: { name?: string; nameBn?: string; slug?: string },
    adminEmail?: string
  ): Promise<MockCourseCategory> {
    const categories = this.ensureCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("ক্যাটাগরি খুঁজে পাওয়া যায়নি।");
    }

    const current = categories[index];
    const nextNameBn = data.nameBn !== undefined ? data.nameBn.trim() : current.nameBn;
    if (!nextNameBn) {
      throw new Error("ক্যাটাগরির নাম খালি রাখা যাবে না।");
    }

    const nextName = data.name !== undefined ? data.name.trim() || nextNameBn : current.name;
    let nextSlug = current.slug;
    if (data.slug !== undefined && data.slug.trim()) {
      const sanitized = this.sanitizeCategorySlug(data.slug);
      if (!sanitized) {
        throw new Error("সঠিক ইংরেজি স্লাগ (Slug) প্রদান করুন।");
      }
      const slugConflict = categories.some((c) => c.id !== id && c.slug === sanitized);
      if (slugConflict) {
        throw new Error("এই স্লাগটি অন্য একটি ক্যাটাগরিতে ব্যবহৃত হচ্ছে।");
      }
      nextSlug = sanitized;
    }

    const nameConflict = categories.some(
      (c) => c.id !== id && c.nameBn.trim().toLowerCase() === nextNameBn.toLowerCase()
    );
    if (nameConflict) {
      throw new Error("এই নামে আরেকটি ক্যাটাগরি ইতিমধ্যে রয়েছে।");
    }

    const updated: MockCourseCategory = {
      ...current,
      name: nextName,
      nameBn: nextNameBn,
      slug: nextSlug,
    };
    categories[index] = updated;

    // Keep courses linked to this category in sync
    for (const course of mockDb.courses) {
      if (course.categorySlug === current.slug) {
        course.categorySlug = updated.slug;
        course.categoryNameBn = updated.nameBn;
      }
    }

    if (adminEmail) {
      mockDb.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorEmail: adminEmail,
        action: "CATEGORY_UPDATED",
        entity: "CourseCategory",
        entityId: id,
        details: `Updated course category: ${updated.nameBn} (${updated.slug})`,
        createdAt: new Date().toISOString(),
      });
    }

    return updated;
  }

  static async deleteCategory(id: string, adminEmail?: string): Promise<MockCourseCategory> {
    const categories = this.ensureCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("ক্যাটাগরি খুঁজে পাওয়া যায়নি।");
    }

    const target = categories[index];
    const usedByCourse = mockDb.courses.some((c) => c.categorySlug === target.slug);
    if (usedByCourse) {
      throw new Error("এই ক্যাটাগরির অধীনে কোর্স রয়েছে, তাই এটি ডিলিট করা যাবে না।");
    }

    categories.splice(index, 1);

    if (adminEmail) {
      mockDb.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorEmail: adminEmail,
        action: "CATEGORY_DELETED",
        entity: "CourseCategory",
        entityId: id,
        details: `Deleted course category: ${target.nameBn} (${target.slug})`,
        createdAt: new Date().toISOString(),
      });
    }

    return target;
  }

  // --- COURSES ---
  static async getCourses(onlyPublished = true) {
    if (onlyPublished) {
      return mockDb.courses.filter((c) => c.status === "PUBLISHED");
    }
    return mockDb.courses;
  }

  static async getCourseBySlug(slug: string) {
    return mockDb.courses.find((c) => c.slug === slug) || null;
  }

  static async getCourseById(id: string) {
    return mockDb.courses.find((c) => c.id === id) || null;
  }

  static async createCourse(data: Partial<MockCourse>, adminEmail?: string) {
    const slugBase =
      data.slug?.trim() ||
      (data.title || "course")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
      `course-${Date.now()}`;

    const slugExists = mockDb.courses.some((c) => c.slug === slugBase);
    const finalSlug = slugExists ? `${slugBase}-${Date.now().toString().slice(-4)}` : slugBase;

    const categories = await this.getCategories();
    const requestedSlug = data.categorySlug?.trim() || "web-development";
    const matchedCat = categories.find((cat) => cat.slug === requestedSlug);
    const categoryNameBn = data.categoryNameBn?.trim() || matchedCat?.nameBn || "ওয়েব ডেভেলপমেন্ট";

    if (!matchedCat && requestedSlug) {
      categories.push({
        id: `cat_${Date.now()}`,
        name: requestedSlug.replace(/-/g, " "),
        nameBn: categoryNameBn,
        slug: requestedSlug,
        createdAt: new Date().toISOString(),
      });
    }

    const processedInstructors: MockInstructor[] = Array.isArray(data.instructors) && data.instructors.length > 0
      ? data.instructors
          .map((ins) => ({
            name: ins.name?.trim() || "",
            avatar:
              ins.avatar?.trim() ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
            designation: ins.designation?.trim() || "কোর্স ইন্সট্রাক্টর",
            instructorType: (ins.instructorType === "CO" ? "CO" : "LEAD") as "LEAD" | "CO",
            instructorTypeBn:
              ins.instructorTypeBn?.trim() ||
              (ins.instructorType === "CO" ? "কো-ইন্সট্রাক্টর" : "লিড ইন্সট্রাক্টর"),
            description: ins.description?.trim() || "",
          }))
          .filter((ins) => Boolean(ins.name))
      : data.instructor?.name?.trim()
        ? [
            {
              name: data.instructor.name.trim(),
              avatar:
                data.instructor.avatar?.trim() ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
              designation: data.instructor.designation?.trim() || "কোর্স ইন্সট্রাক্টর",
              instructorType: (data.instructor.instructorType === "CO" ? "CO" : "LEAD") as "LEAD" | "CO",
              instructorTypeBn:
                data.instructor.instructorTypeBn?.trim() ||
                (data.instructor.instructorType === "CO" ? "কো-ইন্সট্রাক্টর" : "লিড ইন্সট্রাক্টর"),
              description: data.instructor.description?.trim() || "",
            },
          ]
        : [];

    const newCourse: MockCourse = {
      id: `crs_${Date.now()}`,
      title: data.title || "New Course",
      titleBn: data.titleBn || "নতুন কোর্স",
      slug: finalSlug,
      summaryBn: data.summaryBn || "বিস্তারিত কোর্স সিলেবাস ও প্রজেক্ট ভিত্তিক প্রশিক্ষণ।",
      descriptionBn: data.descriptionBn || "এই কোর্সটি আপনাকে বাস্তব জীবনের প্রজেক্টের মাধ্যমে দক্ষ করে তুলবে।",
      thumbnail: data.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      previewVideoUrl: data.previewVideoUrl,
      price: Number(data.price) || 2000,
      originalPrice: Number(data.originalPrice) || 4000,
      commissionRate: Number(data.commissionRate) || 20,
      isAffiliateEligible: data.isAffiliateEligible ?? true,
      status: data.status || "PUBLISHED",
      categorySlug: requestedSlug,
      categoryNameBn,
      duration: data.duration || "২০+ ঘণ্টা",
      totalLessons: Number(data.totalLessons) || 20,
      difficulty: data.difficulty || "সকল স্তরের জন্য",
      featured: data.featured ?? false,
      learningOutcomes: Array.isArray(data.learningOutcomes)
        ? data.learningOutcomes.map((item) => item.trim()).filter(Boolean)
        : undefined,
      instructions: Array.isArray(data.instructions)
        ? data.instructions.map((item) => item.trim()).filter(Boolean)
        : undefined,
      instructor: processedInstructors[0] || undefined,
      instructors: processedInstructors.length > 0 ? processedInstructors : undefined,
      modules: Array.isArray(data.modules) ? data.modules : [],
    };
    mockDb.courses.unshift(newCourse);

    if (adminEmail) {
      mockDb.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorEmail: adminEmail,
        action: "COURSE_CREATED",
        entity: "Course",
        entityId: newCourse.id,
        details: `Created course: ${newCourse.titleBn} (৳${newCourse.price})`,
        createdAt: new Date().toISOString(),
      });
    }

    return newCourse;
  }

  static async updateCourse(id: string, data: Partial<MockCourse>, adminEmail?: string) {
    const courseIndex = mockDb.courses.findIndex((c) => c.id === id);
    if (courseIndex === -1) throw new Error("Course not found");

    const categories = await this.getCategories();
    const nextCategorySlug = data.categorySlug ?? mockDb.courses[courseIndex].categorySlug;
    const matchedCat = categories.find((cat) => cat.slug === nextCategorySlug);
    const nextCategoryNameBn =
      data.categoryNameBn || matchedCat?.nameBn || mockDb.courses[courseIndex].categoryNameBn;

    let processedInstructors: MockInstructor[] | undefined = undefined;
    if (data.instructors !== undefined) {
      processedInstructors = Array.isArray(data.instructors)
        ? data.instructors
            .map((ins) => ({
              name: ins.name?.trim() || "",
              avatar:
                ins.avatar?.trim() ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
              designation: ins.designation?.trim() || "কোর্স ইন্সট্রাক্টর",
              instructorType: (ins.instructorType === "CO" ? "CO" : "LEAD") as "LEAD" | "CO",
              instructorTypeBn:
                ins.instructorTypeBn?.trim() ||
                (ins.instructorType === "CO" ? "কো-ইন্সট্রাক্টর" : "লিড ইন্সট্রাক্টর"),
              description: ins.description?.trim() || "",
            }))
            .filter((ins) => Boolean(ins.name))
        : [];
    } else if (data.instructor !== undefined) {
      processedInstructors = data.instructor?.name?.trim()
        ? [
            {
              name: data.instructor.name.trim(),
              avatar:
                data.instructor.avatar?.trim() ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
              designation: data.instructor.designation?.trim() || "কোর্স ইন্সট্রাক্টর",
              instructorType: (data.instructor.instructorType === "CO" ? "CO" : "LEAD") as "LEAD" | "CO",
              instructorTypeBn:
                data.instructor.instructorTypeBn?.trim() ||
                (data.instructor.instructorType === "CO" ? "কো-ইন্সট্রাক্টর" : "লিড ইন্সট্রাক্টর"),
              description: data.instructor.description?.trim() || "",
            },
          ]
        : [];
    }

    const updated: MockCourse = {
      ...mockDb.courses[courseIndex],
      ...data,
      categorySlug: nextCategorySlug,
      categoryNameBn: nextCategoryNameBn,
      price: data.price !== undefined ? Number(data.price) : mockDb.courses[courseIndex].price,
      originalPrice:
        data.originalPrice !== undefined ? Number(data.originalPrice) : mockDb.courses[courseIndex].originalPrice,
      commissionRate:
        data.commissionRate !== undefined ? Number(data.commissionRate) : mockDb.courses[courseIndex].commissionRate,
      totalLessons:
        data.totalLessons !== undefined ? Number(data.totalLessons) : mockDb.courses[courseIndex].totalLessons,
      learningOutcomes:
        data.learningOutcomes !== undefined
          ? data.learningOutcomes.map((item) => item.trim()).filter(Boolean)
          : mockDb.courses[courseIndex].learningOutcomes,
      instructions:
        data.instructions !== undefined
          ? data.instructions.map((item) => item.trim()).filter(Boolean)
          : mockDb.courses[courseIndex].instructions,
      instructor:
        processedInstructors !== undefined
          ? processedInstructors[0] || undefined
          : mockDb.courses[courseIndex].instructor,
      instructors:
        processedInstructors !== undefined
          ? processedInstructors
          : mockDb.courses[courseIndex].instructors,
      modules: data.modules !== undefined ? data.modules : mockDb.courses[courseIndex].modules,
    };

    mockDb.courses[courseIndex] = updated;

    if (adminEmail) {
      mockDb.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorEmail: adminEmail,
        action: "COURSE_UPDATED",
        entity: "Course",
        entityId: id,
        details: `Updated course: ${updated.titleBn}`,
        createdAt: new Date().toISOString(),
      });
    }

    return updated;
  }

  static async deleteCourse(id: string, adminEmail?: string) {
    const courseIndex = mockDb.courses.findIndex((c) => c.id === id);
    if (courseIndex === -1) throw new Error("কোর্সটি খুঁজে পাওয়া যায়নি।");

    const [deletedCourse] = mockDb.courses.splice(courseIndex, 1);

    if (adminEmail) {
      mockDb.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorEmail: adminEmail,
        action: "COURSE_DELETED",
        entity: "Course",
        entityId: id,
        details: `Deleted course: ${deletedCourse.titleBn}`,
        createdAt: new Date().toISOString(),
      });
    }

    return deletedCourse;
  }

  // --- AFFILIATES & APPLICATIONS ---
  static async getMarketerByUserId(userId: string) {
    return mockDb.marketers.find((m) => m.userId === userId) || null;
  }

  static async getMarketerByReferralCode(code: string) {
    return mockDb.marketers.find((m) => m.referralCode.toUpperCase() === code.toUpperCase()) || null;
  }

  static async getMarketerById(id: string) {
    return mockDb.marketers.find((m) => m.id === id) || null;
  }

  private static enrichMarketer(m: MockMarketerProfile) {
    const user = mockDb.users.find((u) => u.id === m.userId);
    return {
      ...m,
      userName: user?.name || "Unknown",
      userEmail: user?.email || "",
      userPhone: user?.phone || "",
    };
  }

  static async getAllMarketers() {
    return mockDb.marketers.map((m) => this.enrichMarketer(m));
  }

  static async createMarketer(
    data: {
      name: string;
      email: string;
      phone: string;
      password?: string;
      referralCode?: string;
      status?: MockMarketerProfile["status"];
      occupation?: string;
      experience?: string;
      channels?: string;
      whyJoin?: string;
      payoutMethod?: MockMarketerProfile["payoutMethod"];
      payoutAccountNo?: string;
      currentBalance?: number;
    },
    adminEmail?: string
  ) {
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const phone = data.phone?.trim();

    if (!name || !email || !phone) {
      throw new Error("মার্কেটারের নাম, ইমেইল এবং ফোন নম্বর আবশ্যক।");
    }

    let user = mockDb.users.find(
      (u) => u.email.toLowerCase() === email || u.phone === phone
    );

    if (user) {
      const existingMarketer = mockDb.marketers.find((m) => m.userId === user!.id);
      if (existingMarketer) {
        throw new Error("এই ইমেইল বা ফোন নম্বরে ইতিমধ্যে একজন অ্যাফিলিয়েট মার্কেটার নিবন্ধিত আছেন।");
      }
      user.name = name;
      user.email = email;
      user.phone = phone;
      if (user.role !== "ADMIN") {
        user.role = "AFFILIATE";
      }
      user.status = data.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE";
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(data.password?.trim() || "Password@123456", salt);
      user = {
        id: `usr_${Date.now()}`,
        name,
        email,
        phone,
        passwordHash,
        role: "AFFILIATE",
        status: data.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
        createdAt: new Date().toISOString(),
      };
      mockDb.users.push(user);
    }

    let referralCode = data.referralCode
      ? data.referralCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "")
      : generateReferralCode(name);

    if (!referralCode) {
      referralCode = generateReferralCode(name);
    }

    const codeExists = mockDb.marketers.some(
      (m) => m.referralCode.toUpperCase() === referralCode.toUpperCase()
    );
    if (codeExists) {
      if (data.referralCode?.trim()) {
        throw new Error("এই রেফারেল কোডটি ইতিমধ্যে ব্যবহৃত হচ্ছে।");
      }
      referralCode = `${referralCode}${Date.now().toString().slice(-3)}`;
    }

    const status: MockMarketerProfile["status"] = data.status || "APPROVED";
    const now = new Date().toISOString();
    const initialBalance = Math.max(0, Number(data.currentBalance) || 0);

    const newProfile: MockMarketerProfile = {
      id: `mkt_${Date.now()}`,
      userId: user.id,
      referralCode,
      status,
      occupation: data.occupation?.trim() || "ডিজিটাল মার্কেটার",
      experience: data.experience?.trim() || "",
      channels: data.channels?.trim() || "",
      whyJoin: data.whyJoin?.trim() || "",
      totalClicks: 0,
      totalConversions: 0,
      lifetimeEarnings: initialBalance,
      currentBalance: initialBalance,
      pendingBalance: 0,
      paidEarnings: 0,
      payoutMethod: data.payoutMethod || "BKASH",
      payoutAccountNo: data.payoutAccountNo?.trim() || phone,
      approvedAt: status === "APPROVED" ? now : undefined,
      createdAt: now,
    };

    mockDb.marketers.unshift(newProfile);

    if (adminEmail) {
      mockDb.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorEmail: adminEmail,
        action: "MARKETER_CREATED",
        entity: "MarketerProfile",
        entityId: newProfile.id,
        details: `Created affiliate marketer: ${user.name} (${newProfile.referralCode})`,
        createdAt: now,
      });
    }

    return this.enrichMarketer(newProfile);
  }

  static async updateMarketer(
    id: string,
    data: {
      name?: string;
      userName?: string;
      email?: string;
      userEmail?: string;
      phone?: string;
      userPhone?: string;
      referralCode?: string;
      status?: MockMarketerProfile["status"];
      occupation?: string;
      experience?: string;
      channels?: string;
      whyJoin?: string;
      rejectionReason?: string;
      payoutMethod?: MockMarketerProfile["payoutMethod"];
      payoutAccountNo?: string;
      currentBalance?: number;
      pendingBalance?: number;
      paidEarnings?: number;
      lifetimeEarnings?: number;
    },
    adminEmail?: string
  ) {
    const index = mockDb.marketers.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error("মার্কেটার প্রোফাইল খুঁজে পাওয়া যায়নি।");
    }

    const current = mockDb.marketers[index];
    const user = mockDb.users.find((u) => u.id === current.userId);

    const nextName = (data.name ?? data.userName)?.trim();
    const nextEmail = (data.email ?? data.userEmail)?.trim().toLowerCase();
    const nextPhone = (data.phone ?? data.userPhone)?.trim();

    if (user) {
      if (nextEmail && nextEmail !== user.email.toLowerCase()) {
        const emailTaken = mockDb.users.some(
          (u) => u.id !== user.id && u.email.toLowerCase() === nextEmail
        );
        if (emailTaken) {
          throw new Error("এই ইমেইলটি অন্য একজন ইউজার ব্যবহার করছেন।");
        }
        user.email = nextEmail;
      }

      if (nextPhone && nextPhone !== user.phone) {
        const phoneTaken = mockDb.users.some(
          (u) => u.id !== user.id && u.phone === nextPhone
        );
        if (phoneTaken) {
          throw new Error("এই ফোন নম্বরটি অন্য একজন ইউজার ব্যবহার করছেন।");
        }
        user.phone = nextPhone;
      }

      if (nextName) {
        user.name = nextName;
      }
    }

    let nextReferralCode = current.referralCode;
    if (data.referralCode !== undefined && data.referralCode.trim()) {
      const normalized = data.referralCode
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, "");
      if (!normalized) {
        throw new Error("সঠিক রেফারেল কোড প্রদান করুন।");
      }
      const codeTaken = mockDb.marketers.some(
        (m) => m.id !== id && m.referralCode.toUpperCase() === normalized
      );
      if (codeTaken) {
        throw new Error("এই রেফারেল কোডটি অন্য একজন মার্কেটার ব্যবহার করছেন।");
      }
      nextReferralCode = normalized;
    }

    const nextStatus = data.status ?? current.status;
    if (user && user.role !== "ADMIN") {
      if (nextStatus === "SUSPENDED") {
        user.status = "SUSPENDED";
      } else if (nextStatus === "APPROVED") {
        user.role = "AFFILIATE";
        user.status = "ACTIVE";
      }
    }

    const updated: MockMarketerProfile = {
      ...current,
      referralCode: nextReferralCode,
      status: nextStatus,
      occupation: data.occupation !== undefined ? data.occupation.trim() : current.occupation,
      experience: data.experience !== undefined ? data.experience.trim() : current.experience,
      channels: data.channels !== undefined ? data.channels.trim() : current.channels,
      whyJoin: data.whyJoin !== undefined ? data.whyJoin.trim() : current.whyJoin,
      rejectionReason:
        data.rejectionReason !== undefined ? data.rejectionReason.trim() : current.rejectionReason,
      payoutMethod: data.payoutMethod ?? current.payoutMethod,
      payoutAccountNo:
        data.payoutAccountNo !== undefined ? data.payoutAccountNo.trim() : current.payoutAccountNo,
      currentBalance:
        data.currentBalance !== undefined ? Number(data.currentBalance) : current.currentBalance,
      pendingBalance:
        data.pendingBalance !== undefined ? Number(data.pendingBalance) : current.pendingBalance,
      paidEarnings:
        data.paidEarnings !== undefined ? Number(data.paidEarnings) : current.paidEarnings,
      lifetimeEarnings:
        data.lifetimeEarnings !== undefined ? Number(data.lifetimeEarnings) : current.lifetimeEarnings,
      approvedAt:
        nextStatus === "APPROVED" ? current.approvedAt || new Date().toISOString() : current.approvedAt,
    };

    mockDb.marketers[index] = updated;

    if (adminEmail) {
      mockDb.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorEmail: adminEmail,
        action: "MARKETER_UPDATED",
        entity: "MarketerProfile",
        entityId: id,
        details: `Updated affiliate marketer: ${user?.name || updated.referralCode} (Status: ${updated.status})`,
        createdAt: new Date().toISOString(),
      });
    }

    return this.enrichMarketer(updated);
  }

  static async deleteMarketer(id: string, adminEmail?: string) {
    const index = mockDb.marketers.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error("মার্কেটার প্রোফাইল খুঁজে পাওয়া যায়নি।");
    }

    const [removed] = mockDb.marketers.splice(index, 1);
    const user = mockDb.users.find((u) => u.id === removed.userId);
    if (user && user.role === "AFFILIATE") {
      user.role = "STUDENT";
    }

    if (adminEmail) {
      mockDb.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorEmail: adminEmail,
        action: "MARKETER_DELETED",
        entity: "MarketerProfile",
        entityId: id,
        details: `Deleted affiliate marketer: ${user?.name || removed.referralCode} (${removed.referralCode})`,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      ...removed,
      userName: user?.name || "Unknown",
      userEmail: user?.email || "",
      userPhone: user?.phone || "",
    };
  }

  static async getAffiliateApplications() {
    return [...mockDb.applications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async submitAffiliateApplication(data: {
    userId: string;
    fullName: string;
    phone: string;
    email: string;
    occupation: string;
    channels: string;
    marketingExperience: string;
    whyJoin: string;
  }) {
    const existing = mockDb.applications.find((a) => a.userId === data.userId);
    if (existing && existing.status === "PENDING") {
      throw new Error("আপনার একটি আবেদন ইতিমধ্যে পর্যালোচনায় রয়েছে।");
    }

    const app = {
      id: `app_${Date.now()}`,
      userId: data.userId,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      occupation: data.occupation,
      channels: data.channels,
      marketingExperience: data.marketingExperience,
      whyJoin: data.whyJoin,
      status: "PENDING" as const,
      createdAt: new Date().toISOString(),
    };

    mockDb.applications.unshift(app);
    return app;
  }

  static async approveAffiliateApplication(applicationId: string, reviewerEmail: string) {
    const app = mockDb.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error("Application not found");
    if (app.status === "APPROVED") throw new Error("আবেদনটি ইতিমধ্যে অনুমোদিত রয়েছে।");

    app.status = "APPROVED";
    app.rejectionReason = undefined;

    // Update user role to AFFILIATE (preserve ADMIN role if applicable)
    const user = mockDb.users.find((u) => u.id === app.userId);
    if (user && user.role !== "ADMIN") {
      user.role = "AFFILIATE";
      user.status = "ACTIVE";
    }

    // Check or create Marketer Profile
    let profile = mockDb.marketers.find((m) => m.userId === app.userId);
    if (!profile) {
      const referralCode = generateReferralCode(app.fullName);
      profile = {
        id: `mkt_${Date.now()}`,
        userId: app.userId,
        referralCode,
        status: "APPROVED",
        occupation: app.occupation,
        experience: app.marketingExperience,
        channels: app.channels,
        whyJoin: app.whyJoin,
        totalClicks: 0,
        totalConversions: 0,
        lifetimeEarnings: 0,
        currentBalance: 0,
        pendingBalance: 0,
        paidEarnings: 0,
        payoutMethod: "BKASH",
        payoutAccountNo: app.phone,
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      mockDb.marketers.push(profile);
    } else {
      profile.status = "APPROVED";
      profile.occupation = app.occupation;
      profile.experience = app.marketingExperience;
      profile.channels = app.channels;
      profile.approvedAt = new Date().toISOString();
    }

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: reviewerEmail,
      action: "AFFILIATE_APPROVED",
      entity: "AffiliateApplication",
      entityId: applicationId,
      details: `${app.fullName} এর অ্যাফিলিয়েট আবেদন অনুমোদন করা হয়েছে। রেফারেল কোড: ${profile.referralCode}`,
      createdAt: new Date().toISOString(),
    });

    return profile;
  }

  static async rejectAffiliateApplication(applicationId: string, reason: string, reviewerEmail: string) {
    const app = mockDb.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error("Application not found");
    if (app.status === "APPROVED") {
      throw new Error("অনুমোদিত আবেদন সরাসরি বাতিল করা যাবে না, অনুগ্রহ করে রিভার্স ব্যবহার করুন।");
    }
    app.status = "REJECTED";
    app.rejectionReason = reason;

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: reviewerEmail,
      action: "AFFILIATE_REJECTED",
      entity: "AffiliateApplication",
      entityId: applicationId,
      details: `${app.fullName} এর অ্যাফিলিয়েট আবেদন বাতিল করা হয়েছে। কারণ: ${reason}`,
      createdAt: new Date().toISOString(),
    });

    return app;
  }

  static async revertAffiliateApplication(
    applicationId: string,
    options: { targetStatus?: "PENDING" | "REJECTED"; reason?: string },
    reviewerEmail: string
  ) {
    const app = mockDb.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error("আবেদনটি খুঁজে পাওয়া যায়নি।");
    if (app.status !== "APPROVED") {
      throw new Error("শুধুমাত্র অনুমোদিত (APPROVED) আবেদন রিভার্স করা যাবে।");
    }

    const targetStatus: "PENDING" | "REJECTED" =
      options.targetStatus === "REJECTED" ? "REJECTED" : "PENDING";
    const reason =
      options.reason?.trim() || "ভুলবশত অনুমোদন করা হয়েছিল — রিভার্স করা হয়েছে।";

    app.status = targetStatus;
    app.rejectionReason = targetStatus === "REJECTED" ? reason : undefined;

    const marketerIndex = mockDb.marketers.findIndex((m) => m.userId === app.userId);
    if (marketerIndex !== -1) {
      const profile = mockDb.marketers[marketerIndex];
      const hasFinancialActivity =
        profile.totalConversions > 0 ||
        profile.lifetimeEarnings > 0 ||
        profile.currentBalance > 0 ||
        profile.pendingBalance > 0 ||
        profile.paidEarnings > 0;

      if (hasFinancialActivity) {
        profile.status = targetStatus === "REJECTED" ? "REJECTED" : "PENDING";
        if (targetStatus === "REJECTED") {
          profile.rejectionReason = reason;
        }
      } else {
        mockDb.marketers.splice(marketerIndex, 1);
      }
    }

    const user = mockDb.users.find((u) => u.id === app.userId);
    if (user && user.role === "AFFILIATE") {
      user.role = "STUDENT";
    }

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: reviewerEmail,
      action: "AFFILIATE_APPROVAL_REVERTED",
      entity: "AffiliateApplication",
      entityId: applicationId,
      details: `${app.fullName} এর অ্যাফিলিয়েট অনুমোদন রিভার্স করে "${targetStatus}" করা হয়েছে। কারণ: ${reason}`,
      createdAt: new Date().toISOString(),
    });

    return app;
  }

  static async resolveRejectedAffiliateApplication(
    applicationId: string,
    data: {
      channels?: string;
      occupation?: string;
      marketingExperience?: string;
      approveNow?: boolean;
    },
    reviewerEmail: string
  ) {
    const app = mockDb.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error("আবেদনটি খুঁজে পাওয়া যায়নি।");
    if (app.status === "APPROVED") {
      throw new Error("আবেদনটি ইতিমধ্যে অনুমোদিত রয়েছে।");
    }

    if (data.channels?.trim()) app.channels = data.channels.trim();
    if (data.occupation?.trim()) app.occupation = data.occupation.trim();
    if (data.marketingExperience?.trim()) {
      app.marketingExperience = data.marketingExperience.trim();
    }
    app.rejectionReason = undefined;

    if (data.approveNow) {
      const profile = await this.approveAffiliateApplication(applicationId, reviewerEmail);
      return { application: app, profile };
    }

    app.status = "PENDING";
    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: reviewerEmail,
      action: "AFFILIATE_ISSUE_RESOLVED",
      entity: "AffiliateApplication",
      entityId: applicationId,
      details: `${app.fullName} এর অ্যাফিলিয়েট আবেদন আপডেট করে পেন্ডিং রিভিউতে পাঠানো হয়েছে।`,
      createdAt: new Date().toISOString(),
    });

    return { application: app };
  }

  static async deleteAffiliateApplication(applicationId: string, reviewerEmail: string) {
    const index = mockDb.applications.findIndex((a) => a.id === applicationId);
    if (index === -1) throw new Error("আবেদনটি খুঁজে পাওয়া যায়নি।");

    const [deleted] = mockDb.applications.splice(index, 1);

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: reviewerEmail,
      action: "AFFILIATE_APPLICATION_DELETED",
      entity: "AffiliateApplication",
      entityId: applicationId,
      details: `${deleted.fullName} (${deleted.email}) এর অ্যাফিলিয়েট আবেদন ডিলিট করা হয়েছে।`,
      createdAt: new Date().toISOString(),
    });

    return deleted;
  }

  // --- ORDERS & BKASH PAYMENTS ---
  static async getAllOrders() {
    return [...mockDb.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private static removeOrderLinkedRecords<T extends { orderId: string }>(
    list: T[],
    orderId: string
  ) {
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].orderId === orderId) {
        list.splice(i, 1);
      }
    }
  }

  static async deleteOrder(orderId: string, adminEmail: string) {
    const index = mockDb.orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      throw new Error("অর্ডার রেকর্ড খুঁজে পাওয়া যায়নি।");
    }

    const order = mockDb.orders[index];
    const commissionReversed = this.reverseOrderCommissions(
      order.id,
      "এই অর্ডারের কমিশন ইতিমধ্যে মার্কেটারকে পে-আউট করা হয়েছে, তাই অর্ডারটি ডিলিট করা যাবে না।"
    );

    mockDb.orders.splice(index, 1);
    this.removeOrderLinkedRecords(mockDb.payments, order.id);
    this.removeOrderLinkedRecords(mockDb.commissions, order.id);

    if (order.status === "PAID") {
      this.revokeEnrollmentIfNoOtherPaidOrder(order);
    }

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "ORDER_DELETED",
      entity: "Order",
      entityId: orderId,
      details: `অর্ডার ${order.orderNumber} (${order.customerName}, ৳${order.price}, স্ট্যাটাস: ${order.status}) ডিলিট করা হয়েছে${
        commissionReversed > 0 ? ` এবং ৳${commissionReversed} কমিশন রিভার্স করা হয়েছে` : ""
      }।`,
      createdAt: new Date().toISOString(),
    });

    return order;
  }

  static async createOrder(data: { customerId: string; courseId: string; refCode?: string | null }) {
    const course = await this.getCourseById(data.courseId);
    if (!course) throw new Error("কোর্সটি পাওয়া যায়নি");

    const customer = await this.findUserById(data.customerId);
    if (!customer) throw new Error("ইউজার সনাক্ত করা যায়নি");

    // Check if customer already has active enrollment
    const hasEnrollment = mockDb.enrollments.some(
      (e) => e.customerId === customer.id && e.courseId === course.id
    );
    if (hasEnrollment) {
      throw new Error("আপনি ইতিমধ্যে এই কোর্সে ভর্তি আছেন।");
    }

    // Resolve affiliate attribution
    let marketer: any = null;
    if (data.refCode) {
      marketer = await this.getMarketerByReferralCode(data.refCode);
      // Prevent Self-Referral
      if (marketer && marketer.userId === customer.id) {
        marketer = null; // Self-referral ignored silently
      }
      // Inactive marketer ignored
      if (marketer && marketer.status !== "APPROVED") {
        marketer = null;
      }
    }

    const price = course.price;
    const commissionRate = marketer && course.isAffiliateEligible ? course.commissionRate : 0;
    const commissionAmount = (price * commissionRate) / 100;

    const orderNumber = `SKILL-${Date.now().toString().slice(-6)}`;
    const newOrder: MockOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      marketerId: marketer?.id,
      marketerCode: marketer?.referralCode,
      marketerName: marketer ? (mockDb.users.find((u) => u.id === marketer.userId)?.name) : undefined,
      courseId: course.id,
      courseTitleBn: course.titleBn,
      price,
      commissionRate,
      commissionAmount,
      status: "PENDING_PAYMENT",
      createdAt: new Date().toISOString(),
    };

    mockDb.orders.unshift(newOrder);
    return newOrder;
  }

  static async submitPayment(data: {
    orderId: string;
    senderNumber: string;
    transactionId: string;
    paymentMethod?: "BKASH_MANUAL" | "NAGAD_MANUAL";
    customerNote?: string;
    customerId?: string;
  }) {
    const order = mockDb.orders.find((o) => o.id === data.orderId);
    if (!order) throw new Error("অর্ডারটি পাওয়া যায়নি");

    if (data.customerId && order.customerId !== data.customerId) {
      throw new Error("এই অর্ডারের জন্য পেমেন্ট জমা দেওয়ার অনুমতি নেই।");
    }

    if (order.status === "PAID") {
      throw new Error("এই অর্ডারটির মূল্য ইতিমধ্যে পরিশোধ করা হয়েছে।");
    }

    // Check duplicate TrxID
    const duplicate = mockDb.payments.find(
      (p) => p.transactionId.toUpperCase() === data.transactionId.toUpperCase() && p.status !== "REJECTED"
    );
    if (duplicate) {
      throw new Error("এই ট্রানজেকশন আইডি (TrxID) ইতিমধ্যে ব্যবহার করা হয়েছে। অনুগ্রহ করে সঠিক TrxID দিন।");
    }

    const newPayment: MockPayment = {
      id: `pay_${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      courseTitleBn: order.courseTitleBn,
      marketerId: order.marketerId,
      marketerCode: order.marketerCode,
      marketerName: order.marketerName,
      commissionAmount: order.commissionAmount,
      commissionRate: order.commissionRate,
      amount: order.price,
      paymentMethod: data.paymentMethod || "BKASH_MANUAL",
      senderNumber: data.senderNumber,
      transactionId: data.transactionId.toUpperCase(),
      status: "SUBMITTED",
      customerNote: data.customerNote,
      createdAt: new Date().toISOString(),
    };

    mockDb.payments.unshift(newPayment);
    order.status = "PAYMENT_REVIEW";
    return newPayment;
  }

  // ATOMIC APPROVAL TRANSACTION
  static async approvePayment(paymentId: string, adminEmail: string) {
    const payment = mockDb.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.status === "APPROVED") throw new Error("Payment already approved");

    const order = mockDb.orders.find((o) => o.id === payment.orderId);
    if (!order) throw new Error("Associated order not found");
    if (order.status === "PAID") {
      throw new Error("এই অর্ডারের জন্য ইতিমধ্যে আরেকটি পেমেন্ট অনুমোদিত হয়েছে।");
    }

    const admin = mockDb.users.find((u) => u.email === adminEmail);

    // 1. Mark payment as approved and clear any previous rejection reason
    payment.status = "APPROVED";
    payment.rejectionReason = undefined;
    payment.reviewedById = admin?.id || "admin";
    payment.reviewedAt = new Date().toISOString();

    // 2. Mark order as PAID
    order.status = "PAID";

    // 3. Create active enrollment
    const existingEnrollment = mockDb.enrollments.find(
      (e) => e.customerId === order.customerId && e.courseId === order.courseId
    );
    if (!existingEnrollment) {
      mockDb.enrollments.push({
        customerId: order.customerId,
        courseId: order.courseId,
        enrolledAt: new Date().toISOString(),
      });
    }

    // 4. Create commission if affiliate attributed
    if (order.marketerId && order.commissionAmount > 0) {
      const marketer = mockDb.marketers.find((m) => m.id === order.marketerId);
      if (marketer) {
        // Record Commission
        mockDb.commissions.unshift({
          id: `com_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          marketerId: marketer.id,
          courseId: order.courseId,
          courseTitleBn: order.courseTitleBn,
          amount: order.commissionAmount,
          rate: order.commissionRate,
          status: "APPROVED",
          approvedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });

        // Update Marketer Balances
        marketer.totalConversions += 1;
        marketer.lifetimeEarnings += order.commissionAmount;
        marketer.currentBalance += order.commissionAmount;
      }
    }

    // 5. Update live analytics history
    if (mockDb.analyticsHistory?.["7d"]) {
      const dayOfWeek = new Date().getDay(); // 0: Sun, 6: Sat
      const mappedDayIdx = (dayOfWeek + 1) % 7; // 0: Sat, 1: Sun, ... 6: Fri
      const pt = mockDb.analyticsHistory["7d"][mappedDayIdx];
      if (pt) {
        pt.revenue += order.price;
        pt.commission += (order.commissionAmount || 0);
        pt.orders += 1;
      }
    }

    // 6. Write Audit Log
    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "PAYMENT_APPROVED",
      entity: "Payment",
      entityId: payment.id,
      details: `অর্ডার ${order.orderNumber} এর জন্য TrxID ${payment.transactionId} (${payment.amount} টাকা) সফলভাবে ভেরিফাই ও অনুমোদন করা হয়েছে।`,
      createdAt: new Date().toISOString(),
    });

    return { payment, order };
  }

  static async rejectPayment(paymentId: string, reason: string, adminEmail: string) {
    const payment = mockDb.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.status === "APPROVED") throw new Error("Cannot reject an approved payment");

    payment.status = "REJECTED";
    payment.rejectionReason = reason;
    payment.reviewedAt = new Date().toISOString();

    const order = mockDb.orders.find((o) => o.id === payment.orderId);
    if (order && order.status === "PAYMENT_REVIEW") {
      order.status = "PENDING_PAYMENT"; // Allow customer to retry with new TrxID
    }

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "PAYMENT_REJECTED",
      entity: "Payment",
      entityId: payment.id,
      details: `অর্ডার ${order?.orderNumber} এর TrxID ${payment.transactionId} বাতিল করা হয়েছে। কারণ: ${reason}`,
      createdAt: new Date().toISOString(),
    });

    return payment;
  }

  private static reverseOrderCommissions(orderId: string, paidErrorMessage: string): number {
    const orderCommissions = mockDb.commissions.filter(
      (c) => c.orderId === orderId && c.status !== "REVERSED"
    );
    const hasPaidCommission = orderCommissions.some((c) => c.status === "PAID");
    if (hasPaidCommission) {
      throw new Error(paidErrorMessage);
    }

    let commissionReversed = 0;
    for (const comm of orderCommissions) {
      comm.status = "REVERSED";
      commissionReversed += comm.amount;

      const marketer = mockDb.marketers.find((m) => m.id === comm.marketerId);
      if (marketer) {
        marketer.totalConversions = Math.max(0, marketer.totalConversions - 1);
        marketer.lifetimeEarnings = Math.max(0, marketer.lifetimeEarnings - comm.amount);
        marketer.currentBalance = Math.max(0, marketer.currentBalance - comm.amount);
      }
    }
    return commissionReversed;
  }

  private static revokeEnrollmentIfNoOtherPaidOrder(order: MockOrder): void {
    const hasOtherPaidOrder = mockDb.orders.some(
      (o) =>
        o.id !== order.id &&
        o.customerId === order.customerId &&
        o.courseId === order.courseId &&
        o.status === "PAID"
    );
    if (!hasOtherPaidOrder) {
      const enrollIdx = mockDb.enrollments.findIndex(
        (e) => e.customerId === order.customerId && e.courseId === order.courseId
      );
      if (enrollIdx !== -1) {
        mockDb.enrollments.splice(enrollIdx, 1);
      }
    }
  }

  static async revertPaymentApproval(
    paymentId: string,
    options: { targetStatus?: "SUBMITTED" | "REJECTED"; reason?: string },
    adminEmail: string
  ) {
    const payment = mockDb.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error("পেমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি।");
    if (payment.status !== "APPROVED") {
      throw new Error("শুধুমাত্র অনুমোদিত (APPROVED) পেমেন্ট রিভার্স করা যাবে।");
    }

    const order = mockDb.orders.find((o) => o.id === payment.orderId);
    if (!order) throw new Error("সংশ্লিষ্ট অর্ডারটি খুঁজে পাওয়া যায়নি।");

    const targetStatus: "SUBMITTED" | "REJECTED" =
      options.targetStatus === "REJECTED" ? "REJECTED" : "SUBMITTED";
    const reason =
      options.reason?.trim() || "ভুলবশত অনুমোদন করা হয়েছিল — রিভার্স করা হয়েছে।";

    // 1. Check and reverse non-reversed commissions for this order
    const commissionReversed = this.reverseOrderCommissions(
      order.id,
      "এই পেমেন্টের কমিশন ইতিমধ্যে মার্কেটারকে পে-আউট করা হয়েছে, তাই অনুমোদন রিভার্স করা যাবে না।"
    );

    // 2. Update order & payment status first so enrollment check knows this order is no longer PAID
    const admin = mockDb.users.find((u) => u.email === adminEmail);
    payment.status = targetStatus;
    payment.reviewedById = admin?.id || "admin";
    payment.reviewedAt = new Date().toISOString();

    if (targetStatus === "REJECTED") {
      payment.rejectionReason = reason;
      order.status = "PENDING_PAYMENT";
    } else {
      payment.rejectionReason = undefined;
      order.status = "PAYMENT_REVIEW";
    }

    // 3. Revoke enrollment if student has no other PAID order for this course
    this.revokeEnrollmentIfNoOtherPaidOrder(order);

    // 4. Write Audit Log
    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "PAYMENT_APPROVAL_REVERTED",
      entity: "Payment",
      entityId: payment.id,
      details: `অর্ডার ${order.orderNumber} (TrxID: ${payment.transactionId}) এর ভুল অনুমোদন বাতিল করে "${targetStatus}" করা হয়েছে। কোর্স অ্যাক্সেস প্রত্যাহার${
        commissionReversed > 0 ? ` ও ৳${commissionReversed} কমিশন রিভার্স` : ""
      } করা হয়েছে। কারণ: ${reason}`,
      createdAt: new Date().toISOString(),
    });

    return { payment, order, commissionReversed };
  }

  static async resolveRejectedPayment(
    paymentId: string,
    data: {
      transactionId?: string;
      senderNumber?: string;
      approveNow?: boolean;
    },
    adminEmail: string
  ) {
    const payment = mockDb.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error("পেমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি।");
    if (payment.status === "APPROVED") {
      throw new Error("এই পেমেন্টটি ইতিমধ্যে অনুমোদিত রয়েছে।");
    }

    const order = mockDb.orders.find((o) => o.id === payment.orderId);
    if (!order) throw new Error("সংশ্লিষ্ট অর্ডারটি খুঁজে পাওয়া যায়নি।");
    if (order.status === "PAID") {
      throw new Error("এই অর্ডারের জন্য ইতিমধ্যে আরেকটি পেমেন্ট অনুমোদিত হয়েছে।");
    }

    const nextTrxId = (data.transactionId ?? payment.transactionId).trim().toUpperCase();
    if (nextTrxId.length < 8) {
      throw new Error("সঠিক ট্রানজেকশন আইডি (কমপক্ষে ৮ অক্ষর) প্রদান করুন।");
    }

    const duplicate = mockDb.payments.find(
      (p) =>
        p.id !== payment.id &&
        p.transactionId.toUpperCase() === nextTrxId &&
        p.status !== "REJECTED"
    );
    if (duplicate) {
      throw new Error("এই ট্রানজেকশন আইডি (TrxID) ইতিমধ্যে অন্য একটি সক্রিয় পেমেন্টে ব্যবহৃত হয়েছে।");
    }

    if (data.senderNumber?.trim()) {
      payment.senderNumber = data.senderNumber.trim();
    }
    payment.transactionId = nextTrxId;
    payment.rejectionReason = undefined;
    payment.status = "SUBMITTED";
    order.status = "PAYMENT_REVIEW";

    if (data.approveNow) {
      return await this.approvePayment(payment.id, adminEmail);
    }

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "PAYMENT_ISSUE_RESOLVED",
      entity: "Payment",
      entityId: payment.id,
      details: `অর্ডার ${order.orderNumber} এর সংশোধিত TrxID ${payment.transactionId} আপডেট করে পেন্ডিং রিভিউতে পাঠানো হয়েছে।`,
      createdAt: new Date().toISOString(),
    });

    return { payment, order };
  }

  static async deletePayment(paymentId: string, adminEmail: string) {
    const index = mockDb.payments.findIndex((p) => p.id === paymentId);
    if (index === -1) {
      throw new Error("পেমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি।");
    }

    const payment = mockDb.payments[index];
    const order = mockDb.orders.find((o) => o.id === payment.orderId);

    let commissionReversed = 0;
    if (payment.status === "APPROVED" && order) {
      commissionReversed = this.reverseOrderCommissions(
        order.id,
        "এই পেমেন্টের কমিশন ইতিমধ্যে মার্কেটারকে পে-আউট করা হয়েছে, তাই পেমেন্টটি ডিলিট করা যাবে না।"
      );
    }

    mockDb.payments.splice(index, 1);

    if (order) {
      if (payment.status === "APPROVED") {
        const hasOtherApproved = mockDb.payments.some(
          (p) => p.orderId === order.id && p.status === "APPROVED"
        );
        if (!hasOtherApproved) {
          const hasSubmitted = mockDb.payments.some(
            (p) => p.orderId === order.id && p.status === "SUBMITTED"
          );
          order.status = hasSubmitted ? "PAYMENT_REVIEW" : "PENDING_PAYMENT";
          this.revokeEnrollmentIfNoOtherPaidOrder(order);
        }
      } else if (order.status === "PAYMENT_REVIEW") {
        const hasSubmitted = mockDb.payments.some(
          (p) => p.orderId === order.id && p.status === "SUBMITTED"
        );
        if (!hasSubmitted) {
          order.status = "PENDING_PAYMENT";
        }
      }
    }

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "PAYMENT_DELETED",
      entity: "Payment",
      entityId: paymentId,
      details: `অর্ডার ${payment.orderNumber} এর পেমেন্ট রেকর্ড (TrxID: ${payment.transactionId}, ৳${payment.amount}, স্ট্যাটাস: ${payment.status}) ডিলিট করা হয়েছে${
        commissionReversed > 0 ? ` এবং ৳${commissionReversed} কমিশন রিভার্স করা হয়েছে` : ""
      }।`,
      createdAt: new Date().toISOString(),
    });

    return payment;
  }

  // --- COMMISSIONS & PAYOUTS ---
  static async getAllCommissions() {
    return [...mockDb.commissions]
      .map((c) => {
        const marketer = mockDb.marketers.find((m) => m.id === c.marketerId);
        const user = marketer ? mockDb.users.find((u) => u.id === marketer.userId) : null;
        const order = mockDb.orders.find((o) => o.id === c.orderId);
        return {
          ...c,
          marketerName: user?.name || order?.marketerName || c.marketerId,
          marketerCode: marketer?.referralCode || order?.marketerCode,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async deleteCommission(commissionId: string, adminEmail: string) {
    const index = mockDb.commissions.findIndex((c) => c.id === commissionId);
    if (index === -1) {
      throw new Error("কমিশন রেকর্ড খুঁজে পাওয়া যায়নি।");
    }

    const target = mockDb.commissions[index];
    if (target.status === "PAID") {
      throw new Error("ইতিমধ্যে পে-আউট সম্পন্ন হওয়া (PAID) কমিশন ডিলিট করা যাবে না।");
    }

    if (target.status === "APPROVED") {
      const marketer = mockDb.marketers.find((m) => m.id === target.marketerId);
      if (marketer) {
        marketer.currentBalance = Math.max(0, marketer.currentBalance - target.amount);
        marketer.lifetimeEarnings = Math.max(0, marketer.lifetimeEarnings - target.amount);
        marketer.totalConversions = Math.max(0, marketer.totalConversions - 1);
      }
    }

    mockDb.commissions.splice(index, 1);

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "COMMISSION_DELETED",
      entity: "Commission",
      entityId: commissionId,
      details: `অর্ডার ${target.orderNumber} এর ৳${target.amount} কমিশন (${target.status}) লেজার থেকে ডিলিট করা হয়েছে।`,
      createdAt: new Date().toISOString(),
    });

    return target;
  }

  static async getMarketerCommissions(marketerId: string) {
    return mockDb.commissions.filter((c) => c.marketerId === marketerId);
  }

  static async getMarketerClicks(marketerId: string) {
    return mockDb.clicks
      .filter((c) => c.marketerId === marketerId)
      .map((c) => {
        const course = c.courseId
          ? mockDb.courses.find((crs) => crs.id === c.courseId)
          : undefined;
        return {
          ...c,
          courseTitleBn: c.courseTitleBn || course?.titleBn,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getMarketerPayouts(marketerId: string) {
    return mockDb.payouts.filter((p) => p.marketerId === marketerId);
  }

  static async requestPayout(data: {
    marketerId: string;
    amount: number;
    method: "BKASH" | "NAGAD" | "BANK_TRANSFER";
    destinationNumber: string;
  }) {
    const marketer = mockDb.marketers.find((m) => m.id === data.marketerId);
    if (!marketer) throw new Error("মার্কেটার প্রোফাইল পাওয়া যায়নি");

    if (data.amount < 500) {
      throw new Error("ন্যূনতম উত্তোলনের পরিমাণ ৫০০ টাকা।");
    }

    if (data.amount > marketer.currentBalance) {
      throw new Error(`আপনার বর্তমান ব্যালেন্স ৳${marketer.currentBalance}। আপনি এর চেয়ে বেশি উত্তোলন করতে পারবেন না।`);
    }

    // Reserve balance
    marketer.currentBalance -= data.amount;
    marketer.pendingBalance += data.amount;

    const payoutNumber = `PO-${Date.now().toString().slice(-6)}`;
    const user = mockDb.users.find((u) => u.id === marketer.userId);

    const newPayout: MockPayout = {
      id: `po_${Date.now()}`,
      payoutNumber,
      marketerId: marketer.id,
      marketerName: user?.name || "Marketer",
      amount: data.amount,
      method: data.method,
      destinationNumber: data.destinationNumber,
      status: "REQUESTED",
      requestedAt: new Date().toISOString(),
    };

    mockDb.payouts.unshift(newPayout);
    return newPayout;
  }

  static async getAllPayouts() {
    return [...mockDb.payouts].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  static async completePayout(payoutId: string, reference: string, adminEmail: string) {
    const payout = mockDb.payouts.find((p) => p.id === payoutId);
    if (!payout) throw new Error("Payout not found");
    if (payout.status === "PAID") throw new Error("Payout already settled");
    if (payout.status === "REJECTED") {
      throw new Error("বাতিলকৃত পে-আউট সরাসরি নিষ্পত্তি করা যাবে না, অনুগ্রহ করে সমাধান ও অনুমোদন ব্যবহার করুন।");
    }

    const marketer = mockDb.marketers.find((m) => m.id === payout.marketerId);
    if (marketer) {
      marketer.pendingBalance = Math.max(0, marketer.pendingBalance - payout.amount);
      marketer.paidEarnings += payout.amount;
    }

    payout.status = "PAID";
    payout.transactionReference = reference.trim();
    payout.adminNotes = undefined;
    payout.processedAt = new Date().toISOString();

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "PAYOUT_COMPLETED",
      entity: "Payout",
      entityId: payout.id,
      details: `পে-আউট ${payout.payoutNumber} (৳${payout.amount}) সম্পন্ন করা হয়েছে। রেফারেন্স: ${payout.transactionReference}`,
      createdAt: new Date().toISOString(),
    });

    return payout;
  }

  static async rejectPayout(payoutId: string, reason: string, adminEmail: string) {
    const payout = mockDb.payouts.find((p) => p.id === payoutId);
    if (!payout) throw new Error("পে-আউট রিকোয়েস্ট খুঁজে পাওয়া যায়নি।");
    if (payout.status === "PAID") {
      throw new Error("পরিশোধিত পে-আউট সরাসরি বাতিল করা যাবে না, অনুগ্রহ করে রিভার্স ব্যবহার করুন।");
    }
    if (payout.status === "REJECTED") {
      throw new Error("এই পে-আউট রিকোয়েস্টটি ইতিমধ্যে বাতিলকৃত রয়েছে।");
    }

    const marketer = mockDb.marketers.find((m) => m.id === payout.marketerId);
    if (marketer) {
      marketer.pendingBalance = Math.max(0, marketer.pendingBalance - payout.amount);
      marketer.currentBalance += payout.amount;
    }

    payout.status = "REJECTED";
    payout.adminNotes = reason.trim();
    payout.processedAt = new Date().toISOString();

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "PAYOUT_REJECTED",
      entity: "Payout",
      entityId: payout.id,
      details: `পে-আউট ${payout.payoutNumber} (৳${payout.amount}) বাতিল করা হয়েছে। কারণ: ${reason}`,
      createdAt: new Date().toISOString(),
    });

    return payout;
  }

  static async revertPayoutApproval(
    payoutId: string,
    options: { targetStatus?: "REQUESTED" | "REJECTED"; reason?: string },
    adminEmail: string
  ) {
    const payout = mockDb.payouts.find((p) => p.id === payoutId);
    if (!payout) throw new Error("পে-আউট রেকর্ড খুঁজে পাওয়া যায়নি।");
    if (payout.status !== "PAID") {
      throw new Error("শুধুমাত্র পরিশোধিত (PAID) পে-আউট রিভার্স করা যাবে।");
    }

    const targetStatus: "REQUESTED" | "REJECTED" =
      options.targetStatus === "REJECTED" ? "REJECTED" : "REQUESTED";
    const reason =
      options.reason?.trim() || "ভুলবশত পরিশোধিত হিসেবে অনুমোদন করা হয়েছিল।";

    const marketer = mockDb.marketers.find((m) => m.id === payout.marketerId);
    if (marketer) {
      marketer.paidEarnings = Math.max(0, marketer.paidEarnings - payout.amount);
      if (targetStatus === "REQUESTED") {
        marketer.pendingBalance += payout.amount;
      } else {
        marketer.currentBalance += payout.amount;
      }
    }

    payout.status = targetStatus;
    payout.transactionReference = undefined;
    if (targetStatus === "REJECTED") {
      payout.adminNotes = reason;
      payout.processedAt = new Date().toISOString();
    } else {
      payout.adminNotes = undefined;
      payout.processedAt = undefined;
    }

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "PAYOUT_APPROVAL_REVERTED",
      entity: "Payout",
      entityId: payout.id,
      details: `পে-আউট ${payout.payoutNumber} (৳${payout.amount}) এর অনুমোদন রিভার্স করে "${targetStatus}" করা হয়েছে। কারণ: ${reason}`,
      createdAt: new Date().toISOString(),
    });

    return payout;
  }

  static async resolveRejectedPayout(
    payoutId: string,
    data: {
      destinationNumber?: string;
      reference?: string;
      approveNow?: boolean;
    },
    adminEmail: string
  ) {
    const payout = mockDb.payouts.find((p) => p.id === payoutId);
    if (!payout) throw new Error("পে-আউট রেকর্ড খুঁজে পাওয়া যায়নি।");
    if (payout.status === "PAID") {
      throw new Error("এই পে-আউটটি ইতিমধ্যে পরিশোধিত রয়েছে।");
    }

    if (payout.status === "REJECTED") {
      const marketer = mockDb.marketers.find((m) => m.id === payout.marketerId);
      if (marketer) {
        if (marketer.currentBalance < payout.amount) {
          throw new Error(
            `মার্কেটারের বর্তমান ব্যালেন্স (৳${marketer.currentBalance}) এই পে-আউট (৳${payout.amount}) পুনরায় সক্রিয় করার জন্য পর্যাপ্ত নয়।`
          );
        }
        marketer.currentBalance -= payout.amount;
        marketer.pendingBalance += payout.amount;
      }
      payout.status = "REQUESTED";
      payout.adminNotes = undefined;
      payout.processedAt = undefined;
    }

    if (data.destinationNumber?.trim()) {
      payout.destinationNumber = data.destinationNumber.trim();
    }

    if (data.approveNow) {
      if (!data.reference?.trim()) {
        throw new Error("পে-আউট অনুমোদন করতে bKash/Bank ট্রানজেকশন রেফারেন্স প্রদান করুন।");
      }
      return await this.completePayout(payout.id, data.reference.trim(), adminEmail);
    }

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "PAYOUT_ISSUE_RESOLVED",
      entity: "Payout",
      entityId: payout.id,
      details: `পে-আউট ${payout.payoutNumber} এর তথ্য আপডেট করে অপেক্ষমাণ (REQUESTED) তালিকায় ফেরত পাঠানো হয়েছে।`,
      createdAt: new Date().toISOString(),
    });

    return payout;
  }

  static async deletePayout(payoutId: string, adminEmail: string) {
    const index = mockDb.payouts.findIndex((p) => p.id === payoutId);
    if (index === -1) {
      throw new Error("পে-আউট রেকর্ড খুঁজে পাওয়া যায়নি।");
    }

    const [removed] = mockDb.payouts.splice(index, 1);
    const marketer = mockDb.marketers.find((m) => m.id === removed.marketerId);
    if (marketer) {
      if (removed.status === "REQUESTED" || removed.status === "APPROVED" || removed.status === "PROCESSING") {
        marketer.pendingBalance = Math.max(0, marketer.pendingBalance - removed.amount);
        marketer.currentBalance += removed.amount;
      } else if (removed.status === "PAID") {
        marketer.paidEarnings = Math.max(0, marketer.paidEarnings - removed.amount);
        marketer.currentBalance += removed.amount;
      }
    }

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "PAYOUT_DELETED",
      entity: "Payout",
      entityId: payoutId,
      details: `পে-আউট ${removed.payoutNumber} (৳${removed.amount}, স্ট্যাটাস: ${removed.status}) ডিলিট করা হয়েছে।`,
      createdAt: new Date().toISOString(),
    });

    return removed;
  }

  // --- HOMEPAGE & STATS SETTINGS ---
  static extractYouTubeEmbedUrl(url: string): string {
    if (!url || !url.trim()) {
      return "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0";
    }
    const cleanUrl = url.trim();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);

    if (match && match[2] && match[2].length === 11) {
      return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0`;
    }

    if (cleanUrl.includes("/embed/")) {
      return cleanUrl.includes("autoplay=1")
        ? cleanUrl
        : `${cleanUrl}${cleanUrl.includes("?") ? "&" : "?"}autoplay=1&rel=0`;
    }

    return cleanUrl;
  }

  static async getHomepageSettings(): Promise<MockPlatformSettings> {
    if (!mockDb.settings) {
      mockDb.settings = {
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
          totalClicks: 420,
          totalConversions: 28,
          summaryTurnover7d: 142000,
          summaryPayout7d: 28400,
          summaryOrders7d: 69,
        },
      };
    }
    return mockDb.settings;
  }

  static async updateHomepageSettings(data: {
    video?: Partial<MockPlatformSettings["video"]>;
    stats?: Partial<MockPlatformSettings["stats"]>;
    dashboardAnalytics?: Partial<NonNullable<MockPlatformSettings["dashboardAnalytics"]>>;
  }, actorEmail?: string): Promise<MockPlatformSettings> {
    const current = await this.getHomepageSettings();

    let newEmbedUrl = current.video.embedUrl;
    if (data.video?.videoUrl) {
      newEmbedUrl = this.extractYouTubeEmbedUrl(data.video.videoUrl);
    } else if (data.video?.embedUrl) {
      newEmbedUrl = data.video.embedUrl;
    }

    mockDb.settings = {
      ...current,
      video: {
        ...current.video,
        ...(data.video || {}),
        embedUrl: newEmbedUrl,
      },
      stats: {
        ...current.stats,
        ...(data.stats || {}),
      },
      dashboardAnalytics: {
        isManual: false,
        totalClicks: 420,
        totalConversions: 28,
        summaryTurnover7d: 142000,
        summaryPayout7d: 28400,
        summaryOrders7d: 69,
        ...(current.dashboardAnalytics || {}),
        ...(data.dashboardAnalytics || {}),
      },
    };

    if (actorEmail) {
      mockDb.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorEmail,
        action: "UPDATE_HOMEPAGE_SETTINGS",
        entity: "PlatformSetting",
        entityId: "homepage_settings",
        details: `হোমপেজ ভিডিও ও কাউন্টার সেটিংস আপডেট করা হয়েছে (ম্যানুয়াল মোড: ${mockDb.settings.stats.isManual ? "অন" : "অফ"})`,
        createdAt: new Date().toISOString(),
      });
    }

    return mockDb.settings;
  }

  // --- STATS & OVERVIEWS ---
  static async getPlatformStats() {
    const totalAffiliates = mockDb.marketers.filter((m) => m.status === "APPROVED").length;
    const paidOrders = mockDb.orders.filter((o) => o.status === "PAID");
    const totalSales = paidOrders.length;
    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.price, 0);
    const totalCommissionPaid = mockDb.payouts
      .filter((p) => p.status === "PAID")
      .reduce((acc, p) => acc + p.amount, 0);
    const totalAvailableCourses = mockDb.courses.filter((c) => c.status === "PUBLISHED").length;

    const statsSettings = mockDb.settings?.stats;

    return {
      totalAffiliates,
      totalSales,
      totalRevenue,
      totalCommissionPaid,
      totalAvailableCourses,
      isManual: statsSettings?.isManual ?? false,
      manualAffiliates: statsSettings?.manualAffiliates ?? 0,
      manualSales: statsSettings?.manualSales ?? 0,
      manualCommissionPaid: statsSettings?.manualCommissionPaid ?? 0,
      manualAvailableCourses: statsSettings?.manualAvailableCourses ?? totalAvailableCourses,
    };
  }

  static async getAdminOverviewStats() {
    const paidOrders = mockDb.orders.filter((o) => o.status === "PAID");
    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.price, 0);
    const pendingPaymentsCount = mockDb.payments.filter((p) => p.status === "SUBMITTED").length;
    const pendingApplicationsCount = mockDb.applications.filter((a) => a.status === "PENDING").length;
    const pendingPayoutsCount = mockDb.payouts.filter((p) => p.status === "REQUESTED").length;
    const activeMarketersCount = mockDb.marketers.filter((m) => m.status === "APPROVED").length;

    const manualAnalytics = mockDb.settings?.dashboardAnalytics;
    const isManual = manualAnalytics?.isManual ?? false;

    const totalClicks = isManual && manualAnalytics?.totalClicks !== undefined
      ? manualAnalytics.totalClicks
      : (mockDb.marketers.reduce((acc, m) => acc + (m.totalClicks || 0), 0) + (mockDb.clicks?.length || 0));

    const totalConversions = isManual && manualAnalytics?.totalConversions !== undefined
      ? manualAnalytics.totalConversions
      : (mockDb.marketers.reduce((acc, m) => acc + (m.totalConversions || 0), 0) || paidOrders.length);

    const totalCommissionGenerated = mockDb.commissions.reduce((acc, c) => acc + c.amount, 0);

    return {
      totalRevenue,
      totalOrders: mockDb.orders.length,
      paidOrdersCount: paidOrders.length,
      pendingPaymentsCount,
      pendingApplicationsCount,
      pendingPayoutsCount,
      activeMarketersCount,
      totalClicks,
      totalConversions,
      totalCommissionGenerated,
    };
  }

  static async getAdminAnalyticsData(): Promise<AdminAnalyticsData> {
    const courses = mockDb.courses;
    const paidOrders = mockDb.orders.filter((o) => o.status === "PAID");

    // 1. Calculate Top Selling Courses dynamically strictly from real paid orders
    const courseStats: { [courseId: string]: { sales: number; revenue: number; affiliateSales: number } } = {};
    for (const c of courses) {
      courseStats[c.id] = { sales: 0, revenue: 0, affiliateSales: 0 };
    }

    // Incorporate real-time paid orders from database
    for (const order of paidOrders) {
      if (!courseStats[order.courseId]) {
        courseStats[order.courseId] = { sales: 0, revenue: 0, affiliateSales: 0 };
      }
      courseStats[order.courseId].sales += 1;
      courseStats[order.courseId].revenue += order.price;
      if (order.marketerId) {
        courseStats[order.courseId].affiliateSales += 1;
      }
    }

    const courseGradients = [
      "from-blue-600 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-purple-500 to-violet-600",
      "from-amber-500 to-orange-600",
      "from-rose-500 to-red-600",
      "from-cyan-500 to-blue-600",
    ];

    const mappedCourses = courses.map((c) => {
      const stat = courseStats[c.id] || { sales: 0, revenue: 0, affiliateSales: 0 };
      return {
        id: c.id,
        name: c.titleBn || c.title,
        category: c.categoryNameBn || "প্রফেশনাল",
        sales: stat.sales,
        revenue: stat.revenue,
        affiliateSales: stat.affiliateSales,
      };
    });

    // Sort descending by revenue, then by sales
    mappedCourses.sort((a, b) => b.revenue - a.revenue || b.sales - a.sales);

    const maxCourseRev = Math.max(...mappedCourses.map((c) => c.revenue), 0);
    const topCourses: TopCourseItem[] = mappedCourses.slice(0, 5).map((c, idx) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      sales: c.sales,
      revenue: c.revenue,
      percentage: maxCourseRev > 0 ? Math.min(100, Math.round((c.revenue / maxCourseRev) * 100)) : 0,
      color: courseGradients[idx % courseGradients.length],
    }));

    const top1 = mappedCourses[0];
    const affiliateShare = (top1 && top1.sales > 0) ? Math.round((top1.affiliateSales / top1.sales) * 100) : 0;

    const bestPerformer = (top1 && top1.sales > 0)
      ? {
          title: top1.name.length > 25 ? top1.name.substring(0, 22) + "..." : top1.name,
          sales: top1.sales,
          affiliateShare,
        }
      : {
          title: top1 ? (top1.name.length > 25 ? top1.name.substring(0, 22) + "..." : top1.name) : "—",
          sales: 0,
          affiliateShare: 0,
        };

    // 2. Dynamic Chart Datasets for 7d, 30d, year
    const manualAnalytics = mockDb.settings?.dashboardAnalytics;
    const isManual = manualAnalytics?.isManual ?? false;

    if (!mockDb.analyticsHistory) {
      mockDb.analyticsHistory = {
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

    let points7d = mockDb.analyticsHistory["7d"].map((pt) => ({ ...pt }));

    let base7dTurnover: number;
    let base7dPayout: number;
    let base7dOrders: number;

    if (isManual && manualAnalytics?.summaryTurnover7d !== undefined) {
      base7dTurnover = manualAnalytics.summaryTurnover7d;
      base7dPayout = manualAnalytics.summaryPayout7d ?? Math.round(base7dTurnover * 0.2);
      base7dOrders = manualAnalytics.summaryOrders7d ?? (base7dTurnover > 0 ? Math.max(1, Math.round(base7dTurnover / 2000)) : 0);

      const curSum = points7d.reduce((s, p) => s + p.revenue, 0);
      if (curSum > 0) {
        const scale = base7dTurnover / curSum;
        points7d = points7d.map((p) => ({
          ...p,
          revenue: Math.round(p.revenue * scale),
          commission: Math.round(p.commission * scale),
          orders: Math.max(1, Math.round(p.orders * scale)),
        }));
      }
    } else {
      base7dTurnover = points7d.reduce((s, p) => s + p.revenue, 0);
      base7dPayout = points7d.reduce((s, p) => s + p.commission, 0);
      base7dOrders = points7d.reduce((s, p) => s + p.orders, 0);
    }

    const points30d: AdminChartPoint[] = [
      {
        label: "সপ্তাহ ১",
        revenue: points7d[0].revenue + points7d[1].revenue,
        commission: points7d[0].commission + points7d[1].commission,
        orders: points7d[0].orders + points7d[1].orders,
      },
      {
        label: "সপ্তাহ ২",
        revenue: points7d[2].revenue + points7d[3].revenue,
        commission: points7d[2].commission + points7d[3].commission,
        orders: points7d[2].orders + points7d[3].orders,
      },
      {
        label: "সপ্তাহ ৩",
        revenue: points7d[4].revenue,
        commission: points7d[4].commission,
        orders: points7d[4].orders,
      },
      {
        label: "সপ্তাহ ৪",
        revenue: points7d[5].revenue + points7d[6].revenue,
        commission: points7d[5].commission + points7d[6].commission,
        orders: points7d[5].orders + points7d[6].orders,
      },
    ];

    const base30dTurnover = points30d.reduce((s, p) => s + p.revenue, 0);
    const base30dPayout = points30d.reduce((s, p) => s + p.commission, 0);
    const base30dOrders = points30d.reduce((s, p) => s + p.orders, 0);

    const pointsYear: AdminChartPoint[] = [
      {
        label: "জানু-মার্চ",
        revenue: Math.round(base30dTurnover * 0.78),
        commission: Math.round(base30dPayout * 0.78),
        orders: Math.round(base30dOrders * 0.77),
      },
      {
        label: "এপ্রিল-জুন",
        revenue: Math.round(base30dTurnover * 1.17),
        commission: Math.round(base30dPayout * 1.17),
        orders: Math.round(base30dOrders * 1.19),
      },
      {
        label: "জুলাই-সেপ্টে",
        revenue: Math.round(base30dTurnover * 1.41),
        commission: Math.round(base30dPayout * 1.41),
        orders: Math.round(base30dOrders * 1.44),
      },
      {
        label: "অক্টো-ডিসে",
        revenue: Math.round(base30dTurnover * 1.55),
        commission: Math.round(base30dPayout * 1.55),
        orders: Math.round(base30dOrders * 1.58),
      },
    ];

    const baseYearTurnover = pointsYear.reduce((s, p) => s + p.revenue, 0);
    const baseYearPayout = pointsYear.reduce((s, p) => s + p.commission, 0);
    const baseYearOrders = pointsYear.reduce((s, p) => s + p.orders, 0);

    const chartDatasets = {
      "7d": {
        summaryTurnover: base7dTurnover,
        summaryPayout: base7dPayout,
        summaryOrders: base7dOrders,
        growthText: base7dTurnover > 0 ? "+১৮.২% প্রবৃদ্ধি" : "০% প্রবৃদ্ধি",
        payoutNote: `গড় ${base7dTurnover > 0 ? Math.round((base7dPayout / base7dTurnover) * 100) : 20}% কমিশন বণ্টন`,
        conversionRateText: `কনভার্সন রেট ${base7dOrders > 0 ? "৪.৮%" : "০.০%"}`,
        points: points7d,
      },
      "30d": {
        summaryTurnover: base30dTurnover,
        summaryPayout: base30dPayout,
        summaryOrders: base30dOrders,
        growthText: base30dTurnover > 0 ? "+২৪.৫% প্রবৃদ্ধি" : "০% প্রবৃদ্ধি",
        payoutNote: `গড় ${base30dTurnover > 0 ? Math.round((base30dPayout / base30dTurnover) * 100) : 20}% কমিশন বণ্টন`,
        conversionRateText: `কনভার্সন রেট ${base30dOrders > 0 ? "৫.২%" : "০.০%"}`,
        points: points30d,
      },
      year: {
        summaryTurnover: baseYearTurnover,
        summaryPayout: baseYearPayout,
        summaryOrders: baseYearOrders,
        growthText: baseYearTurnover > 0 ? "+৫২.০% বার্ষিক প্রবৃদ্ধি" : "০% প্রবৃদ্ধি",
        payoutNote: `গড় ${baseYearTurnover > 0 ? Math.round((baseYearPayout / baseYearTurnover) * 100) : 20}% কমিশন বণ্টন`,
        conversionRateText: `কনভার্সন রেট ${baseYearOrders > 0 ? "৫.৫%" : "০.০%"}`,
        points: pointsYear,
      },
    };

    // 3. Traffic Clicks & Conversion Performance
    const totalClicks = isManual && manualAnalytics?.totalClicks !== undefined
      ? manualAnalytics.totalClicks
      : (mockDb.marketers.reduce((acc, m) => acc + (m.totalClicks || 0), 0) + (mockDb.clicks?.length || 0));

    const totalConversions = isManual && manualAnalytics?.totalConversions !== undefined
      ? manualAnalytics.totalConversions
      : (mockDb.marketers.reduce((acc, m) => acc + (m.totalConversions || 0), 0) || paidOrders.length);

    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0.0";

    return {
      chartDatasets,
      topCourses,
      bestPerformer,
      totalClicks,
      totalConversions,
      conversionRate,
    };
  }

  static async getStudentDashboardData(userId: string) {
    const enrollments = mockDb.enrollments.filter((e) => e.customerId === userId);
    const enrolledCourses = enrollments.map((e) => {
      const course = mockDb.courses.find((c) => c.id === e.courseId);
      return {
        ...course,
        enrolledAt: e.enrolledAt,
      };
    }).filter(Boolean);

    const orders = mockDb.orders.filter((o) => o.customerId === userId);
    const orderIds = orders.map((o) => o.id);
    const payments = mockDb.payments.filter((p) => orderIds.includes(p.orderId));

    return {
      enrolledCourses,
      orders,
      payments,
    };
  }

  // --- TESTIMONIALS ---
  static async getTestimonials(onlyPublished = false): Promise<MockTestimonial[]> {
    if (!mockDb.testimonials) {
      mockDb.testimonials = [];
    }
    const list = onlyPublished
      ? mockDb.testimonials.filter((t) => t.isPublished !== false)
      : mockDb.testimonials;

    return [...list].sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
  }

  static async getTestimonialById(id: string): Promise<MockTestimonial | null> {
    return mockDb.testimonials?.find((t) => t.id === id) || null;
  }

  static async createTestimonial(
    data: {
      name: string;
      avatar?: string;
      roleBn: string;
      quoteBn: string;
      earningsText?: string;
      rating?: number;
      isPublished?: boolean;
      sortOrder?: number;
    },
    actorEmail?: string
  ): Promise<MockTestimonial> {
    if (!mockDb.testimonials) {
      mockDb.testimonials = [];
    }

    const newTestimonial: MockTestimonial = {
      id: `t_${Date.now()}`,
      name: (data.name || "").trim(),
      avatar:
        (data.avatar || "").trim() ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      roleBn: (data.roleBn || "").trim(),
      quoteBn: (data.quoteBn || "").trim(),
      earningsText: (data.earningsText || "").trim() || undefined,
      rating: Number(data.rating) || 5,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      sortOrder: Number(data.sortOrder) || mockDb.testimonials.length + 1,
    };

    mockDb.testimonials.unshift(newTestimonial);

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: actorEmail || "admin@skilljobs.com",
      action: "TESTIMONIAL_CREATED",
      entity: "Testimonial",
      entityId: newTestimonial.id,
      details: `নতুন রিভিউ/টেস্টিমোনিয়াল যুক্ত করা হয়েছে: ${newTestimonial.name} (${newTestimonial.roleBn})`,
      createdAt: new Date().toISOString(),
    });

    return newTestimonial;
  }

  static async updateTestimonial(
    id: string,
    data: Partial<MockTestimonial>,
    actorEmail?: string
  ): Promise<MockTestimonial> {
    if (!mockDb.testimonials) {
      mockDb.testimonials = [];
    }

    const index = mockDb.testimonials.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error("রিভিউটি পাওয়া যায়নি।");
    }

    const current = mockDb.testimonials[index];
    const updated: MockTestimonial = {
      ...current,
      name: data.name !== undefined ? data.name.trim() : current.name,
      avatar: data.avatar !== undefined ? data.avatar.trim() : current.avatar,
      roleBn: data.roleBn !== undefined ? data.roleBn.trim() : current.roleBn,
      quoteBn: data.quoteBn !== undefined ? data.quoteBn.trim() : current.quoteBn,
      earningsText:
        data.earningsText !== undefined ? data.earningsText.trim() || undefined : current.earningsText,
      rating: data.rating !== undefined ? Number(data.rating) : current.rating,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : current.isPublished,
      sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : current.sortOrder,
    };

    mockDb.testimonials[index] = updated;

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: actorEmail || "admin@skilljobs.com",
      action: "TESTIMONIAL_UPDATED",
      entity: "Testimonial",
      entityId: id,
      details: `রিভিউ/টেস্টিমোনিয়াল আপডেট করা হয়েছে: ${updated.name}`,
      createdAt: new Date().toISOString(),
    });

    return updated;
  }

  static async deleteTestimonial(id: string, actorEmail?: string): Promise<boolean> {
    if (!mockDb.testimonials) {
      mockDb.testimonials = [];
    }

    const index = mockDb.testimonials.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error("রিভিউটি পাওয়া যায়নি।");
    }

    const [deleted] = mockDb.testimonials.splice(index, 1);

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: actorEmail || "admin@skilljobs.com",
      action: "TESTIMONIAL_DELETED",
      entity: "Testimonial",
      entityId: id,
      details: `রিভিউ/টেস্টিমোনিয়াল মুছে ফেলা হয়েছে: ${deleted.name}`,
      createdAt: new Date().toISOString(),
    });

    return true;
  }
}
