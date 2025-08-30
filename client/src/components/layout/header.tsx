import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = "Dashboard", subtitle = "Manage your coding competitions" }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">{title}</h1>
            <p className="text-sm text-muted-foreground" data-testid="text-page-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative text-muted-foreground hover:text-foreground" data-testid="button-notifications">
            <i className="fas fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
            <span data-testid="text-header-user-initial">{user?.name?.charAt(0) || "U"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
