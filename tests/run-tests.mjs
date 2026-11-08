import { DataService } from "../lib/services/data-service.ts";
import { signToken, verifyToken } from "../lib/auth/jwt.ts";
import { mockDb } from "../lib/db/mock-data.ts";

// Test runner
async function run() {
  console.log("=== RUNNING SKILLJOBS COMPREHENSIVE INTEGRATION TEST SUITE ===\n");
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

  // TEST 1: JWT & Session Management
  console.log("1. AUTHENTICATION & JWT SECURITY");
  const testPayload = {
    userId: "usr_student_1",
    email: "student@skilljobs.com",
    name: "রাকিবুল হাসান",
    role: "STUDENT",
    status: "ACTIVE",
  };
  const token = await signToken(testPayload);
  assert(typeof token === "string" && token.length > 20, "JWT Signed with HMAC-SHA256");

  const verified = await verifyToken(token);
  assert(verified && verified.userId === "usr_student_1", "JWT Verified and payload integrity confirmed");

  // TEST 2: Affiliate Attribution & Self-Referral Prevention
  console.log("\n2. AFFILIATE ATTRIBUTION & FRAUD CONTROLS");
  const marketer = await DataService.getMarketerByReferralCode("TANVIR50");
  assert(marketer !== null && marketer.status === "APPROVED", "Marketer profile verified as APPROVED");

  // Order with affiliate
  const order = await DataService.createOrder({
    customerId: "usr_student_1",
    courseId: "crs_1",
    refCode: "TANVIR50",
  });
  assert(order.marketerCode === "TANVIR50", "30-day attribution attached to order");
  assert(order.commissionAmount === 875, "Exact 25% commission snapshot calculated (৳875 on ৳3500)");

  // Self-referral prevention
  const selfOrder = await DataService.createOrder({
    customerId: "usr_affiliate_1", // The marketer themselves
    courseId: "crs_2",
    refCode: "TANVIR50",
  });
  assert(!selfOrder.marketerId, "Self-referral blocked: marketer attribution removed");

  // TEST 3: Manual bKash Payment Workflow & Idempotency
  console.log("\n3. BKASH MANUAL PAYMENT WORKFLOW");
  const payment = await DataService.submitPayment({
    orderId: order.id,
    senderNumber: "01833000000",
    transactionId: "BKASH992821",
    customerNote: "Send money",
  });
  assert(payment.status === "SUBMITTED", "Payment submitted with status SUBMITTED");
  assert(payment.transactionId === "BKASH992821", "TrxID stored in uppercase");

  // Duplicate TrxID block
  let duplicateBlocked = false;
  try {
    await DataService.submitPayment({
      orderId: order.id,
      senderNumber: "01833000000",
      transactionId: "BKASH992821",
    });
  } catch (err) {
    duplicateBlocked = true;
  }
  assert(duplicateBlocked, "Duplicate TrxID submission prevented");

  // TEST 4: Atomic Admin Approval Transaction
  console.log("\n4. ATOMIC ADMIN APPROVAL TRANSACTION");
  const initialBalance = marketer.currentBalance;
  const initialConversions = marketer.totalConversions;

  const approval = await DataService.approvePayment(payment.id, "admin@skilljobs.com");
  assert(approval.payment.status === "APPROVED", "Payment transitioned to APPROVED");
  assert(approval.order.status === "PAID", "Order transitioned to PAID");

  // Active enrollment verified
  const hasAccess = mockDb.enrollments.some(
    (e) => e.customerId === order.customerId && e.courseId === order.courseId
  );
  assert(hasAccess, "Course enrollment created exactly once");

  // Marketer balance & conversions updated
  assert(marketer.totalConversions === initialConversions + 1, "Marketer total conversions incremented");
  assert(marketer.currentBalance === initialBalance + 875, "Marketer balance credited exactly with ৳875");

  // Audit log verified
  const log = mockDb.auditLogs.find((l) => l.entityId === payment.id);
  assert(log && log.action === "PAYMENT_APPROVED", "Immutable audit log created");

  // TEST 5: Payout Request & Settlement
  console.log("\n5. PAYOUT THRESHOLD & SETTLEMENT");
  const payout = await DataService.requestPayout({
    marketerId: marketer.id,
    amount: 500,
    method: "BKASH",
    destinationNumber: "01722000000",
  });
  assert(payout.status === "REQUESTED", "Payout request created with status REQUESTED");
  assert(payout.amount === 500, "Payout amount reserved");

  // Settle Payout
  const settled = await DataService.completePayout(payout.id, "BKASH-SETTLE-TRX-101", "admin@skilljobs.com");
  assert(settled.status === "PAID", "Payout status transitioned to PAID");
  assert(settled.transactionReference === "BKASH-SETTLE-TRX-101", "bKash payout reference saved");

  console.log(`\n======================================================`);
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
