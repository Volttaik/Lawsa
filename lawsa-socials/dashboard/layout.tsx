import { SessionProvider } from "@/components/SessionProvider";
import { FetchInterceptor } from "@/components/FetchInterceptor";
import LayoutShell from "./LayoutShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider isLoggedIn={false}>
      <FetchInterceptor />
      <LayoutShell user={null}>{children}</LayoutShell>
    </SessionProvider>
  );
}
