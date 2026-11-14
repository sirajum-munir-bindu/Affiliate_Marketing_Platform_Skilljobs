import { Users, ShoppingBag, Banknote, BookOpen } from "lucide-react";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";

interface StatsProps {
  stats: {
    totalAffiliates: number;
    totalSales: number;
    totalRevenue: number;
    totalCommissionPaid: number;
    totalAvailableCourses: number;
    isManual?: boolean;
    manualAffiliates?: number;
    manualSales?: number;
    manualCommissionPaid?: number;
    manualAvailableCourses?: number;
  };
}

export function StatsCounter({ stats }: StatsProps) {
  const isManual = Boolean(stats?.isManual);
  const affiliates = isManual && stats?.manualAffiliates !== undefined ? stats.manualAffiliates : stats?.totalAffiliates;
  const sales = isManual && stats?.manualSales !== undefined ? stats.manualSales : stats?.totalSales;
  const commission = isManual && stats?.manualCommissionPaid !== undefined ? stats.manualCommissionPaid : stats?.totalCommissionPaid;
  const courses = isManual && stats?.manualAvailableCourses !== undefined ? stats.manualAvailableCourses : stats?.totalAvailableCourses;

  const items = [
    {
      label: "সক্রিয় অ্যাফিলিয়েট",
      value: formatBnNumber(affiliates ?? 0) + (Number(affiliates || 0) > 0 ? "+" : ""),
      icon: Users,
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
    },
    {
      label: "সফল কোর্স বিক্রি",
      value: formatBnNumber(sales ?? 0) + (Number(sales || 0) > 0 ? "+" : ""),
      icon: ShoppingBag,
      color: "text-[#E53945]",
      bg: "bg-red-50",
    },
    {
      label: "মোট কমিশন প্রদান",
      value: formatBDT(commission ?? 0),
      icon: Banknote,
      color: "text-[#16A34A]",
      bg: "bg-emerald-50",
    },
    {
      label: "উপলব্ধ প্রফেশনাল কোর্স",
      value: formatBnNumber(courses ?? 0) + " টি",
      icon: BookOpen,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <section className="relative z-10 -mt-6 sm:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 p-1.5 sm:p-2 rounded-xl transition-all"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-xs sm:shadow-sm`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-xl lg:text-2xl font-black text-[#172033] tracking-tight truncate">
                    {item.value}
                  </div>
                  <div className="text-[11px] sm:text-xs lg:text-sm font-medium text-[#475569] mt-0.5 line-clamp-1 sm:line-clamp-none">
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
