import { Users, ShoppingBag, Banknote, BookOpen } from "lucide-react";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";

interface StatsProps {
  stats: {
    totalAffiliates: number;
    totalSales: number;
    totalRevenue: number;
    totalCommissionPaid: number;
    totalAvailableCourses: number;
  };
}

export function StatsCounter({ stats }: StatsProps) {
  const items = [
    {
      label: "সক্রিয় অ্যাফিলিয়েট",
      value: formatBnNumber(stats.totalAffiliates || 120) + "+",
      icon: Users,
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
    },
    {
      label: "সফল কোর্স বিক্রি",
      value: formatBnNumber(stats.totalSales || 450) + "+",
      icon: ShoppingBag,
      color: "text-[#E53945]",
      bg: "bg-red-50",
    },
    {
      label: "মোট কমিশন প্রদান",
      value: formatBDT(stats.totalCommissionPaid || 68000),
      icon: Banknote,
      color: "text-[#16A34A]",
      bg: "bg-emerald-50",
    },
    {
      label: "উপলব্ধ প্রফেশনাল কোর্স",
      value: formatBnNumber(stats.totalAvailableCourses || 4) + " টি",
      icon: BookOpen,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <section className="relative z-10 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-6 sm:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 p-2 rounded-xl transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-[#475569] mt-0.5">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
