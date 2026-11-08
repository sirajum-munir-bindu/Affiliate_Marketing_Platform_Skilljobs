import { mockDb, MockCourse, MockOrder, MockPayment, MockCommission, MockPayout } from "../db/mock-data";
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

  static async createCourse(data: Partial<MockCourse>) {
    const newCourse: MockCourse = {
      id: `crs_${Date.now()}`,
      title: data.title || "New Course",
      titleBn: data.titleBn || "নতুন কোর্স",
      slug: data.slug || `course-${Date.now()}`,
      summaryBn: data.summaryBn || "",
      descriptionBn: data.descriptionBn || "",
      thumbnail: data.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      price: data.price || 2000,
      originalPrice: data.originalPrice || 4000,
      commissionRate: data.commissionRate || 20,
      isAffiliateEligible: data.isAffiliateEligible ?? true,
      status: data.status || "PUBLISHED",
      categorySlug: data.categorySlug || "web-development",
      categoryNameBn: data.categoryNameBn || "ওয়েব ডেভেলপমেন্ট",
      duration: data.duration || "২০+ ঘণ্টা",
      totalLessons: data.totalLessons || 20,
      difficulty: data.difficulty || "সকল স্তরের জন্য",
      featured: data.featured || false,
      modules: [],
    };
    mockDb.courses.unshift(newCourse);
    return newCourse;
  }

  static async updateCourse(id: string, data: Partial<MockCourse>) {
    const courseIndex = mockDb.courses.findIndex((c) => c.id === id);
    if (courseIndex === -1) throw new Error("Course not found");
    mockDb.courses[courseIndex] = { ...mockDb.courses[courseIndex], ...data };
    return mockDb.courses[courseIndex];
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

  static async getAllMarketers() {
    return mockDb.marketers.map((m) => {
      const user = mockDb.users.find((u) => u.id === m.userId);
      return {
        ...m,
        userName: user?.name || "Unknown",
        userEmail: user?.email || "",
        userPhone: user?.phone || "",
      };
    });
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
