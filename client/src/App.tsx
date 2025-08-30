import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Events from "@/pages/events";
import Questions from "@/pages/questions";
import Coding from "@/pages/coding";
import Leaderboard from "@/pages/leaderboard";
import JoinEvent from "@/pages/join-event";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import "./lib/api"; // Initialize API interceptor

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="md:ml-64 flex flex-col min-h-screen flex-1">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { user } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <ProtectedRoute>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/events" component={Events} />
        <Route path="/questions" component={Questions} />
        <Route path="/coding/:questionId" component={Coding} />
        <Route path="/leaderboard/:eventId?" component={Leaderboard} />
        <Route path="/join-event" component={JoinEvent} />
        <Route component={NotFound} />
      </Switch>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
