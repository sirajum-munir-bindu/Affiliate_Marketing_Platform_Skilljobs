import { Navbar } from "@/components/public/Navbar";
import { Hero } from "@/components/public/Hero";
import { StatsCounter } from "@/components/public/StatsCounter";
import { FeaturedCourses } from "@/components/public/FeaturedCourses";
import { DashboardPreview } from "@/components/public/DashboardPreview";
import { TestimonialsSection } from "@/components/public/TestimonialsSection";
import { Footer } from "@/components/public/Footer";
import { DataService } from "@/lib/services/data-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [stats, courses, settings, testimonials] = await Promise.all([
    DataService.getPlatformStats(),
    DataService.getCourses(true),
    DataService.getHomepageSettings(),
    DataService.getTestimonials(true),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Hero videoSettings={settings.video} />
        <StatsCounter stats={stats} />
        <FeaturedCourses courses={courses} />
        <DashboardPreview />
        <TestimonialsSection testimonials={testimonials} />
      </main>
      <Footer />
    </div>
  );
}
