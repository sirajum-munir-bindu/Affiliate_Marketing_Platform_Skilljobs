import { DataService } from "@/lib/services/data-service";
import { OrdersTableClient } from "./OrdersTableClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await DataService.getAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          সকল অর্ডার হিস্ট্রি
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          কাস্টমারদের কোর্স অর্ডার, অ্যাফিলিয়েট রেফারেন্স ও পেমেন্ট স্ট্যাটাস।
        </p>
      </div>

      <OrdersTableClient initialOrders={orders} />
    </div>
  );
}
