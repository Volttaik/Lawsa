import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { SessionProvider } from "@/components/SessionProvider";
import { ToastProvider } from "@/components/Toast";
import LayoutShell from "@/components/LayoutShell";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import FeedPage from "@/pages/FeedPage";
import ExplorePage from "@/pages/ExplorePage";
import NotificationsPage from "@/pages/NotificationsPage";
import MessagesPage from "@/pages/MessagesPage";
import ClansPage from "@/pages/ClansPage";
import StorePage from "@/pages/StorePage";
import CustomizePage from "@/pages/CustomizePage";
import SettingsPage from "@/pages/SettingsPage";
import PremiumPage from "@/pages/PremiumPage";
import ProfilePage from "@/pages/ProfilePage";

function DashboardRoutes() {
  return (
    <LayoutShell>
      <Switch>
        <Route path="/dashboard" component={FeedPage} />
        <Route path="/dashboard/explore" component={ExplorePage} />
        <Route path="/dashboard/notifications" component={NotificationsPage} />
        <Route path="/dashboard/messages" component={MessagesPage} />
        <Route path="/dashboard/messages/:userId" component={MessagesPage} />
        <Route path="/dashboard/clans" component={ClansPage} />
        <Route path="/dashboard/store" component={StorePage} />
        <Route path="/dashboard/customize" component={CustomizePage} />
        <Route path="/dashboard/settings" component={SettingsPage} />
        <Route path="/dashboard/premium" component={PremiumPage} />
        <Route path="/dashboard/profile/:userId" component={ProfilePage} />
        <Route><Redirect to="/dashboard" /></Route>
      </Switch>
    </LayoutShell>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/dashboard" />} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard/:rest*" component={DashboardRoutes} />
      <Route path="/dashboard" component={DashboardRoutes} />
      <Route component={() => <Redirect to="/dashboard" />} />
    </Switch>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <SessionProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <AppRoutes />
        </WouterRouter>
      </SessionProvider>
    </ToastProvider>
  );
}
