export const dynamic = "force-dynamic";
import { getClans } from "@/lib/queries";
import ClansClient from "./ClansClient";

export default async function ClansPage() {
  const clans = await getClans();
  return <ClansClient initialClans={(clans || []).filter(Boolean) as any[]} currentUser={null} />;
}
