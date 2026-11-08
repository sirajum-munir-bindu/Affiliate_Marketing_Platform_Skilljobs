import { Navbar } from "@/components/public/Navbar";
import { Hero } from "@/components/public/Hero";
import { StatsCounter } from "@/components/public/StatsCounter";
import { FeaturedCourses } from "@/components/public/FeaturedCourses";
import { DashboardPreview } from "@/components/public/DashboardPreview";
import { TestimonialsSection } from "@/components/public/TestimonialsSection";
import { Footer } from "@/components/public/Footer";
import { DataService } from "@/lib/services/data-service";

export const revalidate = 60; // ISR 60s

export default async function HomePage() {
  const stats = await DataService.getPlatformStats();
  const courses = await DataService.getCourses(true);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsCounter stats={stats} />
        <FeaturedCourses courses={courses} />
        <DashboardPreview />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
