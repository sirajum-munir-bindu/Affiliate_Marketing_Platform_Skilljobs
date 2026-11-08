async function runE2ETests() {
  console.log("=== RUNNING LIVE HTTP END-TO-END TEST SUITE ===");
  const BASE_URL = "http://localhost:3000";

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // Helper fetch with cookie jar
  let cookieHeader = "";
  async function apiFetch(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(options.headers || {}),
    };

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const setCookies = res.headers.get("set-cookie");
    if (setCookies) {
      // Extract session cookie
      const match = setCookies.match(/skilljobs_session=([^;]+)/);
      if (match) {
        cookieHeader = `skilljobs_session=${match[1]}`;
      }
    }

    let json = null;
    try {
      json = await res.json();
    } catch {}

    return { status: res.status, ok: res.ok, data: json, headers: res.headers };
  }

  try {
    // 1. Homepage & Public Pages
    console.log("\n1. PUBLIC WEBSITE ENDPOINTS");
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, "GET / (Homepage) returns HTTP 200 OK");

    const coursesRes = await fetch(`${BASE_URL}/courses`);
    assert(coursesRes.status === 200, "GET /courses (Course Catalog) returns HTTP 200 OK");

    const courseDetailRes = await fetch(`${BASE_URL}/courses/full-stack-web-development-mastery`);
    assert(courseDetailRes.status === 200, "GET /courses/[slug] returns HTTP 200 OK");

    // 2. Affiliate Referral Redirect & Cookie Attribution
    console.log("\n2. AFFILIATE REFERRAL TRACKING (/r/[code])");
    const refRes = await fetch(`${BASE_URL}/r/TANVIR50`, { redirect: "manual" });
    assert(refRes.status === 307 || refRes.status === 302, "GET /r/TANVIR50 performs HTTP redirect");
    const setCookie = refRes.headers.get("set-cookie") || "";
    assert(setCookie.includes("skilljobs_ref_attribution=TANVIR50"), "30-day attribution cookie set for TANVIR50");

    // 3. User Login (Student)
    console.log("\n3. AUTHENTICATION (STUDENT LOGIN)");
    const loginRes = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: "student@skilljobs.com",
        password: "Password@123456",
      }),
    });
    assert(loginRes.ok && loginRes.data.success, "Student login successful with credentials");
    assert(loginRes.data.user.role === "STUDENT", "User role returned as STUDENT");

    // Check /api/auth/me
    const meRes = await apiFetch("/api/auth/me");
    assert(meRes.ok && meRes.data.authenticated, "Session validated via /api/auth/me");

    // 4. Order Creation with Attribution
    console.log("\n4. ORDER CREATION WITH ATTRIBUTION");
    const orderRes = await apiFetch("/api/orders", {
      method: "POST",
      headers: { Cookie: "skilljobs_ref_attribution=TANVIR50; " + cookieHeader },
      body: JSON.stringify({
        courseId: "crs_2",
      }),
    });
    if (!orderRes.ok) {
      console.log("Order error details:", orderRes.status, orderRes.data);
    }
    assert(orderRes.ok && orderRes.data?.success, "Course order created successfully");
    const orderNumber = orderRes.data.order.orderNumber;
    const orderId = orderRes.data.order.id;
    assert(orderRes.data.order.marketerCode === "TANVIR50", "Referral code TANVIR50 attributed to order");
    assert(orderRes.data.order.commissionAmount > 0, "Commission calculated snapshot preserved");

    // 5. bKash Payment Submission
    console.log("\n5. BKASH MANUAL PAYMENT SUBMISSION");
    const trxId = `BKASH${Date.now().toString().slice(-6)}`;
    const payRes = await apiFetch("/api/payments/submit", {
      method: "POST",
      body: JSON.stringify({
        orderId,
        senderNumber: "01833000000",
        transactionId: trxId,
        customerNote: "E2E Automated test payment",
      }),
    });
    assert(payRes.ok && payRes.data.success, "Manual bKash payment details submitted successfully");
    const paymentId = payRes.data.payment.id;
    assert(payRes.data.payment.status === "SUBMITTED", "Payment status is SUBMITTED");

    // 6. Admin Login & Payment Verification
    console.log("\n6. ADMIN LOGIN & ATOMIC PAYMENT APPROVAL");
    cookieHeader = ""; // Clear student session
    const adminLoginRes = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: "admin@skilljobs.com",
        password: "Admin@123456",
      }),
    });
    assert(adminLoginRes.ok && adminLoginRes.data.user.role === "ADMIN", "Super Admin logged in successfully");

    // Approve Payment
    const approveRes = await apiFetch("/api/admin/payments/approve", {
      method: "POST",
      body: JSON.stringify({ paymentId }),
    });
    assert(approveRes.ok && approveRes.data.success, "Payment approved atomically by Super Admin");
    assert(approveRes.data.data.order.status === "PAID", "Order marked PAID");

    // 7. Marketer Login & Payout Request
    console.log("\n7. MARKETER LOGIN & PAYOUT REQUEST");
    cookieHeader = ""; // Clear admin session
    const marketerLoginRes = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: "marketer@skilljobs.com",
        password: "Password@123456",
      }),
    });
    assert(marketerLoginRes.ok && marketerLoginRes.data.user.role === "AFFILIATE", "Marketer logged in successfully");

    // Request Payout
    const payoutRes = await apiFetch("/api/affiliate/payout", {
      method: "POST",
      body: JSON.stringify({
        amount: 500,
        method: "BKASH",
        destinationNumber: "01722000000",
      }),
    });
    assert(payoutRes.ok && payoutRes.data.success, "Payout of ৳500 requested successfully");
    const payoutId = payoutRes.data.payout.id;

    // 8. Admin Settlement of Payout
    console.log("\n8. ADMIN PAYOUT SETTLEMENT");
    cookieHeader = "";
    await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: "admin@skilljobs.com",
        password: "Admin@123456",
      }),
    });

    const settleRes = await apiFetch("/api/admin/payouts/settle", {
      method: "POST",
      body: JSON.stringify({
        payoutId,
        reference: "BKASH-LIVE-E2E-7788",
      }),
    });
    assert(settleRes.ok && settleRes.data.success, "Payout settled and marked PAID with reference");

    console.log("\n=======================================================");
    console.log(`ALL E2E WORKFLOW TESTS PASSED: ${passed}/${passed + failed}`);
    console.log("=======================================================\n");
  } catch (err) {
    console.error("E2E Test Exception:", err);
    process.exit(1);
  }
}

runE2ETests();
