import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { FaqAccordion } from "@/components/public/FaqAccordion";

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <FaqAccordion />
      </main>
      <Footer />
    </div>
  );
}
