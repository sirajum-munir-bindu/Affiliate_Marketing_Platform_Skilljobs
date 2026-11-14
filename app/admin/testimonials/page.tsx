import { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { TestimonialsManagementClient } from "./TestimonialsManagementClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "টপ অ্যাফিলিয়েট অভিজ্ঞতা ও টেস্টিমোনিয়াল ম্যানেজমেন্ট | Skilljobs Admin",
};

export default async function AdminTestimonialsPage() {
  await requireRole(["ADMIN"]);
  const testimonials = await DataService.getTestimonials(false);

  return <TestimonialsManagementClient initialTestimonials={testimonials} />;
}
