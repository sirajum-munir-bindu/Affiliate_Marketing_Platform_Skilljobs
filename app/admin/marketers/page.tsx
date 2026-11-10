import { DataService } from "@/lib/services/data-service";
import { MarketerManagementClient } from "./MarketerManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminMarketersPage() {
  const marketers = await DataService.getAllMarketers();

  return <MarketerManagementClient initialMarketers={marketers} />;
}
