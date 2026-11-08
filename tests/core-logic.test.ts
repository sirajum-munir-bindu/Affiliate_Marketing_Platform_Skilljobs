import { DataService } from "../lib/services/data-service";
import { signToken, verifyToken } from "../lib/auth/jwt";
import { mockDb } from "../lib/db/mock-data";

async function runTests() {
  console.log("=== RUNNING CORE INTEGRATION & BUSINESS LOGIC TESTS ===\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. JWT & Session Tests
  console.log("--- 1. Authentication & JWT Tokens ---");
  const testPayload = {
    userId: "usr_test_123",
    email: "test@skilljobs.com",
    name: "Test User",
    role: "STUDENT" as const,
    status: "ACTIVE" as const,
  };
  const token = await signToken(testPayload);
  assert(typeof token === "string" && token.length > 20, "JWT token signed successfully");

  const verified = await verifyToken(token);
  assert(verified?.userId === "usr_test_123" && verified?.role === "STUDENT", "JWT token verified and payload extracted");

  // 2. Affiliate Tracking & Self-Referral Prevention
  console.log("\n--- 2. Affiliate Attribution & Self-Referral Prevention ---");
  const marketer = await DataService.getMarketerByReferralCode("TANVIR50");
  assert(marketer !== null && marketer?.referralCode === "TANVIR50", "Marketer found by referral code TANVIR50");

  // Order with affiliate attribution
  const orderWithAttribution = await DataService.createOrder({
    customerId: "usr_student_1",
    courseId: "crs_1",
    refCode: "TANVIR50",
  });
  assert(orderWithAttribution.marketerCode === "TANVIR50", "Attribution correctly attached to order");
  assert(orderWithAttribution.commissionAmount > 0, "Commission calculated based on course rate snapshot");

  // Self-referral prevention check
  const selfReferralOrder = await DataService.createOrder({
    customerId: "usr_affiliate_1", // The marketer themselves
    courseId: "crs_2",
    refCode: "TANVIR50",
  });
  assert(selfReferralOrder.marketerId === undefined, "Self-referral successfully blocked: marketerId stripped");

  // 3. Commerce & bKash Manual Payment Submission
  console.log("\n--- 3. Commerce & Manual bKash Payment Submission ---");
  const payment = await DataService.submitPayment({
    orderId: orderWithAttribution.id,
    senderNumber: "01833000000",
    transactionId: "TESTTRX999",
    customerNote: "Test payment note",
  });
  assert(payment.status === "SUBMITTED", "Payment status is SUBMITTED");
  assert(payment.transactionId === "TESTTRX999", "Transaction ID stored in uppercase");

  // Duplicate TrxID rejection check
  let duplicateRejected = false;
  try {
    await DataService.submitPayment({
      orderId: orderWithAttribution.id,
      senderNumber: "01833000000",
      transactionId: "TESTTRX999",
    });
  } catch (err: any) {
    duplicateRejected = err.message.includes("ইতিমধ্যে ব্যবহার করা হয়েছে");
  }
  assert(duplicateRejected, "Duplicate TrxID detected and rejected");

  // 4. Atomic Payment Approval Transaction
  console.log("\n--- 4. Atomic Payment Approval Transaction ---");
  const beforeBalance = marketer!.currentBalance;
  const beforeConversions = marketer!.totalConversions;

  const approvalResult = await DataService.approvePayment(payment.id, "admin@skilljobs.com");
  assert(approvalResult.payment.status === "APPROVED", "Payment marked APPROVED");
  assert(approvalResult.order.status === "PAID", "Order marked PAID");

  // Check enrollment created
  const hasEnrollment = mockDb.enrollments.some(
    (e) => e.customerId === orderWithAttribution.customerId && e.courseId === orderWithAttribution.courseId
  );
  assert(hasEnrollment, "Student enrollment created exactly once");

  // Check marketer commission and balance update
  assert(marketer!.totalConversions === beforeConversions + 1, "Marketer conversion count incremented");
  assert(marketer!.currentBalance > beforeBalance, "Marketer balance credited with commission snapshot");

  // Check audit log
  const auditEntry = mockDb.auditLogs.find((l) => l.entityId === payment.id);
  assert(auditEntry !== undefined && auditEntry.action === "PAYMENT_APPROVED", "Audit log created with actor and action");

  // 5. Payout Request & Settlement
  console.log("\n--- 5. Payout Request & Settlement ---");
  const payoutReq = await DataService.requestPayout({
    marketerId: marketer!.id,
    amount: 500,
    method: "BKASH",
    destinationNumber: "01722000000",
  });
  assert(payoutReq.status === "REQUESTED", "Payout status is REQUESTED");
  assert(payoutReq.amount === 500, "Payout amount reserved from balance");

  // Admin completes payout
  const settled = await DataService.completePayout(payoutReq.id, "BKASH-SETTLE-456", "admin@skilljobs.com");
  assert(settled.status === "PAID", "Payout settled and marked PAID");
  assert(settled.transactionReference === "BKASH-SETTLE-456", "Transaction reference recorded");

  console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
