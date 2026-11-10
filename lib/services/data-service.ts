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
} from "../db/mock-data";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "../affiliate/tracking";

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
      instructor: data.instructor?.name?.trim()
        ? {
            name: data.instructor.name.trim(),
            avatar:
              data.instructor.avatar?.trim() ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
            designation: data.instructor.designation?.trim() || "কোর্স ইন্সট্রাক্টর",
            instructorType: data.instructor.instructorType === "CO" ? "CO" : "LEAD",
            instructorTypeBn:
              data.instructor.instructorTypeBn?.trim() ||
              (data.instructor.instructorType === "CO" ? "কো-ইন্সট্রাক্টর" : "লিড ইন্সট্রাক্টর"),
            description: data.instructor.description?.trim() || "",
          }
        : undefined,
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
      instructor:
        data.instructor !== undefined
          ? data.instructor?.name?.trim()
            ? {
                name: data.instructor.name.trim(),
                avatar:
                  data.instructor.avatar?.trim() ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                designation: data.instructor.designation?.trim() || "কোর্স ইন্সট্রাক্টর",
                instructorType: data.instructor.instructorType === "CO" ? "CO" : "LEAD",
                instructorTypeBn:
                  data.instructor.instructorTypeBn?.trim() ||
                  (data.instructor.instructorType === "CO" ? "কো-ইন্সট্রাক্টর" : "লিড ইন্সট্রাক্টর"),
                description: data.instructor.description?.trim() || "",
              }
            : undefined
          : mockDb.courses[courseIndex].instructor,
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

    app.status = "APPROVED";

    // Update user role to AFFILIATE
    const user = mockDb.users.find((u) => u.id === app.userId);
    if (user) {
      user.role = "AFFILIATE";
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

  // --- ORDERS & BKASH PAYMENTS ---
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
  }) {
    const order = mockDb.orders.find((o) => o.id === data.orderId);
    if (!order) throw new Error("অর্ডারটি পাওয়া যায়নি");

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

    const admin = mockDb.users.find((u) => u.email === adminEmail);

    // 1. Mark payment as approved
    payment.status = "APPROVED";
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

    // 5. Write Audit Log
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

  // --- COMMISSIONS & PAYOUTS ---
  static async getMarketerCommissions(marketerId: string) {
    return mockDb.commissions.filter((c) => c.marketerId === marketerId);
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

  static async completePayout(payoutId: string, reference: string, adminEmail: string) {
    const payout = mockDb.payouts.find((p) => p.id === payoutId);
    if (!payout) throw new Error("Payout not found");
    if (payout.status === "PAID") throw new Error("Payout already settled");

    const marketer = mockDb.marketers.find((m) => m.id === payout.marketerId);
    if (marketer) {
      marketer.pendingBalance = Math.max(0, marketer.pendingBalance - payout.amount);
      marketer.paidEarnings += payout.amount;
    }

    payout.status = "PAID";
    payout.transactionReference = reference;
    payout.processedAt = new Date().toISOString();

    mockDb.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorEmail: adminEmail,
      action: "PAYOUT_COMPLETED",
      entity: "Payout",
      entityId: payout.id,
      details: `পে-আউট ${payout.payoutNumber} (৳${payout.amount}) সম্পন্ন করা হয়েছে। রেফারেন্স: ${reference}`,
      createdAt: new Date().toISOString(),
    });

    return payout;
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

    return {
      totalAffiliates,
      totalSales,
      totalRevenue,
      totalCommissionPaid,
      totalAvailableCourses,
    };
  }

  static async getAdminOverviewStats() {
    const paidOrders = mockDb.orders.filter((o) => o.status === "PAID");
    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.price, 0);
    const pendingPaymentsCount = mockDb.payments.filter((p) => p.status === "SUBMITTED").length;
    const pendingApplicationsCount = mockDb.applications.filter((a) => a.status === "PENDING").length;
    const pendingPayoutsCount = mockDb.payouts.filter((p) => p.status === "REQUESTED").length;
    const activeMarketersCount = mockDb.marketers.filter((m) => m.status === "APPROVED").length;
    const totalClicks = mockDb.marketers.reduce((acc, m) => acc + m.totalClicks, 0);
    const totalConversions = mockDb.marketers.reduce((acc, m) => acc + m.totalConversions, 0);
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
}
